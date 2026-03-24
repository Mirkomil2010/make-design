import { NextRequest, NextResponse } from "next/server";
import { slugify } from "@/lib/slug";
import {
  PREVIEW_VARIANTS,
  type AIDesignAnalysis,
  type AIDesignDraft,
  type AIGenerationMode,
  type AIComponentSections,
  type AITypographyScale,
  type AIImageHints,
} from "@/lib/ai-draft";
import type { PreviewVariant } from "@/lib/types";

const MAX_PROMPT_LENGTH = 2000;
const MAX_REPORT_LENGTH = 22000;
const HEX_COLOR_RE = /^#(?:[a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/;
const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";

const DEFAULT_ANALYSIS: AIDesignAnalysis = {
  primaryScale: ["#F8FAFC", "#E2E8F0", "#E0F2FE", "#7DD3FC", "#0284C7"],
  secondaryScale: ["#F1F5F9", "#94A3B8", "#475569", "#1E293B", "#020617"],
  neutralScale: ["#F4F4F5", "#D4D4D8", "#71717A", "#3F3F46", "#18181B"],
  semanticColors: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
  typography: {
    display: "Display 48px",
    heading1: "Heading 1 36px",
    heading2: "Heading 2 30px",
    heading3: "Heading 3 24px",
    heading4: "Heading 4 20px",
    body: "Body 16px - The quick brown fox.",
    small: "Small 14px - The quick brown fox jumps.",
    caption: "Caption 12px - Over the lazy dog.",
  },
  spacingScale: ["4px", "8px", "12px", "16px", "24px", "32px"],
  borderRadius: ["none", "sm", "md", "lg", "xl", "full"],
  shadows: ["sm", "md", "lg", "xl", "glow"],
  zIndexScale:
    "base: 0 | dropdown: 100 | sticky: 200 | overlay: 300 | modal: 400 | toast: 500",
  componentSections: {
    atoms: ["Buttons", "Inputs", "Selection Controls", "Indicators"],
    molecules: ["Form Fields", "Search and Upload", "Cards", "Navigation Lists"],
    organisms: ["Top Navigation", "Metrics", "Progression", "Notifications"],
    aiComponents: ["Chat Interface", "AI Suggestions"],
  },
};

const safeText = (value: unknown, maxLen: number) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLen);

const safeMultilineText = (value: unknown, maxLen: number) =>
  String(value ?? "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLen);

const toRecord = (value: unknown) =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};

function normalizeHexColor(value: unknown, fallback: string) {
  const normalized = safeText(value, 16).toUpperCase();
  if (!HEX_COLOR_RE.test(normalized)) return fallback;
  if (normalized.length === 4) {
    return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }
  return normalized;
}

function normalizeColorScale(value: unknown, fallback: string[]) {
  const raw = Array.isArray(value) ? value : [];
  return fallback.map((fallbackColor, index) =>
    normalizeHexColor(raw[index], fallbackColor),
  );
}

function normalizeStringArray(value: unknown, fallback: string[], max: number) {
  const raw = Array.isArray(value) ? value : [];
  const normalized = raw
    .map((item) => safeText(item, 64))
    .filter(Boolean)
    .slice(0, max);
  return normalized.length > 0 ? normalized : fallback.slice(0, max);
}

function normalizeTypography(value: unknown, fallback: AITypographyScale) {
  const source = toRecord(value);
  return {
    display: safeText(source.display, 120) || fallback.display,
    heading1: safeText(source.heading1, 120) || fallback.heading1,
    heading2: safeText(source.heading2, 120) || fallback.heading2,
    heading3: safeText(source.heading3, 120) || fallback.heading3,
    heading4: safeText(source.heading4, 120) || fallback.heading4,
    body: safeText(source.body, 160) || fallback.body,
    small: safeText(source.small, 160) || fallback.small,
    caption: safeText(source.caption, 160) || fallback.caption,
  } satisfies AITypographyScale;
}

