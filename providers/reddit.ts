import type { RawSignal } from "../src/types/raw-signal";

const REDDIT_API_URL = process.env.REDDIT_API_URL || "http://localhost:8000";

interface RedditSignalResponse {
  source: string;
  author?: string;
  text: string;
  url?: string;
}

function toRawSignals(items: RedditSignalResponse[]): RawSignal[] {
  const collectedAt = new Date().toISOString();

  return items.map((item) => ({
    provider: "reddit",
    source: item.source,
    author: item.author,
    text: item.text,
    url: item.url,
    collectedAt,
  }));
}

export async function getRedditSignals(keyword: string): Promise<RawSignal[]> {
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

    const data = (await res.json()) as { quotes?: RedditSignalResponse[] };
    const quotes = data?.quotes ?? [];

    if (quotes.length > 0) {
      console.log(`[reddit] fetched ${quotes.length} quotes for "${normalizedKeyword}"`);
      return toRawSignals(quotes);
    }

    console.warn("[reddit] no quotes returned, using fallback");
  } catch (err) {
    console.warn("[reddit] fetch failed, using fallback:", err);
  }

  // Fallback mock data
  return toRawSignals([
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
  ]);
}
