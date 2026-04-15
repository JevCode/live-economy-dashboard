import { useState, useEffect, useRef } from "react";
import { LIVE, KARATS, OIL_TIMELINE, GOLD_TIMELINE, COUNTRIES, STRIKE_EVENTS, WAR_STATS, NEWS, FX_RATES, type Country, type StrikeEvent, type NewsItem } from "./lib/data";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { scaleLinear } from "d3-scale";

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

function Ticker({ cur }: { cur: string }) {
  const [vals, setVals] = useState({
    brent: LIVE.brentUSD, wti: LIVE.wtiUSD, gold: LIVE.goldOzUSD,
  });
  useEffect(() => {
    const t = setInterval(() => {
      setVals(v => ({
        brent: parseFloat((v.brent + (Math.random() - 0.5) * 0.12).toFixed(2)),
        wti:   parseFloat((v.wti   + (Math.random() - 0.5) * 0.12).toFixed(2)),
        gold:  parseFloat((v.gold  + (Math.random() - 0.5) * 2.5).toFixed(2)),
      }));
    }, 2800);
    return () => clearInterval(t);
  }, []);

  const items = [
    { l: "BRENT CRUDE", v: `$${vals.brent.toFixed(2)}`, c: "▲ +3.7% today", dn: false },
    { l: "WTI CRUDE",   v: `$${vals.wti.toFixed(2)}`,   c: "▲ +4.4% today", dn: false },
    { l: "GOLD XAU",    v: `$${vals.gold.toFixed(2)}/oz`, c: "▲ +1.91% today", dn: false },
    { l: "USD/MYR",     v: `${LIVE.usdMyr}`,             c: "Ringgit pressure", dn: true },
    { l: "USD/AED",     v: `${LIVE.usdAed}`,             c: "Pegged stable", dn: false },
    { l: "DXY INDEX",   v: `${LIVE.dxy}`,                c: "▼ −0.35%", dn: true },
    { l: "GOLD/g 24K",  v: fmt(LIVE.goldGramUSD, cur),   c: `per gram`, dn: false },
    { l: "CRISIS DAY",  v: `Day ${LIVE.crisisDay}`,      c: "Since Feb 28", dn: true },
    { l: "BRENT PEAK",  v: `$${LIVE.brentPeak}`,         c: "Mar 18 peak", dn: true },
    { l: "HORMUZ",      v: `PARTIAL OPEN`,               c: "US escort", dn: false },
    { l: "QATAR LNG",   v: `−17%`,                       c: "Force Majeure", dn: true },
    { l: "IEA RELEASE", v: `400M bbl`,                   c: "Largest ever", dn: false },
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
function OilTab({ cur }: { cur: string }) {
  const pctPreWar = pct(LIVE.brentUSD, LIVE.brentPreWar);
  const pctFromPeak = pct(LIVE.brentUSD, LIVE.brentPeak);

  const chartData = OIL_TIMELINE.map(t => ({ ...t, brentFmt: t.brent }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const row = OIL_TIMELINE.find(t => t.date === label);
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
        <KpiCard label="Iran Crisis — Day" value={`Day ${LIVE.crisisDay}`} sub="Since Feb 28, 2026" change={`${pctPreWar} from $65 baseline`} changeUp={false} accent="#ef4444" />
        <KpiCard label="Brent Crude" value={fmt(LIVE.brentUSD, cur)} sub="per barrel · Apr 15 close" change="▲ +3.7% today" changeUp={true} accent="#f97316" />
        <KpiCard label="WTI Crude" value={fmt(LIVE.wtiUSD, cur)} sub="per barrel" change="▲ +4.4% today" changeUp={true} accent="#f97316" />
        <KpiCard label="Peak (Mar 18)" value={fmt(LIVE.brentPeak, cur)} sub="Iran hit Qatar Ras Laffan" change={`${pctFromPeak} from peak`} changeUp={false} accent="#8b5cf6" />
        <KpiCard label="DXY USD Index" value={`${LIVE.dxy}`} sub="Dollar basket" change="▼ −0.35% today" changeUp={false} accent="#3b82f6" />
        <KpiCard label="USD / MYR" value={LIVE.usdMyr.toString()} sub="Mid-market rate" change="↑ Ringgit under pressure" changeUp={false} accent="#06b6d4" />
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
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-1">BRENT CRUDE — CRISIS TIMELINE</div>
        <div className="text-xs text-white/20 mb-5">Feb 27 – Apr 15, 2026 · Key events overlaid</div>
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

      <p className="text-[10px] text-white/20">Sources: Brent/WTI — Barchart / Pound Sterling Live / WSJ (Apr 15, 2026 — OilPrice.com, TradingEconomics, Investing.com) · DXY — Investing.com · USD/MYR — Pound Sterling Live</p>
    </div>
  );
}

// ── GOLD TAB ──
function GoldTab({ cur }: { cur: string }) {
  const chartData = GOLD_TIMELINE.map(t => ({ ...t }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const row = GOLD_TIMELINE.find(t => t.date === label);
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
        <KpiCard label="Gold Spot (24K/oz)" value={fmt(LIVE.goldOzUSD, cur)} sub="per troy ounce (31.1g)" change="▲ +1.91% today" changeUp={true} accent="#f0a500" />
        <KpiCard label="Gold Per Gram (24K)" value={fmt(LIVE.goldGramUSD, cur)} sub="per gram" change="▲ +48% year-on-year" changeUp={true} accent="#f0a500" />
        <KpiCard label="All-Time High" value={`$${LIVE.goldATH.toLocaleString()}`} sub={`${LIVE.goldATHDate} (per oz)`} change="▼ −14.6% from ATH" changeUp={false} accent="#8b5cf6" />
        <KpiCard label="Gold in MYR (oz)" value={`RM ${(LIVE.goldOzUSD * LIVE.usdMyr).toLocaleString("en-MY", { maximumFractionDigits:0 })}`} sub="per troy ounce" change="▲ Safe-haven demand" changeUp={true} accent="#f0a500" />
        <KpiCard label="Gold in AED (oz)" value={`AED ${(LIVE.goldOzUSD * LIVE.usdAed).toLocaleString("en-US", { maximumFractionDigits:0 })}`} sub="per troy ounce" change="▲ AED peg stable" changeUp={true} accent="#f0a500" />
        <KpiCard label="Year-on-Year" value="+48%" sub="War premium driving demand" change="↑ vs pre-crisis gold" changeUp={true} accent="#22c55e" />
      </div>

      {/* Gold chart */}
      <div className="bg-[#0d1117] border border-white/6 rounded-xl p-6">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-1">GOLD XAU/USD — CRISIS PERIOD</div>
        <div className="text-xs text-white/20 mb-5">Spot price per troy ounce · Feb–Apr 2026</div>
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
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-4">GOLD BY KARAT GRADE — PER GRAM · {cur}</div>
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
          <div className="text-[10px] font-bold tracking-widest text-white/30">FULL KARAT REFERENCE TABLE · ALL CURRENCIES · PER GRAM</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {["Karat","Purity","Common Use","USD/g","MYR/g","AED/g","USD/oz"].map(h => (
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
function WorldMapTab() {
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
          <div className="text-[10px] font-bold tracking-widest text-white/30">INTERACTIVE WORLD MAP — HORMUZ CRISIS IMPACT</div>
          <div className="flex items-center gap-3 text-[9px] font-bold tracking-widest">
            {Object.entries(statusColor).map(([s, c]) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} />
                <span className="text-white/40 uppercase">{s}</span>
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
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: statusBg[tooltip.country.status], color: statusColor[tooltip.country.status] }}>{tooltip.country.status}</span>
                  <span className="text-white/50">Impact: <span className="font-mono font-bold" style={{ color: statusColor[tooltip.country.status] }}>{tooltip.country.fuelImpact}</span></span>
                </div>
                {tooltip.country.hormuzDep && (
                  <div className="text-white/40 mt-1">Hormuz dep: <span className="font-mono font-bold text-white/60">{tooltip.country.hormuzDep}%</span></div>
                )}
                <div className="text-white/30 mt-1 text-[10px]">Click for full details →</div>
              </div>
            </div>
          )}
        </div>
        <div className="p-3 text-center text-[10px] text-white/20">Scroll to zoom · Drag to pan · Click country for details</div>
      </div>

      {/* Region filter + search */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text" placeholder="Search country..."
          className="bg-[#0d1117] border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 w-44 transition-colors"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {Object.entries(regionCounts).map(([r, count]) => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all border ${filter === r ? "bg-amber-500/15 border-amber-500/40 text-amber-400" : "bg-transparent border-white/6 text-white/30 hover:border-white/12 hover:text-white/50"}`}>
            {r === "middle-east" ? "Mid East" : r} ({count})
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
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: statusBg[c.status], color: statusColor[c.status] }}>{c.status}</span>
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
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={{ background: statusBg[selected.status], color: statusColor[selected.status] }}>{selected.status}</span>
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
                  { l:"Population", v:selected.detail.population },
                  { l:"GDP", v:selected.detail.gdpBillion },
                  { l:"Hormuz Dep.", v:selected.hormuzDep !== null ? `${selected.hormuzDep}%` : "Producer" },
                  { l:"Fuel Impact", v:selected.fuelImpact },
                ].map(m => (
                  <div key={m.l} className="bg-white/3 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-white/30 font-bold tracking-widest">{m.l}</div>
                    <div className="text-sm font-bold font-mono text-white mt-1">{m.v}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/2 rounded-xl p-4">
                  <div className="text-[10px] font-bold tracking-widest text-white/25 mb-2">ENERGY MIX</div>
                  <div className="text-sm text-white/70">{selected.detail.energyMix}</div>
                </div>
                <div className="bg-white/2 rounded-xl p-4">
                  <div className="text-[10px] font-bold tracking-widest text-white/25 mb-2">RESERVES STATUS</div>
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
                <div className="text-[10px] font-bold tracking-widest text-white/25 mb-3">EMERGENCY MEASURES TAKEN</div>
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
                <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: statusColor[selected.status] }}>ECONOMIC RISK ASSESSMENT</div>
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

function WarTab() {
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
        <div className="text-[10px] font-bold tracking-widest text-white/25 mb-3">CUMULATIVE WAR DAMAGE — APR 15, 2026 · CRISIS DAY 46</div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <KpiCard label="Total Strikes" value={WAR_STATS.totalStrikes.toString()} sub="Documented events" accent="#ef4444" />
          <KpiCard label="Drones Launched" value={WAR_STATS.totalDrones.toLocaleString()} sub="All parties" accent="#f97316" />
          <KpiCard label="Missiles Fired" value={WAR_STATS.totalMissiles.toLocaleString()} sub="All parties" accent="#f97316" />
          <KpiCard label="Confirmed Killed" value={WAR_STATS.totalKilled.toLocaleString()} sub="All sides" accent="#ef4444" />
          <KpiCard label="Confirmed Wounded" value={WAR_STATS.totalWounded.toLocaleString()} sub="All sides" accent="#ef4444" />
          <KpiCard label="Economic Damage" value={`$${(WAR_STATS.totalDamageUSD / 1000).toFixed(2)}B`} sub="Estimated USD" accent="#8b5cf6" />
          <KpiCard label="Countries Struck" value={WAR_STATS.countriesStruck.toString()} sub="Confirmed attacks" accent="#3b82f6" />
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-[#0d1117] border-l-2 border-amber-500/60 border border-white/5 rounded-xl px-5 py-4 text-xs text-white/50 space-y-1">
        <div><span className="text-white/60 font-bold">Largest single strike: </span>{WAR_STATS.largestStrike}</div>
        <div><span className="text-white/60 font-bold">Hormuz status: </span><span className="text-emerald-400 font-bold">{WAR_STATS.hormuzStatus}</span></div>
        <div><span className="text-white/60 font-bold">As of: </span>Apr 15, 2026 · US-Iran peace talks Day 2 in Muscat</div>
      </div>

      {/* ── LEADERBOARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Top Drone Attacks */}
        <div className="bg-[#0d1117] border border-white/6 rounded-xl p-5">
          <div className="text-[10px] font-bold tracking-widest text-orange-400/60 mb-4">🚁 TOP 5 HIGHEST DRONE ATTACKS</div>
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
                  <div className="text-[9px] text-white/20">drones</div>
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
          <div className="text-[10px] font-bold tracking-widest text-red-400/60 mb-4">🚀 TOP 5 HIGHEST MISSILE ATTACKS</div>
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
                  <div className="text-[9px] text-white/20">missiles</div>
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
        <div className="text-[10px] font-bold tracking-widest text-white/25 mb-4">🌍 DAMAGE BY COUNTRY — CUMULATIVE TOTALS</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[9px] font-bold tracking-wider text-white/20 pb-2 pr-4">COUNTRY</th>
                <th className="text-right text-[9px] font-bold tracking-wider text-white/20 pb-2 px-3">STRIKES</th>
                <th className="text-right text-[9px] font-bold tracking-wider text-orange-400/50 pb-2 px-3">DRONES</th>
                <th className="text-right text-[9px] font-bold tracking-wider text-red-400/50 pb-2 px-3">MISSILES</th>
                <th className="text-right text-[9px] font-bold tracking-wider text-red-400/50 pb-2 px-3">KILLED</th>
                <th className="text-right text-[9px] font-bold tracking-wider text-orange-400/50 pb-2 px-3">WOUNDED</th>
                <th className="text-right text-[9px] font-bold tracking-wider text-purple-400/50 pb-2 pl-3">DAMAGE</th>
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
                <td className="pt-3 font-bold text-white/50 text-[9px] tracking-wider">TOTAL</td>
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

      {/* Damage chart */}
      <div className="bg-[#0d1117] border border-white/6 rounded-xl p-6">
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-1">STRIKE ECONOMIC DAMAGE — USD MILLIONS</div>
        <div className="text-xs text-white/20 mb-5">Per event · Ras Laffan ($18.7B) is off-chart scaled</div>
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
        {["all","airstrike","missile","drone","naval"].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all border ${typeFilter === t ? "bg-red-500/15 border-red-500/40 text-red-400" : "bg-transparent border-white/6 text-white/30 hover:border-white/12"}`}>
            {t === "all" ? "All Strikes" : `${typeIcon[t]} ${t}`}
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
            <div className="text-[10px] text-white/20 mt-2">Click for full briefing →</div>
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
                <div className="text-[9px] text-white/25 font-bold tracking-wider mb-1">ESTIMATED DAMAGE</div>
                <div className="text-2xl font-bold font-mono text-purple-400">${selectedStrike.damageUSD >= 1000 ? (selectedStrike.damageUSD / 1000).toFixed(1) + "B" : selectedStrike.damageUSD + "M"} USD</div>
              </div>
              <div className="bg-white/2 rounded-xl p-4">
                <div className="text-[9px] text-white/25 font-bold tracking-wider mb-2">STRIKE BRIEFING</div>
                <div className="text-sm text-white/70 leading-relaxed">{selectedStrike.description}</div>
              </div>
              <div className="bg-white/2 rounded-xl p-4">
                <div className="text-[9px] text-white/25 font-bold tracking-wider mb-2">INFRASTRUCTURE DAMAGED</div>
                <div className="text-sm text-white/60">{selectedStrike.infrastructure}</div>
              </div>
              <div className="text-[10px] text-white/20">All damage figures are estimates based on public intelligence reports and infrastructure valuations.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NEWS TAB ──
function NewsTab() {
  const [catFilter, setCatFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const cats = ["all","military","energy","economy","diplomacy","humanitarian"] as const;
  const catIcon: Record<string, string> = { military:"⚔️", energy:"⚡", economy:"📈", diplomacy:"🕊️", humanitarian:"🤝" };

  const filtered = catFilter === "all" ? NEWS : NEWS.filter(n => n.category === catFilter);

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Daily Briefing</h2>
          <div className="text-xs text-white/30 mt-0.5">Apr 15, 2026 · Crisis Day 46 · {NEWS.length} reports</div>
        </div>
        <div className="flex items-center gap-2 bg-[#0d1117] border border-white/6 rounded-full px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-red-500 pulse-dot" />
          <span className="text-[10px] font-bold tracking-widest text-white/50">LIVE UPDATES</span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {cats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all border ${catFilter === c ? "border-white/20 text-white bg-white/8" : "bg-transparent border-white/5 text-white/30 hover:border-white/10"}`}
            style={catFilter === c && c !== "all" ? { borderColor: catColor[c] + "60", color: catColor[c], background: catColor[c] + "12" } : {}}>
            {c !== "all" ? catIcon[c] : ""} {c}
          </button>
        ))}
      </div>

      {/* News cards */}
      <div className="space-y-3">
        {filtered.map(n => (
          <div key={n.id}
            className="news-card bg-[#0d1117] border border-white/6 rounded-xl overflow-hidden cursor-pointer hover:border-white/10"
            onClick={() => setExpanded(expanded === n.id ? null : n.id)}
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: catColor[n.category] + "15" }}>
                  {catIcon[n.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-[10px] font-bold font-mono text-white/25">{n.time}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: catColor[n.category] + "15", color: catColor[n.category] }}>{n.category}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: impactColor[n.impact] + "15", color: impactColor[n.impact] }}>{n.impact}</span>
                    <span className="text-[9px] text-white/20 font-mono">{n.region}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight">{n.headline}</h3>
                  {expanded === n.id && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-white/55 leading-relaxed">{n.summary}</p>
                      <div className="text-[10px] text-white/25">Source: {n.source}</div>
                    </div>
                  )}
                </div>
                <div className="text-white/20 text-xs shrink-0">{expanded === n.id ? "▲" : "▼"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CURRENCIES TAB ──
function CurrenciesTab() {
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
        <div className="text-[10px] font-bold tracking-widest text-white/30 mb-4">CURRENCY CONVERTER</div>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <div className="text-[10px] text-white/30 font-bold tracking-wider mb-2">AMOUNT</div>
            <input
              type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="bg-white/5 border border-white/8 rounded-lg px-4 py-3 text-white font-mono text-lg outline-none focus:border-amber-500/50 w-36 transition-colors"
            />
          </div>
          <div>
            <div className="text-[10px] text-white/30 font-bold tracking-wider mb-2">FROM</div>
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
          <div className="text-[10px] font-bold tracking-widest text-white/30">FX RATES — APR 15, 2026 MID-MARKET</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {["Pair","Rate","Prev Close","Change","Trend","Note"].map(h => (
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
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold">PEGGED</span>
                      ) : isUp ? (
                        <span className="text-red-400 text-xs">↑ Weakening</span>
                      ) : (
                        <span className="text-emerald-400 text-xs">↓ Strengthening</span>
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
        <span className="text-white/70 font-bold">DXY US Dollar Index: 98.37 (▲ +0.36% today)</span> — Dollar weakening as peace talks reduce safe-haven demand. EUR/USD at 1.082. The DXY measures USD against a basket of 6 currencies (EUR, JPY, GBP, CAD, SEK, CHF).
      </div>

      {/* Fill-up calculator */}
      <div className="bg-[#0d1117] border border-white/6 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="text-[10px] font-bold tracking-widest text-white/30">50-LITRE TANK FILL-UP COST — NOW VS PRE-CRISIS</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {["Country","Price/Litre (Now)","Pre-Crisis","50L Tank Now","Change"].map(h => (
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
const TABS = [
  { id:"oil",       label:"🛢  OIL & ENERGY" },
  { id:"gold",      label:"🥇  GOLD" },
  { id:"map",       label:"🌍  WORLD MAP" },
  { id:"war",       label:"💥  WAR DAMAGE" },
  { id:"news",      label:"📰  NEWS FEED" },
  { id:"currencies",label:"💱  CURRENCIES" },
];

export default function App() {
  const [tab, setTab] = useState("oil");
  const [cur, setCur] = useState<"USD"|"MYR"|"AED">("USD");
  const [now] = useState(new Date());

  return (
    <div className="min-h-screen bg-[#070a0f] text-white flex flex-col">
      <Ticker cur={cur} />

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
            <div className="text-[9px] text-white/25 font-mono tracking-wider leading-none mt-0.5">LIVE ECONOMY DASHBOARD v3</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-[10px] font-mono text-white/20">APR 15, 2026</div>
          <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 pulse-dot inline-block" />
            CRISIS DAY {LIVE.crisisDay}
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
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 text-[11px] font-bold tracking-widest uppercase px-5 py-3.5 transition-all border-b-2 whitespace-nowrap ${tab === t.id ? "border-amber-400 text-amber-400 bg-amber-500/5" : "border-transparent text-white/30 hover:text-white/60 hover:bg-white/2"}`}>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <main className="flex-1">
        {tab === "oil"        && <OilTab cur={cur} />}
        {tab === "gold"       && <GoldTab cur={cur} />}
        {tab === "map"        && <WorldMapTab />}
        {tab === "war"        && <WarTab />}
        {tab === "news"       && <NewsTab />}
        {tab === "currencies" && <CurrenciesTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/4 px-6 py-4 flex flex-wrap justify-between gap-2 text-[10px] text-white/20 font-mono">
        <span>Jeff's MarketIntel v3 · Apr 15, 2026 · Crisis Day {LIVE.crisisDay} · <a href="https://github.com/JevCode/live-economy-dashboard" className="hover:text-amber-400 transition-colors">GitHub</a></span>
        <span>Data: Middle East Insider · goldpricez.com · Pound Sterling Live · Investing.com · Wikipedia · Carbon Brief</span>
        <span>Auto-refreshes daily 08:00 UAE</span>
      </footer>
    </div>
  );
}
