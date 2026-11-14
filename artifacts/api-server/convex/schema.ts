import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// A model identifier is persisted so vectors from different models are never
// compared accidentally. Configure the embedding provider before importing.
export default defineSchema({
  accountProfiles: defineTable({
    authUserId: v.string(),
    name: v.string(),
    accountType: v.union(v.literal("student"), v.literal("faculty")),
  }).index("by_auth_user", ["authUserId"]),
  projects: defineTable({
    sourceId: v.string(),
    title: v.string(),
    department: v.string(),
    description: v.string(),
    faculty: v.string(),
    requiredSkills: v.array(v.string()),
    preferredSkills: v.array(v.string()),
    hoursPerWeek: v.number(),
    offersCredit: v.boolean(),
    beginnerFriendly: v.boolean(),
    recruitmentStatus: v.union(
      v.literal("open"),
      v.literal("closed"),
      v.literal("explore"),
    ),
    sourceUrl: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
    embeddingModel: v.string(),
    embedding: v.array(v.float64()),
  })
    .index("by_source", ["sourceId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["recruitmentStatus"],
    }),
  students: defineTable({
    ownerSubject: v.string(),
    name: v.string(),
    major: v.string(),
    skills: v.array(v.string()),
    interests: v.array(v.string()),
    hoursPerWeek: v.number(),
    seekingCredit: v.boolean(),
    // Only explicit opt-in records may appear in reverse matching.
    recruitmentConsent: v.boolean(),
    embeddingModel: v.string(),
    embedding: v.array(v.float64()),
  })
    .index("by_owner", ["ownerSubject"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["recruitmentConsent"],
    }),
});
