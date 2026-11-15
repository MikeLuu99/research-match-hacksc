import { v } from "convex/values";
import { ConvexError } from "convex/values";
import {
  internalMutationGeneric as internalMutation,
  internalQueryGeneric as internalQuery,
  makeFunctionReference,
  mutationGeneric as mutation,
  queryGeneric as query,
} from "convex/server";
import { authComponent } from "./auth";
import { action } from "./model";
import { EMBEDDING_MODEL_ID, embedBatch } from "./embeddings";
import { bm25Scores, hybridRank, tokenize } from "./ranking";

// Persistent student chat with LABBE, following the convex-ai-chat pattern:
// user messages are stored by a mutation, an internal action retrieves
// context (hybrid vector + BM25 ranking over the lab catalog), inserts an
// empty assistant message and patches it as the completion streams — the
// UI renders it live through the reactive query.

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const CHAT_MODEL = process.env.OPENROUTER_CHAT_MODEL ?? "nvidia/nemotron-3-ultra-550b-a55b";
const MAX_HISTORY = 6;

export const myMessages = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_owner", (q) => q.eq("ownerSubject", identity.subject))
      .collect();
  },
});

export const send = mutation({
  args: { question: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Sign in to chat with LABBE.");
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user || user._id !== identity.subject)
      throw new ConvexError("Sign in to chat with LABBE.");
    const question = args.question.trim().slice(0, 800);
    if (!question) throw new ConvexError("Ask a question first.");
    await ctx.db.insert("chatMessages", {
      ownerSubject: identity.subject,
      isViewer: true,
      text: question,
      createdAt: Date.now(),
    });
    await ctx.scheduler.runAfter(
      0,
      makeFunctionReference<"action">("chat:answer"),
      { subject: identity.subject },
    );
    return null;
  },
});

export const clear = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_owner", (q) => q.eq("ownerSubject", identity.subject))
      .collect();
    for (const message of messages) await ctx.db.delete(message._id);
    return null;
  },
});

export const myHistory = internalQuery({
  args: { subject: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_owner", (q) => q.eq("ownerSubject", args.subject))
      .collect();
    return messages
      .filter((message) => message.text.trim().length > 0)
      .slice(-MAX_HISTORY)
      .map((message) => ({ isViewer: message.isViewer, text: message.text }));
  },
});

