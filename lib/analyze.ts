import type { DemandReport, OpportunityMetrics, ProductIdea, QuoteItem, ReportSource, TrendLabel } from "../src/types/demand-report";
import { getRedditSignals } from "../providers/reddit.js";
import { processRawSignals } from "./signals.js";

const DEFAULT_KEYWORD = "youtube automation";
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const AI_SOURCE: ReportSource = { name: "AI Synthesis", type: "ai" };
const REDDIT_SOURCE: ReportSource = { name: "Reddit Signals", type: "reddit" };
const DEMAND_REPORT_SCHEMA = {
  name: "demand_report",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "keyword",
      "generatedAt",
      "sources",
      "trendScore",
      "trendLabel",
      "quotes",
      "painPoints",
      "productIdeas",
      "opportunityScore",
      "metrics",
    ],
    properties: {
      keyword: { type: "string" },
      generatedAt: { type: "string" },
      sources: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "type"],
          properties: {
            name: { type: "string" },
            type: { type: "string", enum: ["ai", "reddit", "trends", "x"] },
          },
        },
      },
      trendScore: { type: "number" },
      trendLabel: { type: "string", enum: ["Rising", "Stable", "Declining"] },
      quotes: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["source", "text"],
          properties: {
            source: { type: "string" },
            author: { type: "string" },
            text: { type: "string" },
          },
        },
      },
      painPoints: {
        type: "array",
        items: { type: "string" },
      },
      productIdeas: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "description", "targetUser"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            targetUser: { type: "string" },
          },
        },
      },
      opportunityScore: { type: "number" },
      metrics: {
        type: "object",
        additionalProperties: false,
        required: ["demand", "competition", "monetization"],
        properties: {
          demand: { type: "number" },
          competition: { type: "number" },
          monetization: { type: "number" },
        },
      },
    },
  },
} as const;

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

function normalizeSources(value: unknown, fallback: ReportSource[]): ReportSource[] {
  const normalized = asSources(value, fallback);
  const deduped: ReportSource[] = [];
  const seen = new Set<string>();

  for (const source of normalized) {
    const key = `${source.type}:${source.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(source);
  }

  return deduped.length > 0 ? deduped : fallback;
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

function getStructuredOutputText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    throw new Error("Structured response payload was not an object.");
  }

  const response = payload as {
    output_text?: unknown;
    output?: Array<{
      content?: Array<
        | { type?: string; text?: string }
        | { type?: string; refusal?: string }
      >;
    }>;
  };

  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }

  const refusal = response.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "refusal" && typeof content.refusal === "string");

  if (refusal && typeof refusal.refusal === "string") {
    throw new Error(`Structured AI refused request: ${refusal.refusal}`);
  }

  const outputText = response.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text" && typeof content.text === "string");

  if (outputText && typeof outputText.text === "string" && outputText.text.trim()) {
    return outputText.text;
  }

  throw new Error("Structured response did not include output_text.");
}

async function generateAIReport(keyword: string, topQuotes: QuoteItem[]): Promise<Partial<DemandReport>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const generatedAt = new Date().toISOString();
  const quoteContext =
    topQuotes.length > 0
      ? topQuotes
          .map((quote, index) => `${index + 1}. ${quote.text}${quote.author ? ` (author: ${quote.author})` : ""} [source: ${quote.source}]`)
          .join("\n")
      : "No usable signals were available.";

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "Return a DemandReport as JSON only. Follow the schema exactly. Keep scores within 1 to 10. This is a single-source MVP, so synthesize from the provided signal quotes only. Use sources [{\"name\":\"AI Synthesis\",\"type\":\"ai\"},{\"name\":\"Reddit Signals\",\"type\":\"reddit\"}] when signals are present, otherwise use [{\"name\":\"AI Synthesis\",\"type\":\"ai\"}]. Produce 2 to 4 quotes, 3 to 5 pain points, and 2 to 3 product ideas.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Create a demand report for the keyword "${keyword}". Use "${generatedAt}" exactly for generatedAt.\n\nProcessed signal quotes:\n${quoteContext}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...DEMAND_REPORT_SCHEMA,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI structured request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as unknown;
  const outputText = getStructuredOutputText(payload);
  return JSON.parse(outputText) as Partial<DemandReport>;
}

function buildStableReport(input: Partial<DemandReport>): DemandReport {
  return {
    keyword: asString(input.keyword, SAFE_REPORT.keyword),
    generatedAt: asString(input.generatedAt, new Date().toISOString()),
    sources: normalizeSources(input.sources, SAFE_REPORT.sources),
    trendScore: clampScore(asNumber(input.trendScore, SAFE_REPORT.trendScore)),
    trendLabel: asTrendLabel(input.trendLabel, SAFE_REPORT.trendLabel),
    quotes: asQuotes(input.quotes, SAFE_REPORT.quotes),
    painPoints: asPainPoints(input.painPoints, SAFE_REPORT.painPoints),
    productIdeas: asProductIdeas(input.productIdeas, SAFE_REPORT.productIdeas),
    opportunityScore: clampScore(asNumber(input.opportunityScore, SAFE_REPORT.opportunityScore)),
    metrics: asMetrics(input.metrics, SAFE_REPORT.metrics),
  };
}

export async function analyzeKeyword(keyword: string): Promise<DemandReport> {
  const normalizedKeyword = asString(keyword, DEFAULT_KEYWORD);

  try {
    try {
      const rawSignals = await getRedditSignals(normalizedKeyword);
      const processedSignals = processRawSignals(rawSignals);

      console.log("[lib/analyze] raw signals fetched", {
        keyword: normalizedKeyword,
        provider: "reddit",
        rawCount: processedSignals.rawCount,
        filteredCount: processedSignals.filteredCount,
        dedupedCount: processedSignals.dedupedCount,
      });

      const aiReport = await generateAIReport(normalizedKeyword, processedSignals.topQuotes);
      let report = buildStableReport(aiReport);

      console.log("[lib/analyze] structured ai success", {
        keyword: normalizedKeyword,
        model: OPENAI_MODEL,
        signalQuotes: processedSignals.topQuotes.length,
      });

      const derivedPainPoints = derivePainPointsFromQuotes(processedSignals.topQuotes, normalizedKeyword);
      report = buildStableReport({
        ...report,
        quotes: processedSignals.topQuotes.length > 0 ? processedSignals.topQuotes : report.quotes,
        painPoints: [...report.painPoints, ...derivedPainPoints],
        sources: processedSignals.topQuotes.length > 0 ? [AI_SOURCE, REDDIT_SOURCE] : [AI_SOURCE],
      });

      console.log("[lib/analyze] signal pipeline", {
        keyword: normalizedKeyword,
        provider: "reddit",
        topQuotes: processedSignals.topQuotes.length,
        derivedPainPoints: derivedPainPoints.length,
      });

      console.log("[lib/analyze] response source", { source: "structured_ai", keyword: report.keyword });
      return report;
    } catch (providerOrAiError) {
      throw providerOrAiError;
    }
  } catch (error) {
    console.error("[lib/analyze] structured ai failed, using safe fallback", error);
    const report = buildStableReport({
      ...SAFE_REPORT,
      keyword: normalizedKeyword,
      generatedAt: new Date().toISOString(),
    });
    console.log("[lib/analyze] response source", { source: "fallback", keyword: report.keyword });
    return report;
  }
}
