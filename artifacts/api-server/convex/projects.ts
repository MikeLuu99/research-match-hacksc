import { v } from "convex/values";
import { ConvexError } from "convex/values";
import {
  internalMutationGeneric as internalMutation,
  internalQueryGeneric as internalQuery,
  makeFunctionReference,
} from "convex/server";
import { authComponent } from "./auth";
import { accountProfileFor } from "./users";
import { action, mutation, query } from "./model";
import { LABS } from "./labData";
import { isUscEmail } from "./users";
import { EMBEDDING_MODEL_ID, embedBatch, labEmbeddingText } from "./embeddings";

// Faculty-only catalog management. The public USC lab dataset lives in
// labData.ts; embeddings are generated here so vector matching can rank
// students against labs. Statuses reflect public pages, not lab-confirmed
// vacancies — the dataset's caveat travels with every description.

export const labCatalogStatus = query({
  args: {},
  returns: v.object({ total: v.number(), embedded: v.number() }),
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    return {
      total: projects.length,
      embedded: projects.filter((project) => project.embedding.length > 0)
        .length,
    };
  },
});

// One-time faculty mutation: upserts the whole catalog by sourceId.
export const seedLabs = mutation({
  args: {},
  returns: v.object({ inserted: v.number(), updated: v.number() }),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!isUscEmail(user.email))
      throw new ConvexError(
        "Only USC accounts (email ending in @usc.edu) can load the catalog.",
      );
    // The catalog is public USC data, so any signed-in USC user may trigger
    // the seed; the faculty gate remains on candidate ranking.
    let inserted = 0;
    let updated = 0;
    for (const lab of LABS) {
      const existing = await ctx.db
        .query("projects")
        .withIndex("by_source", (q) => q.eq("sourceId", lab.sourceId))
        .unique();
      const fields = {
        title: lab.title,
        department: lab.department,
        description: lab.description,
        faculty: lab.faculty,
        requiredSkills: lab.requiredSkills,
        preferredSkills: lab.preferredSkills,
        hoursPerWeek: lab.hoursPerWeek,
        offersCredit: lab.offersCredit,
        beginnerFriendly: lab.beginnerFriendly,
        recruitmentStatus: lab.recruitmentStatus,
        ...(lab.sourceUrl ? { sourceUrl: lab.sourceUrl } : {}),
      };
      if (existing) {
        await ctx.db.patch(existing._id, fields);
        updated += 1;
      } else {
        await ctx.db.insert("projects", {
          sourceId: lab.sourceId,
          ...fields,
          embeddingModel: "",
          embedding: [],
        });
        inserted += 1;
      }
    }
    return { inserted, updated };
  },
});

// Faculty-gated lab list for the AI candidate-ranking selector.
export const listLabs = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const account = await accountProfileFor(ctx, user._id);
    if (!account || account.accountType !== "faculty")
      throw new ConvexError("Only faculty accounts can view the lab catalog.");
    const projects = await ctx.db.query("projects").collect();
    return projects
      .map((project) => ({
        id: project._id,
        sourceId: project.sourceId,
        title: project.title,
        department: project.department,
        recruitmentStatus: project.recruitmentStatus,
        hasEmbedding: project.embedding.length > 0,
      }))
      .sort((a, b) => a.sourceId.localeCompare(b.sourceId));
  },
});


export const pendingLabs = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      sourceId: v.string(),
      text: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    return projects
      .filter((project) => project.embedding.length === 0)
      .map((project) => ({
        sourceId: project.sourceId,
        text: labEmbeddingText({
          title: project.title,
          lab: project.sourceId,
          department: project.department,
          description: project.description,
          faculty: project.faculty,
          requiredSkills: project.requiredSkills,
        }),
      }));
  },
});

// Embed every lab that lacks a vector (any signed-in USC user may trigger
// this; one batched request covers the whole catalog).
export const embedPendingProjects = action({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Sign in to manage the lab catalog.");
    const caller = await authComponent.safeGetAuthUser(ctx);
    if (!caller || !isUscEmail(caller.email))
      throw new ConvexError(
        "Only USC accounts (email ending in @usc.edu) can embed the catalog.",
      );
    const labs: { sourceId: string; text: string }[] = await ctx.runQuery(
      makeFunctionReference<"query">("projects:pendingLabs"),
      {},
    );
    if (labs.length === 0) return 0;
    const embeddings = await embedBatch(labs.map((lab) => lab.text));
    for (const [index, lab] of labs.entries()) {
      await ctx.runMutation(
        makeFunctionReference<"mutation">("projects:storeProjectEmbedding"),
        { sourceId: lab.sourceId, embedding: embeddings[index] },
      );
    }
    return embeddings.length;
  },
});

export const storeProjectEmbedding = internalMutation({
  args: { sourceId: v.string(), embedding: v.array(v.float64()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_source", (q) => q.eq("sourceId", args.sourceId))
      .unique();
    if (!project) return null;
    await ctx.db.patch(project._id, {
      embedding: args.embedding,
      embeddingModel: EMBEDDING_MODEL_ID,
    });
    return null;
  },
});
