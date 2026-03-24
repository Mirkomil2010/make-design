const bullets = [
  "Prompt orchestration and reusable generation recipes",
  "Screenshot to structured component map",
  "Website parsing into design token recommendations",
  "Design system quality checks before publish",
];

export default function McpPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-black tracking-tight text-[color:var(--vibe-ink)] sm:text-5xl">
        MCP
      </h1>
      <p className="mt-3 text-sm text-[color:var(--vibe-muted)] sm:text-base">
        Model Context Protocol integration powering Vibe Coding generation
        quality and workflow automation.
      </p>

      <div className="mt-8 rounded-3xl border border-black/10 bg-white/90 p-7 shadow-[0_20px_45px_rgba(10,18,34,0.08)]">
        <h2 className="font-display text-2xl font-black text-[color:var(--vibe-ink)]">
          Capabilities
        </h2>
        <ul className="mt-4 space-y-3 text-sm text-[color:var(--vibe-muted)]">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