function normalizeComponentSections(
  value: unknown,
  fallback: AIComponentSections,
) {
  const source = toRecord(value);
  return {
    atoms: normalizeStringArray(source.atoms, fallback.atoms, 8),
    molecules: normalizeStringArray(source.molecules, fallback.molecules, 8),
    organisms: normalizeStringArray(source.organisms, fallback.organisms, 8),
    aiComponents: normalizeStringArray(
      source.aiComponents,
      fallback.aiComponents,
      8,
    ),
  } satisfies AIComponentSections;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const clamp255 = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

function hexToRgb(hex: string) {
  const normalized = normalizeHexColor(hex, "");
  if (!HEX_COLOR_RE.test(normalized)) return null;
  const value = normalized.slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${clamp255(r).toString(16).padStart(2, "0")}${clamp255(g)
    .toString(16)
    .padStart(2, "0")}${clamp255(b).toString(16).padStart(2, "0")}`.toUpperCase();
}

function rgbToHsl(rgb: { r: number; g: number; b: number }) {
  const rn = rgb.r / 255;
  const gn = rgb.g / 255;
  const bn = rgb.b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness };
  }

  const saturation =
    lightness > 0.5
      ? delta / (2 - max - min)
      : delta / (max + min);

  let hue = 0;
  if (max === rn) hue = (gn - bn) / delta + (gn < bn ? 6 : 0);
  else if (max === gn) hue = (bn - rn) / delta + 2;
  else hue = (rn - gn) / delta + 4;

  return { h: hue * 60, s: saturation, l: lightness };
}

function hslToHex(h: number, s: number, l: number) {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp01(s);
  const lig = clamp01(l);

  if (sat === 0) {
    const gray = clamp255(lig * 255);
    return rgbToHex(gray, gray, gray);
  }

  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hue < 60) {
    r1 = c;
    g1 = x;
  } else if (hue < 120) {
    r1 = x;
    g1 = c;
  } else if (hue < 180) {
    g1 = c;
    b1 = x;
  } else if (hue < 240) {
    g1 = x;
    b1 = c;
  } else if (hue < 300) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  return rgbToHex((r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255);
}

function colorLuminance(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
}

function mixHex(colorA: string, colorB: string, ratio: number) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  if (!a && !b) return "#94A3B8";
  if (!a) return normalizeHexColor(colorB, "#94A3B8");
  if (!b) return normalizeHexColor(colorA, "#94A3B8");
  const t = clamp01(ratio);
  return rgbToHex(
    a.r * (1 - t) + b.r * t,
    a.g * (1 - t) + b.g * t,
    a.b * (1 - t) + b.b * t,
  );
}

function normalizeImageHints(value: unknown): AIImageHints | null {
  const source = toRecord(value);
  const rawPalette = Array.isArray(source.palette) ? source.palette : [];
  const palette = rawPalette
    .map((entry) => normalizeHexColor(entry, ""))
    .filter((entry) => HEX_COLOR_RE.test(entry))
    .slice(0, 8);

  if (palette.length === 0) return null;

  const sorted = [...palette].sort((a, b) => colorLuminance(b) - colorLuminance(a));
  const dominant = normalizeHexColor(source.dominant, palette[0]);
  const lightest = normalizeHexColor(source.lightest, sorted[0] ?? palette[0]);
  const darkest = normalizeHexColor(
    source.darkest,
    sorted[sorted.length - 1] ?? palette[palette.length - 1],
  );

  const dominantHueRaw = Number(source.dominantHue);
  const dominantHue = Number.isFinite(dominantHueRaw)
    ? Math.max(0, Math.min(359, Math.round(dominantHueRaw)))
    : Math.round(rgbToHsl(hexToRgb(dominant) ?? { r: 2, g: 132, b: 199 }).h);

  const averageLuminanceRaw = Number(source.averageLuminance);
  const averageLuminance = Number.isFinite(averageLuminanceRaw)
    ? clamp01(averageLuminanceRaw)
    : clamp01(colorLuminance(dominant));

  const fontMood = source.fontMood === "mono" ? "mono" : "sans";
  const width = Math.max(1, Math.round(Number(source.width) || 1));
  const height = Math.max(1, Math.round(Number(source.height) || 1));

  return {
    palette,
    dominant,
    lightest,
    darkest,
    dominantHue,
    averageLuminance,
    fontMood,
    width,
    height,
  };
}

function buildImageDrivenAnalysis(
  hints: AIImageHints | null,
  fallback: AIDesignAnalysis,
) {
  if (!hints) return fallback;

  const palette = hints.palette.length > 0 ? hints.palette : fallback.primaryScale;
  const lightest = hints.lightest || palette[0] || fallback.primaryScale[0];
  const darkest = hints.darkest || palette[palette.length - 1] || fallback.secondaryScale[4];

  const accentFromPalette = [...palette]
    .sort((a, b) => {
      const aRgb = hexToRgb(a) ?? { r: 0, g: 0, b: 0 };
      const bRgb = hexToRgb(b) ?? { r: 0, g: 0, b: 0 };
      const aSat = rgbToHsl(aRgb).s;
      const bSat = rgbToHsl(bRgb).s;
      return bSat - aSat;
    })
    .at(0);

  const accent = accentFromPalette || hints.dominant || fallback.primaryScale[4];

  const primaryScale = normalizeColorScale(
    [
      mixHex(lightest, accent, 0.12),
      mixHex(lightest, accent, 0.3),
      mixHex(lightest, accent, 0.5),
      mixHex(lightest, accent, 0.68),
      mixHex(accent, darkest, 0.22),
    ],
    fallback.primaryScale,
  );

  const secondaryScale = normalizeColorScale(
    [
      mixHex(lightest, darkest, 0.1),
      mixHex(lightest, darkest, 0.3),
      mixHex(lightest, darkest, 0.52),
      mixHex(lightest, darkest, 0.74),
      mixHex(lightest, darkest, 0.9),
    ],
    fallback.secondaryScale,
  );

  const neutralTop = mixHex("#FFFFFF", lightest, 0.35);
  const neutralBottom = mixHex("#000000", darkest, 0.58);
  const neutralScale = normalizeColorScale(
    [
      mixHex(neutralTop, neutralBottom, 0.06),
      mixHex(neutralTop, neutralBottom, 0.28),
      mixHex(neutralTop, neutralBottom, 0.5),
      mixHex(neutralTop, neutralBottom, 0.72),
      mixHex(neutralTop, neutralBottom, 0.9),
    ],
    fallback.neutralScale,
  );

  const semanticSaturation = hints.fontMood === "mono" ? 0.58 : 0.76;
  const semanticLightBase = hints.averageLuminance < 0.42 ? 0.62 : 0.5;
  const semanticColors = {
    success: hslToHex(145, semanticSaturation, semanticLightBase),
    warning: hslToHex(38, 0.9, 0.56),
    error: hslToHex(2, 0.88, 0.58),
    info: hslToHex(hints.dominantHue, Math.max(0.5, semanticSaturation), semanticLightBase),
  };

  const typography: AITypographyScale =
    hints.fontMood === "mono"
      ? {
          display: "Display 48px - Mono emphasis",
          heading1: "Heading 1 36px - Mono",
          heading2: "Heading 2 30px - Mono",
          heading3: "Heading 3 24px - Mono",
          heading4: "Heading 4 20px - Mono",
          body: "Body 16px - The quick brown fox.",
          small: "Small 14px - The quick brown fox jumps.",
          caption: "Caption 12px - Over the lazy dog.",
        }
      : fallback.typography;

  return {
    primaryScale,
    secondaryScale,
    neutralScale,
    semanticColors,
    typography,
    spacingScale: fallback.spacingScale,
    borderRadius: fallback.borderRadius,
    shadows: fallback.shadows,
    zIndexScale: fallback.zIndexScale,
    componentSections: fallback.componentSections,
  } satisfies AIDesignAnalysis;
}

function sanitizeAnalysis(value: unknown, fallback: AIDesignAnalysis) {
  const source = toRecord(value);
  const semanticSource = toRecord(source.semanticColors);

  return {
    primaryScale: normalizeColorScale(source.primaryScale, fallback.primaryScale),
    secondaryScale: normalizeColorScale(
      source.secondaryScale,
      fallback.secondaryScale,
    ),
    neutralScale: normalizeColorScale(source.neutralScale, fallback.neutralScale),
    semanticColors: {
      success: normalizeHexColor(
        semanticSource.success,
        fallback.semanticColors.success,
      ),
      warning: normalizeHexColor(
        semanticSource.warning,
        fallback.semanticColors.warning,
      ),
      error: normalizeHexColor(semanticSource.error, fallback.semanticColors.error),
      info: normalizeHexColor(semanticSource.info, fallback.semanticColors.info),
    },
    typography: normalizeTypography(source.typography, fallback.typography),
    spacingScale: normalizeStringArray(source.spacingScale, fallback.spacingScale, 8),
    borderRadius: normalizeStringArray(source.borderRadius, fallback.borderRadius, 8),
    shadows: normalizeStringArray(source.shadows, fallback.shadows, 8),
    zIndexScale: safeText(source.zIndexScale, 220) || fallback.zIndexScale,
    componentSections: normalizeComponentSections(
      source.componentSections,
      fallback.componentSections,
    ),
  } satisfies AIDesignAnalysis;
}

const isValidHttpUrl = (value: string) => /^https?:\/\/.+/i.test(value);
const isValidImageDataUrl = (value: string) =>
  /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value);

function normalizeTag(tag: string) {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeTags(tags: unknown) {
  const raw = Array.isArray(tags) ? tags : [];
  const unique = new Set<string>();

  for (const item of raw) {
    const normalized = normalizeTag(String(item ?? ""));
    if (normalized) unique.add(normalized);
    if (unique.size >= 8) break;
  }

  return Array.from(unique);
}

function pickVariantFromText(text: string): PreviewVariant {
  const lower = text.toLowerCase();
  if (lower.includes("minimal") || lower.includes("mono")) return "monoWire";
  if (lower.includes("data") || lower.includes("analytics")) return "atlasPanel";
  if (lower.includes("commerce") || lower.includes("shop")) return "candyStack";
  if (lower.includes("token")) return "tokenBoard";
  if (lower.includes("brutal")) return "brutalist";
  return "neonGrid";
}

function getSystemNameFromTitle(title: string) {
  const normalized = safeText(title, 36)
    .replace(/[^a-z0-9 ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (normalized || "IGLOO").split(" ")[0].toUpperCase();
}

function buildAnalysisReport(systemName: string, analysis: AIDesignAnalysis) {
  return [
    `${systemName}`,
    "// System v1.0",
    "Foundation",
    "Design Tokens",
    "Components",
    "Atoms",
    "Molecules",
    "Organisms",
    "AI Components",
    "Tokens",
    "Core visual values extracted from the analyzed image.",
    "",
    "Primary Scale (Ice/Glow)",
    ...analysis.primaryScale,
    "Secondary Scale (Structure)",
    ...analysis.secondaryScale,
    "Neutral Scale",
    ...analysis.neutralScale,
    "Semantic Colors",
    `Success ${analysis.semanticColors.success}`,
    `Warning ${analysis.semanticColors.warning}`,
    `Error ${analysis.semanticColors.error}`,
    `Info ${analysis.semanticColors.info}`,
    "Typography (Mono / Sans)",
    analysis.typography.display,
    analysis.typography.heading1,
    analysis.typography.heading2,
    analysis.typography.heading3,
    analysis.typography.heading4,
    analysis.typography.body,
    analysis.typography.small,
    analysis.typography.caption,
    "Spacing Scale",
    ...analysis.spacingScale,
    "Border Radius",
    ...analysis.borderRadius,
    "Shadows & Elevation (Glows)",
    ...analysis.shadows,
    "Z-Index Scale",
    analysis.zIndexScale,
    "Atoms",
    "Button Variants",
    "Primary",
    "Secondary",
    "Outline",
    "Ghost",
    "Destructive",
    "Button Sizes & States",
    "Small",
    "Medium",
    "Large",
    "Disabled",
    "Loading",
    "Text Inputs",
    "Default Input",
    "With Left Icon",
    "Invalid data",
    "Disabled Input",
    "Password & Textarea",
    "*********",
    "Type your message here...",
    "Selection Controls",
    "Unchecked",
    "Checked",
    "Indeterminate",
    "Option 1",
    "Option 2",
    "Off",
    "On",
    "Sliders & Select",
    "Select Option",
    "Indicators & Elements",
    "Default",
    "Primary",
    "Success",
    "Warn",
    "Error",
    "Onchain",
    "Crypto",
    "IG",
    "+3",
    "Hover me",
    "Molecules",
    "Form Fields",
    "Wallet Address",
    "0x...",
    "Enter your public Ethereum address.",
    "Amount",
    "-500",
    "Amount must be greater than zero.",
    "Username",
    "igloo_builder",
    "Search & Upload",
    "Search blocks...",
    "Drop files here to upload",
    "PNG, JPG up to 10MB",
    "Cards",
    "Igloo Manifesto",
    "Our mission is to create the largest onchain community, driving the revolution.",
    "Read",
    "Glacier Node",
    "Status: Operational",
    "Total Volume Locked",
    "$14.2M",
    "12.5% this week",
    "Lists & Navigation",
    "TX",
    "Transaction #8921",
    "Completed - 2 mins ago",
    "System Alert",
    "Node sync delayed",
    "Dashboard",
    "Transactions",
    "Settings",
    "Home",
    "Ecosystem",
    "Governance",
    "Organisms",
    systemName,
    "Protocol",
    "Build",
    "Community",
    "Connect Wallet",
    "Navigation Elements",
    "Home",
    "/",
    "Settings",
    "/",
    "Security",
    "Overview",
    "Metrics",
    `${systemName} protocol overview and core manifesto details. Cold storage verified.`,
    "Progression",
    "<",
    "1",
    "2",
    "3",
    ">",
    "Init",
    "Verify",
    "Deploy",
    "Overlays & Notifications",
    "Open Modal",
    "Open Drawer",
    "Trigger Toast",
    "System update scheduled for block 15,200,400.",
    "Transaction successfully confirmed onchain.",
    "Gas prices are currently higher than normal.",
    "Connection to RPC node failed. Retrying...",
    "Accordion",
    `What is ${systemName}?`,
    "How to participate?",
    "Timeline",
    "Q1 2026",
    "Genesis Block",
    "Network launch.",
    "Q2 2026",
    "Ice Age Update",
    "Protocol scaling deployed.",
    "Data Presentation",
    "Asset\tBalance\tStatus",
    "ETH",
    "Ethereum",
    "12.45\tSafe",
    "USDC",
    "USD Coin",
    "5,000.00\tSafe",
    "75%",
    "Skeleton Loader",
    "Empty State",
    "No Transactions Yet",
    "Your history is as clear as ice.",
    "Deposit Funds",
    "AI Components",
    "Chat Interface",
    "Analyze the latest block data for anomalies.",
    `${systemName} AI`,
    "Scanning block #15,200,399. All hash rates appear normal. No unusual gas spikes detected in the frozen tier.",
    `Ask ${systemName} AI about onchain data...`,
    "AI Suggestions",
    "Optimize Gas Settings",
    "Based on current network activity, lowering max base fee will save ~12%.",
    "Apply Fix",
    "New Yield Opportunity",
    "Found an ice pool with 15% APY matching your risk profile.",
    "Review",
  ].join("\n");
}

function fallbackDraft(params: {
  mode: AIGenerationMode;
  prompt: string;
  websiteUrl: string;
  imageUrl: string;
  imageHints: AIImageHints | null;
}): AIDesignDraft {
  const { mode, prompt, websiteUrl, imageUrl, imageHints } = params;
  const base =
    prompt || (mode === "website" ? websiteUrl : mode === "image" ? "Visual concept" : "Design system");
  const titleBase = safeText(base, 80)
    .replace(/https?:\/\/\S+/gi, "")
    .trim();
  const title =
    titleBase
      .split(" ")
      .slice(0, 4)
      .map((word) => (word ? `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}` : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim() || "AI Design System";

  const previewVariant = pickVariantFromText(`${title} ${prompt} ${websiteUrl}`);
  const tags = normalizeTags([
    "tokens",
    "components",
    mode === "website" ? "website" : mode === "image" ? "visual" : "prompt",
    ...safeText(prompt, 120)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length >= 4)
      .slice(0, 3),
  ]);

  const externalUrl =
    (mode === "website" && isValidHttpUrl(websiteUrl) ? websiteUrl : "") ||
    `https://example.com/${slugify(title) || "ai-design-system"}`;
  const systemName = getSystemNameFromTitle(title);
  const analysis =
    mode === "image"
      ? buildImageDrivenAnalysis(imageHints, DEFAULT_ANALYSIS)
      : DEFAULT_ANALYSIS;

  return {
    title: safeText(title, 120),
    tagline: safeText(
      `${title} is an AI-assisted design system concept for fast product delivery.`,
      180,
    ),
    description: safeText(
      `${title} includes reusable foundations, practical component patterns, and clear interaction states. It is generated from your ${mode} input and ready to refine before publishing.`,
      600,
    ),
    tags: tags.length > 0 ? tags.slice(0, 8) : ["tokens", "components", "saas"],
    previewVariant,
    externalUrl,
    cover:
      (mode === "image" && isValidHttpUrl(imageUrl) ? imageUrl : "") || DEFAULT_COVER,
    analysis,
    analysisReport: buildAnalysisReport(systemName, analysis),
  };
}

