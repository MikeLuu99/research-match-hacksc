import { v } from "convex/values";
import { ConvexError } from "convex/values";
import {
  actionGeneric as action,
  internalMutationGeneric as internalMutation,
  internalQueryGeneric as internalQuery,
  makeFunctionReference,
} from "convex/server";
import { authComponent } from "./auth";
import { accountProfileFor } from "./users";
import { mutation, query } from "./model";
import { EMBEDDING_MODEL_ID, embedBatch, labEmbeddingText } from "./embeddings";

async function requireFaculty(ctx: unknown) {
  const user = await authComponent.getAuthUser(ctx as never);
  const account = await accountProfileFor(ctx as never, user._id);
  if (!account || account.accountType !== "faculty")
    throw new ConvexError("Only faculty accounts can manage projects.");
  return { user, account };
}

type FacultyProjectInput = {
  title: string;
  labName: string;
  department: string;
  summary: string;
  description: string;
  requiredSkills: string[];
  niceSkills: string[];
  eligibleMajors: string[];
  keywords: string[];
  minHours: number;
  maxHours: number;
  paid: boolean;
  credit: boolean;
  status: "open" | "closed" | "explore";
  level: "beginner" | "intermediate" | "advanced";
};

const projectArgs = {
  title: v.string(),
  labName: v.string(),
  department: v.string(),
  summary: v.string(),
  description: v.string(),
  requiredSkills: v.array(v.string()),
  niceSkills: v.array(v.string()),
  eligibleMajors: v.array(v.string()),
  keywords: v.array(v.string()),
  minHours: v.number(),
  maxHours: v.number(),
  paid: v.boolean(),
  credit: v.boolean(),
  status: v.union(
    v.literal("open"),
    v.literal("closed"),
    v.literal("explore"),
  ),
  level: v.union(
    v.literal("beginner"),
    v.literal("intermediate"),
    v.literal("advanced"),
  ),
};

function facultyView(project: {
  _id: string;
  sourceId: string;
  title: string;
  labName?: string;
  department: string;
  summary?: string;
  description: string;
  faculty: string;
  requiredSkills: string[];
  preferredSkills: string[];
  eligibleMajors?: string[];
  keywords?: string[];
  minHours?: number;
  maxHours?: number;
  hoursPerWeek: number;
  offersCredit: boolean;
  beginnerFriendly: boolean;
  recruitmentStatus: "open" | "closed" | "explore";
  level?: "beginner" | "intermediate" | "advanced";
  sourceUrl?: string;
}) {
  return {
    id: project._id,
    sourceId: project.sourceId,
    title: project.title,
    lab: project.labName ?? project.faculty,
    pi: project.faculty,
    department: project.department,
    summary: project.summary ?? project.description.slice(0, 200),
    description: project.description,
    requiredSkills: project.requiredSkills,
    niceSkills: project.preferredSkills,
    minHours: project.minHours ?? project.hoursPerWeek,
    maxHours: project.maxHours ?? project.hoursPerWeek,
    paid: false,
    credit: project.offersCredit,
    status:
      project.recruitmentStatus === "explore"
        ? "exploration"
        : project.recruitmentStatus,
    level: project.level ?? "beginner",
    eligibleMajors: project.eligibleMajors ?? ["Any"],
    keywords: project.keywords ?? [],
  };
}

// Public: faculty-created listings, mapped to the frontend Project shape so
// students can browse, search and save them alongside the USC catalog.
export const publishedProjects = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    return projects.filter((p) => p.ownerId !== undefined).map(facultyView);
  },
});

export const myProjects = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const account = await accountProfileFor(ctx, user._id);
    if (!account || account.accountType !== "faculty")
      throw new ConvexError("Only faculty accounts can list their projects.");
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();
    return projects.map(facultyView);
  },
});

