import Link from "next/link";
import { GeneratorPanel } from "@/components/generator-panel";
import { TrendingGrid } from "@/components/trending-grid";

const metrics = [
  { value: "22+", label: "Design systems created" },
  { value: "5+", label: "Active creators" },
  { value: "1670+", label: "Community views" },
  { value: "<1s", label: "Avg generation time" },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="fade-in rounded-[32px] border border-white/35 bg-[linear-gradient(155deg,#1e2554_0%,#35407a_45%,#6d7ab8_100%)] px-6 py-12 text-white shadow-[0_30px_80px_rgba(15,20,45,0.35)] sm:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
                Vibe Coding Platform
              </p>
              <h1 className="mt-4 font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                Build production-grade design systems from any idea.
              </h1>
              <p className="mt-4 max-w-xl text-sm text-white/80 sm:text-base">
                Mirror-ready workflows inspired by vibe coding. Generate, publish,
                and discover high-quality systems with dynamic trending signals.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/auth/signup?callbackUrl=%2Fsubmit"
                  className="rounded-full bg-[color:var(--vibe-brand)] px-5 py-2 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:bg-[color:var(--vibe-brand-strong)]"
                >
                  Start creating
                </Link>
                <Link
                  href="/explore"
                  className="rounded-full border border-white/30 px-5 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-white/60"
                >
                  Explore systems
                </Link>
              </div>
            </div>

            <div className="stagger-up rounded-3xl border border-white/20 bg-white/12 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                Trending now
              </p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-xl border border-white/20 bg-white/5 p-3">
                  <p className="text-sm font-bold">Aurora Prime</p>
                  <p className="mt-1 text-xs text-white/70">
                    SaaS dashboard design language
                  </p>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/5 p-3">
                  <p className="text-sm font-bold">Chroma Kit</p>
                  <p className="mt-1 text-xs text-white/70">
                    Commerce-ready component stack
                  </p>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/5 p-3">
                  <p className="text-sm font-bold">Vector Atlas</p>
                  <p className="mt-1 text-xs text-white/70">
                    Data-first analytics UI system
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <GeneratorPanel />
      <TrendingGrid limit={8} compact />

      <section className="content-auto mx-auto mt-16 w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-black/10 bg-white/84 p-8 shadow-[0_14px_32px_rgba(10,18,34,0.07)]">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-black/10 bg-white/80 px-4 py-5 text-center"
              >
                <p className="font-display text-4xl font-black text-[color:var(--vibe-ink)]">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm font-semibold text-[color:var(--vibe-muted)]">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
