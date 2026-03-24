"use client";

import { ChangeEvent, DragEvent, useState } from "react";
import {
  type AIDesignDraft,
  type AIGenerationMode,
  type AIImageHints,
} from "@/lib/ai-draft";
import { DesignAnalysisTerminal } from "@/components/design-analysis-terminal";

const tabs: { value: AIGenerationMode; label: string }[] = [
  { value: "image", label: "Image" },
  { value: "text", label: "Text" },
  { value: "website", label: "Website PRO" },
];

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const COLOR_QUANT_STEP = 24;

type RGB = {
  r: number;
  g: number;
  b: number;
};

const clampChannel = (value: number) =>
  Math.max(0, Math.min(255, Math.round(value)));

const rgbToHex = (r: number, g: number, b: number) =>
  `#${clampChannel(r).toString(16).padStart(2, "0")}${clampChannel(g)
    .toString(16)
    .padStart(2, "0")}${clampChannel(b).toString(16).padStart(2, "0")}`.toUpperCase();

const getLuminance = (r: number, g: number, b: number) =>
  (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
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

const colorDistance = (a: RGB, b: RGB) => {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

function parseRgbKey(key: string): RGB {
  const [r, g, b] = key.split(",").map((part) => Number(part) || 0);
  return { r, g, b };
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image load failed"));
    image.src = dataUrl;
  });
}

