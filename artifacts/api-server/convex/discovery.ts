import { v } from "convex/values";
import { ConvexError } from "convex/values";
import {
  internalQueryGeneric as internalQuery,
  makeFunctionReference,
} from "convex/server";
import { authComponent } from "./auth";
import { action } from "./model";
import { EMBEDDING_MODEL_ID } from "./embeddings";
import { bm25Scores, hybridRank, tokenize } from "./ranking";

const studentProfileBySubjectRef = makeFunctionReference<"query">(
  "users:studentProfileBySubject",
);
const projectsByIdsRef = makeFunctionReference<"query">("discovery:projectsByIds");
const labByIdRef = makeFunctionReference<"query">("discovery:labById");
const studentsByIdsRef = makeFunctionReference<"query">("discovery:studentsByIds");
const matchLexiconRef = makeFunctionReference<"query">("discovery:matchLexicon");
import { DEMO_STUDENT_EMBEDDING, DEMO_STUDENT_NAME, DEMO_STUDENT_TOKENS } from "./demoStudent";
const candidateLexiconRef = makeFunctionReference<"query">(
  "discovery:candidateLexicon",
);

function scoreMap(
  matches: { _id: unknown; _score: number }[],
): Map<string, number> {
  return new Map(matches.map((match) => [String(match._id), match._score]));
}

// Lexical corpus for the hybrid ranker: the student's own tokens plus every
// project's searchable text.
export const matchLexicon = internalQuery({
  args: { subject: v.string() },
  handler: async (ctx, args) => {
    const student = await ctx.db
      .query("students")
      .withIndex("by_owner", (q) => q.eq("ownerSubject", args.subject))
      .unique();
    if (!student) return null;
    const studentTokens = tokenize(
      [
        student.major,
        ...student.skills,
        ...student.interests,
        ...student.experience.map(
          (entry: { role: string; org: string; description: string }) =>
            `${entry.role} ${entry.org} ${entry.description}`,
        ),
      ].join(" "),
    );
    const projects = await ctx.db.query("projects").collect();
    return {
      studentTokens,
      projects: projects.map((project) => ({
        id: project._id,
        text: [
          project.title,
          project.department,
          project.faculty,
          project.description,
          ...project.requiredSkills,
          ...project.preferredSkills,
        ].join(" "),
      })),
    };
  },
});

// Lexical corpus for faculty ranking: the lab's tokens plus every consented
// student's searchable text.
export const candidateLexicon = internalQuery({
  args: { labId: v.id("projects") },
  handler: async (ctx, args) => {
    const lab = await ctx.db.get(args.labId);
    if (!lab) return null;
    const labTokens = tokenize(
      [
        lab.title,
        lab.department,
        ...lab.requiredSkills,
        ...lab.preferredSkills,
      ].join(" "),
    );
    const students = await ctx.db.query("students").collect();
    return {
      labTokens,
      students: students
        .filter((student) => student.recruitmentConsent)
        .map((student) => ({
          id: student._id,
          text: [
            student.name,
            student.major,
            ...student.skills,
            ...student.interests,
            ...student.experience.map(
              (entry: { role: string; org: string; description: string }) =>
                `${entry.role} ${entry.org} ${entry.description}`,
            ),
          ].join(" "),
        })),
    };
  },
});

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
        open: project.recruitmentStatus !== "closed",
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

// The demo sample student's profile: powers the public demo experience so
// visitors see the same AI ranking as signed-in students.
export const projectLexicon = internalQuery({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    return projects.map((project) => ({
      id: project._id,
      text: [
        project.title,
        project.department,
        project.faculty,
        project.description,
        ...project.requiredSkills,
        ...project.preferredSkills,
      ].join(" "),
    }));
  },
});

