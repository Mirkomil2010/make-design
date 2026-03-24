import { NextResponse } from "next/server";
import { getConvexHttpClient } from "@/lib/convex-server";
import { designSystemRefs } from "@/lib/convex-refs";

export async function POST() {
  try {
    const convex = getConvexHttpClient();
    const result = await convex.mutation(designSystemRefs.seedTrending, {});
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Seed failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
