import type { QuoteItem } from "../src/types/demand-report";

export function getRedditSignals(keyword: string): QuoteItem[] {
  const normalizedKeyword = keyword.trim() || "market validation";

  return [
    {
      source: "Reddit",
      author: "u/founder_notes",
      text: `People researching "${normalizedKeyword}" keep asking for clearer examples and faster validation paths.`,
    },
    {
      source: "Reddit",
      author: "u/product_ops",
      text: `A recurring complaint around "${normalizedKeyword}" is that good signal collection is still too manual.`,
    },
  ];
}
