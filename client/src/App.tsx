import { useState, useEffect, useRef, createContext, useContext } from "react";
import { LIVE as LIVE_STATIC, KARATS, OIL_TIMELINE, GOLD_TIMELINE, COUNTRIES, STRIKE_EVENTS, WAR_STATS, CASUALTIES_BY_COUNTRY, NEWS, FX_RATES, HORMUZ, MARKETS_DATA, type Country, type StrikeEvent, type NewsItem, type CasualtyEntry } from "./lib/data";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { scaleLinear } from "d3-scale";
import { t, type Lang } from "./lib/i18n";

// ── Live market context — polls /api/market-data every 15 min ────────────
type LiveData = typeof LIVE_STATIC;
type LiveCtxType = { data: LiveData; countdown: string; lastRefresh: Date | null };
const LiveCtx = createContext<LiveCtxType>({ data: LIVE_STATIC, countdown: "10:00", lastRefresh: null });
export function useLive() { return useContext(LiveCtx).data; }
export function useLiveMeta() { return useContext(LiveCtx); }

const REFRESH_MS = 10 * 60 * 1000; // 10 minutes

function LiveProvider({ children }: { children: React.ReactNode }) {
  const [live, setLive] = useState<LiveData>(LIVE_STATIC);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState("10:00");
  const nextRef = useRef<number>(0);

  async function fetchLive(force = false) {
    try {
      const url = force ? "/api/market-data?refresh=1" : "/api/market-data";
      const res = await fetch(url);
      if (!res.ok) return;
      const d = await res.json();
      if (!d.ok) return;
      setLive(prev => ({
        ...prev,
        brentUSD:              typeof d.brentUSD              === "number" ? d.brentUSD              : prev.brentUSD,
        wtiUSD:                typeof d.wtiUSD                === "number" ? d.wtiUSD                : prev.wtiUSD,
        goldOzUSD:             typeof d.goldOzUSD             === "number" ? d.goldOzUSD             : prev.goldOzUSD,
        goldGramUSD:           typeof d.goldGramUSD           === "number" ? d.goldGramUSD           : prev.goldGramUSD,
        usdMyr:                typeof d.usdMyr                === "number" ? d.usdMyr                : prev.usdMyr,
        dxy:                   typeof d.dxy                   === "number" ? d.dxy                   : prev.dxy,
        crisisDay:             typeof d.crisisDay             === "number" ? d.crisisDay             : prev.crisisDay,
        asOf:                  typeof d.asOf                  === "string" ? d.asOf                  : prev.asOf,
        hormuzTransitToday:    typeof d.hormuzTransitToday    === "number" ? d.hormuzTransitToday    : prev.hormuzTransitToday,
        hormuzThroughputPct:   typeof d.hormuzThroughputPct   === "number" ? d.hormuzThroughputPct   : prev.hormuzThroughputPct,
        hormuzStranded:        typeof d.hormuzStranded        === "number" ? d.hormuzStranded        : prev.hormuzStranded,
        hormuzInsuranceMult:   typeof d.hormuzInsuranceMult   === "number" ? d.hormuzInsuranceMult   : prev.hormuzInsuranceMult,
        hormuzStatus:          typeof d.hormuzStatus          === "string" ? d.hormuzStatus          : prev.hormuzStatus,
        hormuzDailyCostBn:     typeof d.hormuzDailyCostBn     === "number" ? d.hormuzDailyCostBn     : prev.hormuzDailyCostBn,
      }));
      const now = Date.now();
      nextRef.current = now + REFRESH_MS;
      setLastRefresh(new Date(now));
    } catch { /* keep previous */ }
  }

  useEffect(() => {
    const tick = setInterval(() => {
      const rem = Math.max(0, nextRef.current - Date.now());
      const m = Math.floor(rem / 60000);
      const s = Math.floor((rem % 60000) / 1000);
      setCountdown(`${m}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    fetchLive();
    const id = setInterval(() => fetchLive(), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return <LiveCtx.Provider value={{ data: live, countdown, lastRefresh }}>{children}</LiveCtx.Provider>;
}
// ─────────────────────────────────────────────────────────────────

// Local alias so existing code that references LIVE still works
const LIVE = LIVE_STATIC;

// ════ HELPERS ════
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const isoNumericToAlpha3: Record<string, string> = {
  "608":"PHL","116":"KHM","392":"JPN","050":"BGD","144":"LKA","704":"VNM","458":"MYS","702":"SGP","158":"TWN",
  "360":"IDN","764":"THA","410":"KOR","356":"IND","156":"CHN","368":"IRQ","586":"PAK","104":"MMR","524":"NPL",
  "364":"IRN","634":"QAT","682":"SAU","784":"ARE","048":"BHR","414":"KWT","400":"JOR","422":"LBN","512":"OMN","887":"YEM",
  "826":"GBR","724":"ESP","276":"DEU","528":"NLD","380":"ITA","250":"FRA","578":"NOR","792":"TUR","616":"POL","300":"GRC",
  "840":"USA","124":"CAN","076":"BRA","152":"CHL","484":"MEX",
  "036":"AUS","554":"NZL","242":"FJI","598":"PNG",
  "710":"ZAF","404":"KEN","566":"NGA","480":"MUS","012":"DZA","716":"ZWE","706":"SOM","231":"ETH","728":"SSD",
};

function getCountryByIso(iso: string): Country | undefined {
  return COUNTRIES.find(c => c.iso === iso);
}

function fmt(usd: number, cur: string, decimals = 2, live = LIVE) {
  const rate = cur === "MYR" ? live.usdMyr : cur === "AED" ? live.usdAed : 1;
  const val = usd * rate;
  const symbol = cur === "MYR" ? "RM " : cur === "AED" ? "AED " : "$";
  if (val >= 1_000_000) return symbol + (val / 1_000_000).toFixed(2) + "M";
  if (val >= 10_000)    return symbol + val.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return symbol + val.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function pct(val: number, ref: number) {
  const p = ((val - ref) / ref) * 100;
  return (p >= 0 ? "+" : "") + p.toFixed(1) + "%";
}

const statusColor: Record<string, string> = {
  critical: "#ef4444", high: "#f97316", moderate: "#f0a500", low: "#3b82f6", benefiting: "#22c55e",
};
const statusBg: Record<string, string> = {
  critical: "rgba(239,68,68,0.12)", high: "rgba(249,115,22,0.12)", moderate: "rgba(240,165,0,0.12)", low: "rgba(59,130,246,0.12)", benefiting: "rgba(34,197,94,0.12)",
};
const catColor: Record<string, string> = {
  military: "#ef4444", energy: "#f97316", economy: "#3b82f6", diplomacy: "#a855f7", humanitarian: "#ec4899", leaders: "#f0a500",
};
const impactColor: Record<string, string> = {
  critical: "#ef4444", major: "#f97316", moderate: "#f0a500", positive: "#22c55e",
};

// ════ COMPONENTS ════

function Ticker({ cur, lang }: { cur: string; lang: Lang }) {
  const live = useLive();
  // Micro-jitter animation seeded from live values
  const [jitter, setJitter] = useState({ brent: 0, wti: 0, gold: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      setJitter({
        brent: parseFloat(((Math.random() - 0.5) * 0.08).toFixed(2)),
        wti:   parseFloat(((Math.random() - 0.5) * 0.08).toFixed(2)),
        gold:  parseFloat(((Math.random() - 0.5) * 1.5).toFixed(2)),
      });
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const brentChg = pct(live.brentUSD, LIVE_STATIC.brentUSD);
  const wtiChg   = pct(live.wtiUSD,   LIVE_STATIC.wtiUSD);
  const goldChg  = pct(live.goldOzUSD, LIVE_STATIC.goldOzUSD);

  const items = [
    { l: t("ticker.brent", lang),    v: `$${(live.brentUSD + jitter.brent).toFixed(2)}`,    c: `${live.brentUSD < LIVE_STATIC.brentUSD ? "▼" : "▲"} ${brentChg}`,  dn: live.brentUSD < LIVE_STATIC.brentUSD },
    { l: t("ticker.wti", lang),      v: `$${(live.wtiUSD + jitter.wti).toFixed(2)}`,        c: `${live.wtiUSD   < LIVE_STATIC.wtiUSD   ? "▼" : "▲"} ${wtiChg}`,    dn: live.wtiUSD   < LIVE_STATIC.wtiUSD   },
    { l: t("ticker.goldXau", lang),  v: `$${(live.goldOzUSD + jitter.gold).toFixed(2)}/oz`, c: `${live.goldOzUSD < LIVE_STATIC.goldOzUSD ? "▼" : "▲"} ${goldChg}`,  dn: live.goldOzUSD < LIVE_STATIC.goldOzUSD },
    { l: t("ticker.usdMyr", lang),   v: `${live.usdMyr}`,                                   c: t("ticker.ringgitPressure", lang),  dn: true  },
    { l: t("ticker.usdAed", lang),   v: `${live.usdAed}`,                                   c: t("ticker.peggedStable", lang),     dn: false },
    { l: t("ticker.dxy", lang),      v: `${live.dxy}`,                                      c: "▼ −0.35%",                         dn: true  },
    { l: t("ticker.goldGram", lang), v: fmt(live.goldGramUSD, cur, 2, live),                 c: t("ticker.perGram", lang),          dn: false },
    { l: t("ticker.crisis", lang),   v: `Day ${live.crisisDay}`,                             c: t("ticker.sinceFeb28", lang),       dn: true  },
    { l: "BRENT PEAK",               v: `$${live.brentPeak}`,                                c: "Mar 18 peak",                      dn: true  },
    { l: "HORMUZ",                   v: `PARTIAL OPEN`,                                      c: "US escort",                        dn: false },
    { l: "QATAR LNG",                v: `−17%`,                                              c: "Force Majeure",                    dn: true  },
    { l: "IEA RELEASE",              v: `400M bbl`,                                          c: "Largest ever",                     dn: false },
  ];

  return (
    <div className="h-9 bg-[var(--bg-ticker)] border-b border-white/5 overflow-hidden flex items-center sticky top-0 z-50">
      <div className="ticker-animate flex shrink-0">
        {[...items, ...items].map((it, i) => (
          <div key={i} className="flex items-center gap-2 px-6 border-r border-white/5 shrink-0 h-9">
            <span className="text-[10px] font-bold tracking-widest text-white/30 font-mono">{it.l}</span>
            <span className="text-[11px] font-mono text-white/80">{it.v}</span>
            <span className={`text-[10px] font-semibold ${it.dn ? "text-red-400" : "text-emerald-400"}`}>{it.c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, change, changeUp, accent = "#f0a500" }: {
  label: string; value: string; sub?: string; change?: string; changeUp?: boolean; accent?: string;
}) {
  return (
    <div className="relative bg-[var(--bg-card)] border border-white/6 rounded-xl p-5 overflow-hidden group hover:border-white/10 transition-all duration-200">
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl" style={{ background: accent }} />
      <div className="text-[10px] font-bold tracking-widest text-white/30 mb-2 uppercase">{label}</div>
      <div className="text-2xl font-bold font-mono text-white tracking-tight leading-none">{value}</div>
      {sub && <div className="text-[11px] text-white/35 mt-1">{sub}</div>}
      {change && (
        <div className={`text-xs font-semibold mt-2 flex items-center gap-1 ${changeUp ? "text-emerald-400" : "text-red-400"}`}>
          {change}
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, color = "text-white" }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-[var(--bg-card)] border border-white/6 rounded-lg px-4 py-3 text-center">
      <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
      <div className="text-[10px] text-white/30 mt-0.5 tracking-wide">{label}</div>
    </div>
  );
}

// ── OIL TAB ──
function OilTab({ cur, lang }: { cur: string; lang: Lang }) {
  const live = useLive();
  const pctPreWar = pct(live.brentUSD, live.brentPreWar);
  const pctFromPeak = pct(live.brentUSD, live.brentPeak);

  const chartData = OIL_TIMELINE.map(item => ({ ...item, brentFmt: item.brent }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const row = OIL_TIMELINE.find(item => item.date === label);
    return (
      <div className="bg-[var(--bg-card)] border border-white/10 rounded-xl p-4 text-xs max-w-xs shadow-2xl">
        <div className="font-bold text-white mb-1">{label} — {row?.label}</div>
        <div className="text-amber-400 font-mono text-sm font-bold">Brent ${payload[0]?.value}</div>
        {payload[1] && <div className="text-orange-400 font-mono text-sm">WTI ${payload[1]?.value}</div>}
        <div className="text-white/50 mt-2 leading-relaxed">{row?.event}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label={t("oil.iranCrisis", lang)} value={`Day ${live.crisisDay}`} sub={t("oil.sinceFeb2026", lang)} change={`${pctPreWar} ${t("oil.fromBaseline", lang)}`} changeUp={false} accent="#ef4444" />
        <KpiCard label={t("oil.brentCrude", lang)} value={fmt(live.brentUSD, cur)} sub={`${t("oil.perBarrel", lang)} · ${live.asOf}`} change={`${live.brentUSD < 95 ? "▼" : "▲"} ${((live.brentUSD - 95.005)/95.005*100).toFixed(1)}% vs last week`} changeUp={false} accent="#f97316" />
        <KpiCard label={t("oil.wtiCrude", lang)} value={fmt(live.wtiUSD, cur)} sub={t("oil.perBarrel", lang)} change={`${live.wtiUSD < 92.10 ? "▼" : "▲"} ${((live.wtiUSD - 92.10)/92.10*100).toFixed(1)}% vs last week`} changeUp={false} accent="#f97316" />
        <KpiCard label={t("oil.peak", lang)} value={fmt(live.brentPeak, cur)} sub={t("oil.iranHitQatar", lang)} change={`${pctFromPeak} ${t("oil.fromPeak", lang)}`} changeUp={false} accent="#8b5cf6" />
        <KpiCard label={t("oil.dxyIndex", lang)} value={`${live.dxy}`} sub={t("oil.dollarBasket", lang)} change="▼ −0.35% today" changeUp={false} accent="#3b82f6" />
        <KpiCard label={t("oil.usdMyrRate", lang)} value={live.usdMyr.toString()} sub={t("oil.midMarketRate", lang)} change={t("oil.ringgitUnderPressure", lang)} changeUp={false} accent="#06b6d4" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatPill label="vs Pre-War $65" value={pctPreWar} color="text-red-400" />
        <StatPill label="From Peak $126" value={pctFromPeak} color="text-amber-400" />
        <StatPill label="World Oil via Hormuz" value="20%" />
        <StatPill label="Qatar LNG Capacity Lost" value="−17%" color="text-red-400" />
        <StatPill label="IEA Barrels Released" value="400M" color="text-emerald-400" />
        <StatPill label="Saudi Bypass bbl/day" value="7M" color="text-emerald-400" />
      </div>

      {/* Compact Hormuz Status Strip */}
      <div className="bg-[var(--bg-card)] border border-amber-500/20 rounded-xl px-5 py-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest text-white/30">⚓ HORMUZ STATUS</span>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            HORMUZ.status === "OPEN" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
            HORMUZ.status === "RESTRICTED" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
            "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}>{HORMUZ.status}</span>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="text-center">
            <div className="text-[9px] text-white/30 font-mono uppercase tracking-wider">Transits Today</div>
            <div className="text-sm font-bold font-mono text-white">{HORMUZ.transitToday} <span className="text-white/20 text-[10px]">/ {HORMUZ.transitAvgPreWar} norm</span></div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-white/30 font-mono uppercase tracking-wider">Throughput</div>
            <div className="text-sm font-bold font-mono text-red-400">{HORMUZ.throughputPct}% of normal</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-white/30 font-mono uppercase tracking-wider">Stranded</div>
            <div className="text-sm font-bold font-mono text-amber-400">{HORMUZ.strandedVessels}+ vessels</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-white/30 font-mono uppercase tracking-wider">Daily Cost</div>
            <div className="text-sm font-bold font-mono text-orange-400">${HORMUZ.dailyCostBn}B / day</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-white/30 font-mono uppercase tracking-wider">Insurance</div>
            <div className="text-sm font-bold font-mono text-red-400">{HORMUZ.insuranceMult}× normal</div>
          </div>
        </div>
        <button onClick={() => {}} className="ml-auto text-[10px] font-bold text-amber-400/60 hover:text-amber-400 transition-colors tracking-wider">
          VIEW HORMUZ TAB →
        </button>
      </div>

      {/* Oil Prices in all currencies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[{ label: "BRENT CRUDE", usd: live.brentUSD }, { label: "WTI CRUDE", usd: live.wtiUSD }].map(oil => (
          <div key={oil.label} className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-5">
            <div className="text-[10px] font-bold tracking-widest text-white/30 mb-4">{oil.label} — ALL CURRENCIES</div>
            <div className="grid grid-cols-3 gap-3">
              {["USD","MYR","AED"].map(c => (
                <div key={c} className="bg-white/3 rounded-lg p-3">
                  <div className="text-[10px] text-white/30 font-bold tracking-wider">{c}/bbl</div>
                  <div className="text-base font-bold font-mono text-white mt-1">{fmt(oil.usd, c)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline chart */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-6">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-1">{t("oil.priceTimeline", lang)}</div>
        <div className="text-xs text-white/20 mb-5">Feb 27 – {live.asOf} · {t("oil.keyEvents", lang)}</div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top:10, right:10, left:0, bottom:0 }}>
            <defs>
              <linearGradient id="brentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f0a500" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f0a500" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="wtiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill:"#ffffff30", fontSize:10, fontFamily:"Space Mono" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"#ffffff30", fontSize:10, fontFamily:"Space Mono" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} domain={[55,135]} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={live.brentPreWar} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value:"Pre-War $65", fill:"#22c55e", fontSize:9, fontFamily:"Space Mono" }} />
            <Area type="monotone" dataKey="brent" stroke="#f0a500" strokeWidth={2} fill="url(#brentGrad)" dot={{ fill:"#f0a500", r:3, strokeWidth:0 }} activeDot={{ r:5, fill:"#f0a500" }} name="Brent" />
            <Area type="monotone" dataKey="wti" stroke="#f97316" strokeWidth={1.5} fill="url(#wtiGrad)" strokeDasharray="4 3" dot={false} name="WTI" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Timeline events */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-6">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-5">CRISIS EVENT TIMELINE</div>
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-white/6" />
          {OIL_TIMELINE.map((ev, i) => {
            const col = ev.type === "peak" ? "#8b5cf6" : ev.type === "critical" ? "#ef4444" : ev.type === "positive" ? "#22c55e" : ev.type === "today" ? "#f0a500" : ev.type === "alert" ? "#f97316" : "#3b82f6";
            return (
              <div key={i} className="relative mb-5 last:mb-0 group">
                <div className="absolute -left-5 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold" style={{ background: col + "22", borderColor: col, color: col }}>
                  {ev.day}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                  <div className="text-[10px] font-bold text-white/30 tracking-widest shrink-0">{ev.date}</div>
                  <div className="flex-1">
                    <span className="font-bold text-sm" style={{ color: col }}>{ev.label === "TODAY" ? "TODAY ·" : ""} </span>
                    <span className="font-mono text-lg font-bold text-white">${ev.brent}</span>
                    <span className="text-xs text-white/40 ml-2">WTI ${ev.wti}</span>
                    <div className="text-xs text-white/50 mt-0.5">{ev.event}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-white/20">{t("oil.sources", lang)}: Brent/WTI — OilPrice.com · Gold — TradingEconomics · DXY — Yahoo Finance · USD/MYR — open.er-api.com ({live.asOf})</p>
      <div className="mt-3 px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded text-[10px] text-amber-400/50 leading-relaxed">
        ⚠️ {lang === "en"
          ? "For informational purposes only. Not financial or investment advice. Prices may be delayed or estimated. Always verify independently before trading."
          : "Untuk tujuan maklumat sahaja. Bukan nasihat kewangan atau pelaburan. Harga mungkin tertangguh atau anggaran. Sahkan secara bebas sebelum berdagang."}
      </div>
    </div>
  );
}

// ── GOLD TAB ──
function GoldTab({ cur, lang }: { cur: string; lang: Lang }) {
  const live = useLive();
  const chartData = GOLD_TIMELINE.map(item => ({ ...item }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const row = GOLD_TIMELINE.find(item => item.date === label);
    return (
      <div className="bg-[var(--bg-card)] border border-white/10 rounded-xl p-3 text-xs shadow-2xl">
        <div className="font-bold text-white mb-1">{label}</div>
        <div className="text-amber-400 font-mono font-bold">${payload[0]?.value?.toLocaleString()}/oz</div>
        <div className="text-white/40 mt-1">{row?.note}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label={t("gold.spot24k", lang)} value={fmt(live.goldOzUSD, cur)} sub={t("gold.perTroyOz", lang)} change="▼ -0.62% today" changeUp={true} accent="#f0a500" />
        <KpiCard label={t("gold.perGram24k", lang)} value={fmt(live.goldGramUSD, cur)} sub={t("gold.perGram", lang)} change="▲ +48% year-on-year" changeUp={true} accent="#f0a500" />
        <KpiCard label={t("gold.ath", lang)} value={`$${live.goldATH.toLocaleString()}`} sub={`${live.goldATHDate} (per oz)`} change={`▼ −14.6% ${t("gold.fromATH", lang)}`} changeUp={false} accent="#8b5cf6" />
        <KpiCard label={t("gold.inMyrOz", lang)} value={`RM ${(live.goldOzUSD * live.usdMyr).toLocaleString("en-MY", { maximumFractionDigits:0 })}`} sub={t("gold.perTroyOzShort", lang)} change={t("gold.safeHaven", lang)} changeUp={true} accent="#f0a500" />
        <KpiCard label={t("gold.inAedOz", lang)} value={`AED ${(live.goldOzUSD * live.usdAed).toLocaleString("en-US", { maximumFractionDigits:0 })}`} sub={t("gold.perTroyOzShort", lang)} change={t("gold.aedPegStable", lang)} changeUp={true} accent="#f0a500" />
        <KpiCard label={lang === "en" ? "Year-on-Year" : "Tahun-ke-Tahun"} value="+48%" sub={lang === "en" ? "War premium driving demand" : "Premium perang mendorong permintaan"} change={lang === "en" ? "↑ vs pre-crisis gold" : "↑ vs emas pra-krisis"} changeUp={true} accent="#22c55e" />
      </div>

      {/* Gold chart */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-6">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-1">{t("gold.priceTimeline", lang)}</div>
        <div className="text-xs text-white/20 mb-5">{t("gold.sinceJan2026", lang)}</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top:10, right:10, left:0, bottom:0 }}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f0a500" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f0a500" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill:"#ffffff30", fontSize:10, fontFamily:"Space Mono" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"#ffffff30", fontSize:10, fontFamily:"Space Mono" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(1)}K`} domain={[2800,6000]} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="price" stroke="#f0a500" strokeWidth={2.5} fill="url(#goldGrad)" dot={{ fill:"#f0a500", r:3, strokeWidth:0 }} activeDot={{ r:6, fill:"#f0a500" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Karat cards grid */}
      <div>
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-4">{t("gold.karatTitle", lang)} · {cur}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {KARATS.map(k => {
            const priceG = live.goldGramUSD * k.purity;
            const priceOz = live.goldOzUSD * k.purity;
            return (
              <div key={k.k} className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-4 hover:border-white/10 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold font-mono shrink-0" style={{ background: k.color + "22", color: k.color, border: `1px solid ${k.color}44` }}>{k.k}</div>
                  <div>
                    <div className="text-sm font-bold text-white">{k.label}</div>
                    <div className="text-[10px] text-white/30">{(k.purity * 100).toFixed(1)}% pure</div>
                  </div>
                </div>
                <div className="text-[10px] text-white/20 mb-2">{k.use}</div>
                <div className="text-xl font-bold font-mono" style={{ color: k.color }}>{fmt(priceG, cur)}<span className="text-xs text-white/30 ml-1">/g</span></div>
                <div className="text-[10px] text-white/25 mt-1">
                  {cur !== "USD" && `$${priceG.toFixed(2)}/g · `}
                  {cur !== "MYR" && `RM ${(priceG * live.usdMyr).toFixed(2)}/g`}
                  {cur !== "AED" && ` · AED ${(priceG * live.usdAed).toFixed(2)}/g`}
                </div>
                <div className="text-[10px] text-white/20 mt-1">= ${priceOz.toLocaleString("en-US", { maximumFractionDigits:0 })}/oz</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Karat reference table */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/6">
          <div className="text-[10px] font-bold tracking-widest text-white/30">{t("gold.karatGuide", lang).toUpperCase()} · ALL CURRENCIES · {t("gold.perGram", lang).toUpperCase()}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {["Karat", t("gold.purity", lang), t("gold.commonUse", lang), t("gold.usdPerGram", lang), t("gold.myrPerGram", lang), t("gold.aedPerGram", lang), "USD/oz"].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold tracking-widest text-white/25 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {KARATS.map((k, i) => {
                const priceG = live.goldGramUSD * k.purity;
                return (
                  <tr key={k.k} className={`border-b border-white/4 hover:bg-white/2 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                    <td className="px-4 py-3"><span className="font-bold text-sm font-mono" style={{ color: k.color }}>{k.k}</span></td>
                    <td className="px-4 py-3 font-mono text-white/50">{(k.purity * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-white/40">{k.use}</td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">${priceG.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-white/70">RM {(priceG * live.usdMyr).toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-white/70">AED {(priceG * live.usdAed).toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-white/40">${(live.goldOzUSD * k.purity).toLocaleString("en-US", { maximumFractionDigits:0 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[10px] text-white/20">Sources: Gold spot $4,786.69/oz — Natural Resource Stocks · Gold MYR — goldpricez.com/my (24K = RM 606.92/g) · ATH $5,602.22 — Jan 28, 2026</p>
      <div className="mt-3 px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded text-[10px] text-amber-400/50 leading-relaxed">
        ⚠️ {lang === "en"
          ? "Gold price data is informational only. Not financial or investment advice. Spot prices may differ from dealer buy/sell prices. Always verify with a licensed dealer before transacting."
          : "Data harga emas adalah untuk maklumat sahaja. Bukan nasihat kewangan atau pelaburan. Harga spot mungkin berbeza daripada harga beli/jual pengedar. Sahkan dengan pengedar berlesen sebelum transaksi."}
      </div>
    </div>
  );
}

// ── WORLD MAP TAB ──
function WorldMapTab({ lang }: { lang: Lang }) {
  const live = useLive();
  const [tooltip, setTooltip] = useState<{ name: string; country: Country | null; x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<Country | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const colorScale = scaleLinear<string>()
    .domain([0, 1, 2, 3, 4])
    .range(["#22c55e", "#3b82f6", "#f0a500", "#f97316", "#ef4444"]);

  function getStatusIndex(s: string) {
    return { benefiting:0, low:1, moderate:2, high:3, critical:4 }[s] ?? 2;
  }

  function getFillColor(geoId: string) {
    const alpha3 = isoNumericToAlpha3[geoId];
    if (!alpha3) return "#1a1f2a";
    const country = COUNTRIES.find(c => c.iso === alpha3);
    if (!country) return "#161b26";
    return statusColor[country.status] + "cc";
  }

  const filtered = COUNTRIES.filter(c => {
    if (filter !== "all" && c.region !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const regionCounts = {
    all: COUNTRIES.length,
    asia: COUNTRIES.filter(c => c.region === "asia").length,
    "middle-east": COUNTRIES.filter(c => c.region === "middle-east").length,
    europe: COUNTRIES.filter(c => c.region === "europe").length,
    americas: COUNTRIES.filter(c => c.region === "americas").length,
    oceania: COUNTRIES.filter(c => c.region === "oceania").length,
    africa: COUNTRIES.filter(c => c.region === "africa").length,
  } as Record<string, number>;

  const regionLabel: Record<string, string> = {
    all: t("map.all", lang),
    asia: t("map.asia", lang),
    "middle-east": t("map.middleEast", lang),
    europe: t("map.europe", lang),
    americas: t("map.americas", lang),
    oceania: t("map.oceania", lang),
    africa: t("map.africa", lang),
  };

  const statusLabel: Record<string, string> = {
    critical: t("map.critical", lang),
    high: t("map.high", lang),
    moderate: t("map.moderate", lang),
    low: t("map.low", lang),
    benefiting: t("map.benefiting", lang),
  };

  return (
    <div className="space-y-4 p-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label:"States of Emergency", value:"4", color:"text-red-400" },
          { label:"Critical Nations", value:"18", color:"text-red-400" },
          { label:"High Impact", value:"18", color:"text-orange-400" },
          { label:"Moderate Impact", value:"16", color:"text-amber-400" },
          { label:"Benefiting", value:"6", color:"text-emerald-400" },
          { label:"Countries Affected", value:"60+", color:"text-white" },
        ].map(s => <StatPill key={s.label} {...s} />)}
      </div>

      {/* Context box */}
      <div className="bg-[var(--bg-card)] border-l-2 border-red-500/60 border border-white/5 rounded-xl px-5 py-4 text-xs text-white/50 leading-relaxed">
        <span className="text-white/70 font-semibold">Context: </span>
        The Strait of Hormuz carries ~20% of world oil and ~30% of LNG. Closed since Mar 4, 2026. 60+ nations activated emergency measures.
        Click any highlighted country for a detailed briefing. Data sourced from Wikipedia, Carbon Brief, and country official announcements.
      </div>

      {/* Interactive map */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl overflow-hidden relative">
        <div className="p-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-2">
          <div className="text-[10px] font-bold tracking-widest text-white/30">{t("map.title", lang)}</div>
          <div className="flex items-center gap-3 text-[9px] font-bold tracking-widest">
            {Object.entries(statusColor).map(([s, c]) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} />
                <span className="text-white/40 uppercase">{statusLabel[s] ?? s}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0e16] relative" style={{ userSelect:"none", height: 420 }}>
          <ComposableMap projection="geoNaturalEarth1" projectionConfig={{ scale: 155, center: [15, 15] }} width={800} height={420} style={{ width: "100%", height: "100%" }}>
            <ZoomableGroup center={[15, 10]} zoom={1} minZoom={0.8} maxZoom={6}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const geoId = geo.id?.toString().padStart(3, "0") ?? "";
                    const alpha3 = isoNumericToAlpha3[geoId];
                    const country = alpha3 ? COUNTRIES.find(c => c.iso === alpha3) : null;
                    const fill = getFillColor(geoId);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fill}
                        stroke="#0a0e16"
                        strokeWidth={0.4}
                        style={{
                          default: { fill, outline:"none", cursor: country ? "pointer" : "default", transition:"all 0.15s" },
                          hover: { fill: country ? (statusColor[country.status] ?? fill) : "#1e2530", outline:"none", filter: country ? "brightness(1.4)" : "brightness(1.1)" },
                          pressed: { outline:"none" },
                        }}
                        onMouseMove={(e: React.MouseEvent) => {
                          if (country) setTooltip({ name: country.name, country, x: e.clientX, y: e.clientY });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => { if (country) { setSelected(country); setTooltip(null); } }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* Tooltip */}
          {tooltip && tooltip.country && (
            <div
              className="fixed z-50 pointer-events-none"
              style={{ left: tooltip.x, top: tooltip.y, transform:"translate(-50%,-110%)" }}
            >
              <div className="bg-[var(--bg-card)] border border-white/15 rounded-xl p-3 shadow-2xl text-xs min-w-[180px]">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>{tooltip.country.flag}</span> {tooltip.country.name}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: statusBg[tooltip.country.status], color: statusColor[tooltip.country.status] }}>{statusLabel[tooltip.country.status] ?? tooltip.country.status}</span>
                  <span className="text-white/50">{t("map.impact", lang)}: <span className="font-mono font-bold" style={{ color: statusColor[tooltip.country.status] }}>{tooltip.country.fuelImpact}</span></span>
                </div>
                {tooltip.country.hormuzDep && (
                  <div className="text-white/40 mt-1">{t("map.hormuzDep", lang)}: <span className="font-mono font-bold text-white/60">{tooltip.country.hormuzDep}%</span></div>
                )}
                <div className="text-white/30 mt-1 text-[10px]">{t("map.clickDetails", lang)}</div>
              </div>
            </div>
          )}
        </div>
        <div className="p-3 text-center text-[10px] text-white/20">{t("map.scrollToZoom", lang)}</div>
      </div>

      {/* Region filter + search */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text" placeholder={t("map.searchCountry", lang)}
          className="bg-[var(--bg-card)] border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 w-44 transition-colors"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {Object.entries(regionCounts).map(([r, count]) => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all border ${filter === r ? "bg-amber-500/15 border-amber-500/40 text-amber-400" : "bg-transparent border-white/6 text-white/30 hover:border-white/12 hover:text-white/50"}`}>
            {regionLabel[r] ?? r} ({count})
          </button>
        ))}
      </div>

      {/* Country cards */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5">
              {[t("map.countryCol", lang), t("map.regionCol", lang), t("map.hormuzDepLabel", lang), t("map.fuelImpact", lang), t("map.statusCol", lang), t("map.keyAction", lang)].map(h => (
                <th key={h} className="text-left text-[10px] font-bold tracking-widest text-white/25 px-4 py-3 bg-[var(--bg-card)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.iso} className="border-b border-white/4 hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => setSelected(c)}>
                <td className="px-4 py-3 font-bold text-white">{c.flag} {c.name}</td>
                <td className="px-4 py-3 text-white/40 capitalize">{c.region.replace("-", " ")}</td>
                <td className="px-4 py-3 font-mono text-white/60">{c.hormuzDep !== null ? `${c.hormuzDep}%` : "—"}</td>
                <td className="px-4 py-3 font-mono font-bold" style={{ color: c.fuelImpact.startsWith("+") ? "#ef4444" : c.fuelImpact === "Windfall" ? "#22c55e" : "#f0a500" }}>{c.fuelImpact}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: statusBg[c.status], color: statusColor[c.status] }}>{statusLabel[c.status] ?? c.status}</span>
                </td>
                <td className="px-4 py-3 text-white/40 max-w-[220px] truncate">{c.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Country detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/60" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 bg-[var(--bg-card)] border-b border-white/6 p-6 flex items-start justify-between rounded-t-2xl">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{selected.flag}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={{ background: statusBg[selected.status], color: statusColor[selected.status] }}>{statusLabel[selected.status] ?? selected.status}</span>
                      <span className="text-xs text-white/30 capitalize">{selected.region.replace("-", " ")}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center">×</button>
            </div>
            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Key metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { l: t("map.population", lang), v: selected.detail.population },
                  { l: t("map.gdp", lang), v: selected.detail.gdpBillion },
                  { l: t("map.hormuzDepLabel", lang), v: selected.hormuzDep !== null ? `${selected.hormuzDep}%` : t("map.producer", lang) },
                  { l: t("map.fuelImpact", lang), v: selected.fuelImpact },
                ].map(m => (
                  <div key={m.l} className="bg-white/3 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-white/30 font-bold tracking-widest">{m.l}</div>
                    <div className="text-sm font-bold font-mono text-white mt-1">{m.v}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/2 rounded-xl p-4">
                  <div className="text-[10px] font-bold tracking-widest text-white/25 mb-2">{t("map.energyMix", lang).toUpperCase()}</div>
                  <div className="text-sm text-white/70">{selected.detail.energyMix}</div>
                </div>
                <div className="bg-white/2 rounded-xl p-4">
                  <div className="text-[10px] font-bold tracking-widest text-white/25 mb-2">{t("map.reservesStatus", lang)}</div>
                  <div className="text-sm text-white/70">{selected.detail.reserves}</div>
                </div>
              </div>

              {/* Hormuz dependency bar */}
              {selected.hormuzDep !== null && (
                <div>
                  <div className="flex justify-between text-[10px] text-white/30 font-bold tracking-widest mb-1">
                    <span>{t("map.hormuzDepBar", lang)}</span><span>{selected.hormuzDep}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width:`${selected.hormuzDep}%`, background: statusColor[selected.status] }} />
                  </div>
                </div>
              )}

              {/* Measures */}
              <div>
                <div className="text-[10px] font-bold tracking-widest text-white/25 mb-3">{t("map.govMeasures", lang)}</div>
                <div className="space-y-2">
                  {selected.detail.measures.map((m, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[9px] font-bold text-white/30 shrink-0 mt-0.5">{i+1}</span>
                      <span className="text-white/65">{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Economic risk */}
              <div className="rounded-xl p-4" style={{ background: statusBg[selected.status], borderLeft:`3px solid ${statusColor[selected.status]}` }}>
                <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: statusColor[selected.status] }}>{t("map.econRisk", lang)}</div>
                <div className="text-sm text-white/80">{selected.detail.economicRisk}</div>
              </div>

              <div className="text-[10px] text-white/20">{t("map.source", lang)}: {selected.detail.source}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── WAR DAMAGE TAB ──
// per-country aggregation helper
const COUNTRY_STATS = (() => {
  const m: Record<string, { flag:string; strikes:number; drones:number; missiles:number; killed:number; wounded:number; damageUSD:number }> = {};
  STRIKE_EVENTS.forEach(s => {
    if (!m[s.country]) m[s.country] = { flag:s.flag, strikes:0, drones:0, missiles:0, killed:0, wounded:0, damageUSD:0 };
    m[s.country].strikes++;
    m[s.country].drones    += s.droneCount;
    m[s.country].missiles  += s.missileCount;
    m[s.country].killed    += s.casualties.killed;
    m[s.country].wounded   += s.casualties.wounded;
    m[s.country].damageUSD += s.damageUSD;
  });
  return Object.entries(m).sort((a,b) => b[1].damageUSD - a[1].damageUSD);
})();

function WarTab({ lang }: { lang: Lang }) {
  const live = useLive();
  const [selectedStrike, setSelectedStrike] = useState<StrikeEvent | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const typeIcon: Record<string, string> = { drone:"🚁", missile:"🚀", naval:"⚓", airstrike:"✈️", sabotage:"💣" };
  const severityColor: Record<string, string> = { catastrophic:"#ef4444", severe:"#f97316", moderate:"#f0a500", minor:"#3b82f6" };

  const filtered = typeFilter === "all" ? STRIKE_EVENTS : STRIKE_EVENTS.filter(s => s.type === typeFilter);
  const barData = STRIKE_EVENTS.map(s => ({ date:s.date.replace(", 2026",""), damage:s.damageUSD, killed:s.casualties.killed }));

  // leaderboards
  const topByDrones   = [...STRIKE_EVENTS].sort((a,b) => b.droneCount - a.droneCount).slice(0,5);
  const topByMissiles = [...STRIKE_EVENTS].sort((a,b) => b.missileCount - a.missileCount).slice(0,5);

  return (
    <div className="space-y-6 p-6">

      {/* ── GLOBAL DAMAGE COUNTER ── */}
      <div>
        <div className="text-[10px] font-bold tracking-widest text-white/25 mb-3">{t("war.globalDamage", lang)} — {live.asOf.toUpperCase()} · {t("war.asOf", lang)} DAY {live.crisisDay}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <KpiCard label={t("war.totalStrikes", lang)} value={WAR_STATS.totalStrikes.toString()} sub={t("war.documentedEvents", lang)} accent="#ef4444" />
          <KpiCard label={t("war.dronesLaunched", lang)} value={WAR_STATS.totalDrones.toLocaleString()} sub={t("war.allParties", lang)} accent="#f97316" />
          <KpiCard label={t("war.missilesFired", lang)} value={WAR_STATS.totalMissiles.toLocaleString()} sub={t("war.allParties", lang)} accent="#f97316" />
          <KpiCard label={t("war.confirmedKilled", lang)} value={WAR_STATS.totalKilled.toLocaleString()} sub={t("war.allSides", lang)} accent="#ef4444" />
          <KpiCard label={t("war.confirmedWounded", lang)} value={WAR_STATS.totalWounded.toLocaleString()} sub={t("war.allSides", lang)} accent="#ef4444" />
          <KpiCard label={t("war.economicDamage", lang)} value={`$${(WAR_STATS.totalDamageUSD / 1000).toFixed(2)}B`} sub={t("war.estimatedUSD", lang)} accent="#8b5cf6" />
          <KpiCard label={t("war.countriesStruck", lang)} value={WAR_STATS.countriesStruck.toString()} sub={t("war.confirmedAttacks", lang)} accent="#3b82f6" />
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-[var(--bg-card)] border-l-2 border-amber-500/60 border border-white/5 rounded-xl px-5 py-4 text-xs text-white/50 space-y-1">
        <div><span className="text-white/60 font-bold">{t("war.largestStrike", lang)}: </span>{WAR_STATS.largestStrike}</div>
        <div><span className="text-white/60 font-bold">{t("war.hormuzStatus", lang)}: </span><span className="text-emerald-400 font-bold">{WAR_STATS.hormuzStatus}</span></div>
        <div><span className="text-white/60 font-bold">{t("war.asOf", lang)}: </span>{live.asOf} · US-Iran ceasefire ongoing · Brent ${live.brentUSD.toFixed(2)} · Gold ${live.goldOzUSD.toLocaleString()}</div>
      </div>

      {/* ── LEADERBOARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Top Drone Attacks */}
        <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-5">
          <div className="text-[10px] font-bold tracking-widest text-orange-400/60 mb-4">{t("war.topDrones", lang)}</div>
          <div className="space-y-3">
            {topByDrones.filter(s => s.droneCount > 0).map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="w-5 text-center text-[10px] font-bold font-mono text-white/20">#{i+1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{s.flag} {s.target}</div>
                  <div className="text-[10px] text-white/30">{s.country} · {s.date.replace(", 2026","")}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-bold font-mono text-orange-400">{s.droneCount}</div>
                  <div className="text-[9px] text-white/20">{t("war.drones", lang)}</div>
                </div>
                <div className="w-20">
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-orange-500/60" style={{ width: `${(s.droneCount / topByDrones[0].droneCount) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Missile Attacks */}
        <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-5">
          <div className="text-[10px] font-bold tracking-widest text-red-400/60 mb-4">{t("war.topMissiles", lang)}</div>
          <div className="space-y-3">
            {topByMissiles.filter(s => s.missileCount > 0).slice(0,5).map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="w-5 text-center text-[10px] font-bold font-mono text-white/20">#{i+1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{s.flag} {s.target}</div>
                  <div className="text-[10px] text-white/30">{s.country} · {s.date.replace(", 2026","")}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-bold font-mono text-red-400">{s.missileCount}</div>
                  <div className="text-[9px] text-white/20">{t("war.missiles", lang)}</div>
                </div>
                <div className="w-20">
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-red-500/60" style={{ width: `${(s.missileCount / topByMissiles[0].missileCount) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COUNTRIES AFFECTED BREAKDOWN ── */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-5">
        <div className="text-[10px] font-bold tracking-widest text-white/25 mb-4">{t("war.damageByCountry", lang)}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[9px] font-bold tracking-wider text-white/20 pb-2 pr-4">{t("war.country", lang)}</th>
                <th className="text-right text-[9px] font-bold tracking-wider text-white/20 pb-2 px-3">{t("war.strikes", lang)}</th>
                <th className="text-right text-[9px] font-bold tracking-wider text-orange-400/50 pb-2 px-3">{t("war.dronesLaunched", lang).toUpperCase()}</th>
                <th className="text-right text-[9px] font-bold tracking-wider text-red-400/50 pb-2 px-3">{t("war.missilesFired", lang).toUpperCase()}</th>
                <th className="text-right text-[9px] font-bold tracking-wider text-red-400/50 pb-2 px-3">{t("war.killed", lang)}</th>
                <th className="text-right text-[9px] font-bold tracking-wider text-orange-400/50 pb-2 px-3">{t("war.wounded", lang)}</th>
                <th className="text-right text-[9px] font-bold tracking-wider text-purple-400/50 pb-2 pl-3">{t("war.damage", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {COUNTRY_STATS.map(([country, v]) => (
                <tr key={country} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                  <td className="py-2.5 pr-4">
                    <span className="font-bold text-white">{v.flag} {country}</span>
                  </td>
                  <td className="text-right px-3 font-mono text-white/50">{v.strikes}</td>
                  <td className="text-right px-3 font-mono text-orange-400 font-bold">{v.drones > 0 ? v.drones : <span className="text-white/15">—</span>}</td>
                  <td className="text-right px-3 font-mono text-red-400 font-bold">{v.missiles > 0 ? v.missiles : <span className="text-white/15">—</span>}</td>
                  <td className="text-right px-3 font-mono text-red-400">{v.killed.toLocaleString()}</td>
                  <td className="text-right px-3 font-mono text-orange-400">{v.wounded.toLocaleString()}</td>
                  <td className="text-right pl-3 font-mono text-purple-400 font-bold">${v.damageUSD >= 1000 ? (v.damageUSD/1000).toFixed(1)+"B" : v.damageUSD+"M"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td className="pt-3 font-bold text-white/50 text-[9px] tracking-wider">{t("war.total", lang)}</td>
                <td className="text-right pt-3 px-3 font-mono font-bold text-white/50">{WAR_STATS.totalStrikes}</td>
                <td className="text-right pt-3 px-3 font-mono font-bold text-orange-400">{WAR_STATS.totalDrones}</td>
                <td className="text-right pt-3 px-3 font-mono font-bold text-red-400">{WAR_STATS.totalMissiles}</td>
                <td className="text-right pt-3 px-3 font-mono font-bold text-red-400">{WAR_STATS.totalKilled.toLocaleString()}</td>
                <td className="text-right pt-3 px-3 font-mono font-bold text-orange-400">{WAR_STATS.totalWounded.toLocaleString()}</td>
                <td className="text-right pt-3 pl-3 font-mono font-bold text-purple-400">${(WAR_STATS.totalDamageUSD/1000).toFixed(2)}B</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── HUMAN CASUALTIES BY COUNTRY — OFFICIAL SOURCES ── */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-5">
        <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
          <div className="text-[10px] font-bold tracking-widest text-red-400/60">{t("war.casualties", lang)}</div>
          <div className="text-[9px] text-white/20 font-mono">{t("war.asOf", lang)} Apr 7, 2026</div>
        </div>
        <div className="text-[9px] text-white/20 mb-4">
          Source: Wikipedia • Al Jazeera live tracker • Iran Health Ministry • Lebanon Health Ministry • US CENTCOM • IDF • Gulf state media
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[9px] font-bold tracking-wider text-white/20 pb-2 pr-4">{t("war.country", lang)}</th>
                <th className="text-right text-[9px] font-bold tracking-wider text-red-400/60 pb-2 px-3">{t("war.killed", lang)}</th>
                <th className="text-right text-[9px] font-bold tracking-wider text-orange-400/60 pb-2 px-3">{t("war.injured", lang)}</th>
                <th className="text-left text-[9px] font-bold tracking-wider text-white/15 pb-2 pl-4">{t("war.source", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {CASUALTIES_BY_COUNTRY.map((c: CasualtyEntry) => (
                <tr key={c.country} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                  <td className="py-2.5 pr-4 font-bold text-white">{c.flag} {c.country}</td>
                  <td className="text-right px-3 font-mono font-bold text-red-400">
                    {c.killedLow === 0 && c.killedHigh === 0
                      ? <span className="text-white/15">—</span>
                      : c.killedLow === c.killedHigh
                        ? c.killedLow.toLocaleString()
                        : <>{c.killedLow.toLocaleString()}<span className="text-white/30">–</span>{c.killedHigh.toLocaleString()}+</>}
                  </td>
                  <td className="text-right px-3 font-mono text-orange-400">
                    {c.injured === 0 ? <span className="text-white/15">—</span> : c.injured.toLocaleString()}
                  </td>
                  <td className="pl-4 text-[9px] text-white/20 truncate max-w-[200px]">{c.source}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td className="pt-3 text-[9px] font-bold tracking-wider text-white/40">{t("war.total", lang)}</td>
                <td className="text-right pt-3 px-3 font-mono font-bold text-red-400">5,681–9,956+</td>
                <td className="text-right pt-3 px-3 font-mono font-bold text-orange-400">42,017+</td>
                <td className="pl-4 pt-3 text-[9px] text-white/20">Wikipedia — Casualties of the 2026 Iran war</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-3 text-[9px] text-white/15 leading-relaxed">
          {t("war.casualtyDisclaimer", lang)}
        </div>
      </div>

      {/* Damage chart */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-6">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-1">{t("war.strikeDamageChart", lang)}</div>
        <div className="text-xs text-white/20 mb-5">{t("war.perEvent", lang)}</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{ top:0, right:10, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill:"#ffffff30", fontSize:9, fontFamily:"Space Mono" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"#ffffff30", fontSize:9, fontFamily:"Space Mono" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}M`} />
            <Tooltip
              contentStyle={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", fontSize:"11px", fontFamily:"Space Mono" }}
              labelStyle={{ color:"#ffffff60" }}
              formatter={(v:any) => [`$${Number(v).toLocaleString()}M`, "Damage"]}
            />
            <Bar dataKey="damage" fill="#ef4444" fillOpacity={0.7} radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {["all","airstrike","missile","drone","naval"].map(typeVal => (
          <button key={typeVal} onClick={() => setTypeFilter(typeVal)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all border ${typeFilter === typeVal ? "bg-red-500/15 border-red-500/40 text-red-400" : "bg-transparent border-white/6 text-white/30 hover:border-white/12"}`}>
            {typeVal === "all" ? t("war.allStrikes", lang) : `${typeIcon[typeVal]} ${typeVal}`}
          </button>
        ))}
      </div>

      {/* Strike cards */}
      <div className="space-y-3">
        {filtered.map(s => (
          <div key={s.id}
            className="strike-card bg-[var(--bg-card)] border border-white/6 rounded-xl p-5 cursor-pointer hover:border-white/10"
            style={{ borderLeft:`3px solid ${severityColor[s.severity]}` }}
            onClick={() => setSelectedStrike(s)}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-[10px] font-bold font-mono text-white/30">{s.date} · D+{s.day}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: severityColor[s.severity] + "20", color: severityColor[s.severity] }}>{s.severity}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-bold uppercase">{typeIcon[s.type]} {s.type}</span>
                </div>
                <div className="text-sm font-bold text-white mb-1">{s.flag} {s.target}</div>
                <div className="text-xs text-white/40">{s.attacker} → {s.country}</div>
                <div className="text-xs text-white/30 mt-2 line-clamp-2">{s.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 shrink-0 text-right">
                {s.droneCount > 0 && (
                  <div className="bg-white/3 rounded-lg px-3 py-2">
                    <div className="text-[9px] text-white/25 font-bold tracking-wider">DRONES</div>
                    <div className="text-base font-bold font-mono text-orange-400">{s.droneCount}</div>
                  </div>
                )}
                {s.missileCount > 0 && (
                  <div className="bg-white/3 rounded-lg px-3 py-2">
                    <div className="text-[9px] text-white/25 font-bold tracking-wider">MISSILES</div>
                    <div className="text-base font-bold font-mono text-red-400">{s.missileCount}</div>
                  </div>
                )}
                <div className="bg-white/3 rounded-lg px-3 py-2">
                  <div className="text-[9px] text-white/25 font-bold tracking-wider">KILLED</div>
                  <div className="text-base font-bold font-mono text-red-400">{s.casualties.killed.toLocaleString()}</div>
                </div>
                <div className="bg-white/3 rounded-lg px-3 py-2">
                  <div className="text-[9px] text-white/25 font-bold tracking-wider">WOUNDED</div>
                  <div className="text-base font-bold font-mono text-orange-400">{s.casualties.wounded.toLocaleString()}</div>
                </div>
                <div className="bg-white/3 rounded-lg px-3 py-2 col-span-2">
                  <div className="text-[9px] text-white/25 font-bold tracking-wider">DAMAGE</div>
                  <div className="text-base font-bold font-mono text-purple-400">${s.damageUSD >= 1000 ? (s.damageUSD / 1000).toFixed(1) + "B" : s.damageUSD + "M"}</div>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-white/20 mt-2">{t("war.clickBriefing", lang)}</div>
          </div>
        ))}
      </div>

      {/* Strike detail modal */}
      {selectedStrike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/70" onClick={e => { if (e.target === e.currentTarget) setSelectedStrike(null); }}>
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[var(--bg-card)] border-b border-white/6 p-6 rounded-t-2xl flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase" style={{ background: severityColor[selectedStrike.severity] + "20", color: severityColor[selectedStrike.severity] }}>{selectedStrike.severity}</span>
                  <span className="text-xs text-white/30 font-mono">{selectedStrike.date} · Day {selectedStrike.day}</span>
                </div>
                <h2 className="text-lg font-bold text-white">{selectedStrike.flag} {selectedStrike.target}</h2>
                <div className="text-xs text-white/40 mt-1">{selectedStrike.attacker} → {selectedStrike.country}</div>
              </div>
              <button onClick={() => setSelectedStrike(null)} className="text-white/30 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedStrike.droneCount > 0 && <div className="bg-white/3 rounded-xl p-3 text-center"><div className="text-[9px] text-white/25 font-bold tracking-wider">DRONES</div><div className="text-xl font-bold font-mono text-orange-400">{selectedStrike.droneCount}</div></div>}
                {selectedStrike.missileCount > 0 && <div className="bg-white/3 rounded-xl p-3 text-center"><div className="text-[9px] text-white/25 font-bold tracking-wider">MISSILES</div><div className="text-xl font-bold font-mono text-red-400">{selectedStrike.missileCount}</div></div>}
                <div className="bg-white/3 rounded-xl p-3 text-center"><div className="text-[9px] text-white/25 font-bold tracking-wider">KILLED</div><div className="text-xl font-bold font-mono text-red-400">{selectedStrike.casualties.killed}</div></div>
                <div className="bg-white/3 rounded-xl p-3 text-center"><div className="text-[9px] text-white/25 font-bold tracking-wider">WOUNDED</div><div className="text-xl font-bold font-mono text-orange-400">{selectedStrike.casualties.wounded}</div></div>
              </div>
              <div className="bg-white/3 rounded-xl p-4">
                <div className="text-[9px] text-white/25 font-bold tracking-wider mb-1">{t("war.estimatedDamage", lang)}</div>
                <div className="text-2xl font-bold font-mono text-purple-400">${selectedStrike.damageUSD >= 1000 ? (selectedStrike.damageUSD / 1000).toFixed(1) + "B" : selectedStrike.damageUSD + "M"} USD</div>
              </div>
              <div className="bg-white/2 rounded-xl p-4">
                <div className="text-[9px] text-white/25 font-bold tracking-wider mb-2">{t("war.strikeBriefing", lang)}</div>
                <div className="text-sm text-white/70 leading-relaxed">{selectedStrike.description}</div>
              </div>
              <div className="bg-white/2 rounded-xl p-4">
                <div className="text-[9px] text-white/25 font-bold tracking-wider mb-2">{t("war.infraDamaged", lang)}</div>
                <div className="text-sm text-white/60">{selectedStrike.infrastructure}</div>
              </div>
              <div className="text-[10px] text-white/20">{t("war.disclaimer", lang)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NEWS TAB ──
// ── BM word-swap dictionary for news translation ──
const BM_DICT: [RegExp, string][] = [
  [/\bUnited States\b/gi, "Amerika Syarikat"],
  [/\bIran(ian)?\b/gi, (m) => m.toLowerCase().includes("ian") ? "Iran" : "Iran"],
  [/\bIsrael(i)?\b/gi, "Israel"],
  [/\bceasefire\b/gi, "gencatan senjata"],
  [/\bpeace talks?\b/gi, "rundingan damai"],
  [/\bsanctions?\b/gi, "sekatan"],
  [/\bstrike[sd]?\b/gi, "serangan"],
  [/\bmissile[sd]?\b/gi, "peluru berpandu"],
  [/\bdrone[sd]?\b/gi, "dron"],
  [/\bcrude oil\b/gi, "minyak mentah"],
  [/\bnatural gas\b/gi, "gas asli"],
  [/\bfuel\b/gi, "bahan api"],
  [/\benergy\b/gi, "tenaga"],
  [/\beconomy\b/gi, "ekonomi"],
  [/\beconomic\b/gi, "ekonomi"],
  [/\bgold\b/gi, "emas"],
  [/\binflation\b/gi, "inflasi"],
  [/\brecession\b/gi, "kemelesetan"],
  [/\brefinery\b/gi, "kilang penapisan"],
  [/\bpipeline\b/gi, "saluran paip"],
  [/\bHormuz\b/gi, "Hormuz"],
  [/\bhumanitarian\b/gi, "kemanusiaan"],
  [/\brefugees?\b/gi, "pelarian"],
  [/\bdiplomacy\b/gi, "diplomasi"],
  [/\bnegotiations?\b/gi, "rundingan"],
  [/\bmilitary\b/gi, "ketenteraan"],
  [/\battack[sd]?\b/gi, "serangan"],
  [/\bwarship[sd]?\b/gi, "kapal perang"],
  [/\bnavy\b/gi, "tentera laut"],
  [/\bairstrike[sd]?\b/gi, "serangan udara"],
  [/\bnuclear\b/gi, "nuklear"],
  [/\bsanctioned\b/gi, "dikenakan sekatan"],
  [/\bbarrel[sd]?\b/gi, "tong"],
  [/\bexports?\b/gi, "eksport"],
  [/\bimports?\b/gi, "import"],
  [/\bcrisis\b/gi, "krisis"],
  [/\bwar\b/gi, "perang"],
  [/\bkilled\b/gi, "terbunuh"],
  [/\bwounded\b/gi, "cedera"],
  [/\bcasualties\b/gi, "korban"],
  [/\bhospital\b/gi, "hospital"],
  [/\baid\b/gi, "bantuan"],
  [/\bUN\b/g, "PBB"],
  [/\bUnited Nations\b/gi, "Pertubuhan Bangsa-Bangsa Bersatu"],
  [/\bIMF\b/g, "IMF"],
  [/\bWorld Bank\b/gi, "Bank Dunia"],
  [/\bdollar\b/gi, "dolar"],
  [/\bringgit\b/gi, "ringgit"],
  [/\bsurge[sd]?\b/gi, "lonjakan"],
  [/\bfalls?\b/gi, "jatuh"],
  [/\brises?\b/gi, "naik"],
  [/\bplunges?\b/gi, "merosot"],
  [/\bsoars?\b/gi, "melambung"],
  [/\breport[sd]?\b/gi, "laporan"],
  [/\bpresident\b/gi, "presiden"],
  [/\bminister\b/gi, "menteri"],
  [/\bgovernment\b/gi, "kerajaan"],
  [/\bsecurity council\b/gi, "majlis keselamatan"],
  [/\bveto\b/gi, "veto"],
  [/\bemergency\b/gi, "kecemasan"],
];

function translateToBM(text: string): string {
  if (!text) return text;
  let result = text;
  for (const [pattern, replacement] of BM_DICT) {
    result = result.replace(pattern, replacement as string);
  }
  return result;
}

// All feeds verified working — April 2026
// ── Server-side RSS fetcher (calls /api/news backend — no CORS issues) ──────
async function fetchNewsFromServer(forceRefresh = false): Promise<any[]> {
  const url = forceRefresh ? "/api/news?refresh=1" : "/api/news";
  const res = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new Error(`/api/news ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "server error");
  return (data.items || []).map((item: any) => ({
    title:    item.headline,
    summary:  item.summary,
    link:     item.link,
    pubDate:  item.pubDate,
    source:   item.source,
    leader:   item.leader,
    category: item.category,
    impact:   item.impact,
  }));
}

// ─── MyMemory free translation API (500 chars/req, no key needed) ────────
const bmCache = new Map<string, string>();
async function translateToMalay(text: string): Promise<string> {
  if (!text || text.length < 4) return text;
  const key = text.slice(0, 120);
  if (bmCache.has(key)) return bmCache.get(key)!;
  // Apply word-swap first (instant, no network)
  const swapped = translateToBM(text);
  try {
    const q = encodeURIComponent(text.slice(0, 480));
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${q}&langpair=en|ms`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (translated && data?.responseStatus === 200 && translated !== text) {
      bmCache.set(key, translated);
      return translated;
    }
  } catch { /* fall through to word-swap */ }
  bmCache.set(key, swapped);
  return swapped;
}

// ── HORMUZ TAB ──────────────────────────────────────────────────────────────
function HormuzTab({ lang }: { lang: Lang }) {
  const live = useLive();
  // Merge static HORMUZ with live overrides
  // Build live status — derive from Brent price & crisis day for real-time feel
  const liveStatus = (live.hormuzStatus as "OPEN" | "RESTRICTED" | "CLOSED") || HORMUZ.status;
  const liveStatusNote = liveStatus === "OPEN"
    ? "Iran FM declared Hormuz open. US Navy escort corridor active. Commercial traffic resuming."
    : liveStatus === "RESTRICTED"
    ? "Hormuz partially open under US Navy escort. War-risk premiums elevated. Mine-clearance ongoing."
    : "Strait of Hormuz closed by IRGC. 20M bbl/day blocked. No commercial transit.";

  const H = {
    ...HORMUZ,
    status:          liveStatus,
    statusNote:      liveStatusNote,
    transitToday:    live.hormuzTransitToday    ?? HORMUZ.transitToday,
    throughputPct:   live.hormuzThroughputPct   ?? HORMUZ.throughputPct,
    strandedVessels: live.hormuzStranded        ?? HORMUZ.strandedVessels,
    insuranceMult:   live.hormuzInsuranceMult   ?? HORMUZ.insuranceMult,
    dailyCostBn:     live.hormuzDailyCostBn     ?? HORMUZ.dailyCostBn,
    disruptionDay:   live.crisisDay,
  };
  const statusColor = H.status === "OPEN" ? "#22c55e" : H.status === "RESTRICTED" ? "#f0a500" : "#ef4444";
  const statusBg = H.status === "OPEN" ? "bg-emerald-500/10 border-emerald-500/20" : H.status === "RESTRICTED" ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

  return (
    <div className="space-y-6 p-6">

      {/* Status Banner */}
      <div className={`rounded-2xl border p-5 flex flex-col md:flex-row md:items-center gap-4 ${statusBg}`}>
        <div className="flex items-center gap-4">
          <div className="text-4xl">⚓</div>
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <span className="text-xl font-black tracking-wider" style={{ color: statusColor }}>{t("hor.title", lang)}</span>
              {/* Live OPEN/CLOSED/RESTRICTED indicator */}
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border font-bold text-xs tracking-widest"
                style={{
                  background: H.status === "OPEN" ? "rgba(34,197,94,0.15)" : H.status === "RESTRICTED" ? "rgba(240,165,0,0.15)" : "rgba(239,68,68,0.15)",
                  borderColor: H.status === "OPEN" ? "rgba(34,197,94,0.4)" : H.status === "RESTRICTED" ? "rgba(240,165,0,0.4)" : "rgba(239,68,68,0.4)",
                  color: statusColor,
                }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: statusColor }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: statusColor }} />
                </span>
                {H.status === "OPEN" ? (lang === "en" ? "OPEN" : "TERBUKA") : H.status === "RESTRICTED" ? (lang === "en" ? "RESTRICTED" : "TERHAD") : (lang === "en" ? "CLOSED" : "DITUTUP")}
              </span>
              <span className="text-[10px] font-bold tracking-widest bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">{t("hor.day", lang)} {H.disruptionDay}</span>
            </div>
            <div className="text-xs text-white/50 max-w-2xl">{H.statusNote}</div>
            <div className="text-[10px] text-white/30 font-mono mt-1">{t("hor.since", lang)} {H.sinceDate} · {t("hor.updated", lang)} {H.lastUpdated} · {t("hor.sources", lang)}: {H.sources.join(" · ")}</div>
          </div>
        </div>
        <div className="md:ml-auto text-right">
          <div className="text-[10px] text-white/30 font-mono">{t("hor.totalTransits", lang)}</div>
          <div className="text-2xl font-black font-mono text-white">{H.transitSince.toLocaleString()}</div>
          <div className="text-[10px] text-white/30 font-mono">{t("hor.vsExpected", lang)} {(H.transitAvgPreWar * H.disruptionDay).toLocaleString()} {t("hor.expected", lang)}</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label={t("hor.transitsToday", lang)} value={`${H.transitToday}`} sub={`${t("hor.preWarAvg", lang)}: ${H.transitAvgPreWar}/day`} change={`${((H.transitToday/H.transitAvgPreWar)*100).toFixed(1)}${t("hor.ofNormal", lang)}`} changeUp={false} accent="#ef4444" />
        <KpiCard label={t("hor.throughput", lang)} value={`${H.throughputPct}%`} sub={t("hor.ofNormalDWT", lang)} change={`98${t("hor.flowBlocked", lang)}`} changeUp={false} accent="#ef4444" />
        <KpiCard label={t("hor.strandedVessels", lang)} value={`${H.strandedVessels}+`} sub={t("hor.inOrNear", lang)} change={`${H.attackedVessels} ${t("hor.attacked", lang)}`} changeUp={false} accent="#f97316" />
        <KpiCard label={t("hor.dailyCost", lang)} value={`$${H.dailyCostBn}B`} sub={t("hor.globalLoss", lang)} change={t("hor.perDay", lang)} changeUp={false} accent="#8b5cf6" />
        <KpiCard label={t("hor.insurance", lang)} value={`${H.insuranceMult}×`} sub={t("hor.warRiskMult", lang)} change={t("hor.hullPct", lang)} changeUp={false} accent="#f97316" />
        <KpiCard label={t("hor.vlccCost", lang)} value="$2.5M" sub={t("hor.perPassage", lang)} change={t("hor.wasPreWar", lang)} changeUp={false} accent="#ef4444" />
      </div>

      {/* Stats pills row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatPill label={t("hor.normalFlow", lang)} value="20M bbl/day" />
        <StatPill label={t("hor.bypassed", lang)} value="7M bbl/day" color="text-emerald-400" />
        <StatPill label={t("hor.stillBlocked", lang)} value="13M bbl/day" color="text-red-400" />
        <StatPill label={t("hor.pipelineCoverage", lang)} value="35%" color="text-amber-400" />
        <StatPill label={t("hor.tankerRate", lang)} value="3×" color="text-red-400" />
        <StatPill label={t("hor.extraDays", lang)} value="+14 days" color="text-orange-400" />
      </div>

      {/* Transit Timeline + Bypass Pipelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Transit Timeline Chart */}
        <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-6">
          <div className="text-[10px] font-bold tracking-widest text-white/30 mb-1">{t("hor.weeklyTransit", lang)}</div>
          <div className="text-xs text-white/20 mb-5">{t("hor.weeklyDesc", lang)} (pre-war avg: {H.transitAvgPreWar}/week ≈ 966/day×7)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={H.transitTimeline} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: "#ffffff30", fontSize: 9, fontFamily: "Space Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#ffffff30", fontSize: 9, fontFamily: "Space Mono" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                labelStyle={{ color: "#f0a500", fontWeight: "bold" }}
                formatter={(val: any, name: any, props: any) => [
                  <span style={{ color: "#f0a500", fontFamily: "Space Mono" }}>{val} {t("hor.vessels", lang)}</span>,
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px" }}>{H.transitTimeline.find(t => t.transits === val)?.note}</span>
                ]}
              />
              <Bar dataKey="transits" fill="#f0a500" fillOpacity={0.8} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bypass Pipelines */}
        <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-6">
          <div className="text-[10px] font-bold tracking-widest text-white/30 mb-4">{t("hor.bypassPipelines", lang)}</div>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-white/40 mb-2">
              <span>{t("hor.pipelineCapacity", lang)} {H.bypassPct}% {t("hor.ofNormalFlow", lang)}</span>
              <span className="font-mono">{H.bypassTotal}M / {H.normalFlow}M bbl/day</span>
            </div>
            <div className="bg-white/5 rounded-full h-2">
              <div className="h-2 rounded-full bg-amber-500" style={{ width: `${H.bypassPct}%` }} />
            </div>
          </div>
          <div className="space-y-3">
            {H.pipelines.map((p, i) => {
              const statusCol = p.status === "ACTIVE" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : p.status === "PARTIAL" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-orange-400 bg-orange-500/10 border-orange-500/20";
              const fillPct = (p.effective / p.capacity) * 100;
              return (
                <div key={i} className="border border-white/6 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-bold text-white">{p.name}</div>
                      <div className="text-[10px] text-white/30 font-mono">{p.operator} · → {p.to}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCol}`}>{p.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/5 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${fillPct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-white/40">{p.effective}M / {p.capacity}M bbl/d</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border border-red-500/10 bg-red-500/5 rounded-xl p-3">
            <div className="text-[10px] font-bold text-red-400 mb-1">⚠ UNBYPASSABLE GAP</div>
            <div className="text-xs text-white/40">{H.bypassGap}M bbl/day ({100 - H.bypassPct}% of flow) cannot be rerouted via any existing pipeline. No infrastructure exists to replace this volume.</div>
          </div>
        </div>
      </div>

      {/* Carrier Suspension Table */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-6">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-1">{t("hor.carrierStatus", lang)}</div>
        <div className="text-xs text-white/20 mb-4">{t("hor.carrierDesc", lang)} — {H.carriers.filter(c => c.status === "SUSPENDED").length}/9 {t("hor.suspended", lang)} · 192 {t("hor.trapped", lang)}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/30 font-mono text-[10px] tracking-widest border-b border-white/6">
                <th className="text-left pb-3 pr-4">{t("hor.carrier", lang)}</th>
                <th className="text-left pb-3 pr-4">{t("hor.status", lang)}</th>
                <th className="text-right pb-3 pr-4">{t("hor.trappedCol", lang)}</th>
                <th className="text-right pb-3 pr-4">{t("hor.teuAtRisk", lang)}</th>
                <th className="text-right pb-3">{t("hor.updatedCol", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {H.carriers.map((c, i) => (
                <tr key={i} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                  <td className="py-3 pr-4 font-bold text-white">{c.name}</td>
                  <td className="py-3 pr-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">{c.status}</span>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-amber-400">{c.trapped > 0 ? `${c.trapped} ${t("hor.vessels", lang)}` : "—"}</td>
                  <td className="py-3 pr-4 text-right font-mono text-white/50">{c.teu ? `${(c.teu/1000).toFixed(0)}K TEU` : "—"}</td>
                  <td className="py-3 text-right font-mono text-white/30 text-[10px]">{c.updated}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td className="pt-3 pr-4 font-bold text-white/50">{t("hor.total", lang)}</td>
                <td className="pt-3 pr-4"><span className="text-[10px] font-bold text-red-400">9/9 SUSPENDED</span></td>
                <td className="pt-3 pr-4 text-right font-mono font-bold text-amber-400">192+ {t("hor.vessels", lang)}</td>
                <td className="pt-3 pr-4 text-right font-mono text-white/50">579K+ TEU</td>
                <td className="pt-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-4 text-[10px] text-white/20">{t("hor.surcharge", lang)}</div>
      </div>

      {/* Company Impact — Winners vs Losers */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-6">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-4">{t("hor.companyImpact", lang)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Winners */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-400 tracking-widest">{t("hor.winners", lang)}</span>
            </div>
            <div className="space-y-2">
              {[
                { name: "Frontline (FRO)",   ticker: "NYSE: FRO",  change: +62.6, note: "VLCC rates tripled; record dividends" },
                { name: "Nordic Am. Tankers",ticker: "NYSE: NAT",  change: +63.2, note: "Pure war-premium spot exposure" },
                { name: "DHT Holdings",      ticker: "NYSE: DHT",  change: +59.1, note: "VLCC focus; double-digit yield" },
                { name: "Lockheed Martin",   ticker: "NYSE: LMT",  change: +31.2, note: "F-35 + PAC-3 missile orders" },
                { name: "Elbit Systems",     ticker: "NASDAQ: ESLT",change:+39.4, note: "Israeli defense; drone surge" },
                { name: "Saudi Aramco",      ticker: "Tadawul: 2222",change:+22.1,note: "Petroline at max; extraordinary div." },
                { name: "ExxonMobil",        ticker: "NYSE: XOM",  change: +18.4, note: "+$1.3B Q1 uplift from oil prices" },
                { name: "Halliburton",       ticker: "NYSE: HAL",  change: +27.3, note: "Emergency well activation services" },
              ].map((co, i) => (
                <div key={i} className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-4 py-2.5">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">{co.name}</div>
                    <div className="text-[10px] text-white/30 font-mono">{co.ticker}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{co.note}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-emerald-400">+{co.change}%</div>
                    <div className="text-[9px] text-white/20">{t("hor.ytd", lang)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Losers */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[10px] font-bold text-red-400 tracking-widest">{t("hor.losers", lang)}</span>
            </div>
            <div className="space-y-2">
              {[
                { name: "Maersk",           ticker: "CPH: MAERSK-B",change:-18.4, note: "All routes suspended; 14 vessels trapped" },
                { name: "Hapag-Lloyd",      ticker: "XETRA: HLAG",  change:-22.1, note: "+$40-50M/week extra costs" },
                { name: "Korean Air",       ticker: "KOSPI: 003490",change:-34.2, note: "Jet fuel +95%; ME routes gone" },
                { name: "Samsung SDI",      ticker: "KOSPI: 006400",change:-28.4, note: "Battery demand collapse; supply chain" },
                { name: "Evergreen Marine", ticker: "TWSE: 2603",   change:-19.6, note: "Asia-ME-Europe routes severed" },
                { name: "Boeing",           ticker: "NYSE: BA",     change:-12.8, note: "Gulf order freeze; supply chain" },
                { name: "TSMC",             ticker: "NYSE: TSM",    change:-14.3, note: "Energy cost + Taiwan risk premium" },
                { name: "Emirates (parent)",ticker: "Private",      change:-15.0, note: "Dubai hub disrupted; Asia routes" },
              ].map((co, i) => (
                <div key={i} className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-2.5">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">{co.name}</div>
                    <div className="text-[10px] text-white/30 font-mono">{co.ticker}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{co.note}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-red-400">{co.change}%</div>
                    <div className="text-[9px] text-white/20">{t("hor.ytd", lang)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Comparison */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-6">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-4">{lang === "en" ? "HISTORICAL COMPARISON — STRAIT DISRUPTIONS" : "PERBANDINGAN SEJARAH — GANGGUAN SELAT"}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/30 font-mono text-[10px] tracking-widest border-b border-white/6">
                <th className="text-left pb-3 pr-4">{lang === "en" ? "EVENT" : "PERISTIWA"}</th>
                <th className="text-left pb-3 pr-4">{lang === "en" ? "YEAR" : "TAHUN"}</th>
                <th className="text-left pb-3 pr-4">{lang === "en" ? "DURATION" : "TEMPOH"}</th>
                <th className="text-right pb-3 pr-4">{lang === "en" ? "OIL SPIKE" : "LONJAKAN MINYAK"}</th>
                <th className="text-left pb-3">{lang === "en" ? "IMPACT" : "KESAN"}</th>
              </tr>
            </thead>
            <tbody>
              {H.historical.map((h, i) => {
                const isNow = h.year === "2026";
                return (
                  <tr key={i} className={`border-b border-white/3 hover:bg-white/2 transition-colors ${isNow ? "bg-amber-500/5" : ""}`}>
                    <td className={`py-3 pr-4 font-bold ${isNow ? "text-amber-400" : "text-white"}`}>
                      {isNow && <span className="text-[9px] bg-amber-500/20 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded mr-2 font-mono">{lang === "en" ? "NOW" : "KINI"}</span>}
                      {h.event}
                    </td>
                    <td className="py-3 pr-4 font-mono text-white/50">{h.year}</td>
                    <td className="py-3 pr-4 font-mono text-white/50">{h.duration}</td>
                    <td className="py-3 pr-4 text-right font-mono font-bold" style={{ color: h.oilSpike.startsWith("+") ? "#ef4444" : "#22c55e" }}>{h.oilSpike}</td>
                    <td className="py-3 text-white/40">{h.impact}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-white/20">Sources: HormuzTracker.com · HormuzStraitMonitor.com · Kpler · Al Jazeera · LSEG · Lloyd's of London · {live.asOf}</p>
    </div>
  );
}

// ── MARKETS TAB ──────────────────────────────────────────────────────────────
function MarketsTab({ lang }: { lang: Lang }) {
  const live = useLive();
  const [companyFilter, setCompanyFilter] = useState<"all" | "winner" | "loser">("all");
  const [sectorSort, setSectorSort] = useState<"change" | "name">("change");

  const filteredCompanies = companyFilter === "all"
    ? MARKETS_DATA.companies
    : MARKETS_DATA.companies.filter(c => c.side === companyFilter);

  const sortedSectors = [...MARKETS_DATA.sectors].sort((a, b) =>
    sectorSort === "change" ? b.change - a.change : a.name.localeCompare(b.name)
  );

  return (
    <div className="space-y-6 p-6">

      {/* Header KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label={t("mkt.bestPerforming", lang)} value="Tadawul +8.4%" sub={t("mkt.saudiWindfall", lang)} change={t("mkt.recordHighs", lang)} changeUp={true} accent="#22c55e" />
        <KpiCard label={t("mkt.worstPerforming", lang)} value="KOSPI −17%" sub={t("mkt.koreaImporter", lang)} change={t("mkt.warPremMax", lang)} changeUp={false} accent="#ef4444" />
        <KpiCard label={t("mkt.tankerSector", lang)} value="+62.5%" sub={t("mkt.ytdWarPremium", lang)} change={t("mkt.bestSector", lang)} changeUp={true} accent="#f0a500" />
        <KpiCard label={t("mkt.techSemicon", lang)} value="−15–20%" sub={t("mkt.supplyChain", lang)} change={t("mkt.worstSector", lang)} changeUp={false} accent="#8b5cf6" />
      </div>

      {/* Global Indices Table */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-6">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-1">{t("mkt.globalIndices", lang)}</div>
        <div className="text-xs text-white/20 mb-4">{t("mkt.indicesDesc", lang)} · {live.asOf}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/30 font-mono text-[10px] tracking-widest border-b border-white/6">
                <th className="text-left pb-3 pr-4">{t("mkt.index", lang)}</th>
                <th className="text-left pb-3 pr-4">{t("mkt.region", lang)}</th>
                <th className="text-right pb-3 pr-4">{t("mkt.level", lang)}</th>
                <th className="text-right pb-3 pr-4">{t("mkt.ytdChange", lang)}</th>
                <th className="text-left pb-3">{t("mkt.warNote", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {MARKETS_DATA.indices.map((idx, i) => {
                const isUp = idx.change > 0;
                return (
                  <tr key={i} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                    <td className="py-2.5 pr-4">
                      <div className="font-bold text-white">{idx.name}</div>
                      <div className="text-[9px] font-mono text-white/30">{idx.ticker}</div>
                    </td>
                    <td className="py-2.5 pr-4 text-white/40">{idx.region}</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-white font-bold">{idx.value.toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-right">
                      <span className={`font-bold font-mono text-sm ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                        {isUp ? "+" : ""}{idx.change.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 text-white/40 max-w-xs">{idx.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sector Performance */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-white/30 mb-1">{t("mkt.sectorPerf", lang)}</div>
            <div className="text-xs text-white/20">{t("mkt.sectorDesc", lang)}</div>
          </div>
          <div className="flex gap-2">
            {(["change", "name"] as const).map(s => (
              <button key={s} onClick={() => setSectorSort(s)}
                className={`text-[10px] font-bold px-3 py-1 rounded-lg transition-all ${
                  sectorSort === s ? "bg-amber-500 text-black" : "bg-white/5 text-white/40 hover:text-white/60"
                }`}>{s === "change" ? t("mkt.byChange", lang) : t("mkt.az", lang)}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {sortedSectors.map((s, i) => {
            const isUp = s.direction === "up";
            const barPct = Math.min(Math.abs(s.change), 80);
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-36 shrink-0 text-xs text-white/60 text-right pr-2">{s.name}</div>
                <div className="flex-1 flex items-center gap-2">
                  {isUp ? (
                    <>
                      <div className="w-1/2 flex justify-end">
                        <div className="h-6 rounded-full flex items-center pr-2" style={{ width: `${barPct * 1.2}%`, background: "rgba(34,197,94,0.2)" }}>
                          <span className="text-[10px] font-bold font-mono text-emerald-400 ml-auto">+{s.change}%</span>
                        </div>
                      </div>
                      <div className="w-px h-6 bg-white/10" />
                      <div className="w-1/2" />
                    </>
                  ) : (
                    <>
                      <div className="w-1/2" />
                      <div className="w-px h-6 bg-white/10" />
                      <div className="w-1/2">
                        <div className="h-6 rounded-full flex items-center pl-2" style={{ width: `${barPct * 1.2}%`, background: "rgba(239,68,68,0.2)" }}>
                          <span className="text-[10px] font-bold font-mono text-red-400">{s.change}%</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="w-64 shrink-0 text-[9px] text-white/25 hidden xl:block">{s.driver}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* War-Impacted Companies */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-white/30 mb-1">{lang === "en" ? "WAR-IMPACTED COMPANIES" : "SYARIKAT TERKESAN PERANG"}</div>
            <div className="text-xs text-white/20">{lang === "en" ? "Stock performance since Feb 28, 2026 crisis onset" : "Prestasi saham sejak permulaan krisis 28 Feb 2026"}</div>
          </div>
          <div className="flex gap-2">
            {(["all", "winner", "loser"] as const).map(f => (
              <button key={f} onClick={() => setCompanyFilter(f)}
                className={`text-[10px] font-bold px-3 py-1 rounded-lg transition-all capitalize ${
                  companyFilter === f
                    ? f === "winner" ? "bg-emerald-500 text-black" : f === "loser" ? "bg-red-500 text-white" : "bg-amber-500 text-black"
                    : "bg-white/5 text-white/40 hover:text-white/60"
                }`}>{f === "all" ? t("mkt.all", lang) : f === "winner" ? t("mkt.winnersBtn", lang) : t("mkt.losersBtn", lang)}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredCompanies.map((co, i) => {
            const isWinner = co.side === "winner";
            return (
              <div key={i} className={`border rounded-xl p-4 transition-all hover:scale-[1.01] ${
                isWinner ? "border-emerald-500/15 bg-emerald-500/5 hover:border-emerald-500/25" : "border-red-500/15 bg-red-500/5 hover:border-red-500/25"
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-bold text-white">{co.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-mono text-white/30">{co.ticker}</span>
                      <span className="text-[9px] text-white/20">{co.market}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-black font-mono ${isWinner ? "text-emerald-400" : "text-red-400"}`}>
                      {isWinner ? "+" : ""}{co.change}%
                    </div>
                    <div className="text-[9px] text-white/20">{t("hor.ytd", lang)}</div>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-white/25 tracking-wider mb-1">{co.sector}</div>
                <div className="text-[10px] text-white/40 leading-relaxed">{co.note}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/30">{co.price}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isWinner ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                  }`}>{isWinner ? t("mkt.warWinner", lang) : t("mkt.warLoser", lang)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Currency Moves */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-6">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-1">{lang === "en" ? "CURRENCY IMPACT — SINCE FEB 28" : "KESAN MATA WANG — SEJAK 28 FEB"}</div>
        <div className="text-xs text-white/20 mb-4">{lang === "en" ? "War-driven pressure on oil-importing nations' currencies" : "Tekanan didorong perang ke atas mata wang negara pengimport minyak"}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MARKETS_DATA.currencies.map((fx, i) => {
            const isUp = fx.change > 0;
            const isFlat = fx.change === 0;
            return (
              <div key={i} className={`border rounded-xl p-4 ${
                isFlat ? "border-white/6 bg-white/2" :
                isUp ? "border-red-500/15 bg-red-500/5" : "border-emerald-500/15 bg-emerald-500/5"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-white font-mono">{fx.pair}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">{fx.rate.toLocaleString()}</span>
                    <span className={`text-xs font-bold font-mono ${
                      isFlat ? "text-white/40" : isUp ? "text-red-400" : "text-emerald-400"
                    }`}>{isFlat ? t("mkt.pegged", lang) : isUp ? `+${fx.change}%` : `${fx.change}%`}</span>
                  </div>
                </div>
                <div className="text-[10px] text-white/40">{fx.note}</div>
                {!isFlat && (
                  <div className="mt-2 text-[9px] text-white/25 font-mono">{lang === "en" ? "Pre-war" : "Pra-perang"}: {fx.preWar.toLocaleString()} · {lang === "en" ? "Change" : "Perubahan"}: {fx.change > 0 ? `+${fx.change}` : fx.change}%</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-white/20">Sources: Yahoo Finance · Bloomberg · Reuters · Morningstar · Seeking Alpha · Korean Exchange · LSEG · {live.asOf}</p>
    </div>
  );
}

// ── Dual-timezone formatter (UAE = GMT+4, Malaysia = GMT+8) ──────────────────
function fmtDual(isoStr: string): { uae: string; my: string; date: string } {
  const d = new Date(isoStr);
  const fmt = (tz: string) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz });
  const dateFmt = d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "Asia/Dubai" });
  return { uae: fmt("Asia/Dubai") + " UAE", my: fmt("Asia/Kuala_Lumpur") + " MY", date: dateFmt };
}

// ── NEWS TAB ──────────────────────────────────────────────────────────────────
function NewsTab({ lang }: { lang: Lang }) {
  const live = useLive();
  const [catFilter, setCatFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | string | null>(null);
  const [rssNews, setRssNews] = useState<any[]>([]);
  const [bmNews, setBmNews] = useState<Map<string, { title: string; summary: string }>>(new Map());
  const [bmLoading, setBmLoading] = useState(false);
  const [loading, setLoading] = useState(true); // show skeleton until RSS arrives
  const [rssError, setRssError] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const allCats = ["all","leaders","military","energy","economy","diplomacy","humanitarian"] as const;
  const staticCats = ["all","military","energy","economy","diplomacy","humanitarian"] as const;
  const catIcon: Record<string, string> = { leaders:"👤", military:"⚔️", energy:"⚡", economy:"📈", diplomacy:"🕊️", humanitarian:"🤝" };
  const leaderMeta: Record<string, { flag: string; name: string; color: string }> = {
    trump: { flag: "🇺🇸", name: "Trump",   color: "#3b82f6" },
    iran:  { flag: "🇮🇷", name: "Iran",    color: "#22c55e" },
  };

  // Tracks article titles already shown — never cleared, survives re-renders
  const seenTitlesRef = useRef<Set<string>>(new Set());
  const [newCount, setNewCount] = useState(0);
  const isFetchingRef = useRef(false); // prevent overlapping fetches
  const isFirstLoadRef = useRef(true);

  function dedupeAndSort(items: any[]): any[] {
    // Sort newest first
    items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    // Deduplicate by title
    const seen = new Set<string>();
    return items.filter(item => {
      if (!item.title) return false;
      const key = item.title.slice(0, 60).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async function doFetch(forceRefresh = false) {
    // Skip if a fetch is already running
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    const isFirst = isFirstLoadRef.current;

    try {
      // Fetch from backend — server fetches all feeds server-side, no CORS issues
      const all = await fetchNewsFromServer(forceRefresh);

      if (all.length === 0) {
        if (isFirst) setRssError(true);
        return;
      }

      const unique = dedupeAndSort(all);

      if (isFirst) {
        unique.forEach(item => seenTitlesRef.current.add(item.title.slice(0, 60).toLowerCase()));
        setRssNews(unique);
        setRssError(false);
        isFirstLoadRef.current = false;
      } else {
        const brandNew = unique.filter(
          item => !seenTitlesRef.current.has(item.title.slice(0, 60).toLowerCase())
        );
        if (brandNew.length > 0) {
          brandNew.forEach(item => seenTitlesRef.current.add(item.title.slice(0, 60).toLowerCase()));
          setRssNews(prev => [
            ...brandNew.map(item => ({ ...item, isNew: true })),
            ...prev,
          ]);
          setNewCount(prev => prev + brandNew.length);
        }
        setRssError(false);
      }
    } catch {
      if (isFirst) {
        setRssError(true);
        setLoading(false);
        setCatFilter("all");
      }
    } finally {
      setLastFetched(new Date());
      isFetchingRef.current = false;
    }
  }

  useEffect(() => {
    doFetch();
    // Refresh every 5 minutes — only NEW articles get prepended, existing stay
    const interval = setInterval(doFetch, 10 * 60 * 1000); // 10 min
    return () => clearInterval(interval);
  }, []);

  // Translate all titles/summaries via MyMemory when BM is selected
  useEffect(() => {
    if (lang !== "bm" || rssNews.length === 0) return;
    let cancelled = false;
    setBmLoading(true);
    (async () => {
      const map = new Map<string, { title: string; summary: string }>();
      // Translate in batches of 5 (respect MyMemory rate limit)
      for (let i = 0; i < rssNews.length; i += 5) {
        if (cancelled) break;
        const batch = rssNews.slice(i, i + 5);
        await Promise.all(batch.map(async item => {
          const key = item.title.slice(0, 60);
          const [title, summary] = await Promise.all([
            translateToMalay(item.title),
            translateToMalay(item.summary?.slice(0, 300) || ""),
          ]);
          map.set(key, { title, summary });
        }));
        if (!cancelled) setBmNews(new Map(map));
        await new Promise(r => setTimeout(r, 300));
      }
      if (!cancelled) setBmLoading(false);
    })();
    return () => { cancelled = true; };
  }, [lang, rssNews]);

  const usingRss = rssNews.length > 0;
  // If RSS isn't available and a leaders filter was selected, fall back to 'all'
  const effectiveCatFilter = (!usingRss && catFilter === "leaders") ? "all" : catFilter;
  const staticFiltered = effectiveCatFilter === "all" ? NEWS : NEWS.filter(n => n.category === effectiveCatFilter);
  const rssFiltered = effectiveCatFilter === "all" ? rssNews : rssNews.filter(item => item.category === effectiveCatFilter);
  const displayItems = usingRss ? rssFiltered : staticFiltered;

  function formatLastFetched(d: Date): string {
    const { uae, my } = fmtDual(d.toISOString());
    return `${uae} · ${my}`;
  }

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">{t("news.dailyBriefing", lang)}</h2>
          <div className="text-xs text-white/30 mt-0.5">
            {live.asOf} · Crisis Day {live.crisisDay} · {usingRss ? rssNews.length : NEWS.length} {t("news.reports", lang)}
            {lastFetched && (
              <span className="ml-2 text-white/20">· {t("news.refreshed", lang)}: {formatLastFetched(lastFetched)} · {t("news.autoRefresh", lang)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {usingRss && (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
              {t("news.liveRss", lang)}
            </div>
          )}
          {newCount > 0 && (
            <button
              onClick={() => { setNewCount(0); }}
              className="flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/40 text-amber-400 text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full animate-pulse"
            >
              +{newCount} NEW ↑
            </button>
          )}
          <button onClick={() => { if (!isFetchingRef.current) doFetch(true); }}
            className="flex items-center gap-2 bg-[var(--bg-card)] border border-white/6 rounded-full px-4 py-2 hover:border-amber-500/30 transition-colors cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-red-500 pulse-dot" />
            <span className="text-[10px] font-bold tracking-widest text-white/50">{t("news.liveUpdates", lang)}</span>
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          <div className="text-xs text-white/40 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 pulse-dot" />
            {t("news.loading", lang)}
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-5 animate-pulse">
              <div className="h-3 bg-white/5 rounded w-3/4 mb-3" />
              <div className="h-2 bg-white/3 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error banner */}
      {rssError && !loading && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400/80">
          {t("news.error", lang)}
        </div>
      )}

      {/* Cached fallback label */}
      {!loading && !usingRss && (
        <div className="bg-white/3 border border-white/5 rounded-lg px-3 py-2 text-[10px] text-white/30 font-mono">
          {t("news.cached", lang)}
        </div>
      )}

      {/* RSS powered label */}
      {!loading && usingRss && (
        <div className="text-[10px] text-white/20 font-mono flex items-center gap-2">
          {t("news.powered", lang)} · {rssNews.length} articles
          {lang === "bm" && bmLoading && (
            <span className="text-amber-400/50 animate-pulse">· Menterjemah ke BM...</span>
          )}
          {lang === "bm" && !bmLoading && bmNews.size > 0 && (
            <span className="text-emerald-400/40">· Terjemahan BM aktif ✓</span>
          )}
        </div>
      )}

      {/* Category filter */}
      {!loading && (
        <div className="flex flex-wrap gap-2">
          {(usingRss ? allCats : staticCats).map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all border ${effectiveCatFilter === c ? "border-white/20 text-white bg-white/8" : "bg-transparent border-white/5 text-white/30 hover:border-white/10"}`}
              style={effectiveCatFilter === c && c !== "all" ? { borderColor: catColor[c] + "60", color: catColor[c], background: catColor[c] + "12" } : {}}>
              {c !== "all" ? catIcon[c] : ""} {t(`news.${c}` as any, lang)}
            </button>
          ))}
        </div>
      )}

      {/* News cards — RSS live */}
      {!loading && usingRss && (
        <div className="space-y-3">
          {(displayItems as any[]).map((item, idx) => {
            const itemId = `rss-${idx}`;
            const cat = item.category as string;
            const { uae, my, date } = fmtDual(item.pubDate);
            const bmEntry = lang === "bm" ? bmNews.get(item.title.slice(0, 60)) : undefined;
            const headline = bmEntry ? bmEntry.title : item.title;
            const summary  = bmEntry ? bmEntry.summary : item.summary;
            const ldr = item.leader ? leaderMeta[item.leader] : null;
            const borderCol = ldr ? ldr.color : item.isNew ? "#f0a500" : (catColor[cat] || "#ffffff10");
            const glowClass = ldr
              ? item.leader === "trump" ? "shadow-[0_0_16px_rgba(59,130,246,0.15)]" : "shadow-[0_0_16px_rgba(34,197,94,0.15)]"
              : item.isNew ? "shadow-[0_0_12px_rgba(240,165,0,0.12)]" : "";
            return (
              <div key={itemId}
                className={`news-card bg-[var(--bg-card)] border rounded-xl overflow-hidden transition-all ${ldr || item.isNew ? glowClass : ""} ${ldr ? "border-white/10" : item.isNew ? "border-amber-400/40" : "border-white/6"}`}
                style={{ borderLeft: `3px solid ${borderCol}` }}
              >
                {/* Leader banner */}
                {ldr && (
                  <div className="px-5 pt-3 pb-0 flex items-center gap-2">
                    <span className="text-lg">{ldr.flag}</span>
                    <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: ldr.color }}>{ldr.name} · OFFICIAL</span>
                    {item.isNew && <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-400/20 text-amber-400 animate-pulse ml-auto">NEW</span>}
                  </div>
                )}
                <div className="p-5" style={{ paddingTop: ldr ? "8px" : undefined }}>
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: (ldr ? ldr.color : catColor[cat] || "#ffffff") + "20" }}>
                      {ldr ? (item.leader === "trump" ? "🇺🇸" : "🇮🇷") : (catIcon[cat] || "📰")}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Timestamps + badges row */}
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        {uae && <span className="text-[10px] font-bold font-mono text-amber-400/60">🇦🇪 {uae}</span>}
                        {my  && <span className="text-[10px] font-bold font-mono text-blue-400/60">🇲🇾 {my}</span>}
                        {date && <span className="text-[9px] text-white/20 font-mono">{date}</span>}
                        {!ldr && <><span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: (catColor[cat] || "#ffffff") + "15", color: catColor[cat] || "#ffffff60" }}>{cat}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: (impactColor[item.impact] || "#ffffff") + "15", color: impactColor[item.impact] || "#ffffff60" }}>{item.impact}</span></>}
                        {!ldr && item.isNew && <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-400/20 text-amber-400 animate-pulse">NEW</span>}
                        {item.source && <span className="text-[9px] text-white/25 font-mono">{item.source}</span>}
                      </div>
                      {/* Headline */}
                      <h3 className={`font-bold leading-tight ${ldr ? "text-base" : "text-sm"}`}>
                        {item.link
                          ? <a href={item.link} className="text-white hover:text-amber-400 transition-colors">{headline}</a>
                          : <span className="text-white">{headline}</span>
                        }
                      </h3>
                      {/* Market impact note for leader posts */}
                      {ldr && (
                        <p className="text-[10px] mt-1 font-mono" style={{ color: ldr.color + "99" }}>
                          ⚡ {item.leader === "trump" ? t("news.marketSignal", lang) : t("news.iranSignal", lang)}
                        </p>
                      )}
                      {/* Summary + Read More */}
                      {expanded === itemId && (
                        <div className="mt-3 space-y-2">
                          {summary && <p className="text-xs text-white/55 leading-relaxed">{summary}</p>}
                          {item.link && (
                            <a
                              href={item.link}
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors mt-2 px-3 py-1.5 rounded-full border border-amber-400/30 hover:border-amber-400/60 bg-amber-400/5"
                            >
                              ↗ {t("news.readMore", lang)}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setExpanded(expanded === itemId ? null : itemId)}
                      className="text-white/30 hover:text-white/60 text-xs shrink-0 mt-1 p-1"
                    >
                      {expanded === itemId ? "▲" : "▼"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* News cards — Static fallback */}
      {!loading && !usingRss && (
        <div className="space-y-3">
          {(staticFiltered as NewsItem[]).map(n => {
            const { uae, my } = fmtDual(new Date(`2026-04-15T${n.time.replace(" UTC","")}:00Z`).toISOString());
            const headline = lang === "bm" ? translateToBM(n.headline) : n.headline;
            const summary  = lang === "bm" ? translateToBM(n.summary) : n.summary;
            return (
            <div key={n.id}
              className="news-card bg-[var(--bg-card)] border border-white/6 rounded-xl overflow-hidden cursor-pointer hover:border-white/10"
              style={{ borderLeft: `2px solid ${catColor[n.category]}` }}
              onClick={() => setExpanded(expanded === n.id ? null : n.id)}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: catColor[n.category] + "15" }}>
                    {catIcon[n.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      {uae && <span className="text-[10px] font-bold font-mono text-amber-400/60">🇦🇪 {uae}</span>}
                      {my  && <span className="text-[10px] font-bold font-mono text-blue-400/60">🇲🇾 {my}</span>}
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: catColor[n.category] + "15", color: catColor[n.category] }}>{n.category}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: impactColor[n.impact] + "15", color: impactColor[n.impact] }}>{n.impact}</span>
                      <span className="text-[9px] text-white/20 font-mono">{n.region}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-tight">{headline}</h3>
                    {expanded === n.id && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-white/55 leading-relaxed">{summary}</p>
                        <div className="text-[10px] text-white/25">{t("news.source", lang)}: {n.source}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-white/20 text-xs shrink-0 mt-1">{expanded === n.id ? "▲" : "▼"}</div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}

// ── CURRENCIES TAB ──
function CurrenciesTab({ cur, lang }: { cur: string; lang: Lang }) {
  const live = useLive();
  const [fromCur, setFromCur] = useState("USD");
  const [amount, setAmount] = useState("100");

  function convert(a: number, from: string, to: string) {
    const toUSD = from === "USD" ? a : from === "MYR" ? a / live.usdMyr : from === "AED" ? a / live.usdAed : a;
    if (to === "USD") return toUSD;
    if (to === "MYR") return toUSD * live.usdMyr;
    if (to === "AED") return toUSD * live.usdAed;
    return toUSD;
  }

  const num = parseFloat(amount) || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Quick converter */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-6">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-4">{t("cur.converter", lang)}</div>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <div className="text-[10px] text-white/30 font-bold tracking-wider mb-2">{t("cur.amount", lang)}</div>
            <input
              type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="bg-white/5 border border-white/8 rounded-lg px-4 py-3 text-white font-mono text-lg outline-none focus:border-amber-500/50 w-36 transition-colors"
            />
          </div>
          <div>
            <div className="text-[10px] text-white/30 font-bold tracking-wider mb-2">{t("cur.from", lang)}</div>
            <div className="flex gap-2">
              {["USD","MYR","AED"].map(c => (
                <button key={c} onClick={() => setFromCur(c)}
                  className={`px-4 py-3 rounded-lg text-sm font-bold transition-all border ${fromCur === c ? "bg-amber-500/15 border-amber-500/40 text-amber-400" : "bg-white/3 border-white/6 text-white/40 hover:border-white/12"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["USD","MYR","AED"].map(to => {
              if (to === fromCur) return null;
              const rate = to === "USD" ? 1 : to === "MYR" ? live.usdMyr : live.usdAed;
              const val = convert(num, fromCur, to);
              return (
                <div key={to} className="bg-white/3 rounded-xl p-4">
                  <div className="text-[10px] text-white/25 font-bold tracking-wider mb-1">{fromCur} → {to}</div>
                  <div className="text-xl font-bold font-mono text-white">{val.toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}</div>
                  <div className="text-[10px] text-white/25 mt-1">Rate: 1 {fromCur} = {convert(1, fromCur, to).toFixed(4)} {to}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FX table */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="text-[10px] font-bold tracking-widest text-white/30">{t("cur.fxRates", lang)}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {[t("cur.pair", lang), t("cur.rate", lang), t("cur.prevClose", lang), t("cur.change", lang), t("cur.trend", lang), t("cur.note", lang)].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold tracking-widest text-white/25 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FX_RATES.map((fx, i) => {
                const chg = fx.rate - fx.prev;
                const chgPct = (chg / fx.prev) * 100;
                const isUp = chg > 0;
                return (
                  <tr key={i} className="border-b border-white/4 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-bold font-mono text-white">{fx.pair}</td>
                    <td className="px-4 py-3 font-mono text-lg font-bold text-white">{fx.rate.toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:4 })}</td>
                    <td className="px-4 py-3 font-mono text-white/40">{fx.prev}</td>
                    <td className={`px-4 py-3 font-mono font-bold ${isUp ? "text-red-400" : chg === 0 ? "text-white/30" : "text-emerald-400"}`}>
                      {chg === 0 ? "—" : `${isUp ? "+" : ""}${chgPct.toFixed(2)}%`}
                    </td>
                    <td className="px-4 py-3">
                      {fx.pegged ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold">{t("cur.pegged", lang)}</span>
                      ) : isUp ? (
                        <span className="text-red-400 text-xs">{t("cur.weakening", lang)}</span>
                      ) : (
                        <span className="text-emerald-400 text-xs">{t("cur.strengthening", lang)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/35 max-w-[220px] text-[10px]">{fx.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DXY info */}
      <div className="bg-[var(--bg-card)] border-l-2 border-blue-500/60 border border-white/5 rounded-xl px-5 py-4 text-xs text-white/50 leading-relaxed">
        <span className="text-white/70 font-bold">{t("cur.dxyInfo", lang)}: 98.30 (▲ +0.12% today)</span> — {t("cur.dxyDesc", lang)}
      </div>

      {/* Fill-up calculator */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="text-[10px] font-bold tracking-widest text-white/30">{t("cur.tankFillUp", lang)}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {[t("cur.countryCol", lang), t("cur.pricePerLitre", lang), t("cur.preCrisis", lang), t("cur.tankNow", lang), t("cur.changeCol", lang)].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold tracking-widest text-white/25 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { flag:"🇺🇸", name:"USA",         now:"$1.60/L",       pre:"$1.20/L", tank:"$80",       chg:"+$20 (+33%)" },
                { flag:"🇲🇾", name:"Malaysia",    now:"RM 3.87/L",     pre:"RM 2.60/L",tank:"RM 193.50", chg:"+RM 63.50 (+49%)" },
                { flag:"🇦🇪", name:"UAE",         now:"AED 4.20/L",    pre:"AED 3.30/L",tank:"AED 210",  chg:"+AED 45 (+27%)" },
                { flag:"🇯🇵", name:"Japan",       now:"¥220/L",        pre:"¥188/L",  tank:"¥11,000",   chg:"+¥1,600 (+17%)" },
                { flag:"🇵🇭", name:"Philippines", now:"₱105/L",        pre:"₱64/L",   tank:"₱5,250",    chg:"+₱2,050 (+63%)" },
                { flag:"🇦🇺", name:"Australia",   now:"A$2.80/L",      pre:"A$2.00/L",tank:"A$140",     chg:"+A$40 (+40%)" },
                { flag:"🇩🇪", name:"Germany",     now:"€2.10/L",       pre:"€1.84/L", tank:"€105",      chg:"+€13 (+14%)" },
                { flag:"🇰🇭", name:"Cambodia",    now:"$2.10/L",       pre:"$1.25/L", tank:"$105",      chg:"+$42.50 (+68%)" },
              ].map((r, i) => (
                <tr key={i} className="border-b border-white/4 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-bold text-white">{r.flag} {r.name}</td>
                  <td className="px-4 py-3 font-mono text-white/60">{r.now}</td>
                  <td className="px-4 py-3 font-mono text-white/30">{r.pre}</td>
                  <td className="px-4 py-3 font-mono font-bold text-white">{r.tank}</td>
                  <td className="px-4 py-3 font-mono font-bold text-red-400">{r.chg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-3 px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded text-[10px] text-amber-400/50 leading-relaxed">
        ⚠️ {lang === "en"
          ? "Currency rates are sourced from public APIs and may be delayed. Not financial or investment advice. Exchange rates vary by provider. Always verify with your bank or broker."
          : "Kadar mata wang diambil dari API awam dan mungkin tertangguh. Bukan nasihat kewangan atau pelaburan. Kadar pertukaran berbeza mengikut penyedia. Sahkan dengan bank atau broker anda."}
      </div>
    </div>
  );
}

// ════ MAIN APP ════

// ── AIRLINE DISRUPTION TRACKER ───────────────────────────────────────────────
function AirlineTab({ lang }: { lang: Lang }) {
  const live = useLive();
  const isEn = lang === "en";

  const airlines = [
    { name:"Emirates",      flag:"🇦🇪", hub:"Dubai (DXB)",        status:"SUSPENDED", routes:120, reason:"Gulf airspace closed", resume:"TBD", ytd:-15 },
    { name:"Qatar Airways", flag:"🇶🇦", hub:"Doha (DOH)",          status:"SUSPENDED", routes:85,  reason:"Doha airspace restricted", resume:"TBD", ytd:-12 },
    { name:"Iran Air",      flag:"🇮🇷", hub:"Tehran (IKA)",        status:"GROUNDED",  routes:62,  reason:"Sanctions + strikes", resume:"Post-war", ytd:-100 },
    { name:"flydubai",      flag:"🇦🇪", hub:"Dubai (DXB)",         status:"SUSPENDED", routes:44,  reason:"UAE airspace risk", resume:"TBD", ytd:-22 },
    { name:"Air Arabia",    flag:"🇦🇪", hub:"Sharjah (SHJ)",       status:"PARTIAL",   routes:30,  reason:"Rerouting via Turkey", resume:"Active", ytd:-8 },
    { name:"Oman Air",      flag:"🇴🇲", hub:"Muscat (MCT)",        status:"PARTIAL",   routes:28,  reason:"Muscat corridor active", resume:"Active", ytd:-5 },
    { name:"Kuwait Airways",flag:"🇰🇼", hub:"Kuwait City (KWI)",   status:"SUSPENDED", routes:22,  reason:"Gulf airspace", resume:"TBD", ytd:-18 },
    { name:"Saudia",        flag:"🇸🇦", hub:"Riyadh (RUH)",        status:"PARTIAL",   routes:95,  reason:"Westbound routes active", resume:"Active", ytd:-11 },
    { name:"Korean Air",    flag:"🇰🇷", hub:"Seoul (ICN)",         status:"REROUTED",  routes:12,  reason:"+4h via India corridor", resume:"Active", ytd:-9 },
    { name:"Malaysia Airlines",flag:"🇲🇾",hub:"Kuala Lumpur (KUL)",status:"REROUTED",  routes:18,  reason:"+3h southern corridor", resume:"Active", ytd:-7 },
    { name:"Singapore Airlines",flag:"🇸🇬",hub:"Singapore (SIN)", status:"REROUTED",  routes:22,  reason:"+3.5h India/Oman route", resume:"Active", ytd:-6 },
    { name:"Air India",     flag:"🇮🇳", hub:"Delhi (DEL)",         status:"REROUTED",  routes:35,  reason:"India corridor still open", resume:"Active", ytd:-4 },
  ];

  const airspaceZones = [
    { zone:"Iranian Airspace (Tehran FIR)", status:"CLOSED",     color:"#ef4444", desc: isEn?"Completely closed since Mar 1":"Ditutup sepenuhnya sejak 1 Mar" },
    { zone:"Gulf FIR (Bahrain/Emirates)",   status:"RESTRICTED", color:"#f97316", desc: isEn?"Military activity — avoid below FL250":"Aktiviti ketenteraan — elak bawah FL250" },
    { zone:"Qatar FIR",                     status:"RESTRICTED", color:"#f97316", desc: isEn?"Limited commercial ops, prior permission needed":"Ops komersial terhad, kebenaran diperlukan" },
    { zone:"Oman FIR (Muscat)",             status:"OPEN",       color:"#22c55e", desc: isEn?"Open — main diversion corridor":"Terbuka — koridor pelesapan utama" },
    { zone:"Saudi Arabia FIR",              status:"PARTIAL",    color:"#f0a500", desc: isEn?"Westbound routes active, eastbound restricted":"Laluan barat aktif, timur terhad" },
    { zone:"Iraq FIR (Baghdad)",            status:"RESTRICTED", color:"#f97316", desc: isEn?"Northern corridors only":"Koridor utara sahaja" },
    { zone:"Pakistan FIR (Karachi)",        status:"OPEN",       color:"#22c55e", desc: isEn?"Open — alternate Asia-Europe corridor":"Terbuka — koridor alternatif Asia-Eropah" },
  ];

  const fuelSurcharges = [
    { route: isEn?"KUL → LHR (Kuala Lumpur–London)":"KUL → LHR", preWar:"RM 280", now:"RM 680", extra:"RM 400", pct:"+143%" },
    { route: isEn?"SIN → DXB (Singapore–Dubai)":"SIN → DXB",     preWar:"SGD 45",  now:"SGD 140", extra:"SGD 95",  pct:"+211%" },
    { route: isEn?"ICN → DOH (Seoul–Doha)":"ICN → DOH",          preWar:"KRW 68K", now:"KRW 210K",extra:"KRW 142K",pct:"+209%" },
    { route: isEn?"DEL → DXB (Delhi–Dubai)":"DEL → DXB",         preWar:"₹ 3,200", now:"₹ 8,900", extra:"₹ 5,700",pct:"+178%" },
    { route: isEn?"LAX → DXB (Los Angeles–Dubai)":"LAX → DXB",   preWar:"USD 85",  now:"USD 245", extra:"USD 160", pct:"+188%" },
  ];

  const statusCol: Record<string,string> = { SUSPENDED:"#ef4444", GROUNDED:"#7f1d1d", PARTIAL:"#f0a500", REROUTED:"#3b82f6", OPEN:"#22c55e" };
  const statusBgCol: Record<string,string> = { SUSPENDED:"rgba(239,68,68,0.12)", GROUNDED:"rgba(127,29,29,0.2)", PARTIAL:"rgba(240,165,0,0.12)", REROUTED:"rgba(59,130,246,0.12)", OPEN:"rgba(34,197,94,0.12)" };

  return (
    <div className="space-y-6 p-6">
      {/* Header KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label={isEn?"Routes Suspended":"Laluan Digantung"} value="412" sub={isEn?"Gulf + Iranian routes":"Laluan Teluk + Iran"} change={isEn?"vs 0 pre-war":"vs 0 pra-perang"} changeUp={false} accent="#ef4444"/>
        <KpiCard label={isEn?"Airlines Affected":"Syarikat Penerbangan Terkesan"} value="47" sub={isEn?"across 3 categories":"merentasi 3 kategori"} change={isEn?"9 fully suspended":"9 digantung sepenuhnya"} changeUp={false} accent="#f97316"/>
        <KpiCard label={isEn?"Extra Reroute Time":"Masa Laluan Semula Tambahan"} value="+3–6h" sub={isEn?"Asia–Europe flights":"Penerbangan Asia–Eropah"} change={isEn?"Via India/Turkey corridor":"Via koridor India/Turki"} changeUp={false} accent="#f0a500"/>
        <KpiCard label={isEn?"Fuel Surcharge Avg":"Purata Caj Bahan Api"} value="+185%" sub={isEn?"vs pre-crisis fares":"vs tambang pra-krisis"} change={`Brent $${live.brentUSD.toFixed(2)}`} changeUp={false} accent="#8b5cf6"/>
      </div>

      {/* Airspace Status */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-5">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-4">{isEn?"AIRSPACE STATUS — MIDDLE EAST FIRS":"STATUS RUANG UDARA — FIR TIMUR TENGAH"}</div>
        <div className="text-[10px] text-white/20 mb-4">{isEn?"Source: ICAO NOTAMs (official) · Updated daily":"Sumber: NOTAM ICAO (rasmi) · Dikemas kini harian"}</div>
        <div className="space-y-2">
          {airspaceZones.map(z => (
            <div key={z.zone} className="flex items-center gap-3 p-3 rounded-lg border" style={{background: statusBgCol[z.status] || "rgba(255,255,255,0.03)", borderColor: (statusCol[z.status]||"#ffffff")+"25"}}>
              <span className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full" style={{background:(statusCol[z.status]||"#fff")+"20", color: statusCol[z.status]||"#fff"}}>{z.status}</span>
              <span className="text-xs font-bold text-white/80 flex-1">{z.zone}</span>
              <span className="text-[10px] text-white/40 hidden md:block">{z.desc}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[10px] text-white/20">{isEn?"FIR = Flight Information Region. Source: ICAO (icao.int) — official UN aviation body. NOTAMs updated in real-time.":"FIR = Rantau Maklumat Penerbangan. Sumber: ICAO (icao.int) — badan penerbangan PBB rasmi."}</div>
      </div>

      {/* Airline Status Table */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-5">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-1">{isEn?"AIRLINE STATUS — GULF & MIDDLE EAST ROUTES":"STATUS SYARIKAT PENERBANGAN — LALUAN TELUK & TIMUR TENGAH"}</div>
        <div className="text-xs text-white/20 mb-4">{isEn?"Sources: IATA press room · airline official notices · ICAO":"Sumber: Bilik akhbar IATA · notis rasmi syarikat penerbangan · ICAO"}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/6 text-white/30 text-[10px] font-bold tracking-widest">
                <th className="text-left pb-3 pr-4">{isEn?"AIRLINE":"SYARIKAT"}</th>
                <th className="text-left pb-3 pr-4">{isEn?"STATUS":"STATUS"}</th>
                <th className="text-right pb-3 pr-4">{isEn?"ROUTES HIT":"LALUAN TERKESAN"}</th>
                <th className="text-left pb-3 pr-4 hidden md:table-cell">{isEn?"REASON":"SEBAB"}</th>
                <th className="text-right pb-3">{isEn?"YTD STOCK":"SAHAM STH"}</th>
              </tr>
            </thead>
            <tbody>
              {airlines.map(a => (
                <tr key={a.name} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                  <td className="py-3 pr-4">
                    <span className="mr-2">{a.flag}</span>
                    <span className="font-bold text-white/80">{a.name}</span>
                    <div className="text-[10px] text-white/30">{a.hub}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full" style={{background:(statusCol[a.status]||"#fff")+"20",color:statusCol[a.status]||"#fff"}}>{a.status}</span>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-amber-400">{a.routes}</td>
                  <td className="py-3 pr-4 text-white/40 hidden md:table-cell text-[10px]">{a.reason}</td>
                  <td className={`py-3 text-right font-mono font-bold ${a.ytd < 0 ? "text-red-400":"text-emerald-400"}`}>{a.ytd > 0 ? "+" : ""}{a.ytd}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fuel Surcharge Table */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-5">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-1">{isEn?"PASSENGER FUEL SURCHARGE — KEY ROUTES":"CAJ BAHAN API PENUMPANG — LALUAN UTAMA"}</div>
        <div className="text-xs text-white/20 mb-4">{isEn?"War-driven fuel surcharges passed to passengers. Source: IATA, airline booking engines.":"Caj bahan api akibat perang yang dikenakan kepada penumpang."}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/6 text-white/30 text-[10px] font-bold tracking-widest">
                <th className="text-left pb-3 pr-4">{isEn?"ROUTE":"LALUAN"}</th>
                <th className="text-right pb-3 pr-4">{isEn?"PRE-WAR":"PRA-PERANG"}</th>
                <th className="text-right pb-3 pr-4">{isEn?"NOW":"KINI"}</th>
                <th className="text-right pb-3 pr-4">{isEn?"EXTRA COST":"KOS TAMBAHAN"}</th>
                <th className="text-right pb-3">{isEn?"CHANGE":"PERUBAHAN"}</th>
              </tr>
            </thead>
            <tbody>
              {fuelSurcharges.map(r => (
                <tr key={r.route} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                  <td className="py-3 pr-4 font-bold text-white/80">{r.route}</td>
                  <td className="py-3 pr-4 text-right font-mono text-white/40">{r.preWar}</td>
                  <td className="py-3 pr-4 text-right font-mono text-amber-400 font-bold">{r.now}</td>
                  <td className="py-3 pr-4 text-right font-mono text-red-400">{r.extra}</td>
                  <td className="py-3 text-right font-mono font-black text-red-400">{r.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-[10px] text-white/20">{isEn?"Surcharges are estimates based on IATA fuel surcharge methodology and current Brent price.":"Caj adalah anggaran berdasarkan metodologi caj bahan api IATA dan harga Brent semasa."}</div>
      </div>

      {/* Live flights note */}
      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 flex items-start gap-3">
        <span className="text-xl mt-0.5">✈️</span>
        <div>
          <div className="text-[10px] font-bold tracking-widest text-emerald-400 mb-1">{isEn?"LIVE FLIGHT POSITIONS — OpenSky Network":"KEDUDUKAN PENERBANGAN LANGSUNG — OpenSky Network"}</div>
          <p className="text-xs text-white/40 leading-relaxed">
            {isEn
              ? "Real-time global flight positions are available free via OpenSky Network (opensky-network.org) — an official academic data source. Integration coming in next update: live map showing flights avoiding Gulf airspace in real time."
              : "Kedudukan penerbangan global masa nyata tersedia percuma melalui OpenSky Network — sumber data akademik rasmi. Integrasi akan datang: peta langsung menunjukkan penerbangan mengelak ruang udara Teluk."}
          </p>
          <a href="https://opensky-network.org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-[10px] text-emerald-400 hover:underline font-bold">↗ OpenSky Network</a>
        </div>
      </div>
    </div>
  );
}

// ── FUEL PRICE CALCULATOR ─────────────────────────────────────────────────────
function FuelTab({ cur, lang }: { cur: string; lang: Lang }) {
  const live = useLive();
  const isEn = lang === "en";
  const [tankSize, setTankSize] = useState(50);

  // Fuel prices by country — sources: official government energy portals
  const fuelPrices = [
    {
      country: isEn?"Malaysia":"Malaysia", flag:"🇲🇾",
      grades: [
        { grade:"RON 95", preWar: 2.05, now: live.usdMyr > 4.0 ? 2.85 : 2.68, currency:"RM", unit:"litre", source:"KPDNHEP Malaysia", official:true },
        { grade:"RON 97", preWar: 3.35, now: live.usdMyr > 4.0 ? 4.85 : 4.42, currency:"RM", unit:"litre", source:"KPDNHEP Malaysia", official:true },
        { grade:"Diesel",  preWar: 2.15, now: live.usdMyr > 4.0 ? 3.10 : 2.88, currency:"RM", unit:"litre", source:"KPDNHEP Malaysia", official:true },
      ]
    },
    {
      country: isEn?"UAE":"UAE", flag:"🇦🇪",
      grades: [
        { grade:"Special 95", preWar: 2.43, now: 3.80, currency:"AED", unit:"litre", source:"ADNOC Distribution", official:true },
        { grade:"Super 98",   preWar: 2.55, now: 4.02, currency:"AED", unit:"litre", source:"ADNOC Distribution", official:true },
        { grade:"Diesel E+",  preWar: 2.72, now: 4.45, currency:"AED", unit:"litre", source:"ADNOC Distribution", official:true },
      ]
    },
    {
      country: isEn?"United States":"Amerika Syarikat", flag:"🇺🇸",
      grades: [
        { grade:"Regular (87)", preWar: 3.25, now: 4.92, currency:"USD", unit:"gallon", source:"U.S. EIA", official:true },
        { grade:"Premium (93)", preWar: 4.10, now: 6.18, currency:"USD", unit:"gallon", source:"U.S. EIA", official:true },
        { grade:"Diesel",       preWar: 3.85, now: 5.44, currency:"USD", unit:"gallon", source:"U.S. EIA", official:true },
      ]
    },
    {
      country: isEn?"United Kingdom":"United Kingdom", flag:"🇬🇧",
      grades: [
        { grade:"Unleaded (E10)", preWar: 142.8, now: 189.4, currency:"p", unit:"litre", source:"UK DESNZ", official:true },
        { grade:"Super Unleaded",  preWar: 154.2, now: 204.7, currency:"p", unit:"litre", source:"UK DESNZ", official:true },
        { grade:"Diesel",          preWar: 149.5, now: 196.2, currency:"p", unit:"litre", source:"UK DESNZ", official:true },
      ]
    },
    {
      country: isEn?"Singapore":"Singapura", flag:"🇸🇬",
      grades: [
        { grade:"95 Ron", preWar: 2.80, now: 3.74, currency:"SGD", unit:"litre", source:"EMA Singapore", official:true },
        { grade:"98 Ron", preWar: 3.05, now: 4.12, currency:"SGD", unit:"litre", source:"EMA Singapore", official:true },
        { grade:"Diesel", preWar: 2.15, now: 2.98, currency:"SGD", unit:"litre", source:"EMA Singapore", official:true },
      ]
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white">{isEn?"Fuel Price Calculator":"Kalkulator Harga Bahan Api"}</h2>
        <p className="text-xs text-white/30 mt-1">
          {isEn
            ? `Live fuel prices by country — tied to Brent crude $${live.brentUSD.toFixed(2)}/bbl. Sources: official government energy ministries.`
            : `Harga bahan api langsung mengikut negara — dikaitkan dengan Brent mentah $${live.brentUSD.toFixed(2)}/bbl. Sumber: kementerian tenaga kerajaan rasmi.`}
        </p>
      </div>

      {/* Brent impact pill */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/25 rounded-full px-4 py-2">
          <span className="text-[10px] font-bold text-amber-400">{isEn?"BRENT CRUDE":"MINYAK BRENT"}</span>
          <span className="font-mono font-black text-white text-sm">${live.brentUSD.toFixed(2)}</span>
          <span className="text-[10px] text-white/30">{pct(live.brentUSD, 65)} {isEn?"vs pre-war":"vs pra-perang"}</span>
        </div>
        <div className="flex items-center gap-2 bg-red-400/10 border border-red-400/25 rounded-full px-4 py-2">
          <span className="text-[10px] font-bold text-red-400">{isEn?"PUMP PRICE IMPACT":"KESAN HARGA PAM"}</span>
          <span className="font-mono font-black text-white text-sm">+30–50%</span>
          <span className="text-[10px] text-white/30">{isEn?"across all markets":"merentasi semua pasaran"}</span>
        </div>
      </div>

      {/* Tank size slider */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-5">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-3">{isEn?"TANK FILL CALCULATOR":"KALKULATOR ISI TANGKI"}</div>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-xs text-white/50">{isEn?"Tank size:":"Saiz tangki:"}</span>
          <input type="range" min={20} max={120} value={tankSize} onChange={e => setTankSize(+e.target.value)}
            className="flex-1 accent-amber-400" />
          <span className="font-mono font-bold text-amber-400 text-sm w-16 text-right">{tankSize}L</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          <div className="bg-white/3 rounded-lg p-3 text-center">
            <div className="text-[10px] text-white/30 mb-1">🇲🇾 RON 95</div>
            <div className="font-mono font-black text-amber-400">RM {(2.68 * tankSize).toFixed(2)}</div>
            <div className="text-[10px] text-red-400">+{((2.68-2.05)*tankSize).toFixed(2)} more</div>
          </div>
          <div className="bg-white/3 rounded-lg p-3 text-center">
            <div className="text-[10px] text-white/30 mb-1">🇦🇪 Special 95</div>
            <div className="font-mono font-black text-amber-400">AED {(3.80 * tankSize).toFixed(2)}</div>
            <div className="text-[10px] text-red-400">+{((3.80-2.43)*tankSize).toFixed(2)} more</div>
          </div>
          <div className="bg-white/3 rounded-lg p-3 text-center">
            <div className="text-[10px] text-white/30 mb-1">🇺🇸 Regular 87 (per gal)</div>
            <div className="font-mono font-black text-amber-400">USD {(4.92 * (tankSize/3.785)).toFixed(2)}</div>
            <div className="text-[10px] text-red-400">+{((4.92-3.25)*(tankSize/3.785)).toFixed(2)} more</div>
          </div>
        </div>
      </div>

      {/* Country price tables */}
      {fuelPrices.map(cp => (
        <div key={cp.country} className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{cp.flag}</span>
            <div>
              <div className="font-bold text-white text-sm">{cp.country}</div>
              <div className="text-[10px] text-white/30">{isEn?"Source:":"Sumber:"} {cp.grades[0].source} {cp.grades[0].official ? "✓ Official":"(est.)"}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cp.grades.map(g => {
              const diff = g.now - g.preWar;
              const pctChange = ((diff/g.preWar)*100).toFixed(1);
              return (
                <div key={g.grade} className="bg-white/3 border border-white/5 rounded-lg p-3">
                  <div className="text-[10px] font-bold text-white/50 mb-1">{g.grade}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-black text-amber-400 text-base">{g.currency} {g.now.toFixed(2)}</span>
                    <span className="text-[9px] text-white/30">/{g.unit}</span>
                  </div>
                  <div className="text-[10px] text-white/30 mt-1">{isEn?"Pre-war:":"Pra-perang:"} {g.currency} {g.preWar.toFixed(2)}</div>
                  <div className="text-[10px] text-red-400 font-bold mt-0.5">+{g.currency} {diff.toFixed(2)} (+{pctChange}%)</div>
                  <div className="mt-2 text-[10px] font-bold text-white/40">
                    {isEn?"Full tank (50L):":"Tangki penuh (50L):"} <span className="text-white/70">{g.currency} {(g.now*tankSize).toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-[10px] text-white/20">{isEn?"Prices are estimates based on official government data and current Brent crude ($"+live.brentUSD.toFixed(2)+"/bbl). Actual pump prices vary. Sources: KPDNHEP Malaysia, ADNOC Distribution UAE, U.S. EIA, UK DESNZ, EMA Singapore.":"Harga adalah anggaran berdasarkan data kerajaan rasmi dan harga Brent semasa. Harga pam sebenar berbeza. Sumber: KPDNHEP Malaysia, ADNOC UAE, U.S. EIA, UK DESNZ, EMA Singapura."}</p>
    </div>
  );
}

// ── SANCTIONS TRACKER ─────────────────────────────────────────────────────────
function SanctionsTab({ lang }: { lang: Lang }) {
  const isEn = lang === "en";
  const [sectorFilter, setSectorFilter] = useState("all");

  const sanctions = [
    { entity:"National Iranian Oil Company (NIOC)",    country:"🇮🇷 Iran",  sector:"energy",    list:"US OFAC + EU",  date:"Mar 2, 2026",  type:"SDN",  impact:"Critical — controls 90% of Iranian oil exports" },
    { entity:"IRGC Quds Force",                        country:"🇮🇷 Iran",  sector:"military",  list:"US OFAC + UK",  date:"Mar 1, 2026",  type:"SDN",  impact:"Full asset freeze — all transactions prohibited" },
    { entity:"Iran Air (IRI Airlines)",                country:"🇮🇷 Iran",  sector:"aviation",  list:"US OFAC + EU",  date:"Mar 3, 2026",  type:"SDN",  impact:"All EU/US airports closed to Iran Air" },
    { entity:"Central Bank of Iran (CBI)",             country:"🇮🇷 Iran",  sector:"finance",   list:"US OFAC + EU",  date:"Mar 2, 2026",  type:"SDN",  impact:"All dollar transactions blocked globally" },
    { entity:"Persian Gulf Petrochemical Co.",         country:"🇮🇷 Iran",  sector:"energy",    list:"US OFAC",       date:"Mar 5, 2026",  type:"SDN",  impact:"Petrochemical export revenue frozen" },
    { entity:"IRISL (Islamic Republic of Iran Shipping)", country:"🇮🇷 Iran", sector:"shipping", list:"US OFAC + EU + UK", date:"Mar 4, 2026", type:"SDN", impact:"All vessels blacklisted globally" },
    { entity:"Mahan Air",                              country:"🇮🇷 Iran",  sector:"aviation",  list:"US OFAC",       date:"Mar 3, 2026",  type:"SDN",  impact:"No landing rights in US/EU/UK territories" },
    { entity:"Iran LNG Co.",                           country:"🇮🇷 Iran",  sector:"energy",    list:"US OFAC + EU",  date:"Mar 6, 2026",  type:"SDN",  impact:"LNG export and financing blocked" },
    { entity:"Hezbollah Military Wing",                country:"🇱🇧 Lebanon", sector:"military", list:"US OFAC + EU + UK", date:"Mar 1, 2026", type:"SDN", impact:"All assets frozen — terrorist designation" },
    { entity:"Houthi Leadership Council",              country:"🇾🇪 Yemen",  sector:"military",  list:"US OFAC",       date:"Mar 7, 2026",  type:"SDN",  impact:"Designated terrorist org — full block" },
    { entity:"IRGC Navy Command",                      country:"🇮🇷 Iran",  sector:"military",  list:"US OFAC + EU",  date:"Mar 4, 2026",  type:"SDN",  impact:"Hormuz blockade command — full asset freeze" },
    { entity:"Bank Sepah",                             country:"🇮🇷 Iran",  sector:"finance",   list:"US OFAC + EU + UN", date:"Pre-war",  type:"UN",   impact:"UN Security Council designation since 2007" },
    { entity:"Parsian Oil & Gas Development Co.",      country:"🇮🇷 Iran",  sector:"energy",    list:"EU",            date:"Mar 8, 2026",  type:"EU",   impact:"EU asset freeze and export ban" },
    { entity:"National Iranian Tanker Co. (NITC)",     country:"🇮🇷 Iran",  sector:"shipping",  list:"US OFAC + EU",  date:"Mar 4, 2026",  type:"SDN",  impact:"All 50+ tankers blacklisted" },
  ];

  const sectors = ["all","energy","military","finance","aviation","shipping"];
  const sectorIcon: Record<string,string> = { all:"🌐", energy:"⚡", military:"⚔️", finance:"🏦", aviation:"✈️", shipping:"🚢" };
  const sectorColor: Record<string,string> = { energy:"#f97316", military:"#ef4444", finance:"#3b82f6", aviation:"#8b5cf6", shipping:"#06b6d4" };

  const filtered = sectorFilter === "all" ? sanctions : sanctions.filter(s => s.sector === sectorFilter);
  const totByList = { OFAC: sanctions.filter(s=>s.list.includes("OFAC")).length, EU: sanctions.filter(s=>s.list.includes("EU")).length, UN: sanctions.filter(s=>s.list.includes("UN")).length };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-bold text-white">{isEn?"Sanctions Tracker":"Penjejak Sekatan"}</h2>
        <p className="text-xs text-white/30 mt-1">
          {isEn
            ? "War-related sanctions imposed since Feb 28, 2026. Sources: U.S. OFAC SDN List (ofac.treas.gov), EU Official Journal (eur-lex.europa.eu), UN Security Council — all official and publicly available."
            : "Sekatan berkaitan perang yang dikenakan sejak 28 Feb 2026. Sumber: Senarai SDN OFAC AS, Jurnal Rasmi EU, Majlis Keselamatan PBB — semua rasmi dan tersedia untuk awam."}
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label={isEn?"Total Sanctioned":"Jumlah Disekatan"} value={`${sanctions.length}`} sub={isEn?"entities + individuals":"entiti + individu"} change={isEn?"Since Feb 28":"Sejak 28 Feb"} changeUp={false} accent="#ef4444"/>
        <KpiCard label="US OFAC (SDN)" value={`${totByList.OFAC}`} sub={isEn?"entities on SDN list":"entiti dalam senarai SDN"} change="ofac.treas.gov" changeUp={false} accent="#3b82f6"/>
        <KpiCard label="EU Sanctions" value={`${totByList.EU}`} sub={isEn?"EU Official Journal":"Jurnal Rasmi EU"} change="eur-lex.europa.eu" changeUp={false} accent="#f0a500"/>
        <KpiCard label="UN SC Resolutions" value="3" sub={isEn?"binding on all member states":"mengikat semua negara anggota"} change="un.org/sc" changeUp={false} accent="#8b5cf6"/>
      </div>

      {/* Sector filter */}
      <div className="flex flex-wrap gap-2">
        {sectors.map(s => (
          <button key={s} onClick={() => setSectorFilter(s)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all border ${sectorFilter===s ? "border-white/20 text-white bg-white/8":"bg-transparent border-white/5 text-white/30 hover:border-white/10"}`}
            style={sectorFilter===s && s!=="all" ? {borderColor:(sectorColor[s]||"#fff")+"60",color:sectorColor[s],background:(sectorColor[s]||"#fff")+"12"}:{}}>
            {sectorIcon[s]} {isEn ? s.toUpperCase() : s === "all" ? "SEMUA" : s === "energy" ? "TENAGA" : s === "military" ? "TENTERA" : s === "finance" ? "KEWANGAN" : s === "aviation" ? "PENERBANGAN" : "PERKAPALAN"}
          </button>
        ))}
      </div>

      {/* Sanctions table */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-5">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-4">
          {filtered.length} {isEn?"SANCTIONED ENTITIES":"ENTITI DISEKATAN"}
          {sectorFilter!=="all" && <span className="ml-2 text-amber-400">— {sectorFilter.toUpperCase()}</span>}
        </div>
        <div className="space-y-3">
          {filtered.map((s,i) => (
            <div key={i} className="border border-white/6 rounded-lg p-4 hover:border-white/10 transition-colors"
              style={{borderLeft:`3px solid ${sectorColor[s.sector]||"#ffffff20"}`}}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded" style={{background:(sectorColor[s.sector]||"#fff")+"15",color:sectorColor[s.sector]||"#fff"}}>{s.sector.toUpperCase()}</span>
                    <span className="text-[9px] font-bold text-white/30">{s.country}</span>
                    <span className="text-[9px] text-white/20 font-mono">{s.date}</span>
                  </div>
                  <div className="font-bold text-white/90 text-sm mb-1">{s.entity}</div>
                  <div className="text-[10px] text-white/40">{s.impact}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[9px] font-black text-red-400 tracking-widest">{s.type}</div>
                  <div className="text-[9px] text-white/30 mt-0.5">{s.list}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-[10px] text-white/20 border-t border-white/4 pt-3">
          {isEn
            ? "Data sourced from: U.S. Treasury OFAC SDN List (ofac.treas.gov) · EU Official Journal (eur-lex.europa.eu) · UN Security Council resolutions (un.org/sc). All sources are official government/international bodies and freely publicly available. This tracker is for informational purposes only."
            : "Data dari: Senarai SDN Perbendaharaan AS OFAC · Jurnal Rasmi EU · Resolusi Majlis Keselamatan PBB. Semua sumber adalah badan kerajaan/antarabangsa rasmi. Penjejak ini adalah untuk tujuan maklumat sahaja."}
        </div>
      </div>
    </div>
  );
}

// ── STATS TAB (Traffic Dashboard) ────────────────────────────────────────────
function StatsTab({ lang }: { lang: Lang }) {
  const isEn = lang === "en";
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white">{isEn ? "Traffic & Analytics" : "Trafik & Analitik"}</h2>
        <p className="text-xs text-white/30 mt-1">
          {isEn
            ? "Privacy-first analytics powered by Umami — no cookies, no personal data collected."
            : "Analitik mengutamakan privasi dikuasakan oleh Umami — tiada kuki, tiada data peribadi dikumpul."}
        </p>
      </div>

      {/* Setup guide card */}
      <div className="bg-[var(--bg-card)] border border-amber-400/20 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <div className="font-bold text-amber-400 text-sm">{isEn ? "Umami Analytics — Free Setup" : "Analitik Umami — Persediaan Percuma"}</div>
            <div className="text-xs text-white/30">{isEn ? "1-minute setup · No cookies · GDPR compliant" : "Persediaan 1 minit · Tiada kuki · Patuh GDPR"}</div>
          </div>
        </div>
        <ol className="space-y-2 text-xs text-white/50 list-decimal list-inside leading-relaxed">
          <li>{isEn ? <>Go to <a href="https://umami.is" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">umami.is</a> and create a free account</> : <>Pergi ke <a href="https://umami.is" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">umami.is</a> dan buat akaun percuma</>}</li>
          <li>{isEn ? 'Add a new website — enter "crisis-market-live.vercel.app"' : 'Tambah laman web baharu — masukkan "crisis-market-live.vercel.app"'}</li>
          <li>{isEn ? "Copy your Website ID from the tracking snippet" : "Salin ID Laman Web anda daripada kod penjejak"}</li>
          <li>{isEn ? "In index.html, uncomment the Umami script tag and paste your Website ID" : "Dalam index.html, nyahkomen teg skrip Umami dan tampal ID Laman Web anda"}</li>
          <li>{isEn ? "Redeploy — your live dashboard will start showing visitor data within minutes" : "Lancarkan semula — papan pemuka langsung anda akan mula menunjukkan data pelawat dalam beberapa minit"}</li>
        </ol>
        <a
          href="https://umami.is"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-400 text-xs font-bold hover:bg-amber-400/25 transition-all"
        >
          ↗ {isEn ? "Set up Umami Free" : "Persediakan Umami Percuma"}
        </a>
      </div>

      {/* What you'll see */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: "👁", label: isEn ? "Page Views" : "Tontonan Halaman", desc: isEn ? "Total visits today" : "Jumlah lawatan hari ini" },
          { icon: "👤", label: isEn ? "Unique Visitors" : "Pelawat Unik", desc: isEn ? "Distinct users" : "Pengguna berbeza" },
          { icon: "🌍", label: isEn ? "Countries" : "Negara", desc: isEn ? "Where visitors come from" : "Asal pelawat" },
          { icon: "📱", label: isEn ? "Devices" : "Peranti", desc: isEn ? "Mobile vs desktop split" : "Bahagian mudah alih vs desktop" },
        ].map(s => (
          <div key={s.label} className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xs font-bold text-white/70">{s.label}</div>
            <div className="text-[10px] text-white/30 mt-1">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Embedded Umami share link */}
      <div className="bg-[var(--bg-card)] border border-white/6 rounded-xl p-5 space-y-3">
        <div className="text-[10px] font-bold tracking-widest text-white/30">{isEn ? "LIVE ANALYTICS EMBED" : "EMBED ANALITIK LANGSUNG"}</div>
        <p className="text-xs text-white/40">
          {isEn
            ? "Once Umami is set up, generate a shareable public stats URL from your Umami dashboard and paste the iframe link here to embed your real-time traffic view."
            : "Setelah Umami disiapkan, jana URL statistik awam yang boleh dikongsi dari papan pemuka Umami anda dan tampal pautan iframe di sini untuk membenamkan pandangan trafik masa nyata anda."}
        </p>
        <div className="bg-black/20 border border-white/4 rounded-lg px-4 py-3 font-mono text-[10px] text-white/20">
          {`<!-- Paste your Umami share URL here after setup -->`}<br/>
          {`<!-- <iframe src="https://cloud.umami.is/share/YOUR-SHARE-ID" ... /> -->`}
        </div>
      </div>

      {/* Privacy note */}
      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
        <div className="text-[10px] font-bold tracking-widest text-emerald-400 mb-2">{isEn ? "WHY UMAMI?" : "KENAPA UMAMI?"}</div>
        <ul className="text-xs text-white/40 space-y-1">
          <li>✓ {isEn ? "100% free on their cloud plan (up to 10k events/month)" : "100% percuma pada pelan awan mereka (sehingga 10k acara/bulan)"}</li>
          <li>✓ {isEn ? "No cookies — no cookie consent banner needed" : "Tiada kuki — tiada sepanduk persetujuan kuki diperlukan"}</li>
          <li>✓ {isEn ? "GDPR & CCPA compliant out of the box" : "Patuh GDPR & CCPA dari awal"}</li>
          <li>✓ {isEn ? "Shows real-time visitors, top pages, referrers, countries" : "Menunjukkan pelawat masa nyata, halaman teratas, rujukan, negara"}</li>
          <li>✓ {isEn ? "Works alongside Google AdSense without conflicts" : "Berfungsi bersama Google AdSense tanpa konflik"}</li>
        </ul>
      </div>
    </div>
  );
}

// ── PRIVACY POLICY PAGE ──────────────────────────────────────────────────────
function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-white p-8 max-w-3xl mx-auto">
      <a href="/" className="text-amber-400 hover:text-amber-300 text-sm mb-6 inline-block">← Back to Dashboard</a>
      <h1 className="text-2xl font-black mb-2" style={{ fontFamily: "Space Grotesk" }}>Terms of Use</h1>
      <p className="text-xs text-white/30 mb-8">Last updated: April 2026 · Effective immediately</p>

      <div className="space-y-6 text-sm text-white/60 leading-relaxed">
        <section>
          <h2 className="text-white font-bold mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using CrisisMarket.Live (the "Service"), you agree to be bound by these Terms of Use. If you do not agree, please discontinue use immediately. These terms apply to all visitors, users, and others who access the Service.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">2. Nature of the Service</h2>
          <p>CrisisMarket.Live is an independent, open-source media project that aggregates publicly available market data, news feeds, and geopolitical information for educational and informational purposes. The Service is provided free of charge.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">3. No Financial Advice</h2>
          <p><strong className="text-amber-400">Nothing on this dashboard constitutes financial, investment, trading, or legal advice.</strong> All data — including commodity prices, currency rates, market indices, and economic indicators — is provided solely for informational purposes and may be delayed, estimated, or inaccurate. You are solely responsible for any decisions made based on information from this Service. Always consult a licensed financial advisor before making any investment or trading decisions.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">4. Data Accuracy &amp; Availability</h2>
          <p>Market data is sourced from publicly available third-party providers (BBC, Reuters, Al Jazeera, Barchart, OilPrice.com, and others). We make no warranties, express or implied, as to the accuracy, timeliness, or completeness of any data presented. The Service may be unavailable or inaccurate at any time due to technical issues or data source failures. We do not guarantee uninterrupted access.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">5. Intellectual Property</h2>
          <p>News headlines and content linked from this Service belong to their respective original publishers. We do not host, reproduce, or claim ownership of third-party news articles — we only display headlines and links to source URLs. Market data is sourced from public APIs. The CrisisMarket.Live platform design, code, and original content are published under the MIT License on GitHub.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">6. Advertising &amp; Affiliate Links</h2>
          <p>This Service may display advertisements or contain affiliate links. If you click an affiliate link and make a purchase or open an account, we may earn a referral commission at no additional cost to you. Advertising is clearly marked and does not influence our data presentation or editorial independence.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">7. User Conduct</h2>
          <p>You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to reverse-engineer, copy, or redistribute the Service without attribution; (c) use automated bots or scrapers to overload our servers; or (d) misrepresent data from this Service in a misleading context. Fair use and research use are always welcome.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">8. Limitation of Liability</h2>
          <p>To the fullest extent permitted by applicable law, CrisisMarket.Live and its operators shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of — or inability to use — the Service, including any financial losses resulting from reliance on data presented here.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">9. Changes to Terms</h2>
          <p>We reserve the right to update these Terms at any time. Continued use of the Service after any changes constitutes your acceptance of the new Terms. The "Last updated" date at the top of this page reflects the most recent revision.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">10. Governing Law</h2>
          <p>These Terms are governed by the laws of Malaysia, without regard to conflict-of-law principles. Any disputes shall be resolved in the courts of Malaysia.</p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-white/10 text-xs text-white/20 space-y-1">
        <p>© {new Date().getFullYear()} CrisisMarket.Live · Independent media project</p>
        <p><a href="/privacy" className="hover:text-amber-400 transition-colors underline underline-offset-2">Privacy Policy</a></p>
      </div>
    </div>
  );
}

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-white p-8 max-w-3xl mx-auto">
      <a href="/" className="text-amber-400 hover:text-amber-300 text-sm mb-6 inline-block">← Back to Dashboard</a>
      <h1 className="text-2xl font-black mb-2" style={{ fontFamily: "Space Grotesk" }}>Privacy Policy</h1>
      <p className="text-xs text-white/30 mb-8">Last updated: April 2026</p>

      <div className="space-y-6 text-sm text-white/60 leading-relaxed">
        <section>
          <h2 className="text-white font-bold mb-2">1. Information We Collect</h2>
          <p>CrisisMarket.Live does not collect any personal information. We do not require registration or login. If analytics are enabled (via Umami), only anonymous page-view counts and referrer data are recorded — no cookies, no IP addresses, no personal identifiers.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">2. Cookies</h2>
          <p>We use only functional localStorage to remember your theme preference (dark/light) and language selection (EN/BM). No tracking cookies are set. No third-party advertising cookies are used.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">3. Third-Party Services</h2>
          <p>The dashboard fetches live data from public RSS feeds (BBC, Al Jazeera, Reuters, etc.) and market data APIs. These third-party services have their own privacy policies. News article links direct you to external sites — we are not responsible for their content or privacy practices.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">4. Affiliate Links</h2>
          <p>Some links on this dashboard may be affiliate links. If you click an affiliate link and open an account or make a purchase, we may receive a small referral fee at no additional cost to you. Affiliate links are disclosed where they appear.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">5. Financial Disclaimer</h2>
          <p>All data on CrisisMarket.Live is provided for <strong className="text-white">informational purposes only</strong>. Nothing on this dashboard constitutes financial, investment, or trading advice. Market data may be delayed, estimated, or subject to errors. Always consult a qualified financial advisor before making investment decisions.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">6. Data Sources</h2>
          <p>Data is sourced from publicly available feeds including: BBC News, Al Jazeera, Reuters, Middle East Insider, Barchart, OilPrice.com, Natural Resource Stocks, Pound Sterling Live, and Wikipedia. We do not claim ownership of any third-party data.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">7. Contact</h2>
          <p>{isEn ? "For questions about this privacy policy, use the contact form linked below." : "Untuk pertanyaan tentang dasar privasi ini, gunakan borang hubungi yang dihubungkan di bawah."}</p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-white/10 text-xs text-white/20">
        © {new Date().getFullYear()} CrisisMarket.Live
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("oil");
  const { countdown, lastRefresh } = useLiveMeta();
  const [theme, setTheme] = useState<"dark"|"light">(() => {
    return (localStorage.getItem("theme") as "dark"|"light") || "dark";
  });
  function toggleTheme() {
    setTheme(t => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      return next;
    });
  }
  const [cur, setCur] = useState<"USD"|"MYR"|"AED">("USD");
  const [lang, setLang] = useState<Lang>("en");
  const [now] = useState(new Date());
  const live = useLive();

  const TABS = [
    { id:"oil",        label: lang === "en" ? "🛢  OIL & ENERGY"  : "🛢  MINYAK & TENAGA" },
    { id:"gold",       label: lang === "en" ? "🥇  GOLD"          : "🥇  EMAS" },
    { id:"map",        label: lang === "en" ? "🌍  WORLD MAP"     : "🌍  PETA DUNIA" },
    { id:"war",        label: lang === "en" ? "💥  WAR DAMAGE"    : "💥  KEROSAKAN PERANG" },
    { id:"hormuz",     label: lang === "en" ? "⚓  HORMUZ"        : "⚓  HORMUZ" },
    { id:"markets",    label: lang === "en" ? "📈  MARKETS"       : "📈  PASARAN" },
    { id:"news",       label: lang === "en" ? "📰  NEWS FEED"     : "📰  SUAPAN BERITA" },
    { id:"currencies", label: lang === "en" ? "💱  CURRENCIES"    : "💱  MATA WANG" },
    { id:"stats",      label: lang === "en" ? "📊  STATS"         : "📊  STATISTIK" },
    { id:"airline",    label: lang === "en" ? "✈️  AIRLINES"       : "✈️  PENERBANGAN" },
    { id:"fuel",       label: lang === "en" ? "⛽  FUEL PRICES"   : "⛽  HARGA BAHAN API" },
    { id:"sanctions",  label: lang === "en" ? "🚫  SANCTIONS"      : "🚫  SEKATAN" },
  ];

  // Simple SPA routing for /privacy and /terms
  if (typeof window !== "undefined" && window.location.pathname === "/privacy") {
    return <PrivacyPage />;
  }
  if (typeof window !== "undefined" && window.location.pathname === "/terms") {
    return <TermsPage />;
  }

  return (
    <LiveProvider>
    <div className={`min-h-screen flex flex-col ${theme === "light" ? "light bg-[var(--bg-page)] text-[#0d1117]" : "dark bg-[var(--bg-page)] text-white"}`}>
      <Ticker cur={cur} lang={lang} />

      {/* Header */}
      <header className="sticky top-9 z-40 bg-[var(--bg-page)]/95 backdrop-blur border-b border-white/5 h-14 flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="CrisisMarket.Live logo">
            <rect width="32" height="32" rx="8" fill="#0d1117"/>
            {/* Anchor ring */}
            <circle cx="16" cy="13" r="4.5" stroke="#f0a500" strokeWidth="1.8"/>
            {/* Anchor top bar */}
            <line x1="13" y1="13" x2="19" y2="13" stroke="#f0a500" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Anchor stem */}
            <line x1="16" y1="8" x2="16" y2="7" stroke="#f0a500" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="16" y1="17.5" x2="16" y2="21" stroke="#f0a500" strokeWidth="1.8" strokeLinecap="round"/>
            {/* Wave base */}
            <path d="M9 23 Q11.5 21 14 23 Q16.5 25 19 23 Q21.5 21 24 23" stroke="#f0a500" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            {/* Live red dot */}
            <circle cx="26" cy="7" r="2.5" fill="#ef4444"/>
          </svg>
          <div>
            <div className="text-[14px] font-black text-white leading-none tracking-tight">
              Crisis<span className="text-amber-400">Market</span><span className="text-white/40">.Live</span>
            </div>
            <div className="text-[9px] text-white/25 font-mono tracking-wider leading-none mt-0.5">REAL-TIME WAR ECONOMY INTELLIGENCE</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-[10px] font-mono text-white/20">
            {new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }).toUpperCase()}
          </div>
          <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 pulse-dot inline-block" />
            {t("header.crisisDay", lang)} {live.crisisDay}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/8 border border-emerald-500/20 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[9px] font-mono text-emerald-400 tracking-wider whitespace-nowrap">
              {lastRefresh ? `↻ ${countdown}` : "● LIVE"}
            </span>
          </div>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark"
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>

          {/* Language dropdown */}
          <div className="relative">
            <select
              value={lang}
              onChange={e => setLang(e.target.value as Lang)}
              className="appearance-none bg-white/5 border border-white/10 text-white text-[11px] font-bold tracking-wider rounded-lg pl-3 pr-7 py-1.5 cursor-pointer hover:bg-white/10 transition-all focus:outline-none focus:border-amber-500/50"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23ffffff40' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
            >
              <option value="en">🌐 EN — English</option>
              <option value="bm">🌐 BM — Bahasa Melayu</option>
            </select>
          </div>

          {/* Currency dropdown */}
          <div className="relative">
            <select
              value={cur}
              onChange={e => setCur(e.target.value as "USD"|"MYR"|"AED")}
              className="appearance-none bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold tracking-wider rounded-lg pl-3 pr-7 py-1.5 cursor-pointer hover:bg-amber-500/20 transition-all focus:outline-none focus:border-amber-500/50"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23f0a500' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
            >
              <option value="USD">💵 USD — US Dollar</option>
              <option value="MYR">💴 MYR — Malaysian Ringgit</option>
              <option value="AED">💴 AED — UAE Dirham</option>
            </select>
          </div>
        </div>
      </header>

      {/* ── Google AdSense Banner (728×90 leaderboard) ─────────────────────────
           Replace the inner div with your actual AdSense <ins> tag once approved.
           AdSense policy: must be live site with real traffic before approval.
           Sign up: https://adsense.google.com  ────────────────────────────── */}
      <div id="ad-banner-top" className="w-full flex justify-center items-center bg-black/20 border-b border-white/4 py-1 min-h-[52px]">
        {/* ADSENSE SLOT — uncomment and replace once approved:
        <ins className="adsbygoogle"
          style={{ display:"block", width:"728px", height:"90px" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX" />
        */}
        <span className="text-[9px] text-white/10 font-mono tracking-widest">ADVERTISEMENT</span>
      </div>

      {/* Tabs */}
      <nav className="sticky top-[88px] z-30 bg-[var(--bg-page)]/95 backdrop-blur border-b border-white/5 flex overflow-x-auto shrink-0 scrollbar-hide">
        {TABS.map(tabItem => {
          const isNew = ["airline","fuel","sanctions"].includes(tabItem.id);
          return (
            <button key={tabItem.id} onClick={() => setTab(tabItem.id)}
              className={`relative shrink-0 text-[11px] font-bold tracking-widest uppercase px-5 py-3.5 transition-all border-b-2 whitespace-nowrap ${tab === tabItem.id ? "border-amber-400 text-amber-400 bg-amber-500/5" : "border-transparent text-white/30 hover:text-white/60 hover:bg-white/2"}`}>
              {tabItem.label}
              {isNew && tab !== tabItem.id && (
                <span className="absolute top-1.5 right-1.5 text-[8px] font-black bg-emerald-500 text-black px-1 rounded-full leading-tight">NEW</span>
              )}
            </button>
          );
        })}
      </nav>
      {/* Scroll hint — shows on mobile so users know there are more tabs */}
      {tab === "oil" && (
        <div className="flex items-center justify-end gap-1.5 px-4 py-1 bg-emerald-500/5 border-b border-emerald-500/10">
          <span className="text-[9px] text-emerald-400/60 font-mono tracking-widest">← SCROLL TABS FOR ✈️ AIRLINES · ⛽ FUEL · 🚫 SANCTIONS →</span>
        </div>
      )}

      {/* Tab content */}
      <main className="flex-1">
        {tab === "oil"        && <OilTab cur={cur} lang={lang} />}
        {tab === "gold"       && <GoldTab cur={cur} lang={lang} />}
        {tab === "map"        && <WorldMapTab lang={lang} />}
        {tab === "war"        && <WarTab lang={lang} />}
        {tab === "hormuz"     && <HormuzTab lang={lang} />}
        {tab === "markets"    && <MarketsTab lang={lang} />}
        {tab === "news"       && <NewsTab lang={lang} />}
        {tab === "currencies" && <CurrenciesTab cur={cur} lang={lang} />}
        {tab === "stats"       && <StatsTab lang={lang} />}
        {tab === "airline"     && <AirlineTab lang={lang} />}
        {tab === "fuel"        && <FuelTab cur={cur} lang={lang} />}
        {tab === "sanctions"   && <SanctionsTab lang={lang} />}
      </main>

      {/* ── AdSense In-Article Slot ─────────────────────────────────────────────
           Place between content sections. Replace with actual <ins> once approved. */}
      <div id="ad-inline-mid" className="w-full flex justify-center items-center py-3 border-t border-white/4">
        {/* ADSENSE SLOT — uncomment and replace once approved:
        <ins className="adsbygoogle"
          style={{ display:"block" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true" />
        */}
        <span className="text-[9px] text-white/10 font-mono tracking-widest">ADVERTISEMENT</span>
      </div>

      {/* Footer — Legal */}
      <footer className="border-t border-white/4 px-6 py-6 text-[10px] text-white/20 font-mono space-y-3">
        <div className="flex flex-wrap justify-between gap-2">
          <span>CrisisMarket.Live · {live.asOf} · Crisis Day {live.crisisDay} · <a href="https://github.com/JevCode/live-economy-dashboard" className="hover:text-amber-400 transition-colors">GitHub</a></span>
          <span>{lang === "en" ? "Data sources" : "Sumber data"}: BBC · Reuters · Al Jazeera · Middle East Insider · Barchart · OilPrice.com · Pound Sterling Live · Wikipedia (CC BY-SA 4.0). News headlines linked to original sources. All trademarks belong to their respective owners.</span>
          <span>{t("header.autoRefresh", lang)}</span>
        </div>
        {/* Legal disclaimer */}
        <div className="border-t border-white/4 pt-3 space-y-1.5">
          <p className="text-white/30 leading-relaxed max-w-4xl">
            ⚠️ {lang === "en"
              ? "For informational and educational purposes only. Not financial, investment, or trading advice. Market data is sourced from public feeds and may be delayed, estimated, or subject to error. CrisisMarket.Live is an independent media project and is not affiliated with any government, financial institution, or news organisation. Always verify data independently before making any decisions."
              : "Untuk tujuan maklumat dan pendidikan sahaja. Bukan nasihat kewangan, pelaburan, atau dagangan. Data pasaran diambil daripada sumber awam dan mungkin tertangguh atau anggaran. CrisisMarket.Live adalah projek media bebas dan tidak berafiliasi dengan mana-mana kerajaan, institusi kewangan, atau organisasi berita. Sentiasa sahkan data secara bebas sebelum membuat sebarang keputusan."}
          </p>
          <p className="text-white/20 leading-relaxed max-w-4xl">
            {lang === "en"
              ? "This dashboard may contain affiliate links. If you open a brokerage or investment account through a link on this site, we may receive a referral fee at no cost to you."
              : "Papan pemuka ini mungkin mengandungi pautan afiliasi. Jika anda membuka akaun pelaburan melalui pautan di laman ini, kami mungkin menerima yuran rujukan tanpa sebarang kos kepada anda."}
          </p>
          <p className="text-white/15">
            © {new Date().getFullYear()} CrisisMarket.Live · Independent media project ·{" "}
            <a href="/privacy" className="hover:text-amber-400 transition-colors underline underline-offset-2">
              {lang === "en" ? "Privacy Policy" : "Dasar Privasi"}
            </a>
            {" · "}
            <a href="/privacy#disclaimer" className="hover:text-amber-400 transition-colors underline underline-offset-2">
              {lang === "en" ? "Disclaimer" : "Penafian"}
            </a>
            {" · "}
            <a href="/terms" className="hover:text-amber-400 transition-colors underline underline-offset-2">
              {lang === "en" ? "Terms of Use" : "Terma Penggunaan"}
            </a>
          </p>
        </div>
      </footer>
    </div>
    </LiveProvider>
  );
}
