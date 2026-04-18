import type { VercelRequest, VercelResponse } from "@vercel/node";

// Vercel Edge Cache header = 15 min (s-maxage=900)
// Vercel also has stale-while-revalidate so users never wait for a fresh fetch

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

function inRange(v: number | null, min: number, max: number): number | null {
  return v !== null && v >= min && v <= max ? v : null;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,*/*",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(12000),
  });
  return res.text();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel CDN caches this response for 15 min automatically via Cache-Control
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const [brentHtml, goldHtml, wtiHtml, myrHtml, dxyHtml] = await Promise.allSettled([
      fetchHtml("https://tradingeconomics.com/commodity/brent-crude-oil"),
      fetchHtml("https://tradingeconomics.com/commodity/gold"),
      fetchHtml("https://tradingeconomics.com/commodity/crude-oil"),
      fetchHtml("https://freecurrencyrates.com/en/exchange-rate-detail/USD/MYR"),
      fetchHtml("https://finance.yahoo.com/quote/DX-Y.NYB/"),
    ]);

    const get = (r: PromiseSettledResult<string>) => r.status === "fulfilled" ? r.value : "";

    const brent = extractPrice(get(brentHtml), [
      /"price":\s*"([\d,.]+)"/i,
      /class="[^"]*price[^"]*"[^>]*>([\d,.]+)/i,
      /(\d{2,3}\.\d{1,3})\s*(?:USD|\$)?\s*\/\s*(?:bbl|barrel)/i,
    ]);

    const gold = extractPrice(get(goldHtml), [
      /"price":\s*"([\d,.]+)"/i,
      /class="[^"]*price[^"]*"[^>]*>([\d,.]+)/i,
      /(3[0-9]{3}|[4-9]\d{3})\.\d{2}/,
    ]);

    const wti = extractPrice(get(wtiHtml), [
      /"price":\s*"([\d,.]+)"/i,
      /class="[^"]*price[^"]*"[^>]*>([\d,.]+)/i,
      /(\d{2,3}\.\d{1,3})\s*(?:USD|\$)?\s*\/\s*(?:bbl|barrel)/i,
    ]);

    const myr = extractPrice(get(myrHtml), [
      /1\s*USD\s*=\s*([\d.]+)\s*MYR/i,
      /USD\/MYR[^\d]*([\d.]+)/i,
      /([3-5]\.\d{3,4})\s*MYR/i,
      /([3-5]\.\d{2,4})/,
    ]);

    const dxyRaw = extractPrice(get(dxyHtml), [
      /"regularMarketPrice":\{"raw":([\d.]+)/i,
      /data-testid="qsp-price"[^>]*>([\d.]+)/i,
      /((?:9[0-9]|1[01][0-9]|8[5-9])\.\d{1,3})(?!\d)/,
    ]);
    const dxy = dxyRaw !== null && dxyRaw >= 85 && dxyRaw <= 130 ? dxyRaw : null;

    const brentFinal = inRange(brent, 40, 200)   ?? 90.38;
    const goldFinal  = inRange(gold,  2000, 8000) ?? 4833.6;
    const wtiFinal   = inRange(wti,   38, 195)    ?? 87.50;
    const myrFinal   = inRange(myr,   3.0, 6.0)   ?? 3.9525;
    const dxyFinal   = dxy ?? 98.23;

    const goldGramUSD = parseFloat((goldFinal / 31.1035).toFixed(4));
    const crisisDay   = Math.max(1, Math.floor((Date.now() - new Date("2026-02-28T00:00:00Z").getTime()) / 86400000) + 1);
    const asOf        = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Dubai" });

    res.json({
      ok: true,
      brentUSD:    brentFinal,
      wtiUSD:      wtiFinal,
      goldOzUSD:   goldFinal,
      goldGramUSD,
      usdMyr:      myrFinal,
      usdAed:      3.6725,
      dxy:         dxyFinal,
      crisisDay,
      asOf,
      fetchedAt:   Date.now(),
      sources:     "TradingEconomics · Yahoo Finance · FreeCurrencyRates",
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
