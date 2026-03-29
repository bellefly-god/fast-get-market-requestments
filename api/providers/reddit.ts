import type { QuoteItem, ReportSource } from "../../src/types/demand-report";

export async function getRedditSignals(): Promise<{ quotes: QuoteItem[]; sources: ReportSource[] }> {
  // TODO: Replace placeholder implementation with Reddit collection and ranking.
  return {
    quotes: [],
    sources: [
      {
        name: "Reddit Provider",
        kind: "reddit",
        status: "placeholder",
        detail: "TODO: connect Reddit search and summarization.",
      },
    ],
  };
}
