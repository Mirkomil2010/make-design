import { api } from "@/convex/_generated/api";
import type { FunctionReference } from "convex/server";

type DesignSystemRefs = {
  listTrending: FunctionReference<"query">;
  listExplore: FunctionReference<"query">;
  getBySlug: FunctionReference<"query">;
  createDesignSystem: FunctionReference<"mutation">;
  incrementView: FunctionReference<"mutation">;
  toggleUpvote: FunctionReference<"mutation">;
  seedTrending: FunctionReference<"mutation">;
};

type UserRefs = {
  createUser: FunctionReference<"mutation">;
  getByUsername: FunctionReference<"query">;
  touchLogin: FunctionReference<"mutation">;
};

const root = api as unknown as {
  designSystems: DesignSystemRefs;
  users: UserRefs;
};

export const designSystemRefs = root.designSystems;
export const userRefs = root.users;