export const demoMatches = action({
  args: {},
  returns: v.object({
    ready: v.boolean(),
    demo: v.boolean(),
    studentName: v.optional(v.string()),
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
    const projectLexicon: { id: string; text: string }[] = await ctx.runQuery(
      makeFunctionReference<"query">("discovery:projectLexicon"),
      {},
    );
    const vectorHits = await ctx.vectorSearch("projects", "by_embedding", {
      vector: DEMO_STUDENT_EMBEDDING,
      limit: 24,
    });
    const bm25 = bm25Scores(DEMO_STUDENT_TOKENS, projectLexicon);
    const ranked = hybridRank(
      vectorHits.map((hit) => ({ id: String(hit._id), similarity: hit._score })),
      bm25,
      5,
    );
    if (!ranked.length) return { ready: true, demo: true, matches: [] };
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
      ids: ranked.map((entry) => entry.id as never),
    });
    const scoreById = new Map(ranked.map((entry) => [entry.id, entry.score]));
    return {
      ready: true,
      demo: true,
      studentName: DEMO_STUDENT_NAME,
      matches: docs
        .map((doc) => ({
          sourceId: doc.sourceId,
          title: doc.title,
          department: doc.department,
          summary: doc.summary,
          faculty: doc.faculty,
          sourceUrl: doc.sourceUrl,
          similarity: scoreById.get(doc.id) ?? 0,
          open: doc.open,
        }))
        .sort((a, b) => b.similarity - a.similarity),
    };
  },
});

// AI matching for the signed-in student: hybrid ranking over vector
// similarity (semantic) and BM25 (exact keyword matches) across the lab
// catalog. Runs as an action because vector search is action-side.
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
    if (!profile || profile.embedding.length === 0)
      return { ready: false, matches: [] };
    if (profile.embeddingModel !== EMBEDDING_MODEL_ID)
      return { ready: false, matches: [] };
    const lexicon: {
      studentTokens: string[];
      projects: { id: string; text: string }[];
    } | null = await ctx.runQuery(matchLexiconRef, {
      subject: identity.subject,
    });
    if (!lexicon) return { ready: false, matches: [] };
    const vectorHits = await ctx.vectorSearch("projects", "by_embedding", {
      vector: profile.embedding,
      limit: 24,
    });
    const bm25 = bm25Scores(lexicon.studentTokens, lexicon.projects);
    const ranked = hybridRank(
      vectorHits.map((hit) => ({ id: String(hit._id), similarity: hit._score })),
      bm25,
      5,
    );
    if (!ranked.length) return { ready: true, matches: [] };
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
      ids: ranked.map((entry) => entry.id as never),
    });
    const scoreById = new Map(ranked.map((entry) => [entry.id, entry.score]));
    return {
      ready: true,
      matches: docs
        .map((doc) => ({
          sourceId: doc.sourceId,
          title: doc.title,
          department: doc.department,
          summary: doc.summary,
          faculty: doc.faculty,
          sourceUrl: doc.sourceUrl,
          similarity: scoreById.get(doc.id) ?? 0,
          open: doc.open,
        }))
        .sort((a, b) => b.similarity - a.similarity),
    };
  },
});

// Faculty-side AI ranking: hybrid vector + BM25 ranking of consented students
// against a lab.
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
    const lexicon: {
      labTokens: string[];
      students: { id: string; text: string }[];
    } | null = await ctx.runQuery(candidateLexiconRef, { labId: args.labId });
    if (!lexicon) return { ready: false, matches: [] };
    const vectorHits = await ctx.vectorSearch("students", "by_embedding", {
      vector: lab.embedding,
      limit: 24,
      filter: (q) => q.eq("recruitmentConsent", true),
    });
    const bm25 = bm25Scores(lexicon.labTokens, lexicon.students);
    const ranked = hybridRank(
      vectorHits.map((hit) => ({ id: String(hit._id), similarity: hit._score })),
      bm25,
      5,
    );
    if (!ranked.length) return { ready: true, matches: [] };
    const students: {
      studentId: string;
      name: string;
      major: string;
      schoolYear: string;
      skills: string[];
      interests: string[];
      hoursPerWeek: number;
    }[] = await ctx.runQuery(studentsByIdsRef, {
      ids: ranked.map((entry) => entry.id as never),
    });
    const scoreById = new Map(ranked.map((entry) => [entry.id, entry.score]));
    return {
      ready: true,
      matches: students
        .map((student) => ({
          ...student,
          similarity: scoreById.get(student.studentId) ?? 0,
        }))
        .sort((a, b) => b.similarity - a.similarity),
    };
  },
});
