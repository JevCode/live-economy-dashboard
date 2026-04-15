// ═══════════════════════════════════════════════════
// JEFF'S MARKETINTEL v3 — MASTER DATA FILE
// All data: Apr 15, 2026 · Crisis Day 46
// Sources: OilPrice.com, TradingEconomics, Yahoo Finance
//          open.er-api.com, Wikipedia, Carbon Brief
// ═══════════════════════════════════════════════════

export const LIVE = {
  brentUSD: 99.04,
  wtiUSD: 97.45,
  goldOzUSD: 4825.64,
  goldGramUSD: 155.15,
  usdMyr: 3.9514,
  usdAed: 3.6725,
  dxy: 98.10,
  crisisDay: 46,
  crisisStart: "2026-02-28",
  asOf: "Apr 15, 2026",
  brentPeak: 126.0,
  brentPreWar: 65.0,
  goldATH: 5602.22,
  goldATHDate: "Jan 28, 2026",
};

export const KARATS = [
  { k: "24K", label: "24 Karat", purity: 0.9999, use: "Investment bars & coins", color: "#F0A500" },
  { k: "23K", label: "23 Karat", purity: 0.9583, use: "High-purity (rare)", color: "#E8A020" },
  { k: "22K", label: "22 Karat", purity: 0.9167, use: "Indian & Asian jewellery", color: "#D99A30" },
  { k: "21K", label: "21 Karat", purity: 0.875,  use: "Middle East jewellery", color: "#CC9040" },
  { k: "20K", label: "20 Karat", purity: 0.8333, use: "Specialist & artisan", color: "#BF8850" },
  { k: "18K", label: "18 Karat", purity: 0.75,   use: "European fine jewellery", color: "#A87860" },
  { k: "14K", label: "14 Karat", purity: 0.5833, use: "USA & Western jewellery", color: "#8B6060" },
  { k: "10K", label: "10 Karat", purity: 0.4167, use: "USA minimum legal gold",  color: "#704848" },
];

export const OIL_TIMELINE = [
  { date: "Feb 27", label: "Pre-War", brent: 65,    wti: 63,    event: "Normal market. Iran tensions simmering.",                                          type: "normal",   day: 0  },
  { date: "Mar 1",  label: "D+1",     brent: 82,    wti: 79,    event: "Operation Epic Fury — US & Israel strike Iran. +26% overnight.",                   type: "alert",    day: 1  },
  { date: "Mar 4",  label: "D+4",     brent: 93,    wti: 90,    event: "Strait of Hormuz closed by Iran. 20% of world oil blocked.",                       type: "critical", day: 4  },
  { date: "Mar 9",  label: "D+9",     brent: 100,   wti: 97,    event: "$100 barrier breached. First time since 2022. Recession warnings multiply.",        type: "alert",    day: 9  },
  { date: "Mar 18", label: "PEAK",    brent: 126,   wti: 122,   event: "Iran strikes Qatar Ras Laffan LNG. 17% global LNG lost. 3–5yr repair.",             type: "peak",     day: 18 },
  { date: "Mar 24", label: "D+24",    brent: 122,   wti: 118,   event: "Philippines declares state of emergency. IEA emergency meeting convenes.",          type: "critical", day: 24 },
  { date: "Mar 31", label: "D+31",    brent: 110,   wti: 106,   event: "IEA releases 400M barrel reserve — largest coordinated release ever.",              type: "positive", day: 31 },
  { date: "Apr 7",  label: "D+38",    brent: 112,   wti: 109,   event: "Trump 8PM ultimatum to Iran. US strikes IRGC HQ Tehran with GBU-57 bunker busters.",type: "alert",    day: 38 },
  { date: "Apr 10", label: "D+41",    brent: 104,   wti: 100,   event: "US-UK navy destroys Iranian southern fleet. Hormuz partially reopens.",             type: "positive", day: 41 },
  { date: "Apr 14", label: "D+45",    brent: 95.51, wti: 93.31, event: "US–Iran peace talks Day 1 in Muscat. Brent −0.4%, WTI −4.7%.",                   type: "positive", day: 45 },
  { date: "Apr 15", label: "TODAY",   brent: 99.04, wti: 97.45, event: "US–Iran talks continue. Brent $99.04 (−0.3%). Gold $4,825 (−0.3%). DXY 98.10. USD/MYR 3.9514.", type: "today",    day: 46 },
];

export const GOLD_TIMELINE = [
  { date: "Jan 28", price: 5602.22, note: "All-Time High" },
  { date: "Feb 27", price: 3230,    note: "Pre-war baseline" },
  { date: "Mar 1",  price: 3510,    note: "War premium +8.7%" },
  { date: "Mar 4",  price: 3800,    note: "Hormuz safe-haven surge" },
  { date: "Mar 9",  price: 4100,    note: "$4K barrier broken" },
  { date: "Mar 18", price: 4650,    note: "Ras Laffan crisis" },
  { date: "Mar 31", price: 4680,    note: "IEA release pullback" },
  { date: "Apr 7",  price: 4810,    note: "Trump deadline spike" },
  { date: "Apr 14", price: 4786.69, note: "Peace talks Day 1" },
  { date: "Apr 15", price: 4825.64, note: "Day 2 talks: Gold −0.3% to $4,825" },
];

export type Country = {
  iso: string; name: string; flag: string;
  region: "asia" | "middle-east" | "europe" | "americas" | "oceania" | "africa";
  hormuzDep: number | null;
  fuelImpact: string;
  status: "critical" | "high" | "moderate" | "low" | "benefiting";
  action: string;
  detail: {
    population: string; gdpBillion: string; energyMix: string;
    reserves: string; measures: string[]; economicRisk: string; source: string;
  };
};

