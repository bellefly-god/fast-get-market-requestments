import type { DemandReport, OpportunityMetrics, ProductIdea, QuoteItem, ReportSource, TrendLabel } from "../src/types/demand-report";
import { getRedditSignals } from "../providers/reddit.js";
import { getTrendSignals } from "../providers/trends.js";

const DEFAULT_KEYWORD = "youtube automation";

const SAFE_REPORT: DemandReport = {
  keyword: DEFAULT_KEYWORD,
  generatedAt: "2026-03-29T00:00:00.000Z",
  sources: [
    {
      name: "safe-ai-fallback",
      type: "ai",
    },
  ],
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

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clampScore(value: number): number {
  return Math.min(10, Math.max(1, value));
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
  const next = Array.from(new Set(value.map((item) => asString(item, "")).filter(Boolean)));
  return next.length > 0 ? next : fallback;
}

function derivePainPointsFromQuotes(quotes: QuoteItem[], keyword: string): string[] {
  if (quotes.length === 0) return [];

  const normalizedKeyword = asString(keyword, DEFAULT_KEYWORD);
  const combinedText = quotes.map((quote) => quote.text.toLowerCase()).join(" ");
  const derived: string[] = [];

  if (combinedText.includes("manual")) {
    derived.push(`Work around "${normalizedKeyword}" still feels too manual for users.`);
  }

  if (combinedText.includes("clearer") || combinedText.includes("example")) {
    derived.push(`Users exploring "${normalizedKeyword}" want clearer guidance and examples before committing.`);
  }

  if (combinedText.includes("faster") || combinedText.includes("speed")) {
    derived.push(`Teams evaluating "${normalizedKeyword}" need faster validation loops and signal collection.`);
  }

  return derived.slice(0, 2);
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
    demand: clampScore(asNumber(metrics.demand, fallback.demand)),
    competition: clampScore(asNumber(metrics.competition, fallback.competition)),
    monetization: clampScore(asNumber(metrics.monetization, fallback.monetization)),
  };
}

function generateAIReport(keyword: string): Partial<DemandReport> {
  return {
    keyword,
    generatedAt: new Date().toISOString(),
    sources: [
      {
        name: "mock-ai",
        type: "ai",
      },
    ],
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
    trendScore: clampScore(asNumber(input.trendScore, SAFE_REPORT.trendScore)),
    trendLabel: asTrendLabel(input.trendLabel, SAFE_REPORT.trendLabel),
    quotes: asQuotes(input.quotes, SAFE_REPORT.quotes),
    painPoints: asPainPoints(input.painPoints, SAFE_REPORT.painPoints),
    productIdeas: asProductIdeas(input.productIdeas, SAFE_REPORT.productIdeas),
    opportunityScore: clampScore(asNumber(input.opportunityScore, SAFE_REPORT.opportunityScore)),
    metrics: asMetrics(input.metrics, SAFE_REPORT.metrics),
  };
}

export function analyzeKeyword(keyword: string): DemandReport {
  const normalizedKeyword = asString(keyword, DEFAULT_KEYWORD);

  try {
    const aiReport = generateAIReport(normalizedKeyword);
    let report = buildStableReport(aiReport);
    let redditIncluded = false;

    try {
      const trendSignals = getTrendSignals(normalizedKeyword);
      report = buildStableReport({
        ...report,
        trendScore: trendSignals.trendScore,
        trendLabel: trendSignals.trendLabel,
      });
      console.log("[lib/analyze] trends success", {
        keyword: normalizedKeyword,
        trendScore: trendSignals.trendScore,
        trendLabel: trendSignals.trendLabel,
      });
    } catch (error) {
      console.error("[lib/analyze] trends failure", error);
    }

    try {
      const redditResult = getRedditSignals(normalizedKeyword);
      const redditQuotes = asQuotes(redditResult, []);
      const redditPainPoints = derivePainPointsFromQuotes(redditQuotes, normalizedKeyword);
      report = buildStableReport({
        ...report,
        quotes: [...report.quotes, ...redditQuotes],
        painPoints: [...report.painPoints, ...redditPainPoints],
        sources: redditQuotes.length > 0 ? [...report.sources, { name: "reddit-signals", type: "reddit" }] : report.sources,
      });
      redditIncluded = redditQuotes.length > 0;
      console.log("[lib/analyze] reddit success", { keyword: normalizedKeyword, quotes: redditQuotes.length, painPoints: redditPainPoints.length });
    } catch (error) {
      console.error("[lib/analyze] reddit failure", error);
    }

    console.log("[lib/analyze] reddit included", { keyword: normalizedKeyword, included: redditIncluded });

    console.log("[lib/analyze] response source", { source: "ai", keyword: report.keyword });
    return report;
  } catch (error) {
    console.error("[lib/analyze] analyzeKeyword failed, using safe fallback", error);
    const report = buildStableReport({
      ...SAFE_REPORT,
      keyword: normalizedKeyword,
      generatedAt: new Date().toISOString(),
    });
    console.log("[lib/analyze] response source", { source: "fallback", keyword: report.keyword });
    return report;
  }
}
