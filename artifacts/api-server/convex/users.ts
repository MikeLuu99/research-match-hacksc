import { ConvexError, v } from "convex/values";
import type { GenericDatabaseReader } from "convex/server";
import { authComponent } from "./auth";
import { schoolYear, studentProfileFields } from "./schema";
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

async function studentProfileForOwner(
  ctx: { db: GenericDatabaseReader<DataModel> },
  ownerSubject: string,
) {
  return await ctx.db
    .query("students")
    .withIndex("by_owner", (q) => q.eq("ownerSubject", ownerSubject))
    .unique();
}

async function accountProfileFor(
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
  major: v.string(),
  schoolYear,
  skills: v.array(v.string()),
  interests: v.array(v.string()),
  experience: v.array(
    v.object({
      role: v.string(),
      org: v.string(),
      description: v.string(),
    }),
  ),
  hoursPerWeek: v.number(),
  workStudy: v.boolean(),
  seekingCredit: v.boolean(),
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
    if (profile) {
      await ctx.db.patch(profile._id, patch);
    } else {
      await ctx.db.insert("students", {
        ownerSubject: user._id,
        embeddingModel: "",
        embedding: [],
        ...patch,
      });
    }
    return null;
  },
});