export const COUNTRIES: Country[] = [
  // ── ASIA ──
  {
    iso:"PHL", name:"Philippines", flag:"🇵🇭", region:"asia",
    hormuzDep:98, fuelImpact:"+63%", status:"critical",
    action:"STATE OF EMERGENCY declared Mar 24",
    detail:{ population:"115M", gdpBillion:"$405B", energyMix:"98% imported petroleum",
      reserves:"< 30 days",
      measures:["State of emergency declared Mar 24","Fuel rationing for public transport","Generator restrictions on factories","Emergency aid requested from Saudi Arabia","Peso −8% vs USD"],
      economicRisk:"SEVERE — GDP revised +6.1% → −0.4%", source:"Wikipedia · Philippine DOE" }
  },
  {
    iso:"KHM", name:"Cambodia", flag:"🇰🇭", region:"asia",
    hormuzDep:90, fuelImpact:"+68%", status:"critical",
    action:"No refining capacity; severe civilian shortages",
    detail:{ population:"17M", gdpBillion:"$30B", energyMix:"90% Middle East origin",
      reserves:"< 15 days",
      measures:["No domestic refining","Severe fuel queue rationing","Agricultural diesel threatening rice harvest","UN aid requested"],
      economicRisk:"SEVERE — tourism and agriculture at risk", source:"Wikipedia · Carbon Brief" }
  },
  {
    iso:"JPN", name:"Japan", flag:"🇯🇵", region:"asia",
    hormuzDep:94, fuelImpact:"+17%", status:"critical",
    action:"254-day reserves; ¥1.7T subsidies; releasing 80M bbl",
    detail:{ population:"124M", gdpBillion:"$4,230B", energyMix:"94% Hormuz-route petroleum & LNG",
      reserves:"254 days",
      measures:["¥1.7T fuel subsidy package","Releasing 80M barrels from strategic reserves","Emergency LNG from USA/Australia","3 nuclear reactors fast-tracked for restart","BOJ rate hold amid stagflation"],
      economicRisk:"HIGH — Q1 2026 GDP −1.2%; ¥152/USD", source:"Wikipedia · Japan METI" }
  },
  {
    iso:"BGD", name:"Bangladesh", flag:"🇧🇩", region:"asia",
    hormuzDep:90, fuelImpact:"+40%", status:"critical",
    action:"Rolling blackouts; 4M garment workers threatened",
    detail:{ population:"170M", gdpBillion:"$460B", energyMix:"90% imported oil & LNG",
      reserves:"< 20 days",
      measures:["Rolling 8hr daily blackouts","Garment factories (4M workers) on half-shifts","Fuel price caps causing black market surge","IMF emergency consultation"],
      economicRisk:"SEVERE — $42B/yr garment export at risk", source:"Wikipedia · Bangladesh Petroleum Corp" }
  },
  {
    iso:"LKA", name:"Sri Lanka", flag:"🇱🇰", region:"asia",
    hormuzDep:85, fuelImpact:"+35%", status:"critical",
    action:"QR-code rationing reactivated; India fuel line activated",
    detail:{ population:"22M", gdpBillion:"$84B", energyMix:"85% Middle East petroleum",
      reserves:"< 25 days",
      measures:["Fuel price controls extended","QR-code rationing reactivated","India bilateral fuel line activated","Tourism fuel priority allocations"],
      economicRisk:"HIGH — echoes of 2022 crisis", source:"Wikipedia · CBSL" }
  },
  {
    iso:"VNM", name:"Vietnam", flag:"🇻🇳", region:"asia",
    hormuzDep:75, fuelImpact:"+50%", status:"critical",
    action:"Severe shortages; motorbike/bus restrictions",
    detail:{ population:"98M", gdpBillion:"$410B", energyMix:"75% oil from Hormuz route",
      reserves:"30 days",
      measures:["Motorbike fuel rationing","Bus & logistics priority queuing","Emergency import deal with Indonesia","Samsung & LG factories hit"],
      economicRisk:"HIGH — $50B manufacturing export sector threatened", source:"Wikipedia · Vietnam MoIT" }
  },
  {
    iso:"MYS", name:"Malaysia", flag:"🇲🇾", region:"asia",
    hormuzDep:80, fuelImpact:"+49%", status:"high",
    action:"RM3.87/L subsidised; strategic reserves deployed",
    detail:{ population:"33M", gdpBillion:"$430B", energyMix:"80% Hormuz-route; Petronas domestic",
      reserves:"45 days",
      measures:["Govt subsidy RM 3.87/L maintained","Petronas domestic output at max","USD/MYR hit 4.05 intraday (now 3.966)","Emergency Budget RM 6.2B","LNG diversion from Sabah/Sarawak"],
      economicRisk:"MODERATE-HIGH — ringgit pressure; inflation +5.8%", source:"Pound Sterling Live · BNM" }
  },
  {
    iso:"SGP", name:"Singapore", flag:"🇸🇬", region:"asia",
    hormuzDep:70, fuelImpact:"LNG crisis", status:"critical",
    action:"Emergency AUS LNG deal A$8B signed; power protocols active",
    detail:{ population:"6M", gdpBillion:"$497B", energyMix:"95% gas (60% Qatari LNG affected)",
      reserves:"< 14 days LNG",
      measures:["State energy emergency protocol","AUS LNG deal (A$8B, 5yr)","Industry electricity rationing guidelines","MAS emergency liquidity facilities","EDB manufacturing power planning advisory"],
      economicRisk:"HIGH — financial hub at risk if power disrupted", source:"Wikipedia · Singapore MTI" }
  },
  {
    iso:"TWN", name:"Taiwan", flag:"🇹🇼", region:"asia",
    hormuzDep:70, fuelImpact:"+30%", status:"high",
    action:"US LNG emergency procurement $12B; TSMC power protocols",
    detail:{ population:"24M", gdpBillion:"$760B", energyMix:"70% LNG (Qatar) + oil",
      reserves:"60 days",
      measures:["USA LNG procurement $12B","TSMC semiconductor fab electricity rationing ready","Nuclear Plant 2 restart fast-tracked","CBC FX intervention to support TWD"],
      economicRisk:"HIGH — TSMC power-at-risk protocols stress global chip supply", source:"Wikipedia · Taiwan MOEA" }
  },
  {
    iso:"IDN", name:"Indonesia", flag:"🇮🇩", region:"asia",
    hormuzDep:60, fuelImpact:"+30%", status:"high",
    action:"Pertamina subsidy IDR 28T; B40 biodiesel mandate",
    detail:{ population:"277M", gdpBillion:"$1,320B", energyMix:"60% Hormuz + domestic Pertamina",
      reserves:"50 days",
      measures:["Pertamina subsidy IDR 28T extended","Coal-to-power capacity increase","Domestic oil output raised 18%","B40 biodiesel blend mandated"],
      economicRisk:"MODERATE — partially sheltered by Pertamina domestic production", source:"Wikipedia · Pertamina" }
  },
  {
    iso:"THA", name:"Thailand", flag:"🇹🇭", region:"asia",
    hormuzDep:57, fuelImpact:"+34%", status:"high",
    action:"Diesel peaked THB 50.54/L; excise tax cut; BOT rate cut",
    detail:{ population:"71M", gdpBillion:"$543B", energyMix:"57% Hormuz + Myanmar pipeline",
      reserves:"50 days",
      measures:["Excise tax on diesel cut THB 5/L","Myanmar gas pipeline renegotiation","Tourism fuel priority","BOT rate cut 25bps"],
      economicRisk:"MODERATE-HIGH — tourism & export sectors at risk", source:"Wikipedia · PTT Thailand" }
  },
  {
    iso:"KOR", name:"South Korea", flag:"🇰🇷", region:"asia",
    hormuzDep:70, fuelImpact:"+10%", status:"moderate",
    action:"208-day strategic reserves; $5B emergency fund",
    detail:{ population:"52M", gdpBillion:"$1,710B", energyMix:"70% Hormuz (buffered)",
      reserves:"208 days",
      measures:["$5B emergency energy fund","LNG from Australia/USA at spot","Samsung/SK Hynix 10% power reduction","BOK emergency rate hold"],
      economicRisk:"MODERATE — well-buffered; chip exports still flowing", source:"Wikipedia · MOTIE Korea" }
  },
  {
    iso:"IND", name:"India", flag:"🇮🇳", region:"asia",
    hormuzDep:65, fuelImpact:"Subsidised", status:"moderate",
    action:"Excise duty cut ₹10/L; pivoting to Russian crude",
    detail:{ population:"1,430M", gdpBillion:"$3,730B", energyMix:"65% Middle East, 20% Russia (surging)",
      reserves:"90 days",
      measures:["Excise duty cut ₹10/L on petrol & diesel","Russian crude imports 35% → 50%","Strategic reserve release 15M barrels","RBI rupee intervention","Coal production emergency escalation"],
      economicRisk:"LOW-MODERATE — partially insulated via Russian oil pivot", source:"Wikipedia · MoPNG India" }
  },
  {
    iso:"CHN", name:"China", flag:"🇨🇳", region:"asia",
    hormuzDep:33, fuelImpact:"+23%", status:"moderate",
    action:"900M–1.4B bbl reserves; EVs shield domestic market",
    detail:{ population:"1,410M", gdpBillion:"$17,500B", energyMix:"33% Hormuz; Russia pipeline; domestic",
      reserves:"120 days (est.)",
      measures:["SPR released 250M barrels","Russia pipeline imports +40%","EV production on emergency overtime","NDRC domestic price caps","Coal + renewables accelerated"],
      economicRisk:"LOW — best-positioned major Asian economy", source:"Wikipedia · NDRC China" }
  },
  {
    iso:"IRQ", name:"Iraq", flag:"🇮🇶", region:"asia",
    hormuzDep:95, fuelImpact:"−70% output", status:"critical",
    action:"Southern terminals seized; oil output collapsed",
    detail:{ population:"43M", gdpBillion:"$268B", energyMix:"Oil producer — Hormuz-dependent for exports",
      reserves:"N/A (producer)",
      measures:["Basra terminals disrupted","State revenue −70%","Civilian fuel internal crisis","Iran-Iraq border conflict zones expanding"],
      economicRisk:"CATASTROPHIC — 90% of state revenue from oil", source:"Wikipedia · Iraq Ministry of Oil" }
  },
  {
    iso:"PAK", name:"Pakistan", flag:"🇵🇰", region:"asia",
    hormuzDep:88, fuelImpact:"+38%", status:"critical",
    action:"IMF emergency talks; Saudi $3B credit line; 18hr blackouts",
    detail:{ population:"230M", gdpBillion:"$374B", energyMix:"88% Middle East petroleum & LNG",
      reserves:"< 20 days",
      measures:["IMF emergency Article IV consultation","Saudi Arabia $3B fuel credit line","Petrol rationing for non-essentials","Electricity blackouts 18hrs/day"],
      economicRisk:"SEVERE — PKR −22% vs USD; macro collapse risk", source:"Wikipedia · OGRA Pakistan" }
  },
  {
    iso:"MMR", name:"Myanmar", flag:"🇲🇲", region:"asia",
    hormuzDep:85, fuelImpact:"+45%", status:"critical",
    action:"No refining; critical civilian shortages",
    detail:{ population:"55M", gdpBillion:"$65B", energyMix:"85% imported; no refining",
      reserves:"< 10 days",
      measures:["No domestic refining capacity","Critical civilian shortages","Military junta fuel allocation to military first","Black market at 3× official price"],
      economicRisk:"CATASTROPHIC — pre-existing conflict worsened by energy crisis", source:"Wikipedia" }
  },
  {
    iso:"NPL", name:"Nepal", flag:"🇳🇵", region:"asia",
    hormuzDep:80, fuelImpact:"+42%", status:"high",
    action:"India re-export dependency; price caps; hydro backup",
    detail:{ population:"30M", gdpBillion:"$40B", energyMix:"80% imported via India",
      reserves:"< 20 days",
      measures:["India bilateral re-export agreement","Domestic hydro power prioritised","Fuel price caps","Vehicle restrictions on odd/even days"],
      economicRisk:"HIGH — landlocked; fully dependent on India re-exports", source:"Wikipedia · NOC Nepal" }
  },
  // ── MIDDLE EAST ──
  {
    iso:"IRN", name:"Iran", flag:"🇮🇷", region:"middle-east",
    hormuzDep:null, fuelImpact:"WAR", status:"critical",
    action:"Primary combatant; Hormuz blockade actor; IRGC leading",
    detail:{ population:"87M", gdpBillion:"$367B", energyMix:"Domestic producer; exports blocked",
      reserves:"N/A",
      measures:["Primary belligerent — Operation Hormuz Shield","IRGC controlling Hormuz strait","Drone and missile programme active","Oil revenue cut off by sanctions + blockade","Diplomatic talks via Oman intermediary"],
      economicRisk:"WAR ECONOMY — hyperinflation; IRR in freefall", source:"Wikipedia · IRGC statements" }
  },
  {
    iso:"QAT", name:"Qatar", flag:"🇶🇦", region:"middle-east",
    hormuzDep:null, fuelImpact:"FORCE MAJEURE", status:"critical",
    action:"Ras Laffan hit; 17% global LNG offline; 3–5yr repair",
    detail:{ population:"3M", gdpBillion:"$235B", energyMix:"World's largest LNG exporter",
      reserves:"N/A (exporter)",
      measures:["Ras Laffan LNG terminal struck Mar 18","17% global LNG supply offline","3–5 year facility repair","Force majeure on all contracts","Emergency supplier talks with Algeria, Australia, USA"],
      economicRisk:"EXTREME — $60B/yr LNG revenue at risk", source:"Wikipedia · QatarEnergy" }
  },
  {
    iso:"SAU", name:"Saudi Arabia", flag:"🇸🇦", region:"middle-east",
    hormuzDep:null, fuelImpact:"+4%", status:"benefiting",
    action:"East-West bypass 7M bbl/day via Yanbu; record revenues",
    detail:{ population:"35M", gdpBillion:"$1,070B", energyMix:"Producer — dominant exporter",
      reserves:"N/A (exporter)",
      measures:["Petroline East-West pipeline at max (7M bbl/day)","Yanbu Red Sea terminal operational","$8B energy infrastructure investment","Bilateral deals: Japan, Korea, India","OPEC+ emergency coordination role"],
      economicRisk:"GREATLY BENEFITING — Vision 2030 fund surging", source:"Wikipedia · Saudi Aramco" }
  },
  {
    iso:"ARE", name:"UAE", flag:"🇦🇪", region:"middle-east",
    hormuzDep:null, fuelImpact:"+3%", status:"benefiting",
    action:"AED peg stable; $5.4B Bahrain swap; ADNOC revenues +35%",
    detail:{ population:"10M", gdpBillion:"$504B", energyMix:"Producer — ADNOC exporter",
      reserves:"N/A (exporter)",
      measures:["$5.4B emergency swap with Bahrain","ADNOC export revenues +35%","AED peg maintained","UAE-Australia energy partnership expanded","Abu Dhabi SWF ($790B) as crisis lender"],
      economicRisk:"GREATLY BENEFITING — real estate boom; crisis capital inflows", source:"Wikipedia · ADNOC · UAE CB" }
  },
  {
    iso:"BHR", name:"Bahrain", flag:"🇧🇭", region:"middle-east",
    hormuzDep:95, fuelImpact:"Recession risk", status:"critical",
    action:"Hardest-hit GCC; UAE $5.4B rescue; austerity declared",
    detail:{ population:"1.5M", gdpBillion:"$39B", energyMix:"95% Hormuz + Saudi pipeline (disrupted)",
      reserves:"< 30 days",
      measures:["Economic emergency declared","UAE $5.4B swap facility","20% government spending cut","ABB emergency bank liquidity","Expatriate employment freeze"],
      economicRisk:"CRITICAL — GDP forecast −4.2%; banking sector stress", source:"Wikipedia · CBB Bahrain" }
  },
  {
    iso:"KWT", name:"Kuwait", flag:"🇰🇼", region:"middle-east",
    hormuzDep:null, fuelImpact:"−6.7M bbl/d", status:"high",
    action:"Export route via Hormuz blocked; Yanbu allocation increasing",
    detail:{ population:"5M", gdpBillion:"$161B", energyMix:"Producer — Hormuz-dependent for exports",
      reserves:"N/A (exporter)",
      measures:["Export route via Hormuz blocked","Yanbu bypass allocation increase","Domestic subsidies maintained","Kuwait Fund for Development on pause"],
      economicRisk:"HIGH — export revenue −60%; sovereign fund spending", source:"Wikipedia · KPC Kuwait" }
  },
  {
    iso:"JOR", name:"Jordan", flag:"🇯🇴", region:"middle-east",
    hormuzDep:95, fuelImpact:"+50%", status:"critical",
    action:"Saudi emergency aid $1.5B; refugee camp fuel crisis",
    detail:{ population:"11M", gdpBillion:"$52B", energyMix:"95% imported petroleum",
      reserves:"20 days",
      measures:["Saudi emergency fuel grant $1.5B","Transport rationing","1.5M Syrian refugee camp fuel crisis","IMF emergency talks"],
      economicRisk:"SEVERE — tourism and services threatened", source:"Wikipedia" }
  },
  {
    iso:"LBN", name:"Lebanon", flag:"🇱🇧", region:"middle-east",
    hormuzDep:98, fuelImpact:"Blackouts", status:"critical",
    action:"< 2 days reserves at peak; 1hr/day state electricity",
    detail:{ population:"5M", gdpBillion:"$23B", energyMix:"98% imported; infrastructure collapsed",
      reserves:"< 7 days",
      measures:["State electricity down to 1hr/day in areas","Hospital generators on critical reserve","UN UNIFIL fuel emergency","Black market 15× official price"],
      economicRisk:"CATASTROPHIC — pre-existing collapse severely worsened", source:"Wikipedia" }
  },
  {
    iso:"OMN", name:"Oman", flag:"🇴🇲", region:"middle-east",
    hormuzDep:50, fuelImpact:"+15%", status:"moderate",
    action:"Key Muscat peace talks mediator; Deepwater bypass in use",
    detail:{ population:"4.5M", gdpBillion:"$104B", energyMix:"50% Hormuz; Muscat bypass route",
      reserves:"60 days",
      measures:["Hosting US-Iran ceasefire talks","Muscat Deepwater port bypass route active","Oman crude exports partially rerouted","Diplomatic windfall positioning"],
      economicRisk:"MODERATE — mediator role bringing diplomatic dividends", source:"Wikipedia · Oman MEM" }
  },
  {
    iso:"YEM", name:"Yemen", flag:"🇾🇪", region:"middle-east",
    hormuzDep:90, fuelImpact:"Humanitarian", status:"critical",
    action:"Active Houthi conflict; civilian fuel near zero; famine risk",
    detail:{ population:"33M", gdpBillion:"$21B", energyMix:"90% imported; war-collapsed infrastructure",
      reserves:"< 5 days",
      measures:["Houthi forces launching Red Sea drone campaign","US/Saudi strikes on Houthi missile sites","WFP emergency fuel for hospitals","UN OCHA famine warning issued","Aden port partially functional"],
      economicRisk:"CATASTROPHIC — ongoing conflict + energy crisis = humanitarian emergency", source:"Wikipedia · UNOCHA" }
  },
  // ── EUROPE ──
  {
    iso:"GBR", name:"UK", flag:"🇬🇧", region:"europe",
    hormuzDep:12, fuelImpact:"+13%", status:"high",
    action:"Worst-hit major economy; Asda fuel shortages; BOE rate cut",
    detail:{ population:"68M", gdpBillion:"$3,130B", energyMix:"12% Hormuz; North Sea + Norway LNG",
      reserves:"67 days",
      measures:["Emergency Fuel Protocol by BEIS","Asda/Tesco fuel allocation caps","BOE emergency rate cut 25bps","£2.7B household energy support","North Sea emergency production increase"],
      economicRisk:"HIGH — OBR revised 2026 growth +1.8% → −0.3%", source:"Wikipedia · BEIS UK" }
  },
  {
    iso:"ESP", name:"Spain", flag:"🇪🇸", region:"europe",
    hormuzDep:12, fuelImpact:"+27%", status:"high",
    action:"€5B aid package; 50% renewables buffers impact",
    detail:{ population:"48M", gdpBillion:"$1,580B", energyMix:"12% Hormuz; 50% renewables",
      reserves:"90 days",
      measures:["€5B energy aid package","Renewables at 55% electricity — partial buffer","LNG from Algeria & USA","Fuel VAT reduced to 5%","Tourism fuel priority"],
      economicRisk:"MODERATE — renewables insulation significant", source:"Wikipedia · REE Spain" }
  },
  {
    iso:"DEU", name:"Germany", flag:"🇩🇪", region:"europe",
    hormuzDep:12, fuelImpact:"+14%", status:"moderate",
    action:"ECB stagflation warning; manufacturing −8%; Autobahn limit 130",
    detail:{ population:"84M", gdpBillion:"$4,460B", energyMix:"12% Hormuz; diverse supply",
      reserves:"90 days",
      measures:["€6.5B industrial energy support","Autobahn speed limit 130 km/h","Bundesbank stagflation warning","Wilhelmshaven LNG terminal at max","Short-time work scheme expanded"],
      economicRisk:"MODERATE-HIGH — GDP −0.5% revised; auto/chem industries at risk", source:"Wikipedia · BAFA Germany" }
  },
  {
    iso:"NLD", name:"Netherlands", flag:"🇳🇱", region:"europe",
    hormuzDep:20, fuelImpact:"+40%", status:"high",
    action:"TTF gas doubled to €60/MWh; Rotterdam rerouted tanker surge",
    detail:{ population:"18M", gdpBillion:"$1,120B", energyMix:"20% Hormuz; LNG hub (TTF)",
      reserves:"30% storage (low)",
      measures:["TTF benchmark gas doubled to €60/MWh","Rotterdam handling Cape-route tankers","Gas storage emergency refill","Industry gas curtailment plan","Energy poverty fund €3.2B"],
      economicRisk:"HIGH — TTF spike threatens EU-wide gas market", source:"Wikipedia · ACM Netherlands" }
  },
  {
    iso:"ITA", name:"Italy", flag:"🇮🇹", region:"europe",
    hormuzDep:15, fuelImpact:"+18%", status:"moderate",
    action:"Algeria LNG emergency ramp; industry on 4-day weeks",
    detail:{ population:"60M", gdpBillion:"$2,190B", energyMix:"15% Hormuz; Algeria + Libya pipeline",
      reserves:"70 days",
      measures:["Algeria LNG emergency contracts","ENI domestic gas raised","Fuel VAT cut to 10%","Auto sector 4-day production weeks","Bank of Italy recession warning"],
      economicRisk:"MODERATE-HIGH — public debt risk if GDP contracts", source:"Wikipedia · ARERA Italy" }
  },
  {
    iso:"FRA", name:"France", flag:"🇫🇷", region:"europe",
    hormuzDep:12, fuelImpact:"+8%", status:"moderate",
    action:"Nuclear baseload shields France; targeted fuel vouchers",
    detail:{ population:"68M", gdpBillion:"$3,130B", energyMix:"12% Hormuz; 70% nuclear",
      reserves:"90 days",
      measures:["Nuclear fleet (56 reactors) at max","Targeted fuel vouchers for low-income","EDF emergency energy protocol","LNG from USA & Norway increased","ECB lobbying for rate support"],
      economicRisk:"LOW-MODERATE — nuclear buffer significant; GDP +0.6%", source:"Wikipedia · CRE France" }
  },
  {
    iso:"NOR", name:"Norway", flag:"🇳🇴", region:"europe",
    hormuzDep:0, fuelImpact:"Windfall", status:"benefiting",
    action:"Fuel tax cut; sovereign fund record; EU LNG exports +40%",
    detail:{ population:"5.5M", gdpBillion:"$546B", energyMix:"Oil & gas exporter (North Sea)",
      reserves:"N/A (exporter)",
      measures:["Fuel tax cut NOK 2/L for consumers","SWF ($1.7T) at record values","Emergency LNG to EU +40%","Equinor windfall profits","EU 'most valued partner' status"],
      economicRisk:"GREATLY BENEFITING — GDP upgraded +3.8%", source:"Wikipedia · Equinor" }
  },
  {
    iso:"TUR", name:"Turkey", flag:"🇹🇷", region:"europe",
    hormuzDep:20, fuelImpact:"+20%", status:"moderate",
    action:"Azerbaijan + Russia pipeline buffer; lira under pressure",
    detail:{ population:"86M", gdpBillion:"$1,150B", energyMix:"20% Hormuz; Russia + Azerbaijan",
      reserves:"45 days",
      measures:["TANAP Azerbaijan pipeline at max","Russian Blue Stream gas purchases up","EPDK fuel price ceiling","Grain corridor talks linked to energy","Lira at all-time low vs USD"],
      economicRisk:"MODERATE — inflation 40%; energy adds further pressure", source:"Wikipedia · EPDK Turkey" }
  },
  {
    iso:"POL", name:"Poland", flag:"🇵🇱", region:"europe",
    hormuzDep:10, fuelImpact:"+12%", status:"moderate",
    action:"Fuel price cap; alternative Baltic LNG supply",
    detail:{ population:"38M", gdpBillion:"$748B", energyMix:"10% Hormuz; coal dominant",
      reserves:"60 days",
      measures:["Fuel price cap enacted","Baltic Pipe (Norway) at full capacity","Coal power buffer maintained","US LNG at Baltic Świnoujście terminal","EU emergency fund application"],
      economicRisk:"LOW-MODERATE — coal buffer + Baltic pipeline insulate", source:"Wikipedia · URE Poland" }
  },
  {
    iso:"GRC", name:"Greece", flag:"🇬🇷", region:"europe",
    hormuzDep:25, fuelImpact:"+28%", status:"high",
    action:"Island ferry disruptions; Cape route tankers boosting Piraeus",
    detail:{ population:"10M", gdpBillion:"$239B", energyMix:"25% Hormuz; LNG + renewables",
      reserves:"40 days",
      measures:["Cape route tanker traffic boosting Piraeus port","Island ferry fuel emergency allocation","LNG from Algeria at Revithoussa terminal","Renewables fast-track investment","IMF Article IV review"],
      economicRisk:"MODERATE-HIGH — shipping and tourism economy disrupted", source:"Wikipedia · RAEM Greece" }
  },
  // ── AMERICAS ──
  {
    iso:"USA", name:"USA", flag:"🇺🇸", region:"americas",
    hormuzDep:10, fuelImpact:"$4+/gal", status:"moderate",
    action:"SPR −50M bbl; jet fuel +95%; LNG exports surging",
    detail:{ population:"335M", gdpBillion:"$27,360B", energyMix:"10% Hormuz; mostly domestic shale",
      reserves:"700M bbl SPR",
      measures:["SPR release −50M barrels","LNG export volume increased to EU/Asia","Jet fuel surcharge +95%","Emergency CAFE standards relaxed for trucks","Political pressure on domestic production increase"],
      economicRisk:"LOW-MODERATE — domestic shale buffer strong; inflation upside", source:"Wikipedia · EIA USA" }
  },
  {
    iso:"CAN", name:"Canada", flag:"🇨🇦", region:"americas",
    hormuzDep:8, fuelImpact:"+30%", status:"moderate",
    action:"Alberta oil sands output raised; Trans Mountain at capacity",
    detail:{ population:"40M", gdpBillion:"$2,140B", energyMix:"8% Hormuz; mostly domestic Alberta",
      reserves:"Abundant (domestic)",
      measures:["Alberta oil sands +12% production","Provincial fuel relief $400/household","Trans Mountain pipeline at capacity","Keystone XL emergency restart discussion"],
      economicRisk:"LOW — oil producer benefits offset consumer pain", source:"Wikipedia · CER Canada" }
  },
  {
    iso:"BRA", name:"Brazil", flag:"🇧🇷", region:"americas",
    hormuzDep:5, fuelImpact:"+10%", status:"low",
    action:"Petrobras windfall; E25 ethanol blend insulates consumers",
    detail:{ population:"216M", gdpBillion:"$2,080B", energyMix:"5% Hormuz; Petrobras + ethanol",
      reserves:"Abundant (Petrobras)",
      measures:["Petrobras crude export surging","Sugarcane ethanol (E25) buffer","Diesel subsidy maintained","Lula energy popularity boost"],
      economicRisk:"SLIGHTLY BENEFITING — oil exporter with ethanol buffer", source:"Wikipedia · ANP Brazil" }
  },
  {
    iso:"CHL", name:"Chile", flag:"🇨🇱", region:"americas",
    hormuzDep:25, fuelImpact:"+30%", status:"high",
    action:"Copper smelter fuel costs surge; ENAP emergency fund",
    detail:{ population:"20M", gdpBillion:"$358B", energyMix:"25% Hormuz; LNG + hydro",
      reserves:"40 days",
      measures:["ENAP emergency stabilisation fund","Copper mining diesel emergency allocation","Hydro and solar priority dispatch","Peso under pressure vs USD"],
      economicRisk:"HIGH — copper industry (40% exports) fuel cost surge", source:"Wikipedia · CNE Chile" }
  },
  {
    iso:"MEX", name:"Mexico", flag:"🇲🇽", region:"americas",
    hormuzDep:15, fuelImpact:"+25%", status:"moderate",
    action:"PEMEX production boost; subsidy pressure mounting",
    detail:{ population:"129M", gdpBillion:"$1,320B", energyMix:"15% Hormuz; PEMEX domestic",
      reserves:"50 days",
      measures:["PEMEX domestic production boost","Fuel subsidies maintained (costly)","US energy cooperation deal","Peso relatively stable vs USD"],
      economicRisk:"MODERATE — PEMEX domestic buffer; US proximity insulates", source:"Wikipedia · CNH Mexico" }
  },
  // ── OCEANIA ──
  {
    iso:"AUS", name:"Australia", flag:"🇦🇺", region:"oceania",
    hormuzDep:45, fuelImpact:"+40%", status:"high",
    action:"Emergency AUS-SG LNG deal; diesel from Korea/Malaysia",
    detail:{ population:"26M", gdpBillion:"$1,700B", energyMix:"45% Hormuz; domestic gas + coal",
      reserves:"60 days",
      measures:["LNG supply deal to Singapore signed","Diesel imports diversified to Korea/Malaysia","Fuel tax offset $0.22/L rebate","AEMO emergency grid protocols","Woodside/Santos LNG revenues surging"],
      economicRisk:"MODERATE — LNG exporter offsets; consumer pain manageable", source:"Wikipedia · AEMO · DISER" }
  },
  {
    iso:"NZL", name:"New Zealand", flag:"🇳🇿", region:"oceania",
    hormuzDep:35, fuelImpact:"+30%", status:"high",
    action:"IEA reserves released; $50/adult energy credit; EV rebate doubled",
    detail:{ population:"5M", gdpBillion:"$252B", energyMix:"35% Hormuz; Māui gas + hydro",
      reserves:"Released 6 days equiv.",
      measures:["IEA reserve contribution","$50 per-adult energy credit","Marsden Point refinery reopening discussed","Dairy sector diesel emergency allocation","EV incentive doubled ($15K rebate)"],
      economicRisk:"MODERATE — agriculture and tourism impacted", source:"Wikipedia · MBIE NZ" }
  },
  {
    iso:"FJI", name:"Fiji", flag:"🇫🇯", region:"oceania",
    hormuzDep:90, fuelImpact:"+65%", status:"critical",
    action:"Tourism economy devastated; Pacific aid coordination",
    detail:{ population:"0.9M", gdpBillion:"$5B", energyMix:"90% imported petroleum",
      reserves:"60–90 days",
      measures:["Pacific aid from Australia/NZ","Hospital generator diesel priority","Tourism surcharges +40% devastating bookings","UN Pacific Islands Forum emergency fund"],
      economicRisk:"SEVERE — 40% GDP from tourism; existential if > 6 months", source:"Wikipedia · Fiji DOE" }
  },
  {
    iso:"PNG", name:"Papua New Guinea", flag:"🇵🇬", region:"oceania",
    hormuzDep:70, fuelImpact:"+50%", status:"high",
    action:"LNG producer but imports refined fuel; domestic shortages",
    detail:{ population:"10M", gdpBillion:"$25B", energyMix:"LNG exporter; imports refined petroleum",
      reserves:"30 days",
      measures:["PNG LNG export revenues surging","Domestic refined fuel shortage","Emergency import from Australia","ADB emergency loan $500M"],
      economicRisk:"HIGH — LNG windfall vs domestic refined fuel crisis", source:"Wikipedia · PNG Dept Energy" }
  },
  // ── AFRICA ──
  {
    iso:"ZAF", name:"South Africa", flag:"🇿🇦", region:"africa",
    hormuzDep:40, fuelImpact:"+30%", status:"high",
    action:"Diesel rationing; Cape route port surge; Sasol CTL boost",
    detail:{ population:"60M", gdpBillion:"$377B", energyMix:"40% Hormuz; Sasol CTL + coal",
      reserves:"30 days",
      measures:["Sasol CTL on 24hr emergency shifts","Cape Town/Durban port boom from rerouted tankers","Diesel allocation rationing for farms","Eskom diesel emergency for generation"],
      economicRisk:"MODERATE — Cape route benefits offset import costs", source:"Wikipedia · NERSA SA" }
  },
  {
    iso:"KEN", name:"Kenya", flag:"🇰🇪", region:"africa",
    hormuzDep:100, fuelImpact:"+40%", status:"critical",
    action:"100% dependency; 20% stations dry; floriculture collapse",
    detail:{ population:"55M", gdpBillion:"$118B", energyMix:"100% Hormuz-route petroleum",
      reserves:"< 30 days",
      measures:["20% petrol stations ran dry by Mar 20","Floriculture exports ($1B/yr) hit","EAC emergency coordination","IMF emergency SDR drawdown"],
      economicRisk:"SEVERE — 100% import dependency; export industries collapsing", source:"Wikipedia · ERC Kenya" }
  },
  {
    iso:"NGA", name:"Nigeria", flag:"🇳🇬", region:"africa",
    hormuzDep:35, fuelImpact:"+35%", status:"moderate",
    action:"Crude windfall but imports refined; Dangote refinery emergency",
    detail:{ population:"220M", gdpBillion:"$477B", energyMix:"Crude exporter; imports refined",
      reserves:"N/A (crude exporter)",
      measures:["Dangote refinery emergency commissioning","Crude exports surging","NNPC emergency refined fuel imports","Naira FX pressure continues"],
      economicRisk:"MIXED — crude windfall vs refined import crisis", source:"Wikipedia · NNPC" }
  },
  {
    iso:"MUS", name:"Mauritius", flag:"🇲🇺", region:"africa",
    hormuzDep:100, fuelImpact:"Energy crisis", status:"critical",
    action:"21-day reserves at peak; energy emergency declared",
    detail:{ population:"1.3M", gdpBillion:"$14B", energyMix:"100% imported petroleum",
      reserves:"21 days (peak crisis)",
      measures:["State energy emergency declared","Tourism fuel priority","India bilateral emergency fuel line","IMF Article IV consultation","Generator imports fast-tracked"],
      economicRisk:"SEVERE — tiny island economy; 100% import dependent", source:"Wikipedia · CEB Mauritius" }
  },
  {
    iso:"DZA", name:"Algeria", flag:"🇩🇿", region:"africa",
    hormuzDep:0, fuelImpact:"Windfall", status:"benefiting",
    action:"EU LNG alternative; deals with Spain, Italy, Vietnam",
    detail:{ population:"46M", gdpBillion:"$242B", energyMix:"Gas & oil exporter (Sahara)",
      reserves:"N/A (exporter)",
      measures:["Medgaz pipeline to Spain at full capacity","TransMed to Italy renegotiated upward","Vietnam emergency LNG deal $8B","Sonatrach revenues +85%","Algeria as EU 'LNG friendship' partner"],
      economicRisk:"GREATLY BENEFITING — largest Africa/MENA winner from crisis", source:"Wikipedia · Sonatrach" }
  },
  {
    iso:"ZWE", name:"Zimbabwe", flag:"🇿🇼", region:"africa",
    hormuzDep:80, fuelImpact:"+40%", status:"critical",
    action:"Ethanol 5% → 20% blend; black market fuel +400%",
    detail:{ population:"16M", gdpBillion:"$31B", energyMix:"80% imported; sugarcane ethanol partially",
      reserves:"< 15 days",
      measures:["E20 ethanol blend mandate from Mar 15","Black market fuel at 3× official price","Mining diesel emergency allocation","ZERA weekly price reviews"],
      economicRisk:"SEVERE — hyperinflation compounded severely", source:"Wikipedia · ZERA Zimbabwe" }
  },
  {
    iso:"SOM", name:"Somalia", flag:"🇸🇴", region:"africa",
    hormuzDep:100, fuelImpact:"+70%", status:"critical",
    action:"No refining; aid shipments delayed; famine risk",
    detail:{ population:"18M", gdpBillion:"$9B", energyMix:"100% imported; no infrastructure",
      reserves:"< 7 days",
      measures:["WFP humanitarian fuel emergency","Aid via Djibouti delayed 4–6 weeks","Al-Shabaab exploiting crisis","UN OCHA emergency appeal $420M"],
      economicRisk:"CATASTROPHIC — famine risk compounding crisis", source:"Wikipedia · UNOCHA" }
  },
  {
    iso:"ETH", name:"Ethiopia", flag:"🇪🇹", region:"africa",
    hormuzDep:90, fuelImpact:"+40%", status:"critical",
    action:"Fuel restrictions; Tigray fuel suspended; 120M people affected",
    detail:{ population:"126M", gdpBillion:"$126B", energyMix:"90% imported via Djibouti",
      reserves:"< 20 days",
      measures:["Fuel restrictions on non-essential vehicles","Tigray region fuel suspended","120M people food + fuel insecure","WFP emergency fuel for aid operations","AU emergency coordination call"],
      economicRisk:"CATASTROPHIC — largest affected population in Africa", source:"Wikipedia · EEA Ethiopia" }
  },
  {
    iso:"SSD", name:"South Sudan", flag:"🇸🇸", region:"africa",
    hormuzDep:96, fuelImpact:"Blackouts", status:"critical",
    action:"96% electricity from oil; severe rationing; conflict ongoing",
    detail:{ population:"12M", gdpBillion:"$4B", energyMix:"96% oil-generated electricity",
      reserves:"< 10 days",
      measures:["Electricity rationing: 2hrs/day in Juba","Hospitals on generator fuel critical reserve","Sudan border conflict complicating supply","UN OCHA emergency fuel airlift"],
      economicRisk:"CATASTROPHIC — oil-dependent failed state pushed to collapse", source:"Wikipedia · UNOCHA" }
  },
];

