import { v } from "convex/values";
import { ConvexError } from "convex/values";
import {
  internalQueryGeneric as internalQuery,
  makeFunctionReference,
} from "convex/server";
import { authComponent } from "./auth";
import { action } from "./model";
import { EMBEDDING_MODEL_ID } from "./embeddings";

const studentProfileBySubjectRef = makeFunctionReference<"query">(
  "users:studentProfileBySubject",
);
const projectsByIdsRef = makeFunctionReference<"query">("discovery:projectsByIds");
const labByIdRef = makeFunctionReference<"query">("discovery:labById");
const studentsByIdsRef = makeFunctionReference<"query">("discovery:studentsByIds");

export const projectsByIds = internalQuery({
  args: { ids: v.array(v.id("projects")) },
  handler: async (ctx, args) => {
    const out = [];
    for (const id of args.ids) {
      const project = await ctx.db.get(id);
      if (!project || project.embeddingModel !== EMBEDDING_MODEL_ID) continue;
      out.push({
        id: project._id,
        sourceId: project.sourceId,
        title: project.title,
        department: project.department,
        summary: project.description,
        faculty: project.faculty,
        sourceUrl: project.sourceUrl,
        open: project.recruitmentStatus === "open",
      });
    }
    return out;
  },
});

export const labById = internalQuery({
  args: { labId: v.id("projects") },
  handler: async (ctx, args) => {
    const lab = await ctx.db.get(args.labId);
    if (!lab) return null;
    return {
      id: lab._id,
      title: lab.title,
      department: lab.department,
      embedding: lab.embedding,
      embeddingModel: lab.embeddingModel,
    };
  },
});

export const studentsByIds = internalQuery({
  args: { ids: v.array(v.id("students")) },
  handler: async (ctx, args) => {
    const out = [];
    for (const id of args.ids) {
      const student = await ctx.db.get(id);
      // Re-check consent after retrieval; it may have changed during search.
      if (!student?.recruitmentConsent) continue;
      if (student.embeddingModel !== EMBEDDING_MODEL_ID) continue;
      out.push({
        studentId: student._id,
        name: student.name,
        major: student.major,
        schoolYear: student.schoolYear,
        skills: student.skills,
        interests: student.interests,
        hoursPerWeek: student.hoursPerWeek,
      });
    }
    return out;
  },
});

// AI matching for the signed-in student: nearest labs to the student's stored
// profile embedding. Runs as an action because vector search is action-side;
// the client calls it on demand (profile saves refresh the vector shortly
// after).
export const myMatches = action({
  args: {},
  returns: v.object({
    ready: v.boolean(),
    matches: v.array(
      v.object({
        sourceId: v.string(),
        title: v.string(),
        department: v.string(),
        summary: v.string(),
        faculty: v.string(),
        sourceUrl: v.optional(v.string()),
        similarity: v.number(),
        open: v.boolean(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { ready: false, matches: [] };
    const profile: {
      id: string;
      embedding: number[];
      embeddingModel: string;
    } | null = await ctx.runQuery(studentProfileBySubjectRef, {
      subject: identity.subject,
    });
    if (!profile) return { ready: false, matches: [] };
    if (profile.embedding.length === 0) {
      // Self-heal legacy profiles saved before the embedding pipeline:
      // regenerate the vector instead of waiting forever.
      await ctx.scheduler.runAfter(
        0,
        makeFunctionReference<"action">("users:embedStudent"),
        { studentId: profile.id as never },
      );
      return { ready: false, matches: [] };
    }
    if (profile.embeddingModel !== EMBEDDING_MODEL_ID)
      return { ready: false, matches: [] };
    const matches = await ctx.vectorSearch("projects", "by_embedding", {
      vector: profile.embedding,
      limit: 12,
    });
    const docs: {
      id: string;
      sourceId: string;
      title: string;
      department: string;
      summary: string;
      faculty: string;
      sourceUrl?: string;
      open: boolean;
    }[] = await ctx.runQuery(projectsByIdsRef, {
      ids: matches.map((match) => match._id),
    });
    const scoreById = new Map(
      matches.map((match) => [String(match._id), match._score]),
    );
    return {
      ready: true,
      matches: docs.map((doc) => ({
        sourceId: doc.sourceId,
        title: doc.title,
        department: doc.department,
        summary: doc.summary,
        faculty: doc.faculty,
        sourceUrl: doc.sourceUrl,
        similarity: scoreById.get(doc.id) ?? 0,
        open: doc.open,
      })),
    };
  },
});

// Faculty-side AI ranking: consented students whose embedded profiles are
// nearest to a lab.
export const labCandidates = action({
  args: { labId: v.id("projects") },
  returns: v.object({
    ready: v.boolean(),
    matches: v.array(
      v.object({
        studentId: v.string(),
        name: v.string(),
        major: v.string(),
        schoolYear: v.string(),
        skills: v.array(v.string()),
        interests: v.array(v.string()),
        hoursPerWeek: v.number(),
        similarity: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Sign in to view AI ranking.");
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user || user._id !== identity.subject)
      throw new ConvexError("Sign in to view AI ranking.");
    const account = await ctx.runQuery(
      makeFunctionReference<"query">("users:accountProfileBySubject"),
      { subject: identity.subject },
    );
    if (!account || (account as { accountType: string }).accountType !== "faculty")
      throw new ConvexError("Only faculty accounts can use AI ranking.");
    const lab: {
      id: string;
      title: string;
      department: string;
      embedding: number[];
      embeddingModel: string;
    } | null = await ctx.runQuery(labByIdRef, { labId: args.labId });
    if (!lab) throw new ConvexError("Lab not found.");
    if (lab.embedding.length === 0 || lab.embeddingModel !== EMBEDDING_MODEL_ID)
      return { ready: false, matches: [] };
    const matches = await ctx.vectorSearch("students", "by_embedding", {
      vector: lab.embedding,
      limit: 12,
      filter: (q) => q.eq("recruitmentConsent", true),
    });
    const students: {
      studentId: string;
      name: string;
      major: string;
      schoolYear: string;
      skills: string[];
      interests: string[];
      hoursPerWeek: number;
    }[] = await ctx.runQuery(studentsByIdsRef, {
      ids: matches.map((match) => match._id),
    });
    const scoreById = new Map(
      matches.map((match) => [String(match._id), match._score]),
    );
    return {
      ready: true,
      matches: students.map((student) => ({
        ...student,
        similarity: scoreById.get(student.studentId) ?? 0,
      })),
    };
  },
});
