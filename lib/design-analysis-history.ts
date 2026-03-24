import type { AIDesignDraft, AIGenerationMode } from "@/lib/ai-draft";

export const DESIGN_ANALYSIS_HISTORY_KEY = "vibe_design_analysis_history_v1";
const MAX_HISTORY_ITEMS = 30;

export type DesignAnalysisHistoryItem = {
  id: string;
  createdAt: number;
  mode: AIGenerationMode;
  source: string;
  draft: AIDesignDraft;
};

function safeParseHistory(raw: string | null) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as DesignAnalysisHistoryItem[];
  } catch {
    return [];
  }
}

export function readDesignAnalysisHistory() {
  if (typeof window === "undefined") return [] as DesignAnalysisHistoryItem[];
  const raw = window.localStorage.getItem(DESIGN_ANALYSIS_HISTORY_KEY);
  return safeParseHistory(raw);
}

export function writeDesignAnalysisHistory(items: DesignAnalysisHistoryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    DESIGN_ANALYSIS_HISTORY_KEY,
    JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS)),
  );
}

export function addDesignAnalysisHistoryItem(
  item: Omit<DesignAnalysisHistoryItem, "id" | "createdAt">,
) {
  const next: DesignAnalysisHistoryItem = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    createdAt: Date.now(),
    ...item,
  };
  const existing = readDesignAnalysisHistory();
  writeDesignAnalysisHistory([next, ...existing]);
  return [next, ...existing].slice(0, MAX_HISTORY_ITEMS);
}
