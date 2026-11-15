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

const CHAT_MODEL = "gpt-4o-mini";
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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EMBEDDING_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        temperature: 0.4,
        max_tokens: 700,
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
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = payload.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new ConvexError("The assistant returned no answer.");

    return {
      reply,
      sources: projects.map((project) => ({
        sourceId: project.sourceId,
        title: project.title,
        sourceUrl: project.sourceUrl,
      })),
    };
  },
});
