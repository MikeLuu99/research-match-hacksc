import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";
import { mutation, query } from "./model";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;
    const profile = await ctx.db
      .query("accountProfiles")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", user._id))
      .unique();
    return {
      id: user._id,
      name: profile?.name ?? user.name,
      accountType: profile?.accountType ?? null,
    };
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
    const existing = await ctx.db
      .query("accountProfiles")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", user._id))
      .unique();
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
