import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getConvexHttpClient } from "@/lib/convex-server";
import { authOptions } from "@/lib/auth";
import { designSystemRefs } from "@/lib/convex-refs";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, context: Context) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const userId =
    session.user.id ?? session.user.email ?? session.user.name ?? "unknown-user";

  try {
    const convex = getConvexHttpClient();
    const result = await convex.mutation(designSystemRefs.toggleUpvote, {
      id,
      userId,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upvote failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
