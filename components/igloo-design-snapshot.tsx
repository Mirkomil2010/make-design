import type { AIDesignDraft } from "@/lib/ai-draft";

type IglooDesignSnapshotProps = {
  draft: AIDesignDraft;
};

function getSystemName(title: string) {
  const cleaned = String(title ?? "")
    .replace(/[^a-z0-9 ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (cleaned.split(" ")[0] || "IGLOO").toUpperCase();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function shadowStyle(label: string) {
  const key = label.toLowerCase();
  if (key.includes("sm")) return "0 1px 2px 0 rgba(224,242,254,0.2)";
  if (key.includes("md"))
    return "0 4px 6px -1px rgba(224,242,254,0.3), 0 2px 4px -1px rgba(224,242,254,0.2)";
  if (key.includes("lg"))
    return "0 10px 15px -3px rgba(224,242,254,0.4), 0 4px 6px -2px rgba(224,242,254,0.2)";
  if (key.includes("xl"))
    return "0 20px 25px -5px rgba(224,242,254,0.5), 0 10px 10px -5px rgba(224,242,254,0.2)";
  return "0 0 15px 2px rgba(224,242,254,0.6)";
}

function radiusValue(label: string) {
  const key = label.toLowerCase();
  if (key === "none") return "0";
  if (key === "sm") return "2px";
  if (key === "md") return "4px";
  if (key === "lg") return "8px";
  if (key === "xl") return "12px";
  if (key === "full") return "9999px";
  return "6px";
}

function spacingHeight(label: string) {
  const match = /(\d+)/.exec(label);
  const value = match ? Number(match[1]) : 8;
  return Math.max(4, Math.min(value, 40));
}

function renderSwatches(colors: string[]) {
  return colors
    .map(
      (color) =>
        `<div class="color-swatch-wrap"><div class="color-swatch" style="background:${escapeHtml(color)}"></div><div class="swatch-label">${escapeHtml(color)}</div></div>`,
    )
    .join("");
}

function renderSpacing(scale: string[]) {
  return scale
    .map((item) => {
      const height = spacingHeight(item);
      return `<div class="space-row"><div class="space-bar" style="height:${height}px"></div><div class="space-label">${escapeHtml(item)}</div></div>`;
    })
    .join("");
}

function renderRadius(items: string[]) {
  return items
    .map(
      (item) =>
        `<div class="radius-box" style="border-radius:${radiusValue(item)}">${escapeHtml(item)}</div>`,
    )
    .join("");
}

function renderShadows(items: string[]) {
  return items
    .map(
      (item) =>
        `<div class="shadow-box" style="box-shadow:${shadowStyle(item)}">${escapeHtml(item)}</div>`,
    )
    .join("");
}

function renderList(items: string[]) {
  return items
    .map((item) => `<li class="component-item">${escapeHtml(item)}</li>`)
    .join("");
}

function buildSnapshotDoc(draft: AIDesignDraft) {
  const systemName = escapeHtml(getSystemName(draft.title));
  const analysis = draft.analysis;

  const semantic = [
    { label: "Success", color: analysis.semanticColors.success },
    { label: "Warning", color: analysis.semanticColors.warning },
    { label: "Error", color: analysis.semanticColors.error },
    { label: "Info", color: analysis.semanticColors.info },
  ]
    .map(
      (item) =>
        `<div class="semantic-item"><div class="color-swatch" style="background:${escapeHtml(item.color)}"></div><div class="swatch-label">${escapeHtml(item.label)}</div></div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg-base: #8aa0b5;
      --text-primary: #ffffff;
      --text-secondary: #e2e8f0;
      --text-muted: #cbd5e1;
      --font-mono: 'JetBrains Mono', monospace;
      --font-sans: 'Inter', system-ui, sans-serif;
    }
    body {
      font-family: var(--font-mono);
      background: linear-gradient(to bottom, #a1b6c9, #74899e);
      color: var(--text-primary);
      line-height: 1.45;
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    .sidebar {
      width: 260px;
      background-color: rgba(255,255,255,0.05);
      backdrop-filter: blur(10px);
      border-right: 1px solid rgba(255,255,255,0.14);
      height: 100%;
      overflow-y: auto;
      flex-shrink: 0;
    }
    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.12);
      text-transform: uppercase;
      font-size: 28px;
      font-weight: 700;
      text-shadow: 0 0 10px rgba(255,255,255,0.5);
    }
    .sidebar-sub {
      margin-top: 4px;
      font-size: 10px;
      color: var(--text-muted);
      letter-spacing: 0;
      font-weight: 400;
    }
    .sidebar-nav { padding: 14px 0; }
    .sidebar-section-title {
      padding: 10px 24px 6px;
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .sidebar-link {
      display: block;
      padding: 8px 24px;
      color: var(--text-secondary);
      font-size: 14px;
      text-decoration: none;
    }
    .sidebar-link.active {
      color: var(--text-primary);
      background: rgba(255,255,255,0.1);
      border-left: 3px solid rgba(224, 242, 254, 1);
      text-shadow: 0 0 5px rgba(224,242,254,1);
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 28px;
    }
    .wrap {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1, h2 {
      margin-bottom: 14px;
      text-shadow: 0 0 8px rgba(255,255,255,0.3);
    }
    h1 { font-size: 40px; line-height: 1.2; }
    h2 { font-size: 30px; line-height: 1.3; margin-top: 46px; }
    .lead {
      color: var(--text-secondary);
      font-family: var(--font-sans);
      margin-bottom: 24px;
      font-size: 18px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }
    .box {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      padding: 24px;
      backdrop-filter: blur(5px);
    }
    .box.full { grid-column: 1 / -1; }
    .box-title {
      color: var(--text-muted);
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 10px;
      letter-spacing: 0.8px;
    }
    .swatch-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 18px;
    }
    .color-swatch-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .color-swatch {
      width: 40px;
      height: 40px;
      border-radius: 2px;
      border: 1px solid rgba(0,0,0,0.15);
    }
    .swatch-label {
      font-size: 10px;
      color: var(--text-secondary);
      font-family: var(--font-sans);
    }
    .semantic-row {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
    }
    .semantic-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .type-grid {
      display: grid;
      grid-template-columns: minmax(260px, 1fr) minmax(240px, 1fr);
      gap: 24px;
      align-items: end;
    }
    .display { font-size: 48px; line-height: 1.1; font-weight: 700; }
    .h1 { font-size: 36px; line-height: 1.2; font-weight: 700; }
    .h2 { font-size: 30px; line-height: 1.3; font-weight: 700; }
    .h3 { font-size: 24px; line-height: 1.4; font-weight: 700; }
    .h4 { font-size: 20px; line-height: 1.5; font-weight: 700; }
    .body { font-size: 16px; font-family: var(--font-sans); }
    .small { font-size: 14px; font-family: var(--font-sans); }
    .caption { font-size: 12px; color: var(--text-muted); font-family: var(--font-sans); }
    .spacing-stack { display: grid; gap: 6px; }
    .space-row { display: flex; align-items: center; gap: 8px; }
    .space-bar {
      width: 100%;
      max-width: 220px;
      background: rgba(224,242,254,0.85);
      border: 1px solid rgba(224,242,254,0.45);
    }
    .space-label { font-size: 12px; color: var(--text-secondary); min-width: 48px; }
    .radius-grid, .shadow-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .radius-box {
      width: 64px;
      height: 64px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.35);
    }
    .shadow-box {
      width: 90px;
      height: 90px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      border-radius: 6px;
      background: rgba(255,255,255,0.13);
    }
    .zindex {
      margin-top: 10px;
      font-size: 13px;
      color: var(--text-secondary);
      font-family: var(--font-sans);
    }
    .components-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
    }
    .component-list { list-style: none; display: grid; gap: 6px; }
    .component-item {
      font-family: var(--font-sans);
      font-size: 14px;
      color: var(--text-secondary);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 6px;
      padding: 8px 10px;
      background: rgba(255,255,255,0.03);
    }
    @media (max-width: 980px) {
      body { display: block; height: auto; overflow: auto; }
      .sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid rgba(255,255,255,0.14);
      }
      .main-content { padding: 16px; }
      .grid { grid-template-columns: 1fr; }
      .type-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <aside class="sidebar">
    <div class="sidebar-header">
      ${systemName}
      <div class="sidebar-sub">// System v1.0</div>
    </div>
    <nav class="sidebar-nav">
      <div class="sidebar-section-title">Foundation</div>
      <a href="#" class="sidebar-link active">Design Tokens</a>
      <div class="sidebar-section-title">Components</div>
      <a href="#" class="sidebar-link">Atoms</a>
      <a href="#" class="sidebar-link">Molecules</a>
      <a href="#" class="sidebar-link">Organisms</a>
      <a href="#" class="sidebar-link">AI Components</a>
    </nav>
  </aside>
  <main class="main-content">
    <div class="wrap">
      <h1>Tokens</h1>
      <p class="lead">Core visual values extracted from the analyzed image.</p>
      <div class="grid">
        <section class="box">
          <div class="box-title">Primary Scale (Ice/Glow)</div>
          <div class="swatch-row">${renderSwatches(analysis.primaryScale)}</div>
          <div class="box-title">Secondary Scale (Structure)</div>
          <div class="swatch-row">${renderSwatches(analysis.secondaryScale)}</div>
          <div class="box-title">Neutral Scale</div>
          <div class="swatch-row">${renderSwatches(analysis.neutralScale)}</div>
        </section>
        <section class="box">
          <div class="box-title">Semantic Colors</div>
          <div class="semantic-row">${semantic}</div>
        </section>
        <section class="box full">
          <div class="box-title">Typography (Mono / Sans)</div>
          <div class="type-grid">
            <div>
              <div class="display">${escapeHtml(analysis.typography.display)}</div>
              <div class="h1">${escapeHtml(analysis.typography.heading1)}</div>
              <div class="h2">${escapeHtml(analysis.typography.heading2)}</div>
              <div class="h3">${escapeHtml(analysis.typography.heading3)}</div>
              <div class="h4">${escapeHtml(analysis.typography.heading4)}</div>
            </div>
            <div>
              <div class="body">${escapeHtml(analysis.typography.body)}</div>
              <div class="small">${escapeHtml(analysis.typography.small)}</div>
              <div class="caption">${escapeHtml(analysis.typography.caption)}</div>
            </div>
          </div>
        </section>
        <section class="box">
          <div class="box-title">Spacing Scale</div>
          <div class="spacing-stack">${renderSpacing(analysis.spacingScale)}</div>
        </section>
        <section class="box">
          <div class="box-title">Border Radius</div>
          <div class="radius-grid">${renderRadius(analysis.borderRadius)}</div>
        </section>
        <section class="box full">
          <div class="box-title">Shadows & Elevation</div>
          <div class="shadow-grid">${renderShadows(analysis.shadows)}</div>
          <div class="box-title" style="margin-top:16px;">Z-Index Scale</div>
          <p class="zindex">${escapeHtml(analysis.zIndexScale)}</p>
        </section>
      </div>
      <h2>Component Inventory</h2>
      <div class="components-grid">
        <section class="box">
          <div class="box-title">Atoms</div>
          <ul class="component-list">${renderList(analysis.componentSections.atoms)}</ul>
        </section>
        <section class="box">
          <div class="box-title">Molecules</div>
          <ul class="component-list">${renderList(analysis.componentSections.molecules)}</ul>
        </section>
        <section class="box">
          <div class="box-title">Organisms</div>
          <ul class="component-list">${renderList(analysis.componentSections.organisms)}</ul>
        </section>
        <section class="box">
          <div class="box-title">AI Components</div>
          <ul class="component-list">${renderList(analysis.componentSections.aiComponents)}</ul>
        </section>
      </div>
    </div>
  </main>
</body>
</html>`;
}

export function IglooDesignSnapshot({ draft }: IglooDesignSnapshotProps) {
  const doc = buildSnapshotDoc(draft);

  return (
    <iframe
      title="Igloo design preview"
      srcDoc={doc}
      className="h-[820px] w-full rounded-2xl border border-black/10 bg-white"
      sandbox=""
    />
  );
}
