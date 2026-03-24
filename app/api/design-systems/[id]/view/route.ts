import { NextResponse } from "next/server";
import { getConvexHttpClient } from "@/lib/convex-server";
import { designSystemRefs } from "@/lib/convex-refs";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, context: Context) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const convex = getConvexHttpClient();
    const result = await convex.mutation(designSystemRefs.incrementView, {
      id,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "View update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
