import type { TrendLabel } from "../src/types/demand-report";

type TrendSignal = {
  trendScore: number;
  trendLabel: TrendLabel;
};

export function getTrendSignals(keyword: string): TrendSignal {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (normalizedKeyword.includes("ai") || normalizedKeyword.includes("automation")) {
    return {
      trendScore: 9.1,
      trendLabel: "Rising",
    };
  }

  if (normalizedKeyword.includes("finance") || normalizedKeyword.includes("job")) {
    return {
      trendScore: 7.4,
      trendLabel: "Stable",
    };
  }

  return {
    trendScore: 8.0,
    trendLabel: "Rising",
  };
}
