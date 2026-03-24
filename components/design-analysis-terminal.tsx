import type { AIDesignDraft } from "@/lib/ai-draft";

type DesignAnalysisTerminalProps = {
  draft: AIDesignDraft;
};

function getSystemName(title: string) {
  const cleaned = String(title ?? "")
    .replace(/[^a-z0-9 ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (cleaned.split(" ")[0] || "VISUAL").toUpperCase();
}

function buildLines(draft: AIDesignDraft) {
  if (draft.analysisReport?.trim()) {
    return draft.analysisReport
      .replace(/\r/g, "")
      .split("\n")
      .map((line) => line.trimEnd());
  }

  const name = getSystemName(draft.title);
  const a = draft.analysis;
  const lines: string[] = [];

  lines.push(`${name}`);
  lines.push("// System v1.0");
  lines.push("Foundation");
  lines.push("Design Tokens");
  lines.push("Components");
  lines.push("Atoms");
  lines.push("Molecules");
  lines.push("Organisms");
  lines.push("AI Components");
  lines.push("");
  lines.push("Tokens");
  lines.push("Core visual values extracted from the analyzed image.");
  lines.push("");
  lines.push("Primary Scale (Ice/Glow)");
  lines.push(...a.primaryScale);
  lines.push("Secondary Scale (Structure)");
  lines.push(...a.secondaryScale);
  lines.push("Neutral Scale");
  lines.push(...a.neutralScale);
  lines.push("Semantic Colors");
  lines.push(`Success: ${a.semanticColors.success}`);
  lines.push(`Warning: ${a.semanticColors.warning}`);
  lines.push(`Error: ${a.semanticColors.error}`);
  lines.push(`Info: ${a.semanticColors.info}`);
  lines.push("Typography (Mono / Sans)");
  lines.push(a.typography.display);
  lines.push(a.typography.heading1);
  lines.push(a.typography.heading2);
  lines.push(a.typography.heading3);
  lines.push(a.typography.heading4);
  lines.push(a.typography.body);
  lines.push(a.typography.small);
  lines.push(a.typography.caption);
  lines.push("Spacing Scale");
  lines.push(...a.spacingScale);
  lines.push("Border Radius");
  lines.push(...a.borderRadius);
  lines.push("Shadows & Elevation");
  lines.push(...a.shadows);
  lines.push("Z-Index Scale");
  lines.push(a.zIndexScale);
  lines.push("");
  lines.push("Component Inventory");
  lines.push("Atoms");
  lines.push(...a.componentSections.atoms);
  lines.push("Molecules");
  lines.push(...a.componentSections.molecules);
  lines.push("Organisms");
  lines.push(...a.componentSections.organisms);
  lines.push("AI Components");
  lines.push(...a.componentSections.aiComponents);

  return lines;
}

export function DesignAnalysisTerminal({ draft }: DesignAnalysisTerminalProps) {
  const lines = buildLines(draft);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#23314a] bg-[#0a0f1a] text-[#98f5dd] shadow-[0_10px_25px_rgba(5,8,20,0.45)]">
      <div className="flex items-center gap-2 border-b border-[#23314a] bg-[#0d1322] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-300/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <p className="ml-2 font-mono text-[11px] uppercase tracking-[0.16em] text-cyan-100/70">
          Analysis Terminal
        </p>
      </div>
      <div className="max-h-[460px] overflow-auto px-3 py-3 font-mono text-xs leading-6">
        {lines.map((line, index) => (
          <div key={`${line}-${index}`} className="grid grid-cols-[34px_minmax(0,1fr)] gap-2">
            <span className="select-none text-cyan-300/45">{String(index + 1).padStart(2, "0")}</span>
            <span className="break-words">{line || " "}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
