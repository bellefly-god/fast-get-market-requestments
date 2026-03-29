import type { DemandReport, OpportunityMetrics, ProductIdea, QuoteItem, ReportSource, TrendLabel } from "../src/types/demand-report";
import { analyzeWithAI } from "./providers/ai";
import { getTrendSources } from "./providers/trends";
import { getRedditSignals } from "./providers/reddit";

type AnalyzeRequestBody = {
  keyword?: string;
};

type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

type HandlerRequest = {
  method?: string;
  body?: unknown;
};

type HandlerResponse = {
  status: (code: number) => {
    json: (payload: unknown) => void;
  };
};

const DEFAULT_KEYWORD = "market validation";
const VALID_TREND_LABELS: TrendLabel[] = ["Rising", "Stable", "Declining"];

function parseBody(rawBody: unknown): AnalyzeRequestBody | null {
  if (!rawBody) return {};
  if (typeof rawBody === "string") {
    try {
      return JSON.parse(rawBody) as AnalyzeRequestBody;
    } catch {
      return null;
    }
  }
  if (typeof rawBody === "object") {
    return rawBody as AnalyzeRequestBody;
  }
  return null;
}

function sendError(res: HandlerResponse, status: number, code: string, message: string) {
  const payload: ApiError = { error: { code, message } };
  return res.status(status).json(payload);
}

function fallbackString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function fallbackNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function fallbackTrendLabel(value: unknown, fallback: TrendLabel): TrendLabel {
  return typeof value === "string" && VALID_TREND_LABELS.includes(value as TrendLabel) ? (value as TrendLabel) : fallback;
}

function normalizeQuotes(value: unknown): QuoteItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const quote = item as Partial<QuoteItem>;
      return {
        source: fallbackString(quote.source, "Unknown source"),
        author: typeof quote.author === "string" && quote.author.trim() ? quote.author.trim() : undefined,
        text: fallbackString(quote.text, "No quote text available."),
      };
    })
    .filter((item): item is QuoteItem => item !== null);
}

function normalizePainPoints(value: unknown, keyword: string): string[] {
  if (!Array.isArray(value)) {
    return [`No pain points were produced for "${keyword}".`];
  }
  const items = value
    .map((item) => fallbackString(item, ""))
    .filter(Boolean);
  return items.length > 0 ? items : [`No pain points were produced for "${keyword}".`];
}

function normalizeProductIdeas(value: unknown, keyword: string): ProductIdea[] {
  if (!Array.isArray(value)) {
    return [
      {
        title: `${keyword} Insight Workspace`,
        description: `Fallback product concept for "${keyword}".`,
        targetUser: "Product teams",
      },
    ];
  }

  const items = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const idea = item as Partial<ProductIdea>;
      return {
        title: fallbackString(idea.title, `${keyword} Insight Workspace`),
        description: fallbackString(idea.description, `Fallback product concept for "${keyword}".`),
        targetUser: fallbackString(idea.targetUser, "Product teams"),
      };
    })
    .filter((item): item is ProductIdea => item !== null);

  return items.length > 0
    ? items
    : [
        {
          title: `${keyword} Insight Workspace`,
          description: `Fallback product concept for "${keyword}".`,
          targetUser: "Product teams",
        },
      ];
}

function normalizeMetrics(value: unknown): OpportunityMetrics {
  const metrics = value && typeof value === "object" ? (value as Partial<OpportunityMetrics>) : {};
  return {
    demand: fallbackNumber(metrics.demand, 7.5),
    competition: fallbackNumber(metrics.competition, 5.5),
    monetization: fallbackNumber(metrics.monetization, 7.0),
  };
}

function normalizeSources(value: unknown): ReportSource[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Partial<ReportSource>;
      const kind = source.kind === "ai" || source.kind === "trends" || source.kind === "reddit" ? source.kind : "ai";
      const status = source.status === "ok" || source.status === "placeholder" || source.status === "fallback" ? source.status : "fallback";
      return {
        name: fallbackString(source.name, "Unknown provider"),
        kind,
        status,
        detail: typeof source.detail === "string" && source.detail.trim() ? source.detail.trim() : undefined,
      };
    })
    .filter((item): item is ReportSource => item !== null);
}

function buildStableReport(keyword: string, partial: Partial<DemandReport>): DemandReport {
  return {
    keyword: fallbackString(partial.keyword, keyword),
    generatedAt: fallbackString(partial.generatedAt, new Date().toISOString()),
    sources: normalizeSources(partial.sources),
    trendScore: fallbackNumber(partial.trendScore, 7.5),
    trendLabel: fallbackTrendLabel(partial.trendLabel, "Stable"),
    quotes: normalizeQuotes(partial.quotes),
    painPoints: normalizePainPoints(partial.painPoints, keyword),
    productIdeas: normalizeProductIdeas(partial.productIdeas, keyword),
    opportunityScore: fallbackNumber(partial.opportunityScore, 7.4),
    metrics: normalizeMetrics(partial.metrics),
  };
}

export default async function handler(req: HandlerRequest, res: HandlerResponse) {
  const method = req.method ?? "UNKNOWN";
  console.log("[api/analyze] incoming request", { method });

  if (method !== "POST") {
    console.warn("[api/analyze] method not allowed", { method });
    return sendError(res, 405, "METHOD_NOT_ALLOWED", "Only POST is supported.");
  }

  const body = parseBody(req.body);
  if (body === null) {
    console.warn("[api/analyze] invalid JSON body");
    return sendError(res, 400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  if (body.keyword !== undefined && typeof body.keyword !== "string") {
    console.warn("[api/analyze] invalid keyword type", { keywordType: typeof body.keyword });
    return sendError(res, 400, "INVALID_KEYWORD", "`keyword` must be a string.");
  }

  const keyword = fallbackString(body.keyword, DEFAULT_KEYWORD);

  try {
    const [aiReport, trendSources, redditSignals] = await Promise.all([
      analyzeWithAI({ keyword }),
      getTrendSources(),
      getRedditSignals(),
    ]);

    const stableReport = buildStableReport(keyword, {
      ...aiReport,
      quotes: [...normalizeQuotes(aiReport.quotes), ...redditSignals.quotes],
      sources: [...normalizeSources(aiReport.sources), ...trendSources, ...redditSignals.sources],
    });

    console.log("[api/analyze] success", { keyword, sources: stableReport.sources.map((source) => source.name) });
    return res.status(200).json(stableReport);
  } catch (error) {
    console.error("[api/analyze] unexpected error", error);
    return sendError(res, 500, "INTERNAL_ERROR", "Unexpected server error.");
  }
}
