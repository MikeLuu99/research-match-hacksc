import { v } from "convex/values";
import { ConvexError } from "convex/values";
import {
  internalQueryGeneric as internalQuery,
  makeFunctionReference,
} from "convex/server";
import { authComponent } from "./auth";
import { action } from "./model";
import { EMBEDDING_MODEL_ID, embedBatch } from "./embeddings";
import { bm25Scores, hybridRank, tokenize } from "./ranking";

// Chat runs through OpenRouter (embeddings stay on the OpenAI key).
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const CHAT_MODEL = "openai/gpt-4o-mini";
const MAX_HISTORY = 6;

const chatProjectByIds = internalQuery({
  args: { ids: v.array(v.id("projects")) },
  handler: async (ctx, args) => {
    const out = [];
    for (const id of args.ids) {
      const project = await ctx.db.get(id);
      if (!project) continue;
      out.push({
        sourceId: project.sourceId,
        title: project.title,
        department: project.department,
        faculty: project.faculty,
        description: project.description.slice(0, 400),
        requiredSkills: project.requiredSkills,
        hoursPerWeek: project.hoursPerWeek,
        offersCredit: project.offersCredit,
        recruitmentStatus: project.recruitmentStatus,
        sourceUrl: project.sourceUrl,
      });
    }
    return out;
  },
});

