import { ConvexError, v } from "convex/values";
import {
  internalMutationGeneric as internalMutation,
  internalQueryGeneric as internalQuery,
  makeFunctionReference,
} from "convex/server";
import type { GenericDatabaseReader } from "convex/server";
import { authComponent } from "./auth";
import { schoolYear, studentProfileFields } from "./schema";
import {
  EMBEDDING_MODEL_ID,
  embedBatch,
  studentEmbeddingText,
} from "./embeddings";
import { action, mutation, query, type DataModel } from "./model";

function cleanTagList(raw: string[], label: string, maxItems: number) {
  const tags = raw
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= 60);
  const unique = Array.from(new Set(tags));
  if (unique.length > maxItems)
    throw new ConvexError(`List up to ${maxItems} ${label}.`);
  return unique;
}

export async function studentProfileForOwner(
  ctx: { db: GenericDatabaseReader<DataModel> },
  ownerSubject: string,
) {
  return await ctx.db
    .query("students")
    .withIndex("by_owner", (q) => q.eq("ownerSubject", ownerSubject))
    .unique();
}

export function isUscEmail(email: string | null | undefined) {
  return Boolean(email && email.toLowerCase().endsWith("@usc.edu"));
}

export async function accountProfileFor(
  ctx: { db: GenericDatabaseReader<DataModel> },
  authUserId: string,
) {
  return await ctx.db
    .query("accountProfiles")
    .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
    .unique();
}

export const current = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;
    const profile = await accountProfileFor(ctx, user._id);
    const student = profile
      ? await studentProfileForOwner(ctx, user._id)
      : null;
    return {
      id: user._id,
      name: profile?.name ?? user.name,
      email: user.email,
      uscEmail: isUscEmail(user.email),
      accountType: profile?.accountType ?? null,
      hasStudentProfile: student !== null,
    };
  },
});

export const myStudentProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;
    return await studentProfileForOwner(ctx, user._id);
  },
});

const studentListing = v.object({
  id: v.string(),
  name: v.string(),
  ...studentProfileFields,
});


// Faculty discovery over student profiles. Only explicit recruitment-consent
// records are returned, and resume files/parse timestamps stay private.
export const listStudents = query({
  args: {},
  returns: v.array(studentListing),
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Sign in to view student candidates.");
    const account = await accountProfileFor(ctx, user._id);
    if (!account || account.accountType !== "faculty")
      throw new ConvexError(
        "Only faculty accounts can view student candidates.",
      );
    const students = await ctx.db.query("students").collect();
    return students
      .filter((student) => student.recruitmentConsent)
      .map((student) => ({
        id: student._id,
        name: student.name,
        major: student.major,
        minors: student.minors ?? [],
        schoolYear: student.schoolYear,
        skills: student.skills,
        interests: student.interests,
        experience: student.experience,
        hoursPerWeek: student.hoursPerWeek,
        workStudy: student.workStudy,
        seekingCredit: student.seekingCredit,
      }));
  },
});