async function analyzeImageDataUrl(dataUrl: string): Promise<AIImageHints> {
  const image = await loadImage(dataUrl);
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  const maxSide = 160;
  const scale = Math.min(1, maxSide / Math.max(naturalWidth, naturalHeight, 1));
  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.drawImage(image, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const buckets = new Map<string, number>();

  let pixelCount = 0;
  let luminanceSum = 0;
  let saturationSum = 0;
  let hueSin = 0;
  let hueCos = 0;
  let hueWeight = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3] / 255;
    if (alpha < 0.2) continue;

    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const qr = clampChannel(Math.round(r / COLOR_QUANT_STEP) * COLOR_QUANT_STEP);
    const qg = clampChannel(Math.round(g / COLOR_QUANT_STEP) * COLOR_QUANT_STEP);
    const qb = clampChannel(Math.round(b / COLOR_QUANT_STEP) * COLOR_QUANT_STEP);
    const key = `${qr},${qg},${qb}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);

    const hsl = rgbToHsl(r, g, b);
    luminanceSum += getLuminance(r, g, b);
    saturationSum += hsl.s;
    if (hsl.s > 0.08) {
      const rad = (hsl.h * Math.PI) / 180;
      const weighted = hsl.s;
      hueSin += Math.sin(rad) * weighted;
      hueCos += Math.cos(rad) * weighted;
      hueWeight += weighted;
    }
    pixelCount += 1;
  }

  const rankedColors = Array.from(buckets.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => parseRgbKey(key));

  const paletteRgb: RGB[] = [];
  for (const color of rankedColors) {
    const isDistinct = paletteRgb.every(
      (picked) => colorDistance(picked, color) >= 40,
    );
    if (!isDistinct) continue;
    paletteRgb.push(color);
    if (paletteRgb.length >= 8) break;
  }

  if (paletteRgb.length === 0) {
    paletteRgb.push({ r: 248, g: 250, b: 252 });
    paletteRgb.push({ r: 148, g: 163, b: 184 });
    paletteRgb.push({ r: 30, g: 41, b: 59 });
  }

  const palette = paletteRgb.map((color) => rgbToHex(color.r, color.g, color.b));
  const byLuminance = [...paletteRgb].sort(
    (a, b) => getLuminance(b.r, b.g, b.b) - getLuminance(a.r, a.g, a.b),
  );

  const dominantRgb = rankedColors[0] ?? paletteRgb[0];
  const dominant = rgbToHex(dominantRgb.r, dominantRgb.g, dominantRgb.b);
  const lightestRgb = byLuminance[0] ?? dominantRgb;
  const darkestRgb = byLuminance[byLuminance.length - 1] ?? dominantRgb;
  const lightest = rgbToHex(lightestRgb.r, lightestRgb.g, lightestRgb.b);
  const darkest = rgbToHex(darkestRgb.r, darkestRgb.g, darkestRgb.b);

  const fallbackHue = rgbToHsl(dominantRgb.r, dominantRgb.g, dominantRgb.b).h;
  const hue =
    hueWeight > 0
      ? ((Math.atan2(hueSin, hueCos) * 180) / Math.PI + 360) % 360
      : fallbackHue;

  const averageLuminance = pixelCount > 0 ? luminanceSum / pixelCount : 0.5;
  const averageSaturation = pixelCount > 0 ? saturationSum / pixelCount : 0.25;

  return {
    palette,
    dominant,
    lightest,
    darkest,
    dominantHue: Math.round(hue),
    averageLuminance: Number(averageLuminance.toFixed(3)),
    fontMood: averageSaturation < 0.2 ? "mono" : "sans",
    width: naturalWidth,
    height: naturalHeight,
  };
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

export function GeneratorPanel() {
  const [mode, setMode] = useState<AIGenerationMode>("image");
  const [prompt, setPrompt] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageHints, setImageHints] = useState<AIImageHints | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<AIDesignDraft | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const applyFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Image file tanlang (PNG, JPG, WEBP, GIF).");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image hajmi 2MB dan kichik bo'lishi kerak.");
      return;
    }
    const encoded = await fileToDataUrl(file);
    setImageDataUrl(encoded);
    setImageName(file.name);
    try {
      const hints = await analyzeImageDataUrl(encoded);
      setImageHints(hints);
    } catch {
      setImageHints(null);
    }
    setError("");
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await applyFile(file);
  };

  const onDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await applyFile(file);
  };

  const generate = async () => {
    setError("");
    setNotice("");
    setDraft(null);

    if (mode === "text" && !prompt.trim()) {
      setError("Text prompt kiriting.");
      return;
    }
    if (mode === "website" && !/^https?:\/\/.+/i.test(websiteUrl.trim())) {
      setError("Website URL to'g'ri formatda bo'lishi kerak.");
      return;
    }
    if (mode === "image" && !imageDataUrl && !/^https?:\/\/.+/i.test(imageUrl.trim())) {
      setError("Image yuklang yoki image URL kiriting.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          prompt,
          websiteUrl,
          imageUrl,
          imageDataUrl,
          imageHints,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; warning?: string; draft?: AIDesignDraft }
        | null;

      if (!response.ok || !payload?.draft) {
        setError(payload?.error || "AI generation ishlamadi.");
        setIsGenerating(false);
        return;
      }
      setDraft(payload.draft);

      if (payload.warning) {
        setNotice(payload.warning);
      } else {
        setNotice("Image analyzed. Structured design output ready.");
      }
    } catch {
      setError("Network xatolik. Keyinroq qayta urinib ko'ring.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="mx-auto mt-14 w-full max-w-4xl px-4 sm:px-6">
      <div className="mb-5 text-center">
        <span className="inline-flex items-center rounded-full border border-cyan-300/70 bg-cyan-200/25 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyan-100">
          From any prompt, image, screenshot, or website.
        </span>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#12162d] text-white shadow-[0_18px_42px_rgba(4,8,25,0.42)]">
        <div className="pointer-events-none absolute -left-36 top-0 h-72 w-72 rounded-full bg-cyan-400/8 blur-2xl" />
        <div className="pointer-events-none absolute -right-36 bottom-0 h-72 w-72 rounded-full bg-indigo-400/8 blur-2xl" />

        <div className="relative flex border-b border-white/10 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setMode(tab.value)}
              className={`px-3 py-4 text-sm font-semibold ${
                mode === tab.value
                  ? "border-b-2 border-cyan-300 text-white"
                  : "text-white/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative p-6">
          {mode === "image" ? (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                dragOver
                  ? "border-cyan-300 bg-cyan-400/10"
                  : "border-white/15 bg-black/20"
              }`}
            >
              <h3 className="text-base font-semibold">
                Drag and drop image, or click to browse
              </h3>
              <p className="mt-2 text-sm text-white/65">
                PNG, JPG, WEBP, GIF. Max 2MB.
              </p>
              {imageName ? (
                <p className="mt-3 text-xs font-semibold text-cyan-200">
                  Selected: {imageName}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <label className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10">
                  Browse files
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                  />
                </label>
                <input
                  value={imageUrl}
                  onChange={(event) => {
                    const nextUrl = event.target.value;
                    setImageUrl(nextUrl);
                    if (nextUrl.trim()) {
                      setImageDataUrl("");
                      setImageName("");
                      setImageHints(null);
                    }
                  }}
                  placeholder="or paste image URL"
                  className="h-10 min-w-[240px] rounded-xl border border-white/20 bg-black/20 px-3 text-sm text-white outline-none transition focus:border-cyan-300"
                />
              </div>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Optional style instructions (e.g. clean fintech dashboard with dense data cards)"
                className="mt-4 min-h-[84px] w-full rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300"
              />
            </div>
          ) : mode === "text" ? (
            <div className="rounded-2xl border border-white/15 bg-black/20 p-4">
              <label className="text-sm font-semibold text-white/90">
                Prompt
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Describe your design system idea..."
                  className="mt-2 min-h-[160px] w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300"
                />
              </label>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/15 bg-black/20 p-4">
              <label className="text-sm font-semibold text-white/90">
                Website URL
                <input
                  value={websiteUrl}
                  onChange={(event) => setWebsiteUrl(event.target.value)}
                  placeholder="https://example.com"
                  className="mt-2 h-11 w-full rounded-xl border border-white/20 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-cyan-300"
                />
              </label>
              <label className="mt-4 block text-sm font-semibold text-white/90">
                Instructions (optional)
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="What style should be extracted or adapted?"
                  className="mt-2 min-h-[110px] w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300"
                />
              </label>
            </div>
          )}

          {error ? (
            <p className="mt-4 rounded-xl border border-red-300/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="mt-4 rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
              {notice}
            </p>
          ) : null}
        </div>

        <div className="relative px-6 pb-6">
          <button
            type="button"
            onClick={generate}
            disabled={isGenerating}
            className="w-full rounded-2xl border border-white/15 bg-gradient-to-b from-[#2f3562] to-[#1f2443] px-4 py-4 text-sm font-bold tracking-wide text-white transition hover:from-[#384070] hover:to-[#292f54] disabled:opacity-70"
          >
            {isGenerating ? "Generating..." : "Generate Design System"}
          </button>
        </div>
      </div>

      {draft ? (
        <div className="mt-4 rounded-2xl border border-black/10 bg-white/90 p-4 shadow-[0_14px_28px_rgba(10,18,34,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--vibe-muted)]">
            Generated from uploaded image
          </p>
          <h3 className="mt-2 font-display text-2xl font-black text-[color:var(--vibe-ink)]">
            {draft.title}
          </h3>
          <p className="mt-2 text-sm font-semibold text-[color:var(--vibe-muted)]">
            {draft.tagline}
          </p>
          <div className="mt-4">
            <DesignAnalysisTerminal draft={draft} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
