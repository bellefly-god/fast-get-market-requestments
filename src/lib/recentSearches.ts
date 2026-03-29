const RECENT_SEARCHES_KEY = "demand-radar.recent-searches";
const RECENT_SEARCH_LIMIT = 10;

export function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, RECENT_SEARCH_LIMIT);
  } catch {
    return [];
  }
}

export function saveRecentSearch(keyword: string): string[] {
  if (typeof window === "undefined") return [];

  const normalized = keyword.trim();
  if (!normalized) return readRecentSearches();

  const next = [normalized, ...readRecentSearches().filter((item) => item !== normalized)].slice(0, RECENT_SEARCH_LIMIT);

  try {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  } catch {
    return next;
  }

  return next;
}