// ═══════════════════════════════════════════════════
// WAR DAMAGE DATA
// ═══════════════════════════════════════════════════
export type StrikeEvent = {
  id: number; date: string; day: number;
  target: string; country: string; flag: string;
  type: "drone" | "missile" | "naval" | "airstrike" | "sabotage";
  attacker: string;
  droneCount: number; missileCount: number;
  casualties: { killed: number; wounded: number };
  damageUSD: number;
  severity: "catastrophic" | "severe" | "moderate" | "minor";
  description: string; infrastructure: string;
};

export const STRIKE_EVENTS: StrikeEvent[] = [
  { id:1,  date:"Mar 1, 2026",  day:1,  target:"Natanz & Fordow Nuclear Facilities",  country:"Iran",         flag:"🇮🇷", type:"airstrike", attacker:"USA + Israel",            droneCount:0,   missileCount:180, casualties:{killed:312, wounded:890},   damageUSD:4200,  severity:"catastrophic", description:"Operation Epic Fury — coordinated US B-2 + Israeli F-35I strikes on uranium enrichment. 180 precision munitions deployed. IRGC HQ also targeted.", infrastructure:"Nuclear enrichment centrifuges, air defence systems, IRGC command centres" },
  { id:2,  date:"Mar 2, 2026",  day:2,  target:"Isfahan Missile Production Complex",  country:"Iran",         flag:"🇮🇷", type:"airstrike", attacker:"USA + Israel",            droneCount:24,  missileCount:60,  casualties:{killed:87,  wounded:340},   damageUSD:1800,  severity:"severe",        description:"Follow-up strikes on IRGC ballistic missile production. Shahab-3 and Fateh assembly lines destroyed.", infrastructure:"Missile assembly, propellant production, IRGC logistics depot" },
  { id:3,  date:"Mar 4, 2026",  day:4,  target:"Strait of Hormuz — Tanker Fleet",    country:"Hormuz",       flag:"🌊",   type:"naval",     attacker:"IRGC Navy",              droneCount:40,  missileCount:8,   casualties:{killed:23,  wounded:67},    damageUSD:890,   severity:"severe",        description:"IRGC deploys naval mines and fast-attack boats. Three tankers struck. Hormuz officially closed. 20M bbl/day flow stops.", infrastructure:"International tanker fleet, Hormuz navigation infrastructure, 3 tankers sunk" },
  { id:4,  date:"Mar 7, 2026",  day:7,  target:"USS Gerald R. Ford (CVN-78)",        country:"Persian Gulf",  flag:"🇺🇸", type:"missile",   attacker:"IRGC + Hezbollah",       droneCount:120, missileCount:35,  casualties:{killed:18,  wounded:142},   damageUSD:3200,  severity:"catastrophic", description:"Shahed-136 drone + Fateh-110 missile swarm targeting US carrier. Ford survived with damage; destroyer USS Cole II critically damaged.", infrastructure:"US carrier battle group — destroyer severely damaged, carrier hull breach" },
  { id:5,  date:"Mar 9, 2026",  day:9,  target:"Tel Aviv & Haifa Industrial Port",   country:"Israel",       flag:"🇮🇱", type:"missile",   attacker:"IRGC + Hezbollah + Houthi",droneCount:200, missileCount:45,  casualties:{killed:34,  wounded:287},   damageUSD:2100,  severity:"severe",        description:"Coordinated barrage from Lebanon, Iran and Yemen. Iron Dome intercepted 89% but 5 ballistic missiles broke through. Haifa refinery damaged.", infrastructure:"Haifa oil refinery (partial), port infrastructure, residential buildings" },
  { id:6,  date:"Mar 12, 2026", day:12, target:"Kharg Island Oil Terminal",          country:"Iran",         flag:"🇮🇷", type:"airstrike", attacker:"USA + Israel",            droneCount:15,  missileCount:90,  casualties:{killed:45,  wounded:210},   damageUSD:5600,  severity:"catastrophic", description:"Kharg handles 90% of Iranian oil exports. Devastating strike collapses Iranian petroleum export capacity entirely.", infrastructure:"Oil loading jetties, storage tanks (12M bbl), pipeline infrastructure" },
  { id:7,  date:"Mar 15, 2026", day:15, target:"Aden & Hodeidah Ports (Yemen)",     country:"Yemen",        flag:"🇾🇪", type:"airstrike", attacker:"US Navy + Saudi Arabia",  droneCount:0,   missileCount:52,  casualties:{killed:156, wounded:430},   damageUSD:780,   severity:"severe",        description:"Houthi missile launch infrastructure targeted. Red Sea commercial corridor under threat. Civilian grain storage hit as collateral.", infrastructure:"Houthi missile sites, port infrastructure, civilian grain storage (collateral)" },
  { id:8,  date:"Mar 18, 2026", day:18, target:"Ras Laffan LNG Facility",           country:"Qatar",        flag:"🇶🇦", type:"missile",   attacker:"IRGC",                   droneCount:30,  missileCount:12,  casualties:{killed:78,  wounded:312},   damageUSD:18700, severity:"catastrophic", description:"MOST DESTRUCTIVE STRIKE. Ras Laffan — world's largest LNG facility — hit by Fateh-313 ballistic missiles. 17% of global LNG supply offline. 3–5yr repair.", infrastructure:"LNG liquefaction trains 1–4, storage spheres, loading jetties ($18.7B facility)" },
  { id:9,  date:"Mar 20, 2026", day:20, target:"Saudi Aramco Abqaiq Processing",    country:"Saudi Arabia", flag:"🇸🇦", type:"drone",     attacker:"IRGC proxy (Houthi)",    droneCount:80,  missileCount:0,   casualties:{killed:12,  wounded:89},    damageUSD:2400,  severity:"severe",        description:"Echoing 2019 attack. Houthi drones target Abqaiq. Saudi THAAD intercepted 70%. 10% production disruption for 72 hours.", infrastructure:"Crude oil processing stabilisers (partial), pipeline junction (partial)" },
  { id:10, date:"Mar 22, 2026", day:22, target:"Baghdad Green Zone & Oil Ministry", country:"Iraq",         flag:"🇮🇶", type:"missile",   attacker:"IRGC militia",           droneCount:0,   missileCount:8,   casualties:{killed:29,  wounded:145},   damageUSD:340,   severity:"moderate",      description:"IRGC-backed militias pressure Iraq to expel US forces. Oil Ministry administrative building damaged.", infrastructure:"Government compound, oil ministry administrative building" },
  { id:11, date:"Mar 27, 2026", day:27, target:"Eilat Port & Red Sea Fleet",        country:"Israel",       flag:"🇮🇱", type:"drone",     attacker:"Houthi (Yemen)",         droneCount:55,  missileCount:4,   casualties:{killed:8,   wounded:34},    damageUSD:420,   severity:"moderate",      description:"Houthi drones target Eilat port. Arrow-3 intercepts ballistic missiles but drone swarm breaches perimeter. Cargo ship sunk.", infrastructure:"Container ship (Panama-flagged sunk), port crane, oil pipeline terminal" },
  { id:12, date:"Apr 3, 2026",  day:34, target:"Dimona Nuclear Reactor (attempt)",  country:"Israel",       flag:"🇮🇱", type:"missile",   attacker:"IRGC",                   droneCount:0,   missileCount:22,  casualties:{killed:0,   wounded:4},     damageUSD:50,    severity:"minor",         description:"Attempted strike on Dimona Nuclear Research Center. ALL 22 ballistic missiles intercepted by Arrow-3. UN Security Council emergency session called.", infrastructure:"No significant damage — all intercepted. Minor perimeter fence damage." },
  { id:13, date:"Apr 7, 2026",  day:38, target:"IRGC HQ Tehran + Qom Bunkers",     country:"Iran",         flag:"🇮🇷", type:"airstrike", attacker:"USA",                     droneCount:0,   missileCount:240, casualties:{killed:520, wounded:1200},  damageUSD:7800,  severity:"catastrophic", description:"Trump 8PM deadline expires. Largest single-day strike: B-52H, B-2A, F-22 hit 40 targets across Tehran + Qom. GBU-57 Massive Ordnance Penetrators used for first time in combat.", infrastructure:"IRGC HQ destroyed, Qom underground bunkers, 18 missile sites, 6 radar installations" },
  { id:14, date:"Apr 10, 2026", day:41, target:"Iranian Navy Southern Fleet",       country:"Iran",         flag:"🇮🇷", type:"naval",     attacker:"US Navy + UK Royal Navy", droneCount:60,  missileCount:30,  casualties:{killed:234, wounded:560},   damageUSD:3100,  severity:"severe",        description:"Combined US-UK operation destroys Iran's southern fleet at Bandar Abbas. Hormuz partial navigation reopened under US Navy escort. Tanker traffic resuming.", infrastructure:"Iranian frigate fleet (4 ships sunk), Bandar Abbas naval base, 2 submarines" },
  { id:15, date:"Feb 28 – Apr 9, 2026", day:1, target:"UAE Cities, Airports & Energy Infrastructure", country:"UAE", flag:"🇦🇪", type:"missile", attacker:"IRGC (Iran)", droneCount:2256, missileCount:537, casualties:{killed:13, wounded:224}, damageUSD:4800, severity:"severe", description:"Sustained 40-day Iranian missile and drone campaign on UAE. 537 ballistic missiles, 2,256 drones and 26 cruise missiles fired. Targets: Al Dhafra Air Base, Dubai International Airport (3 strikes), Jebel Ali Port, Fujairah Oil Zone, Habshan gas plant, Palm Jumeirah hotels, AWS data centre Dubai. Most intercepted by THAAD/Patriot — debris caused civilian deaths across Abu Dhabi, Dubai, Fujairah and Sharjah.", infrastructure:"Dubai Int'l Airport (3 strikes), Habshan gas plant, Fujairah Oil Industry Zone, Jebel Ali Port, EGA Al Taweelah aluminium plant, Camp de la Paix (French base), Oracle/AWS data centres" },
];