export const chatProjectByIds = internalQuery({
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



export const addBotMessageMutation = internalMutation({
  args: { subject: v.string() },
  returns: v.object({ id: v.id("chatMessages") }),
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("chatMessages", {
      ownerSubject: args.subject,
      isViewer: false,
      text: "",
      streaming: true,
      createdAt: Date.now(),
    });
    return { id };
  },
});

export const updateBotMessage = internalMutation({
  args: {
    messageId: v.id("chatMessages"),
    text: v.string(),
    done: v.optional(v.boolean()),
    sources: v.optional(
      v.array(
        v.object({
          sourceId: v.string(),
          title: v.string(),
          sourceUrl: v.optional(v.string()),
        }),
      ),
    ),
    cards: v.optional(
      v.array(
        v.object({
          sourceId: v.string(),
          title: v.string(),
          department: v.string(),
          faculty: v.string(),
          summary: v.string(),
          open: v.boolean(),
        }),
      ),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = { text: args.text };
    if (args.done) {
      patch.streaming = false;
      if (args.sources) patch.sources = args.sources;
      if (args.cards) patch.cards = args.cards;
    }
    await ctx.db.patch(args.messageId, patch);
    return null;
  },
});

// The scheduled brain: retrieve, stream the completion, persist cards.
export const answer = action({
  args: { subject: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const subject = args.subject;
    const history: { isViewer: boolean; text: string }[] = await ctx.runQuery(
      makeFunctionReference<"query">("chat:myHistory"),
      { subject },
    );
    const question = history.at(-1)?.text ?? "";

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      await ctx.runMutation(
        makeFunctionReference<"mutation">("chat:updateBotMessage"),
        {
          messageId: (await ctx.runMutation(
            makeFunctionReference<"mutation">("chat:addBotMessageMutation"),
            { subject },
          )).id,
          text: "AI chat is not configured (missing OPENROUTER_API_KEY).",
          done: true,
        },
      );
      return null;
    }

    // Retrieval: hybrid ranking of the catalog against the question.
    const lexicon: { id: string; text: string }[] = await ctx.runQuery(
      makeFunctionReference<"query">("discovery:projectLexicon"),
      {},
    );
    const profile = await ctx.runQuery(
      makeFunctionReference<"query">("users:studentProfileBySubject"),
      { subject },
    );
    const vectorHits = await ctx.vectorSearch("projects", "by_embedding", {
      vector:
        profile &&
        profile.embeddingModel === EMBEDDING_MODEL_ID &&
        profile.embedding.length > 0
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

    const historyBlock = history
      .slice(-MAX_HISTORY)
      .map(
        (message) =>
          `${message.isViewer ? "Student" : "Assistant"}: ${message.text}`,
      )
      .join("\n");

    // The assistant message row is created empty and streamed into.
    const bot = (await ctx.runMutation(
      makeFunctionReference<"mutation">("chat:addBotMessageMutation"),
      { subject },
    )) as { id: string };

    const system = [
      "You are LABBE, a friendly research-matching assistant for USC students.",
      "Answer conversationally and concisely (max ~180 words). Use ONLY the numbered lab context below for concrete lab recommendations — never invent labs, professors or links.",
      "When recommending specific labs, call the show_projects tool with their ids.",
      "Reference labs by name, mention their department, skills needed, hours and recruiting status.",
      "If the context has nothing relevant, say so honestly and suggest what the student could search for next.",
      `Lab context:\n${context}`,
      historyBlock ? `Conversation so far:\n${historyBlock}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
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
          stream: true,
          temperature: 0.4,
          messages: [
            { role: "system", content: system },
            { role: "user", content: question },
          ],
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
        }),
      });
      if (!response.ok || !response.body) {
        const detail = await response.text().catch(() => "");
        throw new Error(
          `OpenRouter error ${response.status}: ${detail.slice(0, 200)}`,
        );
      }

      // Parse the SSE stream ourselves, patching the row as tokens arrive.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";
      let toolArgs = "";
      let toolName = "";
      let lastPatch = 0;
      let finished = false;

      async function flush(done: boolean) {
        if (!finished || done) {
          /* continue */
        }
      }
      void flush;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") {
            finished = true;
            continue;
          }
          try {
            const event = JSON.parse(payload) as {
              choices?: {
                delta?: {
                  content?: string;
                  tool_calls?: {
                    function?: { name?: string; arguments?: string };
                  }[];
                };
              }[];
            };
            const delta = event.choices?.[0]?.delta;
            const toolDelta = delta?.tool_calls?.[0];
            if (toolDelta?.function?.name)
              toolName = toolDelta.function.name;
            if (toolDelta?.function?.arguments)
              toolArgs += toolDelta.function.arguments;
            if (typeof delta?.content === "string" && delta.content) {
              text += delta.content;
              const now = Date.now();
              if (now - lastPatch > 120) {
                lastPatch = now;
                await ctx.runMutation(
                  makeFunctionReference<"mutation">("chat:updateBotMessage"),
                  { messageId: bot.id, text },
                );
              }
            }
          } catch {
            // Ignore malformed SSE fragments.
          }
          if (finished) break;
        }
        if (finished) break;
      }

      // Tool round: the assistant picked labs to display — build cards and
      // stream the wrap-up text.
      if (toolName === "show_projects") {
        let picked: { sourceIds?: string[] } = {};
        try {
          picked = JSON.parse(toolArgs || "{}") as { sourceIds?: string[] };
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
        text = text.trim();
        if (text) {
          await ctx.runMutation(
            makeFunctionReference<"mutation">("chat:updateBotMessage"),
            { messageId: bot.id, text: text + "\n\n[showing labs below]" },
          );
        }
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
            messages: [
              {
                role: "system",
                content:
                  "You are LABBE, a friendly research-matching assistant for USC students. The lab cards for the projects you selected are now displayed to the student. Write a short conversational wrap-up (max ~120 words): why these fit, what to check next (hours, recruiting status), and suggest one refined follow-up. Do not repeat the card details.",
              },
              { role: "user", content: question },
            ],
          }),
        });
        const secondPayload = (await second.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const wrapUp =
          secondPayload.choices?.[0]?.message?.content?.trim() ?? "";
        await ctx.runMutation(
          makeFunctionReference<"mutation">("chat:updateBotMessage"),
          {
            messageId: bot.id,
            text: (text ? text + "\n\n" : "") + wrapUp,
            done: true,
            sources: cards.map((card) => ({
              sourceId: card.sourceId,
              title: card.title,
              sourceUrl: projects.find((p) => p.sourceId === card.sourceId)
                ?.sourceUrl,
            })),
            cards,
          },
        );
        return null;
      }

      await ctx.runMutation(
        makeFunctionReference<"mutation">("chat:updateBotMessage"),
        {
          messageId: bot.id,
          text,
          done: true,
          sources: projects.map((project) => ({
            sourceId: project.sourceId,
            title: project.title,
            sourceUrl: project.sourceUrl,
          })),
        },
      );
      return null;
    } catch (error) {
      await ctx.runMutation(
        makeFunctionReference<"mutation">("chat:updateBotMessage"),
        {
          messageId: bot.id,
          text:
            error instanceof Error
              ? `I cannot reply at this time. (${error.message.slice(0, 120)})`
              : "I cannot reply at this time.",
          done: true,
        },
      );
      return null;
    }
  },
});
