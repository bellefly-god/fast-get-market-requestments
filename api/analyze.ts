import { analyzeKeyword } from "../lib/analyze.js";
import type { DemandReport, OpportunityMetrics, ProductIdea, QuoteItem, ReportSource, TrendLabel } from "../src/types/demand-report";

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

const DEFAULT_KEYWORD = "youtube automation";
const AI_SOURCE: ReportSource = { name: "AI Synthesis", type: "ai" };

const SAFE_REPORT: DemandReport = {
  keyword: DEFAULT_KEYWORD,
  generatedAt: "2026-03-29T00:00:00.000Z",
  sources: [AI_SOURCE],
  trendScore: 8,
  trendLabel: "Rising",
  quotes: [
    {
      source: "Fallback",
      author: "system",
      text: "Users want faster ways to validate demand and compare opportunities.",
    },
  ],
  painPoints: [
    "Users struggle to validate demand quickly.",
    "Research is fragmented across multiple channels.",
    "Turning signals into product decisions is still manual.",
  ],
  productIdeas: [
    {
      title: "Demand Signal Monitor",
      description: "Aggregate demand signals and summarize recurring customer pain points.",
      targetUser: "Founders and product teams",
    },
  ],
  opportunityScore: 8.5,
  metrics: {
    demand: 9,
    competition: 6,
    monetization: 8,
  },
};

function parseBody(rawBody: unknown): AnalyzeRequestBody | null {
  if (!rawBody) return {};
  if (typeof rawBody === "string") {
    try {
      return JSON.parse(rawBody) as AnalyzeRequestBody;
    } catch (error) {
      console.error("[api/analyze] parseBody failed", error);
      return null;
    }
  }
  if (typeof rawBody === "object") {
    return rawBody as AnalyzeRequestBody;
  }
  return null;
}

function sendError(res: HandlerResponse, status: number, code: string, message: string) {
  const payload: ApiError = {
    error: {
      code,
      message,
    },
  };
  return res.status(status).json(payload);
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asTrendLabel(value: unknown, fallback: TrendLabel): TrendLabel {
  return value === "Rising" || value === "Stable" || value === "Declining" ? value : fallback;
}

function asSources(value: unknown, fallback: ReportSource[]): ReportSource[] {
  if (!Array.isArray(value)) return fallback;
  const next = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Partial<ReportSource>;
      const type = source.type === "ai" || source.type === "reddit" || source.type === "trends" || source.type === "x" ? source.type : "ai";
      return {
        name: asString(source.name, "safe-ai-fallback"),
        type,
      };
    })
    .filter((item): item is ReportSource => item !== null);
  return next.length > 0 ? next : fallback;
}

function asQuotes(value: unknown, fallback: QuoteItem[]): QuoteItem[] {
  if (!Array.isArray(value)) return fallback;
  const next = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const quote = item as Partial<QuoteItem>;
      return {
        source: asString(quote.source, "Fallback"),
        author: typeof quote.author === "string" && quote.author.trim() ? quote.author.trim() : undefined,
        text: asString(quote.text, "No quote available."),
      };
    })
    .filter((item): item is QuoteItem => item !== null);
  return next.length > 0 ? next : fallback;
}

function asPainPoints(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const next = value.map((item) => asString(item, "")).filter(Boolean);
  return next.length > 0 ? next : fallback;
}

function asProductIdeas(value: unknown, fallback: ProductIdea[]): ProductIdea[] {
  if (!Array.isArray(value)) return fallback;
  const next = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const idea = item as Partial<ProductIdea>;
      return {
        title: asString(idea.title, "Demand Signal Monitor"),
        description: asString(idea.description, "Fallback product concept."),
        targetUser: asString(idea.targetUser, "Founders and product teams"),
      };
    })
    .filter((item): item is ProductIdea => item !== null);
  return next.length > 0 ? next : fallback;
}

