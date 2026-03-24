"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { DesignSystemCard } from "@/components/design-system-card";
import { designSystemRefs } from "@/lib/convex-refs";
import type { DesignSystem, SortMode } from "@/lib/types";

const tags = [
  "",
  "tokens",
  "components",
  "dashboard",
  "saas",
  "commerce",
  "analytics",
  "marketing",
  "minimal",
];

const sortOptions: { value: SortMode; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "mostViewed", label: "Most viewed" },
];

export function ExploreView() {
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<SortMode>("trending");
  const searchValue = search.trim();
  const deferredSearch = useDeferredValue(searchValue);
  const deferredTag = useDeferredValue(tag);
  const deferredSort = useDeferredValue(sort);
  const isFiltering =
    deferredSearch !== searchValue ||
    deferredTag !== tag ||
    deferredSort !== sort;

  const items = useQuery(designSystemRefs.listExplore, {
    search: deferredSearch || undefined,
    tag: deferredTag || undefined,
    sort: deferredSort,
    limit: 60,
  }) as DesignSystem[] | undefined;

  const summaryText = useMemo(() => {
    if (items === undefined || isFiltering) return "Loading...";
    return `${items.length} results`;
  }, [isFiltering, items]);

  return (
    <section className="content-auto mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-black/10 bg-white/88 p-4 shadow-[0_14px_30px_rgba(10,18,34,0.07)] md:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_0.8fr_0.7fr_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, tags, or description..."
            className="h-11 rounded-xl border border-black/15 bg-white px-3 text-sm outline-none ring-0 transition focus:border-black/35"
          />
          <select
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            className="h-11 rounded-xl border border-black/15 bg-white px-3 text-sm outline-none transition focus:border-black/35"
          >
            {tags.map((tagValue) => (
              <option key={tagValue || "all"} value={tagValue}>
                {tagValue ? `Tag: ${tagValue}` : "All tags"}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortMode)}
            className="h-11 rounded-xl border border-black/15 bg-white px-3 text-sm outline-none transition focus:border-black/35"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>
          <div className="grid place-items-center rounded-xl border border-black/10 bg-black/[0.04] px-4 text-xs font-bold uppercase tracking-wide text-[color:var(--vibe-muted)]">
            {summaryText}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items === undefined || isFiltering
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`explore-skeleton-${index}`}
                className="skeleton-soft h-[320px] rounded-3xl"
              />
            ))
          : items.map((item) => <DesignSystemCard key={item._id} item={item} />)}
      </div>
    </section>
  );
}
