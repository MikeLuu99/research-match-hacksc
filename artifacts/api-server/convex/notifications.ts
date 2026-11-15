import { ConvexError, v } from "convex/values";
import type { GenericDatabaseWriter } from "convex/server";
import { authComponent } from "./auth";
import { mutation, query, type DataModel } from "./model";
import type { NotificationDraft } from "./notificationText";

const MAX_LISTED = 50;

/** Stores a notification for one recipient. Skips when there is no recipient. */
export async function notify(
  ctx: { db: GenericDatabaseWriter<DataModel> },
  recipientId: string | undefined,
  draft: NotificationDraft,
) {
  if (!recipientId) return;
  await ctx.db.insert("notifications", {
    recipientId,
    ...draft,
    read: false,
    createdAt: Date.now(),
  });
}

// The signed-in user's latest notifications plus their unread count.
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return { unread: 0, items: [] };
    const items = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", user._id))
      .order("desc")
      .take(MAX_LISTED);
    const unread = (
      await ctx.db
        .query("notifications")
        .withIndex("by_recipient_read", (q) =>
          q.eq("recipientId", user._id).eq("read", false),
        )
        .collect()
    ).length;
    return {
      unread,
      items: items.map((n) => ({
        id: n._id,
        kind: n.kind,
        title: n.title,
        body: n.body,
        href: n.href,
        read: n.read,
        createdAt: n.createdAt,
      })),
    };
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const n = await ctx.db.get(args.id);
    if (!n || n.recipientId !== user._id)
      throw new ConvexError("Notification not found.");
    if (!n.read) await ctx.db.patch(args.id, { read: true });
    return null;
  },
});

export const markAllRead = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_read", (q) =>
        q.eq("recipientId", user._id).eq("read", false),
      )
      .collect();
    for (const n of unread) await ctx.db.patch(n._id, { read: true });
    return null;
  },
});