export const completeProfile = mutation({
  args: {
    name: v.string(),
    accountType: v.union(v.literal("student"), v.literal("faculty")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const existing = await accountProfileFor(ctx, user._id);
    if (existing) return null;
    if (!isUscEmail(user.email))
      throw new ConvexError(
        "Sign in with your USC email (ending in @usc.edu) to create an account.",
      );
    const name = args.name.trim();
    if (name.length < 2 || name.length > 80)
      throw new ConvexError("Enter a name between 2 and 80 characters.");
    // Account type controls the initial workflow only. It never grants verified
    // faculty permissions or access to private student records.
    await ctx.db.insert("accountProfiles", {
      authUserId: user._id,
      name,
      accountType: args.accountType,
    });
    return null;
  },
});

export const generateResumeUploadUrl = action({
  args: {},
  returns: v.object({ url: v.string() }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Sign in to upload a resume.");
    return { url: await ctx.storage.generateUploadUrl() };
  },
});

// Embeddings are left empty until a provider is configured. Vector search only
// matches records with vectors, so profiles stay visible to the matching code
// once embeddings are backfilled.
export const upsertStudentProfile = mutation({
  args: {
    ...studentProfileFields,
    recruitmentConsent: v.boolean(),
    resumeStorageId: v.optional(v.string()),
    resumeFileName: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const account = await accountProfileFor(ctx, user._id);
    if (!account || account.accountType !== "student")
      throw new ConvexError("Only student accounts can save a student profile.");

    const major = args.major.trim();
    if (major.length === 0 || major.length > 120)
      throw new ConvexError("Enter your major (1 to 120 characters).");
    if (typeof args.hoursPerWeek !== "number" || Number.isNaN(args.hoursPerWeek))
      throw new ConvexError("Enter a weekly availability in hours.");
    const hoursPerWeek = Math.max(0, Math.min(80, Math.round(args.hoursPerWeek)));
    const skills = cleanTagList(args.skills, "skills", 30);
    const minors = cleanTagList(args.minors ?? [], "minors", 10);
    const interests = cleanTagList(args.interests, "interests", 30);
    if (skills.length === 0 && interests.length === 0)
      throw new ConvexError("Add at least one skill or research interest.");
    const experience = args.experience
      .map((entry) => ({
        role: entry.role.trim(),
        org: entry.org.trim(),
        description: entry.description.trim(),
      }))
      .filter((entry) => entry.role.length > 0 || entry.org.length > 0)
      .slice(0, 20)
      .map((entry) => ({
        role: entry.role.slice(0, 80),
        org: entry.org.slice(0, 80),
        description: entry.description.slice(0, 600),
      }));
    if (args.resumeStorageId !== undefined && args.resumeStorageId.length === 0)
      throw new ConvexError("Resume upload failed. Please try again.");

    const profile = await studentProfileForOwner(ctx, user._id);
    const patch = {
      name: account.name,
      major,
      schoolYear: args.schoolYear,
      minors,
      skills,
      interests,
      experience,
      hoursPerWeek,
      workStudy: args.workStudy,
      seekingCredit: args.seekingCredit,
      recruitmentConsent: args.recruitmentConsent,
      ...(args.resumeStorageId !== undefined && args.resumeFileName !== undefined
        ? {
            resumeStorageId: args.resumeStorageId,
            resumeFileName: args.resumeFileName,
            resumeParsedAt: Date.now(),
          }
        : {}),
    };
    let studentId: string;
    if (profile) {
      await ctx.db.patch(profile._id, patch);
      studentId = profile._id;
    } else {
      studentId = await ctx.db.insert("students", {
        ownerSubject: user._id,
        embeddingModel: "",
        embedding: [],
        ...patch,
      });
    }
    await ctx.scheduler.runAfter(
      0,
      makeFunctionReference<"mutation">("users:embedStudent"),
      { studentId: studentId as never },
    );
    return null;
  },
});


export const accountProfileBySubject = internalQuery({
  args: { subject: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      accountType: v.union(v.literal("student"), v.literal("faculty")),
      name: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const account = await accountProfileFor(ctx, args.subject);
    if (!account) return null;
    return { accountType: account.accountType, name: account.name };
  },
});

export const studentProfileBySubject = internalQuery({
  args: { subject: v.string() },
  handler: async (ctx, args) => {
    const student = await studentProfileForOwner(ctx, args.subject);
    if (!student) return null;
    return {
      id: student._id,
      embedding: student.embedding,
      embeddingModel: student.embeddingModel,
    };
  },
});

export const studentProfileById = internalQuery({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) return null;
    return {
      name: student.name,
      major: student.major,
      minors: student.minors ?? [],
      schoolYear: student.schoolYear,
      skills: student.skills,
      interests: student.interests,
      experience: student.experience,
      workStudy: student.workStudy,
      seekingCredit: student.seekingCredit,
    };
  },
});


export const storeStudentEmbedding = internalMutation({
  args: { studentId: v.id("students"), embedding: v.array(v.float64()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.studentId, {
      embedding: args.embedding,
      embeddingModel: EMBEDDING_MODEL_ID,
    });
    return null;
  },
});

// Generates and stores the profile embedding. Scheduled right after a profile
// save; the AI-match action treats a missing vector as "not ready yet".
export const embedStudent = action({
  args: { studentId: v.id("students") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const student: {
      name: string;
      major: string;
      minors: string[];
      schoolYear: string;
      skills: string[];
      interests: string[];
      experience: { role: string; org: string; description: string }[];
      workStudy: boolean;
      seekingCredit: boolean;
    } | null = await ctx.runQuery(
      makeFunctionReference<"query">("users:studentProfileById"),
      { studentId: args.studentId },
    );
    if (!student) return null;
    const [embedding] = await embedBatch([studentEmbeddingText(student)]);
    await ctx.runMutation(
      makeFunctionReference<"mutation">("users:storeStudentEmbedding"),
      { studentId: args.studentId, embedding },
    );
    return null;
  },
});
