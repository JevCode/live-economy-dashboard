import type { Express } from "express";
import { type Server } from "http";
import Parser from "rss-parser";
import { execFile } from "child_process";

const parser = new Parser({
  timeout: 12000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/rss+xml, application/xml, text/xml, application/atom+xml, */*",
    "Accept-Language": "en-US,en;q=0.9",
  },
  customFields: {
    item: [["media:content", "mediaContent"], ["media:thumbnail", "mediaThumbnail"], ["content:encoded", "contentEncoded"]],
  },
});

// ── All RSS feeds — fetched server-side (no CORS issues) ──────────────────
const RSS_FEEDS: { url: string; source: string; leader?: string; category?: string }[] = [
  // Leader feeds — Trump
  { url: "https://trumpstruth.org/feed",                             source: "Trump · Truth Social",  leader: "trump"  },
  // Leader feeds — Iran official (only confirmed-working feeds)
  { url: "https://ifpnews.com/feed/",                                source: "Iran Front Page",        leader: "iran"   },
  { url: "https://ifpnews.com/category/news/politics/feed/",         source: "IFP Politics",           leader: "iran"   },
  { url: "https://ifpnews.com/category/war/feed/",                   source: "IFP War News",           leader: "iran"   },
  { url: "https://ifpnews.com/category/news/diplomacy/feed/",        source: "IFP Diplomacy",          leader: "iran"   },
  // Global / ME news
  { url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", source: "BBC Middle East"  },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml",             source: "BBC World"        },
  { url: "https://www.aljazeera.com/xml/rss/all.xml",               source: "Al Jazeera"       },
  { url: "https://feeds.skynews.com/feeds/rss/world.xml",           source: "Sky News"         },
  { url: "https://www.theguardian.com/world/middleeast/rss",        source: "The Guardian ME"  },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml", source: "NY Times ME"  },
  { url: "https://www.npr.org/rss/rss.php?id=1004",                 source: "NPR World"        },
  { url: "https://middleeastmonitor.com/feed/",                     source: "Middle East Monitor" },
  { url: "https://dohanews.co/feed/",                               source: "Doha News"        },
  { url: "https://www.jpost.com/rss/rssfeedsfrontpage.aspx",        source: "Jerusalem Post"   },
  { url: "https://crisisgroup.org/rss.xml",                         source: "Crisis Group"     },
  // Energy / Markets
  { url: "https://oilprice.com/rss/main",                           source: "OilPrice.com",    category: "energy"  },
  { url: "https://www.bloomberg.com/feeds/sitemap_news.xml",        source: "Bloomberg"        },
  { url: "https://feeds.reuters.com/reuters/businessNews",          source: "Reuters Business" },
  { url: "https://feeds.reuters.com/reuters/worldNews",             source: "Reuters World"    },
];

const WAR_KW = [
  "iran","hormuz","tehran","brent","oil","crude","opec","gold","energy","crisis",
  "war","strike","missile","drone","ceasefire","peace","sanction","gulf","qatar",
  "uae","saudi","kuwait","bahrain","oman","iraq","israel","hezbollah","houthi",
  "irgc","lng","refinery","nuclear","fuel","barrel","humanitarian","refugee",
  "imf","recession","inflation","dollar","ringgit","dirham","trump","centcom",
  "pentagon","navy","tanker","shipping","hormuz","maersk","hapag","freight",
];

function categorize(title: string, desc: string): string {
  const t = (title + " " + desc).toLowerCase();
  if (/missile|strike|drone|military|attack|bomb|navy|pentagon|centcom|irgc|weapon|soldier|warship|combat/.test(t)) return "military";
  if (/oil|crude|brent|wti|lng|opec|energy|fuel|power|refinery|pipeline|barrel|tanker|shipping/.test(t)) return "energy";
  if (/gold|dollar|gdp|inflation|economy|recession|trade|market|stock|imf|bank|currency|ringgit|dirham|peso|index/.test(t)) return "economy";
  if (/ceasefire|diplomacy|peace|talks|negotiat|sanction|un |treaty|resolution|summit|deal/.test(t)) return "diplomacy";
  if (/humanitarian|refugee|aid|hunger|famine|medical|hospital|civilian|casualt|death|killed|wounded/.test(t)) return "humanitarian";
  return "economy";
}

function estimateImpact(title: string, desc: string): string {
  const t = (title + " " + desc).toLowerCase();
  if (/ceasefire|peace deal|agreement|reopen|recovery|stabilise|stabilize|positive/.test(t)) return "positive";
  if (/catastroph|emergency|famine|historic|record|surge|worst|collapse|unprecedented/.test(t)) return "critical";
  if (/major|significant|escalat|intensif|surge|veto|deadline|ultimatum/.test(t)) return "major";
  return "moderate";
}

type RssNewsItem = {
  id: string;
  time: string;
  category: string;
  headline: string;
  summary: string;
  source: string;
  impact: string;
  link: string;
  pubDate: string;
  leader: string | null;
};

// Cache: 5 min TTL
let newsCache: { items: RssNewsItem[]; fetchedAt: number } = { items: [], fetchedAt: 0 };
const CACHE_TTL = 5 * 60 * 1000;


// Curl-based fetch (bypasses Node.js SSL issues; curl handles redirects natively)
function curlFetch(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("curl", [
      "-sL", "--max-time", "12", "--max-redirs", "5",
      "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "-H", "Accept: application/rss+xml, application/xml, text/xml, */*",
      url,
    ], { maxBuffer: 5 * 1024 * 1024 }, (err, stdout) => {
      if (err) { reject(err); return; }
      resolve(stdout);
    });
  });
}

