import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const previewVariantValidator = v.union(
  v.literal("neonGrid"),
  v.literal("tokenBoard"),
  v.literal("atlasPanel"),
  v.literal("monoWire"),
  v.literal("candyStack"),
  v.literal("brutalist"),
);

const sortModeValidator = v.union(
  v.literal("trending"),
  v.literal("newest"),
  v.literal("mostViewed"),
);

const normalizeText = (value: string) => value.trim().toLowerCase();

const trendingScore = (doc: {
  upvotes: number;
  views: number;
  createdAt: number;
}) => {
  const hoursSinceCreated = Math.max(
    (Date.now() - doc.createdAt) / (1000 * 60 * 60),
    1,
  );
  const freshnessBoost = 40 / (1 + hoursSinceCreated / 18);
  return doc.upvotes * 5 + doc.views * 0.25 + freshnessBoost;
};

export const listTrending = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 8, 40));
    const scanSize = Math.min(Math.max(limit * 8, 120), 500);
    const docs = await ctx.db
      .query("designSystems")
      .withIndex("by_published_createdAt", (q) => q.eq("published", true))
      .order("desc")
      .take(scanSize);

    return docs
      .sort((a, b) => trendingScore(b) - trendingScore(a))
      .slice(0, limit);
  },
});

export const listExplore = query({
  args: {
    search: v.optional(v.string()),
    tag: v.optional(v.string()),
    sort: v.optional(sortModeValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 60, 120));
    const scanSize = Math.min(Math.max(limit * 10, 240), 600);
    const docs = await ctx.db
      .query("designSystems")
      .withIndex("by_published_createdAt", (q) => q.eq("published", true))
      .order("desc")
      .take(scanSize);

    const search = args.search ? normalizeText(args.search) : "";
    const tag = args.tag ? normalizeText(args.tag) : "";

    const filtered = docs.filter((doc) => {
      const searchable = normalizeText(
        `${doc.title} ${doc.tagline} ${doc.description} ${doc.tags.join(" ")}`,
      );
      const searchMatch = !search || searchable.includes(search);
      const tagMatch =
        !tag || doc.tags.map((item) => normalizeText(item)).includes(tag);
      return searchMatch && tagMatch;
    });

    const sortMode = args.sort ?? "trending";
    if (sortMode === "newest") {
      filtered.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortMode === "mostViewed") {
      filtered.sort((a, b) => b.views - a.views);
    } else {
      filtered.sort((a, b) => trendingScore(b) - trendingScore(a));
    }

    return filtered.slice(0, limit);
  },
});

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("designSystems")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!doc || !doc.published) {
      return null;
    }
    return doc;
  },
});

export const createDesignSystem = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    tagline: v.string(),
    description: v.string(),
    previewVariant: previewVariantValidator,
    cover: v.string(),
    tags: v.array(v.string()),
    externalUrl: v.string(),
    authorId: v.string(),
    authorName: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("designSystems")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("Slug already exists");
    }

    const now = Date.now();
    const id = await ctx.db.insert("designSystems", {
      slug: args.slug,
      title: args.title,
      tagline: args.tagline,
      description: args.description,
      previewVariant: args.previewVariant,
      cover: args.cover,
      tags: args.tags,
      externalUrl: args.externalUrl,
      authorId: args.authorId,
      authorName: args.authorName,
      views: 0,
      upvotes: 0,
      createdAt: now,
      updatedAt: now,
      published: true,
    });

    return { id, slug: args.slug };
  },
});

export const incrementView = mutation({
  args: {
    id: v.id("designSystems"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) {
      throw new Error("Design system not found");
    }

    const views = doc.views + 1;
    await ctx.db.patch(args.id, {
      views,
      updatedAt: Date.now(),
    });

    return { views };
  },
});

export const toggleUpvote = mutation({
  args: {
    id: v.id("designSystems"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) {
      throw new Error("Design system not found");
    }

    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_designSystem_user", (q) =>
        q.eq("designSystemId", args.id).eq("userId", args.userId),
      )
      .first();

    if (existingVote) {
      await ctx.db.delete(existingVote._id);
      const upvotes = Math.max(doc.upvotes - 1, 0);
      await ctx.db.patch(args.id, {
        upvotes,
        updatedAt: Date.now(),
      });
      return { upvoted: false, upvotes };
    }

    await ctx.db.insert("votes", {
      designSystemId: args.id,
      userId: args.userId,
      createdAt: Date.now(),
    });

    const upvotes = doc.upvotes + 1;
    await ctx.db.patch(args.id, {
      upvotes,
      updatedAt: Date.now(),
    });

    return { upvoted: true, upvotes };
  },
});

export const seedTrending = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("designSystems").take(1);
    if (existing.length > 0) {
      return { seeded: false };
    }

    const now = Date.now();
    const seedItems = [
      {
        slug: "aurora-prime",
        title: "Aurora Prime",
        tagline: "A fast visual language for SaaS dashboards.",
        description:
          "Composable tokens, dense tables, and polished states for modern admin experiences.",
        previewVariant: "neonGrid" as const,
        cover:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        tags: ["saas", "dashboard", "tokens"],
        externalUrl: "https://example.com/aurora-prime",
        authorId: "seed-system",
        authorName: "Vibe Team",
        views: 940,
        upvotes: 188,
      },
      {
        slug: "chroma-kit",
        title: "Chroma Kit",
        tagline: "Bold e-commerce UI primitives with adaptive scales.",
        description:
          "High-contrast commerce components tuned for conversion, speed, and clarity.",
        previewVariant: "candyStack" as const,
        cover:
          "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
        tags: ["commerce", "marketing", "components"],
        externalUrl: "https://example.com/chroma-kit",
        authorId: "seed-system",
        authorName: "Vibe Team",
        views: 1205,
        upvotes: 247,
      },
      {
        slug: "mono-flow",
        title: "Mono Flow",
        tagline: "Minimal black-and-white foundations for product teams.",
        description:
          "A strict mono grammar for teams that need precision and consistent structure.",
        previewVariant: "monoWire" as const,
        cover:
          "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80",
        tags: ["minimal", "product", "components"],
        externalUrl: "https://example.com/mono-flow",
        authorId: "seed-system",
        authorName: "Vibe Team",
        views: 760,
        upvotes: 171,
      },
      {
        slug: "vector-atlas",
        title: "Vector Atlas",
        tagline: "Data-heavy interface kit for analytics products.",
        description:
          "Charts, controls, and structured card patterns for high-information dashboards.",
        previewVariant: "atlasPanel" as const,
        cover:
          "https://images.unsplash.com/photo-1518186233392-c232efbf2373?auto=format&fit=crop&w=1200&q=80",
        tags: ["analytics", "data", "dashboard"],
        externalUrl: "https://example.com/vector-atlas",
        authorId: "seed-system",
        authorName: "Vibe Team",
        views: 685,
        upvotes: 142,
      },
    ];

    for (const item of seedItems) {
      await ctx.db.insert("designSystems", {
        ...item,
        createdAt: now,
        updatedAt: now,
        published: true,
      });
    }

    return { seeded: true };
  },
});
