import { ConvexHttpClient } from "convex/browser";

export function getConvexHttpClient() {
  const convexUrl =
    process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL ?? "";

  if (!convexUrl) {
    throw new Error(
      "Missing Convex URL. Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL.",
    );
  }

  return new ConvexHttpClient(convexUrl);
}