function parseItemsFromXml(xml: string): Array<{ title: string; link: string; pubDate: string; description: string }> {
  const items: Array<{ title: string; link: string; pubDate: string; description: string }> = [];
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const title   = (block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1]?.trim() || "";
    const link    = (block.match(/<link[^>]*>([\s\S]*?)<\/link>/)         || [])[1]?.trim() || "";
    const pubDate = (block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)   || [])[1]?.trim() || new Date().toUTCString();
    const desc    = (block.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1]?.replace(/<[^>]*>/g, "").trim().slice(0, 500) || "";
    if (title) items.push({ title, link, pubDate, description: desc });
  }
  return items;
}

async function fetchAllFeeds(): Promise<RssNewsItem[]> {
  const now = Date.now();
  if (newsCache.items.length > 0 && now - newsCache.fetchedAt < CACHE_TTL) {
    return newsCache.items;
  }

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      // Try rss-parser first; fall back to curlFetch + manual XML parse for SSL/redirect failures
      let rawItems: Array<{ title?: string; link?: string; pubDate?: string; contentSnippet?: string; content?: string; summary?: string }> = [];
      let parsedOk = false;

      try {
        const parsed = await parser.parseURL(feed.url);
        rawItems = parsed.items || [];
        parsedOk = true;
      } catch {
        // Fall through to curlFetch
      }

      if (!parsedOk || rawItems.length === 0) {
        try {
          const xml = await curlFetch(feed.url);
          const xmlItems = parseItemsFromXml(xml);
          rawItems = xmlItems;
        } catch {
          rawItems = [];
        }
      }

      return rawItems.map((item) => ({
        ...item,
        _source: feed.source,
        _leader: feed.leader || null,
        _forceCat: feed.category || null,
      }));
    })
  );

  const allItems: RssNewsItem[] = [];
  let idCounter = 1;

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const item of result.value) {
      const title  = (item.title || "").trim();
      const desc   = ((item.contentSnippet || item.content || item.summary || (item as any).description || "") as string)
        .replace(/<[^>]*>/g, "").trim().slice(0, 500);
      if (!title) continue;

      const text = (title + " " + desc).toLowerCase();
      const isLeader = !!item._leader;

      // Leaders always included; others must match war keywords
      if (!isLeader) {
        const isRelevant = WAR_KW.some(kw => text.includes(kw));
        if (!isRelevant) continue;
      }

      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      const id = `${item._source}-${title.slice(0,40)}-${pubDate.getTime()}`;

      allItems.push({
        id,
        time:     pubDate.toISOString().slice(11, 16) + " UTC",
        category: isLeader ? "leaders" : (item._forceCat || categorize(title, desc)),
        headline: title,
        summary:  desc,
        source:   item._source as string,
        impact:   estimateImpact(title, desc),
        link:     item.link || "",
        pubDate:  pubDate.toISOString(),
        leader:   item._leader as string | null,
      });
    }
  }

  allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  // Always keep leader articles — partition by leader type to prevent one leader drowning the other
  const trumpItems = allItems.filter(i => i.leader === "trump").slice(0, 20);
  const iranItems  = allItems.filter(i => i.leader === "iran").slice(0, 20);
  const nonLeaderItems = allItems.filter(i => i.leader === null).slice(0, 110);
  const combined = [...trumpItems, ...iranItems, ...nonLeaderItems];
  combined.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  const top = combined.slice(0, 150);
  newsCache = { items: top, fetchedAt: now };
  return top;
}

