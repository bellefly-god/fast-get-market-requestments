export type TrendLabel = "Rising" | "Stable" | "Declining";

export type ReportSource = {
  name: string;
  kind: "ai" | "trends" | "reddit";
  status: "ok" | "placeholder" | "fallback";
  detail?: string;
};

export type QuoteItem = {
  source: string;
  author?: string;
  text: string;
};

export type ProductIdea = {
  title: string;
  description: string;
  targetUser: string;
};

export type OpportunityMetrics = {
  demand: number;
  competition: number;
  monetization: number;
};

export type DemandReport = {
  keyword: string;
  generatedAt: string;
  sources: ReportSource[];
  trendScore: number;
  trendLabel: TrendLabel;
  quotes: QuoteItem[];
  painPoints: string[];
  productIdeas: ProductIdea[];
  opportunityScore: number;
  metrics: OpportunityMetrics;
};
