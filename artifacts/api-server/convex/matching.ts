import {
  internalActionGeneric as internalAction,
  internalQueryGeneric as internalQuery,
  makeFunctionReference,
  queryGeneric as query,
} from "convex/server";
import { v } from "convex/values";

// All matching entry points are INTERNAL until authentication, faculty
// ownership checks and the real embedding provider are connected. Do not
// expose these as public actions without adding those checks.
const vectorArgs = {
  embedding: v.array(v.float64()),
  embeddingModel: v.string(),
};

function validateVector(embedding: number[]) {
  if (embedding.length !== 1536 || embedding.some((value) => !Number.isFinite(value))) {
    throw new Error("Expected a finite 1536-dimensional embedding.");
  }
  if (embedding.every((value) => value === 0)) {
    throw new Error("Zero vectors cannot be used for cosine matching.");
  }
}

// Safe to call without authentication: no user or project data is returned.
export const health = query({
  args: {},
  handler: async () => ({ service: "ResearchMatch", schemaVersion: 1 }),
});

export const projectsForStudent = internalAction({
  args: {
    ...vectorArgs,
    skills: v.array(v.string()),
    hoursPerWeek: v.number(),
    seekingCredit: v.boolean(),
  },
  handler: async (ctx, args) => {
    validateVector(args.embedding);
    const matches = await ctx.vectorSearch("projects", "by_embedding", {
      vector: args.embedding,
      limit: 64,
      filter: (q) => q.eq("recruitmentStatus", "open"),
    });
    return ctx.runQuery(makeFunctionReference<"query">("matching:loadProjectMatches"), {
      skills: args.skills,
      hoursPerWeek: args.hoursPerWeek,
      seekingCredit: args.seekingCredit,
      embeddingModel: args.embeddingModel,
      matches,
    });
  },
});

export const loadProjectMatches = internalQuery({
  args: {
    matches: v.array(v.object({ _id: v.id("projects"), _score: v.number() })),
    embeddingModel: v.string(),
    skills: v.array(v.string()),
    hoursPerWeek: v.number(),
    seekingCredit: v.boolean(),
  },
  handler: async (ctx, args) => {
    const normalized = new Set(args.skills.map((skill) => skill.trim().toLowerCase()));
    const results = [];
    for (const match of args.matches) {
      const project = await ctx.db.get(match._id);
      if (!project || project.recruitmentStatus !== "open" ||
        project.embeddingModel !== args.embeddingModel) continue;
      const missingRequiredSkills = (project.requiredSkills as string[])
        .filter((skill) => !normalized.has(skill.trim().toLowerCase()));
      const hoursFit = args.hoursPerWeek >= project.hoursPerWeek;
      const creditFit = !args.seekingCredit || project.offersCredit;
      const { embedding: _embedding, ...publicProject } = project;
      results.push({
        project: publicProject,
        similarity: match._score,
        eligible: missingRequiredSkills.length === 0 && hoursFit && creditFit,
        missingRequiredSkills,
        hoursFit,
        creditFit,
        learningPotential: Boolean(project.beginnerFriendly),
      });
    }
    return results;
  },
});

export const studentsForProject = internalAction({
  args: vectorArgs,
  handler: async (ctx, args) => {
    validateVector(args.embedding);
    const matches = await ctx.vectorSearch("students", "by_embedding", {
      vector: args.embedding,
      limit: 64,
      filter: (q) => q.eq("recruitmentConsent", true),
    });
    return ctx.runQuery(makeFunctionReference<"query">("matching:loadConsentingStudents"), {
      matches,
      embeddingModel: args.embeddingModel,
    });
  },
});

export const loadConsentingStudents = internalQuery({
  args: {
    matches: v.array(v.object({ _id: v.id("students"), _score: v.number() })),
    embeddingModel: v.string(),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const match of args.matches) {
      const student = await ctx.db.get(match._id);
      // Re-check consent after retrieval; it may have changed during search.
      if (!student?.recruitmentConsent || student.embeddingModel !== args.embeddingModel) continue;
      results.push({
        id: student._id,
        name: student.name,
        major: student.major,
        skills: student.skills,
        interests: student.interests,
        hoursPerWeek: student.hoursPerWeek,
        seekingCredit: student.seekingCredit,
        similarity: match._score,
      });
    }
    return results;
  },
});
