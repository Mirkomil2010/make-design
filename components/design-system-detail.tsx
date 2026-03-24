"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useQuery } from "convex/react";
import { signIn, useSession } from "next-auth/react";
import { DesignSystemPreview } from "@/components/design-system-preview";
import { designSystemRefs } from "@/lib/convex-refs";
import type { DesignSystem } from "@/lib/types";

type DetailProps = {
  slug: string;
};

export function DesignSystemDetail({ slug }: DetailProps) {
  const { data: session } = useSession();
  const trackedRef = useRef(false);
  const [localUpvotes, setLocalUpvotes] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const item = useQuery(designSystemRefs.getBySlug, {
    slug,
  }) as DesignSystem | null | undefined;

  useEffect(() => {
    if (!item?._id || trackedRef.current) return;
    trackedRef.current = true;
    fetch(`/api/design-systems/${item._id}/view`, { method: "POST" }).catch(
      () => null,
    );
  }, [item?._id]);

  const onUpvote = () => {
    if (!item?._id) return;
    if (!session?.user) {
      signIn(undefined, { callbackUrl: `/design-systems/${slug}` });
      return;
    }
    startTransition(async () => {
      const response = await fetch(`/api/design-systems/${item._id}/upvote`, {
        method: "POST",
      });
      if (!response.ok) return;
      const payload = await response.json();
      if (typeof payload.upvotes === "number") {
        setLocalUpvotes(payload.upvotes);
      }
    });
  };

  if (item === undefined) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="skeleton-soft h-72 rounded-3xl" />
      </section>
    );
  }

  if (!item) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-dashed border-black/20 bg-white/80 p-12 text-center">
          <h1 className="font-display text-2xl font-black text-[color:var(--vibe-ink)]">
            Design system not found
          </h1>
          <p className="mt-2 text-sm text-[color:var(--vibe-muted)]">
            This item may be unpublished or removed.
          </p>
          <Link
            href="/explore"
            className="mt-5 inline-flex rounded-full bg-[color:var(--vibe-brand)] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-black"
          >
            Back to explore
          </Link>
        </div>
      </section>
    );
  }

  const votes = localUpvotes ?? item.upvotes;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-black/10 bg-white/90 p-4 shadow-[0_24px_50px_rgba(16,24,40,0.1)]">
          <div className="h-[360px]">
            <DesignSystemPreview
              variant={item.previewVariant}
              title={item.title}
              tagline={item.tagline}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_24px_50px_rgba(16,24,40,0.1)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--vibe-muted)]">
            Vibe Coding system
          </p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-[color:var(--vibe-ink)]">
            {item.title}
          </h1>
          <p className="mt-3 text-base font-semibold text-[color:var(--vibe-muted)]">
            {item.tagline}
          </p>
          <p className="mt-4 text-sm leading-7 text-[color:var(--vibe-muted)]">
            {item.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={`${item._id}-${tag}`}
                className="rounded-full border border-black/15 bg-black/[0.03] px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--vibe-muted)]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-2 text-sm text-[color:var(--vibe-muted)]">
            <p>
              Created by <span className="font-semibold">{item.authorName}</span>
            </p>
            <p>Views: {item.views}</p>
            <p>Upvotes: {votes}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={onUpvote}
              className="rounded-full bg-[color:var(--vibe-brand)] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-black transition hover:bg-[color:var(--vibe-brand-strong)] disabled:opacity-60"
            >
              Upvote
            </button>
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-black/20 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-[color:var(--vibe-ink)] transition hover:border-black/35"
            >
              Visit source
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
