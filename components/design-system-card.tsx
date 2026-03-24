"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useSession, signIn } from "next-auth/react";
import { DesignSystemPreview } from "@/components/design-system-preview";
import type { DesignSystem } from "@/lib/types";

type CardProps = {
  item: DesignSystem;
  compact?: boolean;
};

const Eye = () => (
  <svg
    className="h-3.5 w-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M2.1 12a10.75 10.75 0 0 1 19.8 0 10.75 10.75 0 0 1-19.8 0Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ArrowUp = () => (
  <svg
    className="h-3.5 w-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="m12 19 7-7-7-7" />
    <path d="M5 12h14" />
  </svg>
);

export function DesignSystemCard({ item, compact = false }: CardProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [upvotes, setUpvotes] = useState(item.upvotes);

  const tags = useMemo(() => item.tags.slice(0, 3), [item.tags]);

  const onUpvote = () => {
    if (!session?.user) {
      signIn(undefined, { callbackUrl: `/design-systems/${item.slug}` });
      return;
    }
    startTransition(async () => {
      const response = await fetch(`/api/design-systems/${item._id}/upvote`, {
        method: "POST",
      });
      if (!response.ok) {
        return;
      }
      const payload = await response.json();
      if (typeof payload.upvotes === "number") {
        setUpvotes(payload.upvotes);
      }
    });
  };

  return (
    <article className="group overflow-hidden rounded-3xl border border-black/10 bg-white/92 shadow-[0_14px_30px_rgba(23,30,55,0.07)]">
      <Link href={`/design-systems/${item.slug}`} className="block">
        <div className={compact ? "h-40 p-3" : "h-48 p-3"}>
          <DesignSystemPreview
            variant={item.previewVariant}
            title={item.title}
            tagline={item.tagline}
          />
        </div>
      </Link>

      <div className="flex flex-col gap-4 px-4 pb-4">
        <div>
          <Link href={`/design-systems/${item.slug}`} className="block">
            <h3 className="font-display text-lg font-bold tracking-tight text-[color:var(--vibe-ink)] transition group-hover:text-[color:var(--vibe-ink-strong)]">
              {item.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-[color:var(--vibe-muted)]">
              {item.tagline}
            </p>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={`${item._id}-${tag}`}
              className="rounded-full border border-black/10 bg-black/[0.03] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--vibe-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-[color:var(--vibe-muted)]">
            by {item.authorName}
          </p>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/80 px-2 py-1 text-[11px] font-semibold text-white">
              <Eye />
              {item.views}
            </span>
            <button
              type="button"
              onClick={onUpvote}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-full border border-black/15 bg-white px-2.5 py-1 text-[11px] font-bold text-[color:var(--vibe-ink)] transition hover:border-black/30 disabled:opacity-60"
            >
              <ArrowUp />
              {upvotes}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
