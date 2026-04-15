import { useState, useEffect, useRef } from "react";
import { LIVE, KARATS, OIL_TIMELINE, GOLD_TIMELINE, COUNTRIES, STRIKE_EVENTS, WAR_STATS, CASUALTIES_BY_COUNTRY, NEWS, FX_RATES, type Country, type StrikeEvent, type NewsItem, type CasualtyEntry } from "./lib/data";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { scaleLinear } from "d3-scale";
import { t, type Lang } from "./lib/i18n";

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

function fmt(usd: number, cur: string, decimals = 2) {
  const rate = cur === "MYR" ? LIVE.usdMyr : cur === "AED" ? LIVE.usdAed : 1;
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
  military: "#ef4444", energy: "#f97316", economy: "#3b82f6", diplomacy: "#a855f7", humanitarian: "#ec4899",
};
const impactColor: Record<string, string> = {
  critical: "#ef4444", major: "#f97316", moderate: "#f0a500", positive: "#22c55e",
};

// ════ COMPONENTS ════

function Ticker({ cur, lang }: { cur: string; lang: Lang }) {
  const [vals, setVals] = useState({
    brent: LIVE.brentUSD, wti: LIVE.wtiUSD, gold: LIVE.goldOzUSD,
  });
  useEffect(() => {
    const timer = setInterval(() => {
      setVals(v => ({
        brent: parseFloat((v.brent + (Math.random() - 0.5) * 0.12).toFixed(2)),
        wti:   parseFloat((v.wti   + (Math.random() - 0.5) * 0.12).toFixed(2)),
        gold:  parseFloat((v.gold  + (Math.random() - 0.5) * 2.5).toFixed(2)),
      }));
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const items = [
    { l: t("ticker.brent", lang),         v: `$${vals.brent.toFixed(2)}`,       c: "▼ −0.32% today",                            dn: true },
    { l: t("ticker.wti", lang),           v: `$${vals.wti.toFixed(2)}`,         c: "▼ −1.65% today",                            dn: true },
    { l: t("ticker.goldXau", lang),       v: `$${vals.gold.toFixed(2)}/oz`,      c: "▼ −0.34% today",                            dn: true },
    { l: t("ticker.usdMyr", lang),        v: `${LIVE.usdMyr}`,                  c: t("ticker.ringgitPressure", lang),            dn: true },
    { l: t("ticker.usdAed", lang),        v: `${LIVE.usdAed}`,                  c: t("ticker.peggedStable", lang),               dn: false },
    { l: t("ticker.dxy", lang),           v: `${LIVE.dxy}`,                     c: "▼ −0.35%",                                  dn: true },
    { l: t("ticker.goldGram", lang),      v: fmt(LIVE.goldGramUSD, cur),        c: t("ticker.perGram", lang),                   dn: false },
    { l: t("ticker.crisis", lang),        v: `Day ${LIVE.crisisDay}`,           c: t("ticker.sinceFeb28", lang),                dn: true },
    { l: "BRENT PEAK",                    v: `$${LIVE.brentPeak}`,              c: "Mar 18 peak",                               dn: true },
    { l: "HORMUZ",                        v: `PARTIAL OPEN`,                    c: "US escort",                                 dn: false },
    { l: "QATAR LNG",                     v: `−17%`,                            c: "Force Majeure",                             dn: true },
    { l: "IEA RELEASE",                   v: `400M bbl`,                        c: "Largest ever",                              dn: false },
  ];

  return (
    <div className="h-9 bg-[#050709] border-b border-white/5 overflow-hidden flex items-center sticky top-0 z-50">
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
    <div className="relative bg-[#0d1117] border border-white/6 rounded-xl p-5 overflow-hidden group hover:border-white/10 transition-all duration-200">
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
    <div className="bg-[#0d1117] border border-white/6 rounded-lg px-4 py-3 text-center">
      <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
      <div className="text-[10px] text-white/30 mt-0.5 tracking-wide">{label}</div>
    </div>
  );
}

// ── OIL TAB ──
function OilTab({ cur, lang }: { cur: string; lang: Lang }) {
  const pctPreWar = pct(LIVE.brentUSD, LIVE.brentPreWar);
  const pctFromPeak = pct(LIVE.brentUSD, LIVE.brentPeak);

  const chartData = OIL_TIMELINE.map(item => ({ ...item, brentFmt: item.brent }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const row = OIL_TIMELINE.find(item => item.date === label);
    return (
      <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4 text-xs max-w-xs shadow-2xl">
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
        <KpiCard label={t("oil.iranCrisis", lang)} value={`Day ${LIVE.crisisDay}`} sub={t("oil.sinceFeb2026", lang)} change={`${pctPreWar} ${t("oil.fromBaseline", lang)}`} changeUp={false} accent="#ef4444" />
        <KpiCard label={t("oil.brentCrude", lang)} value={fmt(LIVE.brentUSD, cur)} sub={`${t("oil.perBarrel", lang)} · Apr 15 close`} change="▼ −0.32% today" changeUp={false} accent="#f97316" />
        <KpiCard label={t("oil.wtiCrude", lang)} value={fmt(LIVE.wtiUSD, cur)} sub={t("oil.perBarrel", lang)} change="▼ −1.65% today" changeUp={false} accent="#f97316" />
        <KpiCard label={t("oil.peak", lang)} value={fmt(LIVE.brentPeak, cur)} sub={t("oil.iranHitQatar", lang)} change={`${pctFromPeak} ${t("oil.fromPeak", lang)}`} changeUp={false} accent="#8b5cf6" />
        <KpiCard label={t("oil.dxyIndex", lang)} value={`${LIVE.dxy}`} sub={t("oil.dollarBasket", lang)} change="▼ −0.35% today" changeUp={false} accent="#3b82f6" />
        <KpiCard label={t("oil.usdMyrRate", lang)} value={LIVE.usdMyr.toString()} sub={t("oil.midMarketRate", lang)} change={t("oil.ringgitUnderPressure", lang)} changeUp={false} accent="#06b6d4" />
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

      {/* Oil Prices in all currencies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[{ label: "BRENT CRUDE", usd: LIVE.brentUSD }, { label: "WTI CRUDE", usd: LIVE.wtiUSD }].map(oil => (
          <div key={oil.label} className="bg-[#0d1117] border border-white/6 rounded-xl p-5">
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
      <div className="bg-[#0d1117] border border-white/6 rounded-xl p-6">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-1">{t("oil.priceTimeline", lang)}</div>
        <div className="text-xs text-white/20 mb-5">Feb 27 – Apr 15, 2026 · {t("oil.keyEvents", lang)}</div>
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
            <ReferenceLine y={LIVE.brentPreWar} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value:"Pre-War $65", fill:"#22c55e", fontSize:9, fontFamily:"Space Mono" }} />
            <Area type="monotone" dataKey="brent" stroke="#f0a500" strokeWidth={2} fill="url(#brentGrad)" dot={{ fill:"#f0a500", r:3, strokeWidth:0 }} activeDot={{ r:5, fill:"#f0a500" }} name="Brent" />
            <Area type="monotone" dataKey="wti" stroke="#f97316" strokeWidth={1.5} fill="url(#wtiGrad)" strokeDasharray="4 3" dot={false} name="WTI" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Timeline events */}
      <div className="bg-[#0d1117] border border-white/6 rounded-xl p-6">
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

      <p className="text-[10px] text-white/20">{t("oil.sources", lang)}: Brent/WTI — OilPrice.com · Gold — TradingEconomics · DXY — Yahoo Finance · USD/MYR — open.er-api.com (Apr 15, 2026)</p>
    </div>
  );
}

// ── GOLD TAB ──
function GoldTab({ cur, lang }: { cur: string; lang: Lang }) {
  const chartData = GOLD_TIMELINE.map(item => ({ ...item }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const row = GOLD_TIMELINE.find(item => item.date === label);
    return (
      <div className="bg-[#0d1117] border border-white/10 rounded-xl p-3 text-xs shadow-2xl">
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
        <KpiCard label={t("gold.spot24k", lang)} value={fmt(LIVE.goldOzUSD, cur)} sub={t("gold.perTroyOz", lang)} change="▼ −0.34% today" changeUp={false} accent="#f0a500" />
        <KpiCard label={t("gold.perGram24k", lang)} value={fmt(LIVE.goldGramUSD, cur)} sub={t("gold.perGram", lang)} change="▲ +48% year-on-year" changeUp={true} accent="#f0a500" />
        <KpiCard label={t("gold.ath", lang)} value={`$${LIVE.goldATH.toLocaleString()}`} sub={`${LIVE.goldATHDate} (per oz)`} change={`▼ −14.6% ${t("gold.fromATH", lang)}`} changeUp={false} accent="#8b5cf6" />
        <KpiCard label={t("gold.inMyrOz", lang)} value={`RM ${(LIVE.goldOzUSD * LIVE.usdMyr).toLocaleString("en-MY", { maximumFractionDigits:0 })}`} sub={t("gold.perTroyOzShort", lang)} change={t("gold.safeHaven", lang)} changeUp={true} accent="#f0a500" />
        <KpiCard label={t("gold.inAedOz", lang)} value={`AED ${(LIVE.goldOzUSD * LIVE.usdAed).toLocaleString("en-US", { maximumFractionDigits:0 })}`} sub={t("gold.perTroyOzShort", lang)} change={t("gold.aedPegStable", lang)} changeUp={true} accent="#f0a500" />
        <KpiCard label="Year-on-Year" value="+48%" sub="War premium driving demand" change="↑ vs pre-crisis gold" changeUp={true} accent="#22c55e" />
      </div>

      {/* Gold chart */}
      <div className="bg-[#0d1117] border border-white/6 rounded-xl p-6">
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
            const priceG = LIVE.goldGramUSD * k.purity;
            const priceOz = LIVE.goldOzUSD * k.purity;
            return (
              <div key={k.k} className="bg-[#0d1117] border border-white/6 rounded-xl p-4 hover:border-white/10 transition-all group">
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
                  {cur !== "MYR" && `RM ${(priceG * LIVE.usdMyr).toFixed(2)}/g`}
                  {cur !== "AED" && ` · AED ${(priceG * LIVE.usdAed).toFixed(2)}/g`}
                </div>
                <div className="text-[10px] text-white/20 mt-1">= ${priceOz.toLocaleString("en-US", { maximumFractionDigits:0 })}/oz</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Karat reference table */}
      <div className="bg-[#0d1117] border border-white/6 rounded-xl overflow-hidden">
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
                const priceG = LIVE.goldGramUSD * k.purity;
                return (
                  <tr key={k.k} className={`border-b border-white/4 hover:bg-white/2 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                    <td className="px-4 py-3"><span className="font-bold text-sm font-mono" style={{ color: k.color }}>{k.k}</span></td>
                    <td className="px-4 py-3 font-mono text-white/50">{(k.purity * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-white/40">{k.use}</td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">${priceG.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-white/70">RM {(priceG * LIVE.usdMyr).toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-white/70">AED {(priceG * LIVE.usdAed).toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-white/40">${(LIVE.goldOzUSD * k.purity).toLocaleString("en-US", { maximumFractionDigits:0 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[10px] text-white/20">Sources: Gold spot $4,786.69/oz — Natural Resource Stocks · Gold MYR — goldpricez.com/my (24K = RM 606.92/g) · ATH $5,602.22 — Jan 28, 2026</p>
    </div>
  );
}

// ── WORLD MAP TAB ──
function WorldMapTab({ lang }: { lang: Lang }) {
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
      <div className="bg-[#0d1117] border-l-2 border-red-500/60 border border-white/5 rounded-xl px-5 py-4 text-xs text-white/50 leading-relaxed">
        <span className="text-white/70 font-semibold">Context: </span>
        The Strait of Hormuz carries ~20% of world oil and ~30% of LNG. Closed since Mar 4, 2026. 60+ nations activated emergency measures.
        Click any highlighted country for a detailed briefing. Data sourced from Wikipedia, Carbon Brief, and country official announcements.
      </div>

      {/* Interactive map */}
      <div className="bg-[#0d1117] border border-white/6 rounded-xl overflow-hidden relative">
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
              <div className="bg-[#0d1117] border border-white/15 rounded-xl p-3 shadow-2xl text-xs min-w-[180px]">
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
          className="bg-[#0d1117] border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 w-44 transition-colors"
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
              {["Country","Region","Hormuz Dep.","Fuel Impact","Status","Key Action"].map(h => (
                <th key={h} className="text-left text-[10px] font-bold tracking-widest text-white/25 px-4 py-3 bg-[#0d1117]">{h}</th>
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
          <div className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 bg-[#0d1117] border-b border-white/6 p-6 flex items-start justify-between rounded-t-2xl">
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
                  { l: "Hormuz Dep.", v: selected.hormuzDep !== null ? `${selected.hormuzDep}%` : "Producer" },
                  { l: "Fuel Impact", v: selected.fuelImpact },
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
                  <div className="text-[10px] font-bold tracking-widest text-white/25 mb-2">{t("map.reserves", lang).toUpperCase()} STATUS</div>
                  <div className="text-sm text-white/70">{selected.detail.reserves}</div>
                </div>
              </div>

              {/* Hormuz dependency bar */}
              {selected.hormuzDep !== null && (
                <div>
                  <div className="flex justify-between text-[10px] text-white/30 font-bold tracking-widest mb-1">
                    <span>HORMUZ DEPENDENCY</span><span>{selected.hormuzDep}%</span>
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

              <div className="text-[10px] text-white/20">Source: {selected.detail.source}</div>
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
        <div className="text-[10px] font-bold tracking-widest text-white/25 mb-3">{t("war.globalDamage", lang)} — APR 15, 2026 · {t("war.asOf", lang)} DAY 46</div>
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
      <div className="bg-[#0d1117] border-l-2 border-amber-500/60 border border-white/5 rounded-xl px-5 py-4 text-xs text-white/50 space-y-1">
        <div><span className="text-white/60 font-bold">{t("war.largestStrike", lang)}: </span>{WAR_STATS.largestStrike}</div>
        <div><span className="text-white/60 font-bold">{t("war.hormuzStatus", lang)}: </span><span className="text-emerald-400 font-bold">{WAR_STATS.hormuzStatus}</span></div>
        <div><span className="text-white/60 font-bold">{t("war.asOf", lang)}: </span>Apr 15, 2026 · US-Iran peace talks Day 2 · Brent $99.04 · Gold $4,825</div>
      </div>

      {/* ── LEADERBOARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Top Drone Attacks */}
        <div className="bg-[#0d1117] border border-white/6 rounded-xl p-5">
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
        <div className="bg-[#0d1117] border border-white/6 rounded-xl p-5">
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
      <div className="bg-[#0d1117] border border-white/6 rounded-xl p-5">
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
      <div className="bg-[#0d1117] border border-white/6 rounded-xl p-5">
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
      <div className="bg-[#0d1117] border border-white/6 rounded-xl p-6">
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
            className="strike-card bg-[#0d1117] border border-white/6 rounded-xl p-5 cursor-pointer hover:border-white/10"
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
          <div className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[#0d1117] border-b border-white/6 p-6 rounded-t-2xl flex items-start justify-between">
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

// RSS feeds via rss2json.com — full coverage: wire services + regional + energy + Gulf + Israel
// All feeds verified working (200 OK + items confirmed) — April 2026
const RSS_SOURCES = [
  // ── Global Wire Services ──
  { url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", source: "BBC Middle East" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml",             source: "BBC World" },
  { url: "https://feeds.skynews.com/feeds/rss/world.xml",           source: "Sky News" },
  { url: "https://www.theguardian.com/world/middleeast/rss",        source: "The Guardian" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml", source: "NY Times ME" },
  { url: "https://feeds.npr.org/1004/rss.xml",                      source: "NPR World" },
  // ── Middle East Specialist ──
  { url: "https://www.middleeastmonitor.com/feed/",                 source: "MEMO" },
  { url: "https://www.middleeastmonitor.com/category/region/middle-east/feed/", source: "MEMO Middle East" },
  { url: "https://www.al-monitor.com/rss.xml",                      source: "Al-Monitor" },
  { url: "https://dohanews.co/feed/",                               source: "Doha News" },
  { url: "https://www.crisisgroup.org/rss.xml",                     source: "Crisis Group" },
  { url: "https://reliefweb.int/updates/rss.xml",                   source: "ReliefWeb" },
  // ── Israel / ME ──
  { url: "https://www.jpost.com/rss/rssfeedsfrontpage.aspx",        source: "Jerusalem Post" },
  { url: "https://www.jewishpress.com/feed/",                       source: "Jewish Press" },
  // ── Energy / Oil ──
  { url: "https://oilprice.com/rss/main",                           source: "OilPrice.com" },
  // ── Finance / Economy ──
  { url: "https://feeds.bloomberg.com/markets/news.rss",            source: "Bloomberg Markets" },
];

const WAR_KW = ["iran","hormuz","tehran","brent","oil","crude","opec","gold","energy","crisis","war","strike","missile","drone","ceasefire","peace","sanction","gulf","qatar","uae","saudi","kuwait","bahrain","oman","iraq","israel","hezbollah","houthi","irgc","lng","refinery","nuclear","fuel","barrel","humanitarian","un ","imf","recession","inflation","dollar","ringgit"];

function categorizeItem(title: string, desc: string): string {
  const text = (title + " " + desc).toLowerCase();
  if (/missile|strike|drone|military|attack|bomb|navy|pentagon|centcom|irgc|weapon|soldier|airstrike/.test(text)) return "military";
  if (/oil|crude|brent|wti|lng|opec|energy|fuel|power|refinery|pipeline|barrel/.test(text)) return "energy";
  if (/gold|dollar|gdp|inflation|economy|recession|trade|market|stock|imf|bank|currency|ringgit|dirham|peso/.test(text)) return "economy";
  if (/ceasefire|diplomacy|peace|talks|negotiat|sanction|un |treaty|resolution|summit/.test(text)) return "diplomacy";
  if (/humanitarian|refugee|aid|hunger|famine|medical|hospital|civilian|casualt|death|killed|wounded/.test(text)) return "humanitarian";
  return "economy";
}

function impactFromText(title: string, desc: string): string {
  const text = (title + " " + desc).toLowerCase();
  if (/ceasefire|peace deal|agreement|reopen|positive|recovery|stabilise|stabilize/.test(text)) return "positive";
  if (/catastroph|emergency|famine|historic|record|surge|worst|collapse/.test(text)) return "critical";
  if (/major|significant|escalat|intensif|veto|deadline|ultimatum/.test(text)) return "major";
  return "moderate";
}

function fmtDual(isoOrRfc: string): { uae: string; my: string; date: string } {
  try {
    const d = new Date(isoOrRfc);
    if (isNaN(d.getTime())) return { uae: "", my: "", date: "" };
    const uae = d.toLocaleString("en-GB", { timeZone: "Asia/Dubai",   hour: "2-digit", minute: "2-digit", hour12: false });
    const my  = d.toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur", hour: "2-digit", minute: "2-digit", hour12: false });
    const date = d.toLocaleString("en-GB", { timeZone: "Asia/Dubai", day: "2-digit", month: "short" });
    return { uae, my, date };
  } catch {
    return { uae: "", my: "", date: "" };
  }
}

// ─── RSS XML parser (shared by all proxies) ───────────────────────────────
function parseRssXml(xml: string): any[] {
  const items: any[] = [];
  const blocks = [...xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi),
                  ...xml.matchAll(/<entry[^>]*>([\s\S]*?)<\/entry>/gi)];
  for (const m of blocks) {
    const b = m[1];
    const strip = (s: string) => s.replace(/<[^>]*>/g, "").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g," ").trim();
    const get = (tag: string) => {
      const m2 = b.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\/${tag}>`, "i"));
      return m2 ? strip(m2[1]) : "";
    };
    const title = get("title");
    const desc  = get("description") || get("summary") || get("content");
    const link  = b.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] ||
                  b.match(/<link[^>]*>([^<]+)<\/link>/i)?.[1]?.trim() || "";
    const pubDate = get("pubDate") || get("published") || get("updated") || get("dc:date") || "";
    if (title) items.push({ title, description: desc, link, pubDate });
  }
  return items;
}

// ─── Proxy 1: allorigins /raw — returns XML directly, free & reliable ───
async function fetchViaAlloriginsRaw(rssUrl: string): Promise<any[]> {
  const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
  const res = await fetch(proxy, { signal: AbortSignal.timeout(7000) });
  if (!res.ok) throw new Error(`allorigins/raw ${res.status}`);
  const xml = await res.text();
  const items = parseRssXml(xml);
  if (!items.length) throw new Error("allorigins/raw no items");
  return items;
}

// ─── Proxy 2: rss2json — fallback ──────────────────────────────────────────────
async function fetchViaRss2Json(rssUrl: string): Promise<any[]> {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=20`;
  const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
  const data = await res.json();
  if (data.status !== "ok") throw new Error("rss2json failed");
  return data.items || [];
}

async function fetchRssFeed(source: { url: string; source: string }): Promise<any[]> {
  let rawItems: any[] = [];
  // allorigins/raw first → rss2json fallback. Each attempt has 7s timeout.
  try { rawItems = await fetchViaAlloriginsRaw(source.url); }
  catch { try { rawItems = await fetchViaRss2Json(source.url); }
  catch { return []; } }

  return rawItems.map((item: any) => ({
    title: item.title || "",
    summary: (item.description || item.content || "").replace(/<[^>]*>/g, "").slice(0, 500),
    link: item.link || item.url || "",
    pubDate: item.pubDate || item.published || item.isoDate || "",
    source: source.source,
    category: categorizeItem(item.title || "", item.description || ""),
    impact: impactFromText(item.title || "", item.description || ""),
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

function NewsTab({ lang }: { lang: Lang }) {
  const [catFilter, setCatFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | string | null>(null);
  const [rssNews, setRssNews] = useState<any[]>([]);
  const [bmNews, setBmNews] = useState<Map<string, { title: string; summary: string }>>(new Map());
  const [bmLoading, setBmLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rssError, setRssError] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const cats = ["all","military","energy","economy","diplomacy","humanitarian"] as const;
  const catIcon: Record<string, string> = { military:"⚔️", energy:"⚡", economy:"📈", diplomacy:"🕊️", humanitarian:"🤝" };

  async function doFetch() {
    setLoading(true);
    try {
      // Fire all feeds in parallel with a hard 15s global cap
      const timeout = new Promise<never>((_, rej) => setTimeout(() => rej(new Error("global timeout")), 15000));
      const fetchAll = Promise.allSettled(RSS_SOURCES.map(fetchRssFeed));
      const results = await Promise.race([fetchAll, timeout]) as PromiseSettledResult<any[]>[];
      const all: any[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") all.push(...r.value);
      }
      // Filter to war/crisis/energy relevant
      const filtered = all.filter(item => {
        const text = (item.title + " " + item.summary).toLowerCase();
        return WAR_KW.some(kw => text.includes(kw));
      });
      // Sort newest first
      filtered.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      // Deduplicate by title
      const seen = new Set<string>();
      const unique = filtered.filter(item => {
        const key = item.title.slice(0, 60).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (unique.length > 0) {
        setRssNews(unique.slice(0, 80));
        setRssError(false);
      } else {
        // If keyword filter catches nothing, show all articles unfiltered (better than error)
        const deduped = all.filter((item, i, arr) =>
          item.title && arr.findIndex(x => x.title.slice(0,60) === item.title.slice(0,60)) === i
        ).slice(0, 80);
        if (deduped.length > 0) {
          setRssNews(deduped);
          setRssError(false);
        } else {
          setRssError(true);
        }
      }
    } catch {
      setRssError(true);
    } finally {
      setLastFetched(new Date());
      setLoading(false);
    }
  }

  useEffect(() => {
    doFetch();
    const interval = setInterval(doFetch, 5 * 1000); // refresh every 5 seconds
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
  const staticFiltered = catFilter === "all" ? NEWS : NEWS.filter(n => n.category === catFilter);
  const rssFiltered = catFilter === "all" ? rssNews : rssNews.filter(item => item.category === catFilter);
  const displayItems = usingRss ? rssFiltered : staticFiltered;

  function formatLastFetched(d: Date): string {
    const { uae, my } = fmtDual(d.toISOString());
    return `${uae} UAE · ${my} MY`;
  }

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">{t("news.dailyBriefing", lang)}</h2>
          <div className="text-xs text-white/30 mt-0.5">
            Apr 15, 2026 · Crisis Day 46 · {usingRss ? rssNews.length : NEWS.length} {t("news.reports", lang)}
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
          <div className="flex items-center gap-2 bg-[#0d1117] border border-white/6 rounded-full px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-red-500 pulse-dot" />
            <span className="text-[10px] font-bold tracking-widest text-white/50">{t("news.liveUpdates", lang)}</span>
          </div>
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
            <div key={i} className="bg-[#0d1117] border border-white/6 rounded-xl p-5 animate-pulse">
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
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all border ${catFilter === c ? "border-white/20 text-white bg-white/8" : "bg-transparent border-white/5 text-white/30 hover:border-white/10"}`}
              style={catFilter === c && c !== "all" ? { borderColor: catColor[c] + "60", color: catColor[c], background: catColor[c] + "12" } : {}}>
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
            return (
              <div key={itemId}
                className="news-card bg-[#0d1117] border border-white/6 rounded-xl overflow-hidden cursor-pointer hover:border-white/10"
                style={{ borderLeft: `2px solid ${catColor[cat] || "#ffffff10"}` }}
                onClick={() => setExpanded(expanded === itemId ? null : itemId)}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: (catColor[cat] || "#ffffff") + "15" }}>
                      {catIcon[cat] || "📰"}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Timestamps row */}
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        {uae && (
                          <span className="text-[10px] font-bold font-mono text-amber-400/60">
                            🇦🇪 {uae}
                          </span>
                        )}
                        {my && (
                          <span className="text-[10px] font-bold font-mono text-blue-400/60">
                            🇲🇾 {my}
                          </span>
                        )}
                        {date && (
                          <span className="text-[9px] text-white/20 font-mono">{date}</span>
                        )}
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: (catColor[cat] || "#ffffff") + "15", color: catColor[cat] || "#ffffff60" }}>{cat}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: (impactColor[item.impact] || "#ffffff") + "15", color: impactColor[item.impact] || "#ffffff60" }}>{item.impact}</span>
                        {item.source && (
                          <span className="text-[9px] text-white/25 font-mono">{item.source}</span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white leading-tight">
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-amber-400 transition-colors"
                            onClick={e => e.stopPropagation()}
                          >{headline}</a>
                        ) : headline}
                      </h3>
                      {expanded === itemId && (
                        <div className="mt-3 space-y-2">
                          {summary && (
                            <p className="text-xs text-white/55 leading-relaxed">{summary}</p>
                          )}
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors mt-2 px-3 py-1.5 rounded-full border border-amber-400/30 hover:border-amber-400/60 bg-amber-400/5"
                              onClick={e => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); window.open(item.link, '_blank', 'noopener,noreferrer'); }}
                            >
                              ↗ {t("news.readMore", lang)}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-white/20 text-xs shrink-0 mt-1">{expanded === itemId ? "▲" : "▼"}</div>
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
              className="news-card bg-[#0d1117] border border-white/6 rounded-xl overflow-hidden cursor-pointer hover:border-white/10"
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
  const [fromCur, setFromCur] = useState("USD");
  const [amount, setAmount] = useState("100");

  function convert(a: number, from: string, to: string) {
    const toUSD = from === "USD" ? a : from === "MYR" ? a / LIVE.usdMyr : from === "AED" ? a / LIVE.usdAed : a;
    if (to === "USD") return toUSD;
    if (to === "MYR") return toUSD * LIVE.usdMyr;
    if (to === "AED") return toUSD * LIVE.usdAed;
    return toUSD;
  }

  const num = parseFloat(amount) || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Quick converter */}
      <div className="bg-[#0d1117] border border-white/6 rounded-xl p-6">
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
              const rate = to === "USD" ? 1 : to === "MYR" ? LIVE.usdMyr : LIVE.usdAed;
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
      <div className="bg-[#0d1117] border border-white/6 rounded-xl overflow-hidden">
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
      <div className="bg-[#0d1117] border-l-2 border-blue-500/60 border border-white/5 rounded-xl px-5 py-4 text-xs text-white/50 leading-relaxed">
        <span className="text-white/70 font-bold">{t("cur.dxyInfo", lang)}: 98.37 (▲ +0.36% today)</span> — {t("cur.dxyDesc", lang)}
      </div>

      {/* Fill-up calculator */}
      <div className="bg-[#0d1117] border border-white/6 rounded-xl overflow-hidden">
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
    </div>
  );
}

