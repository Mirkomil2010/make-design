"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { DesignSystemCard } from "@/components/design-system-card";
import { designSystemRefs } from "@/lib/convex-refs";
import type { DesignSystem } from "@/lib/types";

type TrendingGridProps = {
  limit?: number;
  compact?: boolean;
};

export function TrendingGrid({ limit = 8, compact = false }: TrendingGridProps) {
  const seededRef = useRef(false);
  const items = useQuery(designSystemRefs.listTrending, {
    limit,
  }) as DesignSystem[] | undefined;

  useEffect(() => {
    if (seededRef.current || items === undefined || items.length > 0) {
      return;
    }
    seededRef.current = true;
    fetch("/api/design-systems/seed", { method: "POST" }).catch(() => null);
  }, [items]);

  return (
    <section className="content-auto mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-black tracking-tight text-[color:var(--vibe-ink)] sm:text-4xl">
            Trending Design Systems
          </h2>
          <p className="mt-2 text-sm text-[color:var(--vibe-muted)]">
            Live from the Vibe Coding community.
          </p>
        </div>
        <Link
          href="/explore"
          className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[color:var(--vibe-ink)] transition hover:border-black/30"
        >
          View all
        </Link>
      </div>

      {items === undefined ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: Math.min(limit, 8) }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="skeleton-soft h-[320px] rounded-3xl"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/20 bg-white/70 p-10 text-center">
          <p className="font-semibold text-[color:var(--vibe-ink)]">
            No design systems yet.
          </p>
          <p className="mt-2 text-sm text-[color:var(--vibe-muted)]">
            Be the first creator to publish one.
          </p>
          <Link
            href="/submit"
            className="mt-4 inline-flex rounded-full bg-[color:var(--vibe-brand)] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-black transition hover:bg-[color:var(--vibe-brand-strong)]"
          >
            Submit first system
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <DesignSystemCard key={item._id} item={item} compact={compact} />
          ))}
        </div>
      )}
    </section>
  );
}