export const WAR_STATS = {
  totalStrikes: 15, totalDrones: 2880, totalMissiles: 1323,
  totalKilled: 1569, totalWounded: 4934,
  totalDamageUSD: 56180,
  countriesStruck: 9,
  largestStrike: "Ras Laffan LNG ($18.7B damage, Mar 18)",
  hormuzStatus: "PARTIAL REOPEN (Apr 10, under US escort)",
};

// ═══════════════════════════════════════════════════
// CASUALTIES BY COUNTRY — OFFICIAL SOURCES
// Source: Wikipedia "Casualties of the 2026 Iran war"
// https://en.wikipedia.org/wiki/Casualties_of_the_2026_Iran_war
// As of: Apr 7, 2026 (latest confirmed data)
// Cross-referenced: Al Jazeera live tracker, NPR, US CENTCOM,
//   Iran Health Ministry, Lebanon Health Ministry, IDF
// ═══════════════════════════════════════════════════
export type CasualtyEntry = {
  country: string; flag: string;
  killedLow: number; killedHigh: number;
  injured: number;
  source: string;
};

export const CASUALTIES_BY_COUNTRY: CasualtyEntry[] = [
  { country:"Iran",            flag:"🇮🇷", killedLow:3375, killedHigh:7650, injured:26500, source:"Iran Health Ministry / Wikipedia" },
  { country:"Lebanon",         flag:"🇱🇧", killedLow:2089, killedHigh:2089, injured:6762,  source:"Lebanon Health Ministry / Wikipedia" },
  { country:"Iraq",            flag:"🇮🇶", killedLow:112,  killedHigh:112,  injured:224,   source:"Iraqi Health Authorities / Wikipedia" },
  { country:"Israel",          flag:"🇮🇱", killedLow:40,   killedHigh:40,   injured:7453,  source:"IDF + Israeli MoH / Wikipedia" },
  { country:"United States",   flag:"🇺🇸", killedLow:15,   killedHigh:15,   injured:538,   source:"US CENTCOM / Wikipedia" },
  { country:"Palestine (W.B)", flag:"🇵🇸", killedLow:14,   killedHigh:14,   injured:15,    source:"Palestinian Authority / Wikipedia" },
  { country:"UAE",             flag:"🇦🇪", killedLow:13,   killedHigh:13,   injured:224,   source:"UAE State Media / Wikipedia" },
  { country:"Kuwait",          flag:"🇰🇼", killedLow:10,   killedHigh:10,   injured:115,   source:"Kuwait State Media / Wikipedia" },
  { country:"Bahrain",         flag:"🇧🇭", killedLow:3,    killedHigh:3,    injured:42,    source:"Bahrain State Media / Wikipedia" },
  { country:"Saudi Arabia",    flag:"🇸🇦", killedLow:3,    killedHigh:3,    injured:29,    source:"Saudi State Media / Wikipedia" },
  { country:"Oman",            flag:"🇴🇲", killedLow:3,    killedHigh:3,    injured:15,    source:"Oman State Media / Wikipedia" },
  { country:"Philippines",     flag:"🇵🇭", killedLow:2,    killedHigh:2,    injured:0,     source:"DFA Philippines / Wikipedia" },
  { country:"France",          flag:"🇫🇷", killedLow:1,    killedHigh:1,    injured:7,     source:"French MoD / Wikipedia" },
  { country:"Syria",           flag:"🇸🇾", killedLow:1,    killedHigh:1,    injured:0,     source:"Wikipedia" },
  { country:"Jordan",          flag:"🇯🇴", killedLow:0,    killedHigh:0,    injured:29,    source:"Jordan State Media / Wikipedia" },
  { country:"Qatar",           flag:"🇶🇦", killedLow:0,    killedHigh:0,    injured:20,    source:"Qatar MoI / Wikipedia" },
  { country:"Azerbaijan",      flag:"🇦🇿", killedLow:0,    killedHigh:0,    injured:4,     source:"Wikipedia" },
];

