import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getConvexHttpClient } from "@/lib/convex-server";
import { designSystemRefs } from "@/lib/convex-refs";
import { authOptions } from "@/lib/auth";
import type { PreviewVariant } from "@/lib/types";
import { slugify } from "@/lib/slug";

const previewVariants: PreviewVariant[] = [
  "neonGrid",
  "tokenBoard",
  "atlasPanel",
  "monoWire",
  "candyStack",
  "brutalist",
];

const safeText = (value: unknown, maxLen: number) =>
  String(value ?? "")
    .trim()
    .slice(0, maxLen);

const isValidHttpUrl = (value: string) => /^https?:\/\/.+/.test(value);

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = safeText(body.title, 120);
  const tagline = safeText(body.tagline, 180);
  const description = safeText(body.description, 600);
  const cover = safeText(body.cover, 600);
  const externalUrl = safeText(body.externalUrl, 600);
  const previewVariant = safeText(body.previewVariant, 40) as PreviewVariant;
  const tags = Array.isArray(body.tags)
    ? body.tags
        .map((tag: unknown) => safeText(tag, 24).toLowerCase())
        .filter(Boolean)
        .slice(0, 8)
    : [];

  if (!title || !tagline || !description || !externalUrl) {
    return NextResponse.json(
      { error: "title, tagline, description and externalUrl are required" },
      { status: 400 },
    );
  }

  if (!isValidHttpUrl(externalUrl) || (cover && !isValidHttpUrl(cover))) {
    return NextResponse.json(
      { error: "cover and externalUrl must be valid http(s) URLs" },
      { status: 400 },
    );
  }

  if (!previewVariants.includes(previewVariant)) {
    return NextResponse.json(
      { error: "Invalid previewVariant" },
      { status: 400 },
    );
  }

  const baseSlug = slugify(title);
  if (!baseSlug) {
    return NextResponse.json({ error: "Invalid title" }, { status: 400 });
  }

  const slug = `${baseSlug}-${Math.floor(Date.now() / 1000)}`;
  const authorId =
    session.user.id ?? session.user.email ?? session.user.name ?? "unknown-user";
  const authorName = session.user.name ?? "Anonymous creator";

  try {
    const convex = getConvexHttpClient();
    const created = await convex.mutation(designSystemRefs.createDesignSystem, {
      slug,
      title,
      tagline,
      description,
      previewVariant,
      cover:
        cover ||
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      tags,
      externalUrl,
      authorId,
      authorName,
    });

    return NextResponse.json({ ok: true, ...created }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create design system";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
