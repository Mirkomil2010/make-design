import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const normalizeUsername = (username: string) => username.trim().toLowerCase();
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const usernamePattern = /^[a-z0-9_]{3,24}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createUser = mutation({
  args: {
    username: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const username = normalizeUsername(args.username);
    const email = normalizeEmail(args.email);
    const name = args.name?.trim();

    if (!usernamePattern.test(username) && !emailPattern.test(username)) {
      throw new Error("Username must be 3-24 chars (a-z, 0-9, underscore) or an email");
    }
    if (!emailPattern.test(email)) {
      throw new Error("Invalid email");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (existing) {
      throw new Error("Username already exists");
    }
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    const now = Date.now();
    const id = await ctx.db.insert("users", {
      username,
      email,
      passwordHash: args.passwordHash,
      name: name || undefined,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    });

    return { id, username };
  },
});

export const getByUsername = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const username = normalizeUsername(args.username);
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
  },
});

export const touchLogin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    await ctx.db.patch(args.userId, {
      updatedAt: now,
      lastLoginAt: now,
    });

    return { ok: true };
  },
});