function extractJson(text: string) {
  const direct = text.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(direct) as Record<string, unknown>;
  } catch {
    const firstCurly = direct.indexOf("{");
    const lastCurly = direct.lastIndexOf("}");
    if (firstCurly >= 0 && lastCurly > firstCurly) {
      const candidate = direct.slice(firstCurly, lastCurly + 1);
      return JSON.parse(candidate) as Record<string, unknown>;
    }
    throw new Error("Model did not return valid JSON");
  }
}

function readOutputText(payload: unknown) {
  const data = payload as Record<string, unknown>;

  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  const output = data.output;
  if (!Array.isArray(output)) {
    throw new Error("Missing output text");
  }

  for (const item of output) {
    const content = (item as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      const partObj = part as Record<string, unknown>;
      if (typeof partObj.text === "string" && partObj.text.trim()) {
        return partObj.text;
      }
    }
  }

  throw new Error("Missing output text");
}

function sanitizeDraft(raw: Record<string, unknown>, params: {
  prompt: string;
  websiteUrl: string;
  mode: AIGenerationMode;
  imageUrl: string;
  imageHints: AIImageHints | null;
}) {
  const fallback = fallbackDraft({
    mode: params.mode,
    prompt: params.prompt,
    websiteUrl: params.websiteUrl,
    imageUrl: params.imageUrl,
    imageHints: params.imageHints,
  });

  const title = safeText(raw.title, 120) || fallback.title;
  const tagline = safeText(raw.tagline, 180) || fallback.tagline;
  const description = safeText(raw.description, 600) || fallback.description;
  const analysis = sanitizeAnalysis(raw.analysis, fallback.analysis);
  const systemName = getSystemNameFromTitle(title);
  const analysisReport =
    safeMultilineText(raw.analysisReport, MAX_REPORT_LENGTH) ||
    buildAnalysisReport(systemName, analysis) ||
    fallback.analysisReport;
  const tags = normalizeTags(raw.tags);
  const previewVariant = PREVIEW_VARIANTS.includes(raw.previewVariant as PreviewVariant)
    ? (raw.previewVariant as PreviewVariant)
    : pickVariantFromText(`${title} ${tagline} ${description}`);

  const externalUrlRaw = safeText(raw.externalUrl, 600);
  const externalUrl =
    (isValidHttpUrl(externalUrlRaw) && externalUrlRaw) ||
    (params.mode === "website" && isValidHttpUrl(params.websiteUrl)
      ? params.websiteUrl
      : fallback.externalUrl);

  const coverRaw = safeText(raw.cover, 600);
  const cover = isValidHttpUrl(coverRaw) ? coverRaw : fallback.cover;

  return {
    title,
    tagline,
    description,
    tags: tags.length > 0 ? tags : fallback.tags,
    previewVariant,
    externalUrl,
    cover,
    analysis,
    analysisReport,
  } satisfies AIDesignDraft;
}

