export type TrendLabel = "Rising" | "Stable" | "Declining";

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
  trendScore: number;
  trendLabel: TrendLabel;
  quotes: QuoteItem[];
  painPoints: string[];
  productIdeas: ProductIdea[];
  opportunityScore: number;
  metrics: OpportunityMetrics;
};