// Force a background refresh (used after cache miss)
async function backgroundRefresh() {
  newsCache.fetchedAt = 0; // invalidate
  fetchAllFeeds().catch(() => {});
}

// ── LIVE MARKET DATA — fetched server-side, cached 15 min ─────────────────
const MARKET_TTL = 15 * 60 * 1000;
let marketCache: { data: Record<string, number | string> | null; fetchedAt: number } = { data: null, fetchedAt: 0 };

function extractPrice(html: string, patterns: RegExp[]): number | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m) {
      const val = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(val) && val > 0) return val;
    }
  }
  return null;
}

async function fetchMarketData(): Promise<Record<string, number | string>> {
  const now = Date.now();
  if (marketCache.data && now - marketCache.fetchedAt < MARKET_TTL) return marketCache.data;

  async function fetchHtml(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(
        "curl",
        ["-sL", "--max-time", "15", "--max-redirs", "5",
          "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "-H", "Accept: text/html,application/xhtml+xml,*/*",
          "-H", "Accept-Language: en-US,en;q=0.9",
          url],
        { maxBuffer: 4 * 1024 * 1024 },
        (err, stdout) => { err ? reject(err) : resolve(stdout); }
      );
    });
  }

  // Fetch all prices in parallel
  const [brentHtml, goldHtml, wtiHtml, myrHtml, dxyHtml] = await Promise.allSettled([
    fetchHtml("https://tradingeconomics.com/commodity/brent-crude-oil"),
    fetchHtml("https://tradingeconomics.com/commodity/gold"),
    fetchHtml("https://tradingeconomics.com/commodity/crude-oil"),
    fetchHtml("https://freecurrencyrates.com/en/exchange-rate-detail/USD/MYR"),
    fetchHtml("https://finance.yahoo.com/quote/DX-Y.NYB/"),
  ]);

  function getHtml(r: PromiseSettledResult<string>): string {
    return r.status === "fulfilled" ? r.value : "";
  }

  const brentHtmlStr = getHtml(brentHtml);
  const goldHtmlStr  = getHtml(goldHtml);
  const wtiHtmlStr   = getHtml(wtiHtml);
  const myrHtmlStr   = getHtml(myrHtml);
  const dxyHtmlStr   = getHtml(dxyHtml);

  // Extract Brent
  const brent = extractPrice(brentHtmlStr, [
    /"price":\s*"([\d,.]+)"/i,
    /class="[^"]*price[^"]*"[^>]*>([\d,.]+)/i,
    /<td[^>]*id="p"[^>]*>([\d,.]+)/i,
    /Brent[^<]*<\/[^>]+>[^<]*<[^>]+>([\d,.]+)/i,
    /data-value="([\d.]+)"[^>]*>\s*Brent/i,
    /(\d{2,3}\.\d{1,3})\s*(?:USD|\$)?\s*\/\s*(?:bbl|barrel)/i,
  ]);

  // Extract Gold
  const gold = extractPrice(goldHtmlStr, [
    /"price":\s*"([\d,.]+)"/i,
    /class="[^"]*price[^"]*"[^>]*>([\d,.]+)/i,
    /(3[0-9]{3}|[4-9]\d{3})\.\d{2}/,
  ]);

  // Extract WTI
  const wti = extractPrice(wtiHtmlStr, [
    /"price":\s*"([\d,.]+)"/i,
    /class="[^"]*price[^"]*"[^>]*>([\d,.]+)/i,
    /(\d{2,3}\.\d{1,3})\s*(?:USD|\$)?\s*\/\s*(?:bbl|barrel)/i,
  ]);

  // Extract USD/MYR
  const myr = extractPrice(myrHtmlStr, [
    /1\s*USD\s*=\s*([\d.]+)\s*MYR/i,
    /USD\/MYR[^\d]*([\d.]+)/i,
    /([3-5]\.\d{3,4})\s*MYR/i,
    /"rate":\s*"?([\d.]+)"?/i,
    /([3-5]\.\d{2,4})/,
  ]);

  // Extract DXY from Yahoo Finance — must be in range 85–130
  const dxyRaw = extractPrice(dxyHtmlStr, [
    /"regularMarketPrice":\{"raw":([\d.]+)/i,
    /data-testid="qsp-price"[^>]*>([\d.]+)/i,
    /((?:9[0-9]|1[01][0-9]|8[5-9])\.\d{1,3})(?!\d)/,
  ]);
  const dxy = dxyRaw !== null && dxyRaw >= 85 && dxyRaw <= 130 ? dxyRaw : null;

  // Validate ranges before accepting
  function inRange(v: number | null, min: number, max: number): number | null {
    return v !== null && v >= min && v <= max ? v : null;
  }

  // Calculate derived values with range validation
  const brentFinal = inRange(brent, 40, 200) ?? (marketCache.data?.brentUSD as number) ?? 90.38;
  const goldFinal  = inRange(gold,  2000, 8000) ?? (marketCache.data?.goldOzUSD as number) ?? 4833.6;
  const wtiFinal   = inRange(wti,   38, 195) ?? (marketCache.data?.wtiUSD as number)    ?? 87.50;
  const myrFinal   = inRange(myr,   3.0, 6.0)   ?? (marketCache.data?.usdMyr as number)    ?? 3.9525;
  const dxyFinal   = dxy ?? (marketCache.data?.dxy as number) ?? 98.23;

  const goldGramUSD = parseFloat((goldFinal / 31.1035).toFixed(4));
  const crisisStart = new Date("2026-02-28T00:00:00Z").getTime();
  const crisisDay   = Math.max(1, Math.floor((Date.now() - crisisStart) / 86400000) + 1);

  const asOfDate = new Date().toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Dubai"
  });

  const data: Record<string, number | string> = {
    brentUSD:    brentFinal,
    wtiUSD:      wtiFinal,
    goldOzUSD:   goldFinal,
    goldGramUSD: goldGramUSD,
    usdMyr:      myrFinal,
    usdAed:      3.6725,
    dxy:         dxyFinal,
    crisisDay,
    asOf:        asOfDate,
    fetchedAt:   now,
    sources: "TradingEconomics · Yahoo Finance · FreeCurrencyRates",
  };

  marketCache = { data, fetchedAt: now };
  return data;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", dashboard: "Jeff's MarketIntel v3", asOf: "Apr 16, 2026" });
  });

  // Live market data endpoint — cached 15 min, falls back to last known values
  app.get("/api/market-data", async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === "1";
      if (forceRefresh) marketCache.fetchedAt = 0;
      const data = await fetchMarketData();
      res.json({ ok: true, ...data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // RSS News endpoint — server-side fetch, no CORS issues
  app.get("/api/news", async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === "1";
      if (forceRefresh) newsCache.fetchedAt = 0;
      const items = await fetchAllFeeds();
      res.json({
        ok: true,
        count: items.length,
        items,
        fetchedAt: new Date(newsCache.fetchedAt).toISOString(),
        cacheAge: Math.round((Date.now() - newsCache.fetchedAt) / 1000),
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message, items: [] });
    }
  });

  // Warm up caches on startup
  setTimeout(() => fetchAllFeeds().catch(() => {}), 2000);
  setTimeout(() => fetchMarketData().catch(() => {}), 3000);

  return httpServer;
}

// Intentionally left blank — see modification below