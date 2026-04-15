import type { Express } from "express";
import { type Server } from "http";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "MarketIntel-RSS/1.0" },
});

// RSS feeds from official & reputable outlets covering the Iran war / energy crisis
const RSS_FEEDS = [
  { url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", source: "BBC News" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera" },
  { url: "https://feeds.reuters.com/reuters/worldNews", source: "Reuters" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml", source: "NY Times" },
  { url: "https://www.theguardian.com/world/middleeast/rss", source: "The Guardian" },
  { url: "https://feeds.skynews.com/feeds/rss/world.xml", source: "Sky News" },
];

// War-related keywords to filter relevant articles
const WAR_KEYWORDS = [
  "iran", "hormuz", "tehran", "brent", "oil", "crude", "opec",
  "gold", "energy", "crisis", "war", "strike", "missile", "drone",
  "ceasefire", "peace", "sanctions", "gulf", "qatar", "uae",
  "saudi", "kuwait", "bahrain", "oman", "iraq", "israel",
  "hezbollah", "houthi", "irgc", "pentagon", "centcom",
  "lng", "refinery", "nuclear", "enrichment", "fuel",
  "barrel", "petroleum", "gasoline", "dollar", "dxy",
  "ringgit", "dirham", "humanitarian", "refugee", "un ",
  "iea", "imf", "world bank", "recession",
];

function categorize(title: string, description: string): string {
  const text = (title + " " + description).toLowerCase();
  if (/missile|strike|drone|military|attack|bomb|navy|pentagon|centcom|irgc|weapon|soldier/.test(text)) return "military";
  if (/oil|crude|brent|wti|lng|opec|energy|fuel|power|refinery|pipeline|barrel/.test(text)) return "energy";
  if (/gold|dollar|gdp|inflation|economy|recession|trade|market|stock|imf|bank|currency|ringgit|dirham|peso/.test(text)) return "economy";
  if (/ceasefire|diplomacy|peace|talks|negotiat|sanction|un |treaty|resolution|summit/.test(text)) return "diplomacy";
  if (/humanitarian|refugee|aid|hunger|famine|medical|hospital|civilian|casualt|death|killed|wounded/.test(text)) return "humanitarian";
  return "economy";
}

function estimateImpact(title: string, description: string): string {
  const text = (title + " " + description).toLowerCase();
  if (/ceasefire|peace deal|agreement|reopen|positive|recovery|stabilise|stabilize/.test(text)) return "positive";
  if (/catastroph|emergency|crisis|famine|historic|record|surge|worst|collapse/.test(text)) return "critical";
  if (/major|significant|escalat|intensif|surge|veto|deadline|ultimatum/.test(text)) return "major";
  return "moderate";
}

type RssNewsItem = {
  id: number;
  time: string;
  category: string;
  headline: string;
  summary: string;
  source: string;
  impact: string;
  region: string;
  link: string;
  pubDate: string;
};

// In-memory cache
let newsCache: { items: RssNewsItem[]; fetchedAt: number } = { items: [], fetchedAt: 0 };
const CACHE_TTL = 15 * 60 * 1000; // 15 min

async function fetchAllFeeds(): Promise<RssNewsItem[]> {
  const now = Date.now();
  if (newsCache.items.length > 0 && now - newsCache.fetchedAt < CACHE_TTL) {
    return newsCache.items;
  }

  const allItems: RssNewsItem[] = [];
  let idCounter = 1;

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        return (parsed.items || []).map((item) => ({
          ...item,
          _source: feed.source,
        }));
      } catch {
        return [];
      }
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const item of result.value) {
        const title = item.title || "";
        const desc = item.contentSnippet || item.content || item.summary || "";
        const text = (title + " " + desc).toLowerCase();

        // Filter only war/crisis/energy related articles
        const isRelevant = WAR_KEYWORDS.some((kw) => text.includes(kw));
        if (!isRelevant) continue;

        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
        const timeStr = pubDate.toISOString().slice(11, 16) + " UTC";

        allItems.push({
          id: idCounter++,
          time: timeStr,
          category: categorize(title, desc),
          headline: title,
          summary: desc.slice(0, 400),
          source: (item as any)._source || "Unknown",
          impact: estimateImpact(title, desc),
          region: "Global",
          link: item.link || "",
          pubDate: pubDate.toISOString(),
        });
      }
    }
  }

  // Sort by publish date descending (newest first)
  allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  // Keep top 50
  const top = allItems.slice(0, 50);
  newsCache = { items: top, fetchedAt: now };
  return top;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", dashboard: "Jeff's MarketIntel v3", asOf: "Apr 15, 2026" });
  });

  // RSS News endpoint
  app.get("/api/news", async (_req, res) => {
    try {
      const items = await fetchAllFeeds();
      res.json({ ok: true, count: items.length, items, fetchedAt: new Date(newsCache.fetchedAt).toISOString() });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message, items: [] });
    }
  });

  return httpServer;
}
