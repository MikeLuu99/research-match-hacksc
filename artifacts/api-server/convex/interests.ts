import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { authComponent } from "./auth";
import { accountProfileFor, studentProfileForOwner } from "./users";
import { mutation, query } from "./model";
import { compatibilityScore } from "./compatibility";

const statusValidator = v.union(
  v.literal("interested"),
  v.literal("conversation"),
  v.literal("accepted"),
  v.literal("declined"),
  v.literal("withdrawn"),
);

// Student expresses interest in a lab (must be an open listing). One record
// per student per lab; re-expressing re-activates a withdrawn one.
export const expressInterest = mutation({
  args: { sourceId: v.string() },
  returns: v.object({ interestId: v.string() }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const profile = await studentProfileForOwner(ctx, user._id);
    if (!profile)
      throw new ConvexError("Complete your profile before showing interest.");
    const project = await ctx.db
      .query("projects")
      .withIndex("by_source", (q) => q.eq("sourceId", args.sourceId))
      .unique();
    if (!project) throw new ConvexError("Lab not found.");
    if (project.recruitmentStatus === "closed")
      throw new ConvexError(
        "This lab is closed — it is not accepting interest right now.",
      );
    const existing = await ctx.db
      .query("interests")
      .withIndex("by_student", (q) => q.eq("studentId", profile._id))
      .collect();
    const mine = existing.find((i) => i.sourceId === args.sourceId);
    if (mine) {
      await ctx.db.patch(mine._id, {
        status: "interested",
        updatedAt: Date.now(),
      });
      return { interestId: mine._id };
    }
    const now = Date.now();
    const interestId = await ctx.db.insert("interests", {
      studentId: profile._id,
      sourceId: args.sourceId,
      status: "interested",
      createdAt: now,
      updatedAt: now,
    });
    return { interestId };
  },
});

// The student's own interests with the lab details joined.
export const myInterests = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return [];
    const profile = await studentProfileForOwner(ctx, user._id);
    if (!profile) return [];
    const interests = await ctx.db
      .query("interests")
      .withIndex("by_student", (q) => q.eq("studentId", profile._id))
      .collect();
    const out = [];
    for (const interest of interests) {
      const project = await ctx.db
        .query("projects")
        .withIndex("by_source", (q) => q.eq("sourceId", interest.sourceId))
        .unique();
      out.push({
        interestId: interest._id,
        sourceId: interest.sourceId,
        status: interest.status,
        updatedAt: interest.updatedAt,
        title: project?.title ?? interest.sourceId,
        department: project?.department ?? "",
        faculty: project?.faculty ?? "",
        labStatus: project?.recruitmentStatus ?? "explore",
      });
    }
    return out.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Student withdraws their own interest.
export const withdrawInterest = mutation({
  args: { interestId: v.id("interests") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const profile = await studentProfileForOwner(ctx, user._id);
    const interest = await ctx.db.get(args.interestId);
    if (!interest || !profile || interest.studentId !== profile._id)
      throw new ConvexError("You can only withdraw your own interest.");
    await ctx.db.patch(args.interestId, {
      status: "withdrawn",
      updatedAt: Date.now(),
    });
    return null;
  },
});

// Faculty inbox: interests on projects the faculty member owns, joined with
// the student's profile.
export const labInbox = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const account = await accountProfileFor(ctx, user._id);
    if (!account || account.accountType !== "faculty")
      throw new ConvexError("Only faculty accounts have an interest inbox.");
    const owned = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();
    const ownerBySource = new Map(
      owned.map((project) => [project.sourceId, project]),
    );
    const all = await ctx.db.query("interests").collect();
    const out = [];
    for (const interest of all) {
      const project = ownerBySource.get(interest.sourceId);
      if (!project) continue;
      const student = await ctx.db.get(interest.studentId);
      if (!student) continue;
      out.push({
        interestId: interest._id,
        projectId: project._id,
        sourceId: interest.sourceId,
        projectTitle: project.title,
        status: interest.status,
        updatedAt: interest.updatedAt,
        studentName: student.name,
        studentMajor: student.major,
        studentSchoolYear: student.schoolYear,
        studentSkills: student.skills,
        studentSchedule: student.schedule ?? "",
        studentBio: student.bio ?? "",
        studentMinors: student.minors ?? [],
        studentInterests: student.interests,
        studentExperience: student.experience,
        studentHoursPerWeek: student.hoursPerWeek,
        studentSeekingCredit: student.seekingCredit,
        studentWorkStudy: student.workStudy,
        compatibility: compatibilityScore(student, project),
      });
    }
    return out.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Faculty updates a status on an interest for a project they own.
export const setInterestStatus = mutation({
  args: { interestId: v.id("interests"), status: statusValidator },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const account = await accountProfileFor(ctx, user._id);
    if (!account || account.accountType !== "faculty")
      throw new ConvexError("Only faculty accounts can update statuses.");
    const interest = await ctx.db.get(args.interestId);
    if (!interest) throw new ConvexError("Interest not found.");
    const project = await ctx.db
      .query("projects")
      .withIndex("by_source", (q) => q.eq("sourceId", interest.sourceId))
      .unique();
    if (!project || project.ownerId !== user._id)
      throw new ConvexError("You can only update interests on your own projects.");
    await ctx.db.patch(args.interestId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return null;
  },
});