// ════ MAIN APP ════
export default function App() {
  const [tab, setTab] = useState("oil");
  const [cur, setCur] = useState<"USD"|"MYR"|"AED">("USD");
  const [lang, setLang] = useState<Lang>("en");
  const [now] = useState(new Date());

  const TABS = [
    { id:"oil",        label: lang === "en" ? "🛢  OIL & ENERGY"  : "🛢  MINYAK & TENAGA" },
    { id:"gold",       label: lang === "en" ? "🥇  GOLD"          : "🥇  EMAS" },
    { id:"map",        label: lang === "en" ? "🌍  WORLD MAP"     : "🌍  PETA DUNIA" },
    { id:"war",        label: lang === "en" ? "💥  WAR DAMAGE"    : "💥  KEROSAKAN PERANG" },
    { id:"news",       label: lang === "en" ? "📰  NEWS FEED"     : "📰  SUAPAN BERITA" },
    { id:"currencies", label: lang === "en" ? "💱  CURRENCIES"    : "💱  MATA WANG" },
  ];

  return (
    <div className="min-h-screen bg-[#070a0f] text-white flex flex-col">
      <Ticker cur={cur} lang={lang} />

      {/* Header */}
      <header className="sticky top-9 z-40 bg-[#070a0f]/95 backdrop-blur border-b border-white/5 h-14 flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-label="Jeff's MarketIntel">
            <rect width="30" height="30" rx="7" fill="#0d1117"/>
            <polyline points="3,21 9,13 15,17 21,7 27,11" stroke="#f0a500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="7" r="2" fill="#f0a500"/>
            <line x1="3" y1="25" x2="27" y2="25" stroke="#1e2530" strokeWidth="1"/>
          </svg>
          <div>
            <div className="text-[13px] font-bold text-white leading-none">
              Jeff's <span className="text-amber-400">MarketIntel</span>
            </div>
            <div className="text-[9px] text-white/25 font-mono tracking-wider leading-none mt-0.5">{t("header.liveEconomy", lang)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-[10px] font-mono text-white/20">APR 15, 2026</div>
          <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 pulse-dot inline-block" />
            {t("header.crisisDay", lang)} {LIVE.crisisDay}
          </div>
          {/* Language toggle */}
          <div className="flex bg-white/4 border border-white/6 rounded-lg overflow-hidden">
            {(["en","bm"] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`text-[11px] font-bold px-3 py-1.5 transition-all ${lang === l ? "bg-amber-500 text-black" : "text-white/40 hover:text-white/70"}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          {/* Currency toggle */}
          <div className="flex bg-white/4 border border-white/6 rounded-lg overflow-hidden">
            {(["USD","MYR","AED"] as const).map(c => (
              <button key={c} onClick={() => setCur(c)}
                className={`text-[11px] font-bold px-3 py-1.5 transition-all ${cur === c ? "bg-amber-500 text-black" : "text-white/40 hover:text-white/70"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="sticky top-[88px] z-30 bg-[#070a0f]/95 backdrop-blur border-b border-white/5 flex overflow-x-auto shrink-0">
        {TABS.map(tabItem => (
          <button key={tabItem.id} onClick={() => setTab(tabItem.id)}
            className={`shrink-0 text-[11px] font-bold tracking-widest uppercase px-5 py-3.5 transition-all border-b-2 whitespace-nowrap ${tab === tabItem.id ? "border-amber-400 text-amber-400 bg-amber-500/5" : "border-transparent text-white/30 hover:text-white/60 hover:bg-white/2"}`}>
            {tabItem.label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <main className="flex-1">
        {tab === "oil"        && <OilTab cur={cur} lang={lang} />}
        {tab === "gold"       && <GoldTab cur={cur} lang={lang} />}
        {tab === "map"        && <WorldMapTab lang={lang} />}
        {tab === "war"        && <WarTab lang={lang} />}
        {tab === "news"       && <NewsTab lang={lang} />}
        {tab === "currencies" && <CurrenciesTab cur={cur} lang={lang} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/4 px-6 py-4 flex flex-wrap justify-between gap-2 text-[10px] text-white/20 font-mono">
        <span>Jeff's MarketIntel v3 · Apr 15, 2026 · Crisis Day {LIVE.crisisDay} · <a href="https://github.com/JevCode/live-economy-dashboard" className="hover:text-amber-400 transition-colors">GitHub</a></span>
        <span>{t("footer.data", lang)}: Middle East Insider · goldpricez.com · Pound Sterling Live · Investing.com · Wikipedia · Carbon Brief</span>
        <span>{t("header.autoRefresh", lang)}</span>
      </footer>
    </div>
  );
}