export const createProject = mutation({
  args: projectArgs,
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const { user, account } = await requireFaculty(ctx);
    if (args.minHours < 0 || args.maxHours < args.minHours)
      throw new ConvexError("Hours must be positive with max at least min.");
    const sourceId = `fac-${user._id}-${Date.now()}`;
    const projectId = await ctx.db.insert("projects", {
      sourceId,
      title: args.title.trim().slice(0, 120),
      department: args.department.trim().slice(0, 120),
      description: args.description.trim().slice(0, 2000),
      faculty: account.name,
      requiredSkills: args.requiredSkills.slice(0, 15),
      preferredSkills: args.niceSkills.slice(0, 15),
      hoursPerWeek: Math.round(((args.minHours + args.maxHours) / 2) * 10) / 10,
      offersCredit: args.credit,
      beginnerFriendly: args.level === "beginner",
      recruitmentStatus: args.status,
      embeddingModel: "",
      embedding: [],
      ownerId: user._id,
      labName: args.labName.trim().slice(0, 120),
      summary: args.summary.trim().slice(0, 300),
      minHours: args.minHours,
      maxHours: args.maxHours,
      eligibleMajors: args.eligibleMajors.slice(0, 10),
      keywords: args.keywords.slice(0, 15),
      level: args.level,
    });
    await ctx.scheduler.runAfter(
      0,
      makeFunctionReference<"action">("faculty:embedProject"),
      { projectId: projectId as never },
    );
    return { id: projectId };
  },
});

export const updateProject = mutation({
  args: { projectId: v.id("projects"), ...projectArgs },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { user } = await requireFaculty(ctx);
    const { projectId, ...fields } = args;
    const project = await ctx.db.get(projectId);
    if (!project || project.ownerId !== user._id)
      throw new ConvexError("You can only edit your own projects.");
    await ctx.db.patch(projectId, {
      title: fields.title.trim().slice(0, 120),
      department: fields.department.trim().slice(0, 120),
      description: fields.description.trim().slice(0, 2000),
      requiredSkills: fields.requiredSkills.slice(0, 15),
      preferredSkills: fields.niceSkills.slice(0, 15),
      hoursPerWeek: Math.round(((fields.minHours + fields.maxHours) / 2) * 10) / 10,
      offersCredit: fields.credit,
      beginnerFriendly: fields.level === "beginner",
      recruitmentStatus: fields.status,
      labName: fields.labName.trim().slice(0, 120),
      summary: fields.summary.trim().slice(0, 300),
      minHours: fields.minHours,
      maxHours: fields.maxHours,
      eligibleMajors: fields.eligibleMajors.slice(0, 10),
      keywords: fields.keywords.slice(0, 15),
      level: fields.level,
      // Reset the embedding so it regenerates from the new text.
      embeddingModel: "",
      embedding: [],
    });
    await ctx.scheduler.runAfter(
      0,
      makeFunctionReference<"action">("faculty:embedProject"),
      { projectId },
    );
    return null;
  },
});

export const removeProject = mutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { user } = await requireFaculty(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== user._id)
      throw new ConvexError("You can only remove your own projects.");
    await ctx.db.delete(args.projectId);
    return null;
  },
});

const projectById = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId === undefined) return null;
    return {
      title: project.title,
      department: project.department,
      description: project.description,
      faculty: project.faculty,
      requiredSkills: project.requiredSkills,
      preferredSkills: project.preferredSkills,
    };
  },
});

export const storeProjectEmbeddingById = internalMutation({
  args: { projectId: v.id("projects"), embedding: v.array(v.float64()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      embedding: args.embedding,
      embeddingModel: EMBEDDING_MODEL_ID,
    });
    return null;
  },
});

// Scheduled after create/update: regenerates the project embedding so the
// listing stays discoverable in student AI matches.
export const embedProject = action({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project: {
      title: string;
      department: string;
      description: string;
      faculty: string;
      requiredSkills: string[];
      preferredSkills: string[];
    } | null = await ctx.runQuery(
      makeFunctionReference<"query">("faculty:projectById"),
      { projectId: args.projectId },
    );
    if (!project) return null;
    const [embedding] = await embedBatch([
      labEmbeddingText({
        title: project.title,
        lab: "",
        department: project.department,
        description: project.description,
        faculty: project.faculty,
        requiredSkills: project.requiredSkills,
      }),
    ]);
    await ctx.runMutation(
      makeFunctionReference<"mutation">("faculty:storeProjectEmbeddingById"),
      { projectId: args.projectId, embedding },
    );
    return null;
  },
});
