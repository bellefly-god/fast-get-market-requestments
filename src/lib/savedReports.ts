import type { DemandReport, OpportunityMetrics, ProductIdea, QuoteItem, ReportSource, TrendLabel } from "@/types/demand-report";

const SAVED_REPORTS_KEY = "demand-radar.saved-reports";
const SAVED_REPORT_LIMIT = 10;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asTrendLabel(value: unknown, fallback: TrendLabel = "Stable"): TrendLabel {
  return value === "Rising" || value === "Stable" || value === "Declining" ? value : fallback;
}

function asSources(value: unknown): ReportSource[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Partial<ReportSource>;
      const name = asString(source.name);
      const type = source.type === "ai" || source.type === "reddit" || source.type === "trends" || source.type === "x" ? source.type : null;

      if (!name || !type) return null;

      return { name, type };
    })
    .filter((item): item is ReportSource => item !== null);
}

function asQuotes(value: unknown): QuoteItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const quote = item as Partial<QuoteItem>;
      const source = asString(quote.source);
      const text = asString(quote.text);

      if (!source || !text) return null;

      return {
        source,
        text,
        author: typeof quote.author === "string" && quote.author.trim().length > 0 ? quote.author.trim() : undefined,
      };
    })
    .filter((item): item is QuoteItem => item !== null);
}

function asPainPoints(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter(Boolean);
}

function asProductIdeas(value: unknown): ProductIdea[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const idea = item as Partial<ProductIdea>;
      const title = asString(idea.title);
      const description = asString(idea.description);
      const targetUser = asString(idea.targetUser);

      if (!title || !description || !targetUser) return null;

      return { title, description, targetUser };
    })
    .filter((item): item is ProductIdea => item !== null);
}

function asMetrics(value: unknown): OpportunityMetrics | null {
  if (!value || typeof value !== "object") return null;
  const metrics = value as Partial<OpportunityMetrics>;

  return {
    demand: asNumber(metrics.demand),
    competition: asNumber(metrics.competition),
    monetization: asNumber(metrics.monetization),
  };
}

function normalizeReport(value: unknown): DemandReport | null {
  if (!value || typeof value !== "object") return null;
  const report = value as Partial<DemandReport>;
  const keyword = asString(report.keyword);
  const generatedAt = asString(report.generatedAt);
  const metrics = asMetrics(report.metrics);

  if (!keyword || !generatedAt || !metrics) return null;

  return {
    keyword,
    generatedAt,
    sources: asSources(report.sources),
    trendScore: asNumber(report.trendScore),
    trendLabel: asTrendLabel(report.trendLabel),
    quotes: asQuotes(report.quotes),
    painPoints: asPainPoints(report.painPoints),
    productIdeas: asProductIdeas(report.productIdeas),
    opportunityScore: asNumber(report.opportunityScore),
    metrics,
  };
}

export function readSavedReports(): DemandReport[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(SAVED_REPORTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeReport(item))
      .filter((item): item is DemandReport => item !== null)
      .slice(0, SAVED_REPORT_LIMIT);
  } catch {
    return [];
  }
}

export function saveReport(report: DemandReport): DemandReport[] {
  if (typeof window === "undefined") return [];

  const normalized = normalizeReport(report);
  if (!normalized) return readSavedReports();

  const next = [normalized, ...readSavedReports().filter((item) => item.keyword.toLowerCase() !== normalized.keyword.toLowerCase())].slice(0, SAVED_REPORT_LIMIT);

  try {
    window.localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(next));
  } catch {
    return next;
  }

  return next;
}

export function getSavedReport(keyword: string): DemandReport | null {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return null;

  return readSavedReports().find((item) => item.keyword.trim().toLowerCase() === normalizedKeyword) ?? null;
}

export function deleteSavedReport(keyword: string): DemandReport[] {
  if (typeof window === "undefined") return [];

  const normalizedKeyword = keyword.trim().toLowerCase();
  const next = readSavedReports().filter((item) => item.keyword.trim().toLowerCase() !== normalizedKeyword);

  try {
    window.localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(next));
  } catch {
    return next;
  }

  return next;
}
