import type { QuoteItem } from "../src/types/demand-report";
import type { RawSignal } from "../src/types/raw-signal";

export type ProcessedSignals = {
  rawCount: number;
  filteredCount: number;
  dedupedCount: number;
  signals: RawSignal[];
  topQuotes: QuoteItem[];
};

function normalizeSignalText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function isHighQualitySignal(signal: RawSignal): boolean {
  const normalizedText = normalizeSignalText(signal.text);

  if (normalizedText.length < 40) return false;
  if (normalizedText.includes("[removed]") || normalizedText.includes("[deleted]")) return false;
  if (normalizedText.startsWith("http")) return false;

  return true;
}

export function processRawSignals(rawSignals: RawSignal[]): ProcessedSignals {
  const filteredSignals = rawSignals.filter(isHighQualitySignal);
  const dedupedSignals: RawSignal[] = [];
  const seen = new Set<string>();

  for (const signal of filteredSignals) {
    const key = normalizeSignalText(signal.text);
    if (seen.has(key)) continue;
    seen.add(key);
    dedupedSignals.push(signal);
  }

  const topQuotes = dedupedSignals.slice(0, 5).map((signal) => ({
    source: signal.source,
    author: signal.author,
    text: signal.text,
  }));

  return {
    rawCount: rawSignals.length,
    filteredCount: filteredSignals.length,
    dedupedCount: dedupedSignals.length,
    signals: dedupedSignals,
    topQuotes,
  };
}