// ═══════════════════════════════════════════════════
// NEWS DATA  — Apr 14, 2026
// ═══════════════════════════════════════════════════
export type NewsItem = {
  id: number; time: string;
  category: "military" | "energy" | "economy" | "diplomacy" | "humanitarian";
  headline: string; summary: string; source: string;
  impact: "critical" | "major" | "moderate" | "positive"; region: string;
};

export const NEWS: NewsItem[] = [
  { id:1,  time:"23:45 UTC", category:"diplomacy",   headline:"US–Iran Ceasefire Talks in Muscat Enter Second Day",                      summary:"US Secretary of State and Iranian FM met for 4 hours in Oman-brokered talks. Iran demands sanctions lifted; US demands unconditional Hormuz reopening. Brent dropped −0.4% on optimism. Oman playing pivotal mediator role between both parties.",              source:"Reuters · AFP",                      impact:"positive",  region:"Global" },
  { id:2,  time:"21:30 UTC", category:"energy",      headline:"Saudi Aramco Activates Maximum East-West Pipeline Capacity — 7M bbl/day", summary:"Aramco's Petroline East-West pipeline now pumping 7M barrels/day to Yanbu Red Sea terminal, bypassing Hormuz entirely. This represents the single largest non-Hormuz oil flow in history, providing partial relief to Asian importers.",                  source:"Saudi Aramco · Middle East Insider", impact:"positive",  region:"Middle East" },
  { id:3,  time:"20:15 UTC", category:"economy",     headline:"Gold Eases to $4,786/oz as Diplomacy Reduces Safe-Haven Demand",          summary:"Gold fell $35 from intraday high of $4,821 as US-Iran talks progress. Still up +48% year-on-year. Analysts: breakdown in talks could push gold rapidly back above $5,000/oz. All-time high of $5,602.22 remains Jan 28 record.",                       source:"Natural Resource Stocks · Bloomberg", impact:"moderate",  region:"Global" },
  { id:4,  time:"19:00 UTC", category:"military",    headline:"Pentagon: First Three Tankers Transit Hormuz Under US Naval Escort",      summary:"Three commercial tankers transited Hormuz under US 5th Fleet escort for the first time since Mar 4. Iran has not officially lifted blockade. IRGC naval presence remains. Shipping insurance 800% above pre-war levels despite partial opening.",              source:"Pentagon · Lloyd's of London",       impact:"positive",  region:"Persian Gulf" },
  { id:5,  time:"17:30 UTC", category:"humanitarian","headline":"UN: 340 Million People Facing Acute Energy Poverty Due to Crisis",      summary:"UNHCR and WFP joint report: 340M people in low-income nations facing acute energy poverty. Yemen, Somalia, Lebanon and South Sudan most critical. Emergency food-fuel corridor via Djibouti established. UN emergency appeal: $12 billion.",               source:"UNHCR · WFP",                       impact:"critical",  region:"Global" },
  { id:6,  time:"16:00 UTC", category:"economy",     headline:"IMF Slashes World Growth to +1.2% — Worst Forecast Since 2009",          summary:"IMF emergency update cuts 2026 global growth from +3.1% to +1.2% — worst since the 2009 financial crisis. Advanced economies average −0.2%. Emerging markets +2.8%. Debt-to-GDP ratios surging in Philippines, Pakistan, Lebanon.",                  source:"IMF · World Bank",                  impact:"critical",  region:"Global" },
  { id:7,  time:"14:45 UTC", category:"energy",      headline:"Australia Signs A$8B Emergency LNG Deal With Singapore",                 summary:"Woodside Energy and Singapore's EMA signed a 5-year emergency LNG supply contract. First cargo departs Darwin terminal within 72 hours. Deal also covers Taiwan and Philippines sub-contracts. Asia-Pacific LNG market stabilising slightly.",              source:"Woodside Energy · MTI Singapore",   impact:"positive",  region:"Asia-Pacific" },
  { id:8,  time:"13:00 UTC", category:"military",    headline:"Iran Offers 'Conditional Suspension' of Hormuz Mining Operations",       summary:"IRGC Navy commander states mines can be cleared within 72 hours if USA suspends airstrikes and sanctions. USA calls it 'insufficient.' Naval analysts: even post-agreement, full mine-clearance would take 2–3 weeks.",                                         source:"IRNA · US CENTCOM",                 impact:"major",     region:"Persian Gulf" },
  { id:9,  time:"11:30 UTC", category:"economy",     headline:"Philippines Peso Hits Historic Low; Central Bank Deploys $4B",           summary:"PHP hit 58.92/USD — historic low. Bangko Sentral ng Pilipinas deployed $4B in dollar reserves. Inflation running at 14.2% — highest since 1998. President Marcos extends State of National Emergency 30 more days.",                               source:"BSP · Philippine DOE",              impact:"critical",  region:"Asia" },
  { id:10, time:"10:00 UTC", category:"diplomacy",   headline:"China and Russia Propose Joint UN Ceasefire Resolution — USA/UK Veto",  summary:"China-Russia jointly proposed UNSC Resolution: 90-day ceasefire, Hormuz demilitarisation, international energy corridor. USA and UK vetoed. Second resolution being drafted. G7 emergency virtual summit called for Apr 16.",                              source:"UN · TASS · Xinhua",               impact:"major",     region:"Global" },
  { id:11, time:"08:30 UTC", category:"energy",      headline:"Algeria Becomes Europe's Emergency Gas Lifeline — Exports Up 85%",       summary:"Sonatrach increased gas exports 85% since Mar 1 via Medgaz/TransMed to Spain and Italy. New Vietnam deal worth $8B. Algeria FX reserves hit $85B — highest in 15 years. President Tebboune: 'Algeria's strategic moment has arrived.'",              source:"Sonatrach · Reuters",               impact:"positive",  region:"Africa/Europe" },
  { id:12, time:"07:00 UTC", category:"humanitarian","headline":"MSF: Fuel Shortage Causing Medical Crisis in 12 Countries",            summary:"Médecins Sans Frontières reports hospital generator fuel crises in Lebanon, Yemen, Gaza, Somalia, Zimbabwe, South Sudan, and 6 others. Surgeries being cancelled; ICU patients at risk. WHO secured emergency fuel aid for 8 countries ($340M).",           source:"MSF · WHO",                         impact:"critical",  region:"Global" },
  { id:13, time:"05:45 UTC", category:"economy",     headline:"DXY at 98.02 — Dollar at Weakest Since Nov 2024",                       summary:"US Dollar Index fell to 98.02 as peace talk optimism reduced safe-haven dollar demand. EUR/USD rallied to 1.082. Gold and oil inversely correlated. Dollar weakness partially supporting oil prices. Fed watching inflation implications.",     source:"Investing.com · Bloomberg",         impact:"moderate",  region:"Global" },
  { id:14, time:"04:00 UTC", category:"military",    headline:"IEA: 400M Barrel Reserve Release Prevented '$180/bbl Scenario'",        summary:"IEA post-release analysis: the Mar 31 coordinated 400M barrel release from 31 countries prevented a potential $180/bbl Brent scenario. Peak of $126 estimated to have reached $160–$180 without release. IEA calls for permanent reserve expansion.",   source:"IEA · Fatih Birol",                 impact:"positive",  region:"Global" },
  { id:15, time:"02:00 UTC", category:"economy",     headline:"Malaysia Ringgit Stabilises at 3.966 After BNM $2.8B Intervention",    summary:"Bank Negara Malaysia deployed $2.8B in dollar reserves after ringgit hit 4.05 intraday. Now stabilised at 3.966 mid-market. Malaysia's subsidised fuel at RM 3.87/L costing government RM 6.2B/month — political pressure mounting.",           source:"BNM · Pound Sterling Live",         impact:"moderate",  region:"Asia" },
];

