import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    email: v.optional(v.string()),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastLoginAt: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_email", ["email"]),
  designSystems: defineTable({
    slug: v.string(),
    title: v.string(),
    tagline: v.string(),
    description: v.string(),
    previewVariant: v.union(
      v.literal("neonGrid"),
      v.literal("tokenBoard"),
      v.literal("atlasPanel"),
      v.literal("monoWire"),
      v.literal("candyStack"),
      v.literal("brutalist"),
    ),
    cover: v.string(),
    tags: v.array(v.string()),
    externalUrl: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    views: v.number(),
    upvotes: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    published: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_published_createdAt", ["published", "createdAt"])
    .index("by_published_upvotes", ["published", "upvotes"]),
  votes: defineTable({
    designSystemId: v.id("designSystems"),
    userId: v.string(),
    createdAt: v.number(),
  })
    .index("by_designSystem_user", ["designSystemId", "userId"])
    .index("by_designSystem", ["designSystemId"]),
});
