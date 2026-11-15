import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// A model identifier is persisted so vectors from different models are never
// compared accidentally. Configure the embedding provider before importing.
export const schoolYear = v.union(
  v.literal("freshman"),
  v.literal("sophomore"),
  v.literal("junior"),
  v.literal("senior"),
  v.literal("masters"),
  v.literal("phd"),
);

// Profile fields shared between the students table and the profile upsert
// mutation so both stay in sync.
export const studentProfileFields = {
  major: v.string(),
  // Optional so profiles saved before the field exists still validate;
  // handlers default it to [].
  minors: v.optional(v.array(v.string())),
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
  // Optional so legacy profiles validate; handlers default it to "".
  bio: v.optional(v.string()),
  // Weekly availability as comma-separated day-hour tokens ("mon-9,tue-14").
  schedule: v.optional(v.string()),
};

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
    ...studentProfileFields,
    // Only explicit opt-in records may appear in reverse matching.
    recruitmentConsent: v.boolean(),
    // Resume is stored as a file; parsed structured data lands in
    // experience/skills. Embeddings are generated once a provider is configured.
    resumeStorageId: v.optional(v.string()),
    resumeFileName: v.optional(v.string()),
    resumeParsedAt: v.optional(v.number()),
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
