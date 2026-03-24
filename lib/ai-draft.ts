import type { PreviewVariant } from "@/lib/types";

export type AIGenerationMode = "image" | "text" | "website";

export type AIColorSemantic = {
  success: string;
  warning: string;
  error: string;
  info: string;
};

export type AITypographyScale = {
  display: string;
  heading1: string;
  heading2: string;
  heading3: string;
  heading4: string;
  body: string;
  small: string;
  caption: string;
};

export type AIComponentSections = {
  atoms: string[];
  molecules: string[];
  organisms: string[];
  aiComponents: string[];
};

export type AIDesignAnalysis = {
  primaryScale: string[];
  secondaryScale: string[];
  neutralScale: string[];
  semanticColors: AIColorSemantic;
  typography: AITypographyScale;
  spacingScale: string[];
  borderRadius: string[];
  shadows: string[];
  zIndexScale: string;
  componentSections: AIComponentSections;
};

export type AIImageHints = {
  palette: string[];
  dominant: string;
  lightest: string;
  darkest: string;
  dominantHue: number;
  averageLuminance: number;
  fontMood: "mono" | "sans";
  width: number;
  height: number;
};

export type AIDesignDraft = {
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  previewVariant: PreviewVariant;
  externalUrl: string;
  cover?: string;
  analysis: AIDesignAnalysis;
  analysisReport: string;
};

export const AI_DRAFT_STORAGE_KEY = "vibe_ai_draft";

export const PREVIEW_VARIANTS: PreviewVariant[] = [
  "neonGrid",
  "tokenBoard",
  "atlasPanel",
  "monoWire",
  "candyStack",
  "brutalist",
];
