// ═══════════════════════════════════════════════════════════════
// CRISISMARKET.LIVE — WORLD CURRENCIES
// 60+ currencies with flags, names, symbols
// Rates fetched live from open.er-api.com (USD base, free tier)
// ═══════════════════════════════════════════════════════════════

export interface Currency {
  code: string;   // ISO 4217
  flag: string;   // emoji flag
  name: string;   // full name
  symbol: string; // display symbol
  region: string; // grouping
}

export const WORLD_CURRENCIES: Currency[] = [
  // ── Major / Most Used ──────────────────────────────────────────
  { code: "USD", flag: "🇺🇸", name: "US Dollar",             symbol: "$",    region: "Major" },
  { code: "EUR", flag: "🇪🇺", name: "Euro",                   symbol: "€",    region: "Major" },
  { code: "GBP", flag: "🇬🇧", name: "British Pound",          symbol: "£",    region: "Major" },
  { code: "JPY", flag: "🇯🇵", name: "Japanese Yen",           symbol: "¥",    region: "Major" },
  { code: "CHF", flag: "🇨🇭", name: "Swiss Franc",            symbol: "Fr",   region: "Major" },
  { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar",        symbol: "C$",   region: "Major" },
  { code: "AUD", flag: "🇦🇺", name: "Australian Dollar",      symbol: "A$",   region: "Major" },
  { code: "NZD", flag: "🇳🇿", name: "New Zealand Dollar",     symbol: "NZ$",  region: "Major" },
  { code: "CNY", flag: "🇨🇳", name: "Chinese Yuan",           symbol: "¥",    region: "Major" },
  { code: "HKD", flag: "🇭🇰", name: "Hong Kong Dollar",       symbol: "HK$",  region: "Major" },
  { code: "SGD", flag: "🇸🇬", name: "Singapore Dollar",       symbol: "S$",   region: "Major" },

  // ── Middle East & Gulf ─────────────────────────────────────────
  { code: "AED", flag: "🇦🇪", name: "UAE Dirham",             symbol: "AED",  region: "Middle East" },
  { code: "SAR", flag: "🇸🇦", name: "Saudi Riyal",            symbol: "SR",   region: "Middle East" },
  { code: "QAR", flag: "🇶🇦", name: "Qatari Riyal",           symbol: "QR",   region: "Middle East" },
  { code: "KWD", flag: "🇰🇼", name: "Kuwaiti Dinar",          symbol: "KD",   region: "Middle East" },
  { code: "BHD", flag: "🇧🇭", name: "Bahraini Dinar",         symbol: "BD",   region: "Middle East" },
  { code: "OMR", flag: "🇴🇲", name: "Omani Rial",             symbol: "OMR",  region: "Middle East" },
  { code: "JOD", flag: "🇯🇴", name: "Jordanian Dinar",        symbol: "JD",   region: "Middle East" },
  { code: "IQD", flag: "🇮🇶", name: "Iraqi Dinar",            symbol: "IQD",  region: "Middle East" },
  { code: "IRR", flag: "🇮🇷", name: "Iranian Rial",           symbol: "﷼",   region: "Middle East" },
  { code: "LBP", flag: "🇱🇧", name: "Lebanese Pound",         symbol: "LL",   region: "Middle East" },
  { code: "EGP", flag: "🇪🇬", name: "Egyptian Pound",         symbol: "E£",   region: "Middle East" },
  { code: "ILS", flag: "🇮🇱", name: "Israeli Shekel",         symbol: "₪",    region: "Middle East" },
  { code: "TRY", flag: "🇹🇷", name: "Turkish Lira",           symbol: "₺",    region: "Middle East" },

  // ── Asia Pacific ───────────────────────────────────────────────
  { code: "MYR", flag: "🇲🇾", name: "Malaysian Ringgit",      symbol: "RM",   region: "Asia" },
  { code: "IDR", flag: "🇮🇩", name: "Indonesian Rupiah",      symbol: "Rp",   region: "Asia" },
  { code: "THB", flag: "🇹🇭", name: "Thai Baht",              symbol: "฿",    region: "Asia" },
  { code: "PHP", flag: "🇵🇭", name: "Philippine Peso",        symbol: "₱",    region: "Asia" },
  { code: "VND", flag: "🇻🇳", name: "Vietnamese Dong",        symbol: "₫",    region: "Asia" },
  { code: "KRW", flag: "🇰🇷", name: "South Korean Won",       symbol: "₩",    region: "Asia" },
  { code: "TWD", flag: "🇹🇼", name: "Taiwan Dollar",          symbol: "NT$",  region: "Asia" },
  { code: "INR", flag: "🇮🇳", name: "Indian Rupee",           symbol: "₹",    region: "Asia" },
  { code: "PKR", flag: "🇵🇰", name: "Pakistani Rupee",        symbol: "₨",    region: "Asia" },
  { code: "BDT", flag: "🇧🇩", name: "Bangladeshi Taka",       symbol: "৳",    region: "Asia" },
  { code: "LKR", flag: "🇱🇰", name: "Sri Lankan Rupee",       symbol: "₨",    region: "Asia" },
  { code: "NPR", flag: "🇳🇵", name: "Nepalese Rupee",         symbol: "₨",    region: "Asia" },
  { code: "MMK", flag: "🇲🇲", name: "Myanmar Kyat",           symbol: "K",    region: "Asia" },
  { code: "KHR", flag: "🇰🇭", name: "Cambodian Riel",         symbol: "₭",    region: "Asia" },
  { code: "MNT", flag: "🇲🇳", name: "Mongolian Tögrög",       symbol: "₮",    region: "Asia" },

  // ── Europe ─────────────────────────────────────────────────────
  { code: "SEK", flag: "🇸🇪", name: "Swedish Krona",          symbol: "kr",   region: "Europe" },
  { code: "NOK", flag: "🇳🇴", name: "Norwegian Krone",        symbol: "kr",   region: "Europe" },
  { code: "DKK", flag: "🇩🇰", name: "Danish Krone",           symbol: "kr",   region: "Europe" },
  { code: "PLN", flag: "🇵🇱", name: "Polish Zloty",           symbol: "zł",   region: "Europe" },
  { code: "CZK", flag: "🇨🇿", name: "Czech Koruna",           symbol: "Kč",   region: "Europe" },
  { code: "HUF", flag: "🇭🇺", name: "Hungarian Forint",       symbol: "Ft",   region: "Europe" },
  { code: "RON", flag: "🇷🇴", name: "Romanian Leu",           symbol: "lei",  region: "Europe" },
  { code: "RUB", flag: "🇷🇺", name: "Russian Ruble",          symbol: "₽",    region: "Europe" },
  { code: "UAH", flag: "🇺🇦", name: "Ukrainian Hryvnia",      symbol: "₴",    region: "Europe" },

  // ── Americas ───────────────────────────────────────────────────
  { code: "MXN", flag: "🇲🇽", name: "Mexican Peso",           symbol: "Mex$", region: "Americas" },
  { code: "BRL", flag: "🇧🇷", name: "Brazilian Real",         symbol: "R$",   region: "Americas" },
  { code: "ARS", flag: "🇦🇷", name: "Argentine Peso",         symbol: "AR$",  region: "Americas" },
  { code: "COP", flag: "🇨🇴", name: "Colombian Peso",         symbol: "Col$", region: "Americas" },
  { code: "CLP", flag: "🇨🇱", name: "Chilean Peso",           symbol: "CL$",  region: "Americas" },
  { code: "PEN", flag: "🇵🇪", name: "Peruvian Sol",           symbol: "S/",   region: "Americas" },

  // ── Africa ─────────────────────────────────────────────────────
  { code: "ZAR", flag: "🇿🇦", name: "South African Rand",     symbol: "R",    region: "Africa" },
  { code: "NGN", flag: "🇳🇬", name: "Nigerian Naira",         symbol: "₦",    region: "Africa" },
  { code: "KES", flag: "🇰🇪", name: "Kenyan Shilling",        symbol: "KSh",  region: "Africa" },
  { code: "GHS", flag: "🇬🇭", name: "Ghanaian Cedi",          symbol: "₵",    region: "Africa" },
  { code: "MAD", flag: "🇲🇦", name: "Moroccan Dirham",        symbol: "DH",   region: "Africa" },

  // ── Commodities / Crypto ───────────────────────────────────────
  { code: "XAU", flag: "🥇", name: "Gold (troy oz)",          symbol: "XAU",  region: "Commodity" },
  { code: "XAG", flag: "🥈", name: "Silver (troy oz)",        symbol: "XAG",  region: "Commodity" },
];

// Fallback rates vs USD (updated by live API, these are recent approximations)
export const FALLBACK_RATES: Record<string, number> = {
  USD:1, EUR:0.924, GBP:0.787, JPY:154.2, CHF:0.903, CAD:1.384, AUD:1.559, NZD:1.718,
  CNY:7.243, HKD:7.784, SGD:1.349, AED:3.6725, SAR:3.75, QAR:3.64, KWD:0.307,
  BHD:0.376, OMR:0.384, JOD:0.709, IQD:1310, IRR:42000, LBP:89500, EGP:48.9,
  ILS:3.74, TRY:38.1, MYR:4.42, IDR:16300, THB:35.1, PHP:57.8, VND:25400,
  KRW:1375, TWD:32.4, INR:83.5, PKR:278, BDT:110, LKR:298, NPR:133, MMK:2098,
  KHR:4110, MNT:3450, SEK:10.9, NOK:10.7, DKK:6.89, PLN:4.02, CZK:23.4,
  HUF:368, RON:4.61, RUB:91.5, UAH:41.2, MXN:17.2, BRL:5.05, ARS:1040,
  COP:3900, CLP:950, PEN:3.72, ZAR:18.9, NGN:1580, KES:129, GHS:15.3,
  MAD:9.98, XAU:0.000501, XAG:0.0328,
};