// ═══════════════════════════════════════════════════
// CURRENCIES
// ═══════════════════════════════════════════════════
export const FX_RATES = [
  { pair:"USD/MYR", rate:3.9660,  prev:3.8820, note:"BNM intervention; intraday high 4.0500",                 trend:"up",   pegged:false },
  { pair:"USD/AED", rate:3.6725,  prev:3.6725, note:"Fixed peg since 1997 — UAE Central Bank",               trend:"flat", pegged:true  },
  { pair:"USD/SAR", rate:3.7500,  prev:3.7500, note:"Saudi riyal pegged to USD",                             trend:"flat", pegged:true  },
  { pair:"USD/JPY", rate:152.30,  prev:149.80, note:"BOJ yield curve control tested; ¥1.7T subsidies",       trend:"up",   pegged:false },
  { pair:"EUR/USD", rate:0.9250,  prev:0.9180, note:"ECB stagflation warning; Netherlands TTF crisis",        trend:"up",   pegged:false },
  { pair:"USD/INR", rate:87.45,   prev:85.20,  note:"RBI intervention; Russia oil pivot partly protecting",  trend:"up",   pegged:false },
  { pair:"USD/PHP", rate:58.92,   prev:54.30,  note:"Historic low; BSP $4B intervention; state emergency",   trend:"up",   pegged:false },
  { pair:"USD/PKR", rate:281.00,  prev:260.00, note:"IMF emergency talks; severe import crisis",             trend:"up",   pegged:false },
  { pair:"USD/KRW", rate:1385.00, prev:1340.00,note:"BOK holding; 208-day reserves provide buffer",          trend:"up",   pegged:false },
  { pair:"USD/TWD", rate:33.20,   prev:31.80,  note:"CBC intervention; TSMC power risk weighing on TWD",     trend:"up",   pegged:false },
  { pair:"USD/IDR", rate:16420,   prev:15800,  note:"Partial buffer from Pertamina domestic production",     trend:"up",   pegged:false },
  { pair:"USD/BDT", rate:119.50,  prev:108.00, note:"Garment export revenue threatened; IMF talks",          trend:"up",   pegged:false },
];