function asMetrics(value: unknown, fallback: OpportunityMetrics): OpportunityMetrics {
  if (!value || typeof value !== "object") return fallback;
  const metrics = value as Partial<OpportunityMetrics>;
  return {
    demand: asNumber(metrics.demand, fallback.demand),
    competition: asNumber(metrics.competition, fallback.competition),
    monetization: asNumber(metrics.monetization, fallback.monetization),
  };
}

function generateAIReport(keyword: string): Partial<DemandReport> {
  return {
    keyword,
    generatedAt: new Date().toISOString(),
    sources: [AI_SOURCE],
    trendScore: 8,
    trendLabel: "Rising",
    quotes: [
      {
        source: "AI synthesis",
        author: "system",
        text: `Signals around "${keyword}" show strong demand for faster validation and clearer market research workflows.`,
      },
    ],
    painPoints: [
      `Teams researching "${keyword}" struggle to validate real demand quickly.`,
      `Research for "${keyword}" is spread across too many places.`,
      `Users need clearer decision support around "${keyword}".`,
    ],
    productIdeas: [
      {
        title: `${keyword} Signal Monitor`,
        description: `Collect and summarize demand signals for "${keyword}" in one place.`,
        targetUser: "Founders and product teams",
      },
    ],
    opportunityScore: 8.4,
    metrics: {
      demand: 8.8,
      competition: 6.1,
      monetization: 8.0,
    },
  };
}

function buildStableReport(input: Partial<DemandReport>): DemandReport {
  return {
    keyword: asString(input.keyword, SAFE_REPORT.keyword),
    generatedAt: asString(input.generatedAt, new Date().toISOString()),
    sources: asSources(input.sources, SAFE_REPORT.sources),
    trendScore: asNumber(input.trendScore, SAFE_REPORT.trendScore),
    trendLabel: asTrendLabel(input.trendLabel, SAFE_REPORT.trendLabel),
    quotes: asQuotes(input.quotes, SAFE_REPORT.quotes),
    painPoints: asPainPoints(input.painPoints, SAFE_REPORT.painPoints),
    productIdeas: asProductIdeas(input.productIdeas, SAFE_REPORT.productIdeas),
    opportunityScore: asNumber(input.opportunityScore, SAFE_REPORT.opportunityScore),
    metrics: asMetrics(input.metrics, SAFE_REPORT.metrics),
  };
}

export default async function handler(req: HandlerRequest, res: HandlerResponse) {
  const method = req.method ?? "UNKNOWN";
  console.log("[api/analyze] handler start", { method });

  try {
    if (method !== "POST") {
      console.warn("[api/analyze] method not allowed", { method });
      return sendError(res, 405, "METHOD_NOT_ALLOWED", "Only POST is supported.");
    }

    const body = parseBody(req.body);
    if (body === null) {
      console.error("[api/analyze] invalid JSON body");
      return sendError(res, 400, "INVALID_JSON", "Request body must be valid JSON.");
    }

    console.log("[api/analyze] request parsed", {
      method,
      hasKeyword: typeof body.keyword === "string" && body.keyword.trim().length > 0,
    });

    if (body.keyword !== undefined && typeof body.keyword !== "string") {
      console.error("[api/analyze] invalid keyword type", { keywordType: typeof body.keyword });
      return sendError(res, 400, "INVALID_KEYWORD", "`keyword` must be a string.");
    }

    const keyword = asString(body.keyword, DEFAULT_KEYWORD);

    let report: DemandReport;
    try {
      report = await analyzeKeyword(keyword);
    } catch (error) {
      console.error("[api/analyze] analyzeKeyword failed", error);
      throw error;
    }

    console.log("[api/analyze] success", { keyword });
    return res.status(200).json(report);
  } catch (error) {
    console.error("[api/analyze] unexpected error", error);
    return sendError(res, 500, "INTERNAL_ERROR", "Unexpected server error.");
  } finally {
    console.log("[api/analyze] handler finish", { method });
  }
}