async function generateWithOpenAI(params: {
  apiKey: string;
  model: string;
  mode: AIGenerationMode;
  prompt: string;
  websiteUrl: string;
  imageDataUrl: string;
  imageUrl: string;
  imageHints: AIImageHints | null;
}) {
  const imageHintsSummary = params.imageHints
    ? `\nImage hints: palette=${params.imageHints.palette.join(", ")}; dominant=${params.imageHints.dominant}; lightest=${params.imageHints.lightest}; darkest=${params.imageHints.darkest}; hue=${params.imageHints.dominantHue}; avgLum=${params.imageHints.averageLuminance}; fontMood=${params.imageHints.fontMood}; size=${params.imageHints.width}x${params.imageHints.height}`
    : "";

  const userSummary =
    params.mode === "website"
      ? `Website URL: ${params.websiteUrl}\nInstructions: ${params.prompt || "Analyze the website style and purpose."}`
      : params.mode === "image"
        ? `Image-based concept request. Instructions: ${params.prompt || "Infer the visual style and propose a design system."}${imageHintsSummary}`
        : `Text prompt: ${params.prompt}`;

  const userContent: Array<Record<string, string>> = [
    {
      type: "input_text",
      text: userSummary,
    },
  ];

  if (params.mode === "image" && params.imageDataUrl) {
    userContent.push({
      type: "input_image",
      image_url: params.imageDataUrl,
    });
  } else if (params.mode === "image" && params.imageUrl) {
    userContent.push({
      type: "input_image",
      image_url: params.imageUrl,
    });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      input: [
        {
          role: "system",
          content:
            "You generate clean metadata for a public design system directory. Return JSON only with keys: title, tagline, description, tags, previewVariant, externalUrl, cover, analysis, analysisReport. Rules: concise, realistic, no markdown, tags as 3-8 lowercase tokens, previewVariant one of neonGrid/tokenBoard/atlasPanel/monoWire/candyStack/brutalist. analysis must be an object with keys: primaryScale (5 hex colors), secondaryScale (5 hex colors), neutralScale (5 hex colors), semanticColors ({success,warning,error,info} as hex colors), typography ({display,heading1,heading2,heading3,heading4,body,small,caption}), spacingScale (4-8 labels like 4px/8px), borderRadius (labels), shadows (labels), zIndexScale (single string), componentSections ({atoms,molecules,organisms,aiComponents} arrays). analysisReport must be multiline plain text and follow this style: Tokens/Primary Scale/Secondary Scale/Neutral Scale/Semantic Colors/Typography/Spacing/Border Radius/Shadows/Z-Index/Atoms/Molecules/Organisms/AI Components with many concrete lines. If an image is provided, infer colors, tone, naming, and content directly from the image, not generic defaults.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      max_output_tokens: 2400,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`OpenAI error ${response.status}: ${errorText}`);
  }

  const payload = (await response.json()) as unknown;
  const text = readOutputText(payload);
  return extractJson(text);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        mode?: AIGenerationMode;
        prompt?: string;
        websiteUrl?: string;
        imageDataUrl?: string;
        imageUrl?: string;
        imageHints?: unknown;
      }
    | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const mode = (body.mode ?? "text") as AIGenerationMode;
  if (!["image", "text", "website"].includes(mode)) {
    return NextResponse.json({ error: "Invalid generation mode" }, { status: 400 });
  }

  const prompt = safeText(body.prompt, MAX_PROMPT_LENGTH);
  const websiteUrl = safeText(body.websiteUrl, 600);
  const imageDataUrl = safeText(body.imageDataUrl, 5_000_000);
  const imageUrl = safeText(body.imageUrl, 600);
  const imageHints = normalizeImageHints(body.imageHints);

  if (mode === "text" && !prompt) {
    return NextResponse.json({ error: "Text prompt is required" }, { status: 400 });
  }
  if (mode === "website" && !isValidHttpUrl(websiteUrl)) {
    return NextResponse.json({ error: "Valid website URL is required" }, { status: 400 });
  }
  if (mode === "image" && !imageDataUrl && !isValidHttpUrl(imageUrl)) {
    return NextResponse.json(
      { error: "Image file or valid image URL is required" },
      { status: 400 },
    );
  }
  if (imageDataUrl && !isValidImageDataUrl(imageDataUrl)) {
    return NextResponse.json({ error: "Invalid image data format" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY ?? "";
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  if (!apiKey) {
    const draft = fallbackDraft({
      mode,
      prompt,
      websiteUrl,
      imageUrl,
      imageHints,
    });
    return NextResponse.json({
      ok: true,
      provider: "fallback",
      warning:
        mode === "image"
          ? "OPENAI_API_KEY topilmadi. Local image analysis fallback ishlatildi."
          : "OPENAI_API_KEY topilmadi. Local AI fallback ishlatildi. Real AI uchun env sozlang.",
      draft,
    });
  }

  try {
    const raw = await generateWithOpenAI({
      apiKey,
      model,
      mode,
      prompt,
      websiteUrl,
      imageDataUrl,
      imageUrl,
      imageHints,
    });
    const draft = sanitizeDraft(raw, {
      mode,
      prompt,
      websiteUrl,
      imageUrl,
      imageHints,
    });

    return NextResponse.json({
      ok: true,
      provider: "openai",
      draft,
    });
  } catch (error) {
    console.error("AI generation failed", error);
    const draft = fallbackDraft({
      mode,
      prompt,
      websiteUrl,
      imageUrl,
      imageHints,
    });
    return NextResponse.json({
      ok: true,
      provider: "fallback",
      warning:
        "AI servis vaqtincha ishlamadi. Local fallback draft yaratildi.",
      draft,
    });
  }
}