export const ask = action({
  args: {
    question: v.string(),
    history: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      }),
    ),
  },
  returns: v.object({
    reply: v.string(),
    sources: v.array(
      v.object({
        sourceId: v.string(),
        title: v.string(),
        sourceUrl: v.optional(v.string()),
      }),
    ),
    cards: v.array(
      v.object({
        sourceId: v.string(),
        title: v.string(),
        department: v.string(),
        faculty: v.string(),
        summary: v.string(),
        open: v.boolean(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const question = args.question.trim().slice(0, 800);
    if (!question) throw new ConvexError("Ask a question first.");
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Sign in to chat with LABBE.");
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user || user._id !== identity.subject)
      throw new ConvexError("Sign in to chat with LABBE.");
    const profile = await ctx.runQuery(
      makeFunctionReference<"query">("users:studentProfileBySubject"),
      { subject: identity.subject },
    );

    // Retrieval: hybrid ranking of the catalog against the question.
    const lexicon: { id: string; text: string }[] = await ctx.runQuery(
      makeFunctionReference<"query">("discovery:projectLexicon"),
      {},
    );
    const vectorHits = await ctx.vectorSearch("projects", "by_embedding", {
      vector: profile && profile.embeddingModel === EMBEDDING_MODEL_ID && profile.embedding.length > 0
        ? profile.embedding
        : (await embedBatch([question]))[0],
      limit: 24,
    });
    const bm25 = bm25Scores(tokenize(question), lexicon);
    const ranked = hybridRank(
      vectorHits.map((hit) => ({ id: String(hit._id), similarity: hit._score })),
      bm25,
      8,
    );
    const projects: {
      sourceId: string;
      title: string;
      department: string;
      faculty: string;
      description: string;
      requiredSkills: string[];
      hoursPerWeek: number;
      offersCredit: boolean;
      recruitmentStatus: string;
      sourceUrl?: string;
    }[] = await ctx.runQuery(
      makeFunctionReference<"query">("chat:chatProjectByIds"),
      { ids: ranked.map((entry) => entry.id as never) },
    );

    // Personal context: the signed-in student's saved profile summary.
    let profileBlock = "No saved profile yet — ask what they are looking for.";
    if (profile && profile.embedding.length > 0) {
      profileBlock = `Student's saved profile embedding matches their interests; they are a registered student with a profile on LABBE.`;
    }

    const context = projects
      .map(
        (project, index) =>
          `[${index + 1}] ${project.title} — ${project.department} — PI: ${
            project.faculty
          } — ${project.description} Skills: ${project.requiredSkills.join(
            ", ",
          )} — ${project.hoursPerWeek} h/week — ${
            project.offersCredit ? "credit available" : "no credit"
          } — status: ${project.recruitmentStatus} — id: ${project.sourceId}`,
      )
      .join("\n");

    const history = args.history
      .slice(-MAX_HISTORY)
      .map((message) => `${message.role === "user" ? "Student" : "Assistant"}: ${message.content}`)
      .join("\n");

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey)
      throw new ConvexError(
        "AI chat is not configured (missing OPENROUTER_API_KEY).",
      );
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL ?? "https://labbe.pages.dev",
        "X-Title": "LABBE",
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        temperature: 0.4,
        max_tokens: 700,
        tools: [
          {
            type: "function",
            function: {
              name: "show_projects",
              description:
                "Display lab project cards to the student in the chat UI. Call this whenever you recommend specific labs.",
              parameters: {
                type: "object",
                properties: {
                  sourceIds: {
                    type: "array",
                    description: "The id fields of the labs to display",
                    items: { type: "string" },
                  },
                },
                required: ["sourceIds"],
              },
            },
          },
        ],
        messages: [
          {
            role: "system",
            content: [
              "You are LABBE, a friendly research-matching assistant for USC students.",
              "Answer conversationally and concisely (max ~180 words). Use ONLY the numbered lab context below for concrete lab recommendations — never invent labs, professors or links.",
              "When recommending, reference labs by name, mention their department, skills needed, hours and recruiting status.",
              "If the context has nothing relevant, say so honestly and suggest what the student could search for next.",
              "You may ask one short follow-up question if the student's query is vague.",
              `Student context: ${profileBlock}`,
              `Lab context:\n${context}`,
              history ? `Conversation so far:\n${history}` : "",
            ]
              .filter(Boolean)
              .join("\n\n"),
          },
          { role: "user", content: question },
        ],
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new ConvexError(
        `AI chat failed (${response.status}): ${detail.slice(0, 200)}`,
      );
    }
    const basePayload = (await response.json()) as {
      choices?: {
        message?: { content?: string; tool_calls?: { function?: { name?: string; arguments?: string } }[] };
      }[];
    };
    const firstChoice = basePayload.choices?.[0]?.message;
    const toolCall = firstChoice?.tool_calls?.find(
      (call) => call.function?.name === "show_projects",
    );

    // Tool call: the assistant picked the labs worth showing as cards.
    if (toolCall?.function?.arguments) {
      let picked: { sourceIds?: string[] } = {};
      try {
        picked = JSON.parse(toolCall.function.arguments) as {
          sourceIds?: string[];
        };
      } catch {
        picked = {};
      }
      const wanted = new Set(picked.sourceIds ?? []);
      const cards = projects
        .filter((project) => wanted.has(project.sourceId))
        .map((project) => ({
          sourceId: project.sourceId,
          title: project.title,
          department: project.department,
          faculty: project.faculty,
          summary: project.description.slice(0, 240),
          open: project.recruitmentStatus !== "closed",
        }));
      // Second round: the model writes its conversational answer knowing
      // the cards are displayed.
      const second = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.SITE_URL ?? "https://labbe.pages.dev",
            "X-Title": "LABBE",
          },
          body: JSON.stringify({
            model: CHAT_MODEL,
            temperature: 0.4,
            max_tokens: 700,
            messages: [
              {
                role: "system",
                content:
                  "You are LABBE, a friendly research-matching assistant for USC students. The lab cards for the projects you selected are now displayed to the student. Write a short conversational wrap-up (max ~120 words): why these fit, what to check next (hours, recruiting status), and suggest one refined follow-up. Do not repeat the card details.",
              },
              { role: "user", content: question },
            ],
          }),
        },
      );
      const secondPayload = (await second.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const reply = secondPayload.choices?.[0]?.message?.content?.trim() ?? "";
      return {
        reply,
        sources: cards.map((card) => ({
          sourceId: card.sourceId,
          title: card.title,
          sourceUrl: projects.find((p) => p.sourceId === card.sourceId)?.sourceUrl,
        })),
        cards,
      };
    }

    const reply = firstChoice?.content?.trim();
    if (!reply) throw new ConvexError("The assistant returned no answer.");

    return {
      reply,
      sources: projects.map((project) => ({
        sourceId: project.sourceId,
        title: project.title,
        sourceUrl: project.sourceUrl,
      })),
      cards: [],
    };
  },
});
