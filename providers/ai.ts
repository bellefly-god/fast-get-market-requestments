import type { DemandReport } from "../src/types/demand-report";

type AIAnalysisInput = {
  keyword: string;
};

export async function analyzeWithAI({ keyword }: AIAnalysisInput): Promise<Partial<DemandReport>> {
  const normalizedKeyword = keyword.trim() || "market validation";
  const titleKeyword = normalizedKeyword.toLowerCase();

  return {
    keyword: normalizedKeyword,
    generatedAt: new Date().toISOString(),
    sources: [
      {
        name: "AI Provider",
        kind: "ai",
        status: "ok",
        detail: `Generated mock-first analysis for "${normalizedKeyword}".`,
      },
    ],
    trendScore: 8,
    trendLabel: "Rising",
    quotes: [
      {
        source: "AI synthesis",
        author: "system",
        text: `Found repeat signals that buyers researching "${titleKeyword}" care about speed, proof, and workflow clarity.`,
      },
      {
        source: "AI synthesis",
        author: "system",
        text: `Users comparing "${titleKeyword}" solutions are frustrated by fragmented information and weak validation signals.`,
      },
    ],
    painPoints: [
      `Teams exploring "${titleKeyword}" struggle to validate demand quickly.`,
      `Research around "${titleKeyword}" is scattered across multiple platforms.`,
      `Turning "${titleKeyword}" market signals into actionable product decisions is still too manual.`,
    ],
    productIdeas: [
      {
        title: `${normalizedKeyword} Signal Monitor`,
        description: `Track recurring buyer intent, friction patterns, and demand shifts for "${titleKeyword}" in one workflow.`,
        targetUser: "Indie hackers and product teams",
      },
      {
        title: `${normalizedKeyword} Opportunity Mapper`,
        description: `Turn raw "${titleKeyword}" pain points into prioritized product opportunities with clearer execution guidance.`,
        targetUser: "Founders and product strategists",
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
