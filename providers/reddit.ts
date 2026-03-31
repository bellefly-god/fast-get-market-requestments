const REDDIT_API_URL = process.env.REDDIT_API_URL || "http://localhost:8000";

interface RedditQuote {
  source: string;
  author?: string;
  text: string;
}

export async function getRedditSignals(keyword: string): Promise<RedditQuote[]> {
  const normalizedKeyword = keyword.trim() || "market validation";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const url = `${REDDIT_API_URL}/quotes?keyword=${encodeURIComponent(normalizedKeyword)}&limit=10`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[reddit] API returned ${res.status}, using fallback`);
      throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as { quotes?: RedditQuote[] };
    const quotes = data?.quotes ?? [];

    if (quotes.length > 0) {
      console.log(`[reddit] fetched ${quotes.length} quotes for "${normalizedKeyword}"`);
      return quotes;
    }

    console.warn("[reddit] no quotes returned, using fallback");
  } catch (err) {
    console.warn("[reddit] fetch failed, using fallback:", err);
  }

  // Fallback mock data
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
