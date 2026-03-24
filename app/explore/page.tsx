import { ExploreView } from "@/components/explore-view";

export default function ExplorePage() {
  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-black tracking-tight text-[color:var(--vibe-ink)] sm:text-5xl">
          Explore Design Systems
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[color:var(--vibe-muted)] sm:text-base">
          Discover dynamic systems ranked by community engagement and freshness.
        </p>
      </section>
      <ExploreView />
    </>
  );
}
