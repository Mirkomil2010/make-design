import type { PreviewVariant } from "@/lib/types";

type PreviewProps = {
  variant: PreviewVariant;
  title: string;
  tagline: string;
};

function NeonGrid({ title }: { title: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#101522] p-3 text-cyan-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.2),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(56,189,248,0.25),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(125,211,252,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.08)_1px,transparent_1px)] bg-[size:20px_20px]" />
      <div className="relative">
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-200/80">
          Neural Layout
        </p>
        <p className="mt-2 text-sm font-bold">{title}</p>
      </div>
    </div>
  );
}

function TokenBoard({ title }: { title: string }) {
  return (
    <div className="h-full w-full rounded-2xl bg-white p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
        Design Tokens
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="h-8 rounded bg-emerald-200" />
        <div className="h-8 rounded bg-emerald-400" />
        <div className="h-8 rounded bg-emerald-700" />
        <div className="h-8 rounded bg-slate-100" />
        <div className="h-8 rounded bg-slate-300" />
        <div className="h-8 rounded bg-slate-900" />
      </div>
      <p className="mt-3 text-xs font-bold text-slate-700">{title}</p>
    </div>
  );
}

function AtlasPanel({ title }: { title: string }) {
  return (
    <div className="h-full w-full rounded-2xl bg-[#0f172a] p-3 text-white">
      <div className="grid h-full grid-cols-[1fr_1.6fr] gap-3">
        <div className="rounded-lg bg-white/5 p-2">
          <div className="h-2 w-12 rounded bg-white/50" />
          <div className="mt-2 h-2 w-8 rounded bg-white/20" />
          <div className="mt-5 h-16 rounded bg-white/10" />
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <div className="h-2 w-20 rounded bg-white/40" />
          <div className="mt-3 h-10 rounded bg-cyan-300/20" />
          <p className="mt-3 text-xs font-semibold text-white/70">{title}</p>
        </div>
      </div>
    </div>
  );
}

function MonoWire({ title }: { title: string }) {
  return (
    <div className="h-full w-full rounded-2xl border border-slate-300 bg-white p-3 text-slate-900">
      <div className="grid h-full grid-rows-[auto_1fr] gap-3">
        <div className="flex items-center justify-between">
          <div className="h-2 w-12 rounded bg-slate-300" />
          <div className="h-2 w-6 rounded bg-slate-300" />
        </div>
        <div className="rounded-lg border border-dashed border-slate-400 p-2">
          <div className="h-5 rounded bg-slate-100" />
          <div className="mt-2 h-5 rounded bg-slate-100" />
          <p className="mt-2 text-xs font-semibold">{title}</p>
        </div>
      </div>
    </div>
  );
}

function CandyStack({ title }: { title: string }) {
  return (
    <div className="h-full w-full rounded-2xl bg-[linear-gradient(145deg,#ffedd5,#fde68a,#fecdd3)] p-3">
      <div className="grid h-full grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/70 p-2">
          <div className="h-2 w-10 rounded bg-orange-300/80" />
          <div className="mt-2 h-10 rounded bg-orange-200/80" />
        </div>
        <div className="rounded-xl bg-white/70 p-2">
          <div className="h-2 w-10 rounded bg-rose-300/80" />
          <div className="mt-2 h-10 rounded bg-rose-200/80" />
        </div>
      </div>
      <p className="mt-2 text-xs font-bold text-slate-700">{title}</p>
    </div>
  );
}

function Brutalist({ title, tagline }: { title: string; tagline: string }) {
  return (
    <div className="h-full w-full rounded-2xl bg-[#111] p-3 text-white">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-lime-300">
        Brutalist System
      </p>
      <p className="mt-2 text-sm font-black uppercase">{title}</p>
      <p className="mt-3 text-[11px] text-white/70">{tagline}</p>
    </div>
  );
}

export function DesignSystemPreview({ variant, title, tagline }: PreviewProps) {
  if (variant === "tokenBoard") return <TokenBoard title={title} />;
  if (variant === "atlasPanel") return <AtlasPanel title={title} />;
  if (variant === "monoWire") return <MonoWire title={title} />;
  if (variant === "candyStack") return <CandyStack title={title} />;
  if (variant === "brutalist")
    return <Brutalist title={title} tagline={tagline} />;
  return <NeonGrid title={title} />;
}
