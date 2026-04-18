import type { VercelRequest, VercelResponse } from "@vercel/node";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 12000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/rss+xml, application/xml, text/xml, application/atom+xml, */*",
    "Accept-Language": "en-US,en;q=0.9",
  },
  customFields: {
    item: [["media:content", "mediaContent"], ["content:encoded", "contentEncoded"]],
  },
});

const RSS_FEEDS = [
  { url: "https://trumpstruth.org/feed",                                source: "Trump · Truth Social",   leader: "trump" },
  { url: "https://ifpnews.com/feed/",                                   source: "Iran Front Page",         leader: "iran"  },
  { url: "https://ifpnews.com/category/news/politics/feed/",            source: "IFP Politics",            leader: "iran"  },
  { url: "https://ifpnews.com/category/war/feed/",                      source: "IFP War News",            leader: "iran"  },
  { url: "https://ifpnews.com/category/news/diplomacy/feed/",           source: "IFP Diplomacy",           leader: "iran"  },
  { url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",    source: "BBC Middle East"  },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml",                source: "BBC World"        },
  { url: "https://www.aljazeera.com/xml/rss/all.xml",                  source: "Al Jazeera"       },
  { url: "https://feeds.skynews.com/feeds/rss/world.xml",              source: "Sky News"         },
  { url: "https://www.theguardian.com/world/middleeast/rss",           source: "The Guardian ME"  },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml",source: "NY Times ME"      },
  { url: "https://www.npr.org/rss/rss.php?id=1004",                    source: "NPR World"        },
  { url: "https://middleeastmonitor.com/feed/",                        source: "Middle East Monitor" },
  { url: "https://dohanews.co/feed/",                                  source: "Doha News"        },
  { url: "https://www.jpost.com/rss/rssfeedsfrontpage.aspx",           source: "Jerusalem Post"   },
  { url: "https://oilprice.com/rss/main",                              source: "OilPrice.com",    category: "energy" },
  { url: "https://feeds.reuters.com/reuters/businessNews",             source: "Reuters Business" },
  { url: "https://feeds.reuters.com/reuters/worldNews",               source: "Reuters World"    },
];

const WAR_KW = [
  "iran","hormuz","tehran","brent","oil","crude","opec","gold","energy","crisis",
  "war","strike","missile","drone","ceasefire","peace","sanction","gulf","qatar",
  "uae","saudi","kuwait","bahrain","oman","iraq","israel","hezbollah","houthi",
  "irgc","lng","refinery","nuclear","fuel","barrel","humanitarian","refugee",
  "imf","recession","inflation","dollar","ringgit","dirham","trump","centcom",
  "pentagon","navy","tanker","shipping","maersk","hapag","freight",
];

function categorize(title: string, desc: string): string {
  const t = (title + " " + desc).toLowerCase();
  if (/missile|strike|drone|military|attack|bomb|navy|pentagon|centcom|irgc|weapon|soldier|warship|combat/.test(t)) return "military";
  if (/oil|crude|brent|wti|lng|opec|energy|fuel|power|refinery|pipeline|barrel|tanker|shipping/.test(t)) return "energy";
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

function parseItemsFromXml(xml: string) {
  const items: Array<{ title: string; link: string; pubDate: string; description: string }> = [];
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const title   = (block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1]?.trim() || "";
    const link    = (block.match(/<link[^>]*>([\s\S]*?)<\/link>/) || [])[1]?.trim() || "";
    const pubDate = (block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/) || [])[1]?.trim() || new Date().toUTCString();
    const desc    = (block.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1]?.replace(/<[^>]*>/g, "").trim().slice(0, 500) || "";
    if (title) items.push({ title, link, pubDate, description: desc });
  }
  return items;
}

async function fetchFeedWithFallback(url: string): Promise<any[]> {
  // Try rss-parser first
  try {
    const parsed = await parser.parseURL(url);
    if (parsed.items?.length) return parsed.items;
  } catch { /* fall through */ }

  // Fallback: native fetch + XML parse
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    const xml = await res.text();
    return parseItemsFromXml(xml);
  } catch { return []; }
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  // Cache at Vercel CDN edge for 5 min
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map(async (feed) => {
        const rawItems = await fetchFeedWithFallback(feed.url);
        return rawItems.map((item: any) => ({
          ...item,
          _source:   feed.source,
          _leader:   (feed as any).leader || null,
          _forceCat: (feed as any).category || null,
        }));
      })
    );

    const allItems: any[] = [];

    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      for (const item of result.value) {
        const title = (item.title || "").trim();
        const desc  = ((item.contentSnippet || item.content || item.summary || item.description || "") as string)
          .replace(/<[^>]*>/g, "").trim().slice(0, 500);
        if (!title) continue;

        const isLeader  = !!item._leader;
        const isRelevant = isLeader || WAR_KW.some(kw => (title + " " + desc).toLowerCase().includes(kw));
        if (!isRelevant) continue;

        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

        allItems.push({
          id:       `${item._source}-${title.slice(0,40)}-${pubDate.getTime()}`,
          time:     pubDate.toISOString().slice(11, 16) + " UTC",
          category: isLeader ? "leaders" : (item._forceCat || categorize(title, desc)),
          headline: title,
          summary:  desc,
          source:   item._source,
          impact:   estimateImpact(title, desc),
          link:     item.link || "",
          pubDate:  pubDate.toISOString(),
          leader:   item._leader,
        });
      }
    }

    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    const trumpItems     = allItems.filter(i => i.leader === "trump").slice(0, 20);
    const iranItems      = allItems.filter(i => i.leader === "iran").slice(0, 20);
    const nonLeaderItems = allItems.filter(i => !i.leader).slice(0, 110);
    const combined       = [...trumpItems, ...iranItems, ...nonLeaderItems];
    combined.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    const top = combined.slice(0, 150);

    res.json({ ok: true, count: top.length, items: top, fetchedAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message, items: [] });
  }
}
