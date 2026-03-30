import type { DemandReport } from "@/types/demand-report";

export const LEADERBOARD_KEYWORDS = [
  "job search",
  "creator tools",
  "study tools",
  "AI tools",
  "productivity",
  "solo business",
  "remote work",
  "note taking",
] as const;

export async function fetchDemandReport(keyword: string, signal?: AbortSignal): Promise<DemandReport> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ keyword }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Analyze request failed: ${response.status}`);
  }

  return (await response.json()) as DemandReport;
}

export async function batchFetchReports(
  keywords: readonly string[],
  signal?: AbortSignal,
): Promise<{
  reports: DemandReport[];
  failedKeywords: string[];
}> {
  const results = await Promise.allSettled(keywords.map((keyword) => fetchDemandReport(keyword, signal)));

  const reports: DemandReport[] = [];
  const failedKeywords: string[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      reports.push(result.value);
      return;
    }

    failedKeywords.push(keywords[index]);
  });

  reports.sort((a, b) => b.opportunityScore - a.opportunityScore);

  return { reports, failedKeywords };
}
