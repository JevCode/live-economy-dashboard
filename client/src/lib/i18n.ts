export type Language = 'en' | 'bm' | 'ar' | 'zh' | 'hi' | 'fr' | 'es' | 'de' | 'ja' | 'ko' | 'tr' | 'ru';

export interface Translation {
  header: {
    title: string;
    subtitle: string;
    crisisDay: string;
  };
  navigation: {
    oil: string;
    gold: string;
    worldmap: string;
    wardamage: string;
    hormuz: string;
    markets: string;
    newsfeed: string;
    currencies: string;
    airlines: string;
    fuelprices: string;
    sanctions: string;
    scrollTabs: string;
  };
  oil: {
    title: string;
    brentCrude: string;
    wtiCrude: string;
    perBarrel: string;
    hormuzStatus: string;
    restricted: string;
    transitsToday: string;
    throughput: string;
    stranded: string;
    vessels: string;
    dailyCost: string;
    insurance: string;
    normal: string;
    timeline: string;
    events: string;
  };
  gold: {
    title: string;
    spotPrice: string;
    perOz: string;
    perGram: string;
    allTimeHigh: string;
    yearOnYear: string;
    karat: string;
    purity: string;
    commonUse: string;
    investment: string;
    highPurity: string;
    indian: string;
    middleEast: string;
    specialist: string;
    european: string;
    western: string;
    legalMinimum: string;
  };
  worldmap: {
    title: string;
    interactive: string;
    crisisMap: string;
  };
  wardamage: {
    title: string;
    infrastructure: string;
    impact: string;
  };
  hormuz: {
    title: string;
    straitStatus: string;
    shipping: string;
  };
  markets: {
    title: string;
    financial: string;
    data: string;
  };
  newsfeed: {
    title: string;
    dailyBriefing: string;
    reports: string;
    lastRefreshed: string;
    liveUpdates: string;
    fetching: string;
  };
  currencies: {
    title: string;
    conversion: string;
    rates: string;
  };
  airlines: {
    title: string;
    airspace: string;
    status: string;
    fuelSurcharges: string;
  };
  fuelprices: {
    title: string;
    calculator: string;
    livePrices: string;
    tankSize: string;
    fullTank: string;
    preWar: string;
    official: string;
  };
  sanctions: {
    title: string;
    tracker: string;
    entities: string;
    individuals: string;
    since: string;
  };
  common: {
    loading: string;
    error: string;
    refresh: string;
    today: string;
    live: string;
    new: string;
    crisis: string;
    day: string;
  };
}

export const translations: Record<Language, Translation> = {

  // ─── English ────────────────────────────────────────────────────────────────
  en: {
    header: {
      title: "WAR ECONOMY INTELLIGENCE DASHBOARD",
      subtitle: "REAL-TIME GLOBAL CRISIS MONITORING",
      crisisDay: "CRISIS DAY"
    },
    navigation: {
      oil: "OIL & ENERGY",
      gold: "GOLD",
      worldmap: "WORLD MAP",
      wardamage: "WAR DAMAGE",
      hormuz: "HORMUZ",
      markets: "MARKETS",
      newsfeed: "NEWS FEED",
      currencies: "CURRENCIES",
      airlines: "AIRLINES",
      fuelprices: "FUEL PRICES",
      sanctions: "SANCTIONS",
      scrollTabs: "SCROLL FOR MORE ✈️ AIRLINES · ⛽ FUEL · 🚫 SANCTIONS"
    },
    oil: {
      title: "Oil & Energy Crisis Monitor",
      brentCrude: "BRENT CRUDE",
      wtiCrude: "WTI CRUDE",
      perBarrel: "per barrel",
      hormuzStatus: "HORMUZ STATUS",
      restricted: "RESTRICTED",
      transitsToday: "Transits Today",
      throughput: "Throughput",
      stranded: "Stranded",
      vessels: "vessels",
      dailyCost: "Daily Cost",
      insurance: "Insurance",
      normal: "normal",
      timeline: "OIL PRICE TIMELINE",
      events: "CRISIS EVENT TIMELINE"
    },
    gold: {
      title: "Gold Market Intelligence",
      spotPrice: "Gold Spot Price",
      perOz: "per troy ounce",
      perGram: "per gram",
      allTimeHigh: "All-Time High",
      yearOnYear: "Year-on-Year",
      karat: "Karat",
      purity: "Purity",
      commonUse: "Common Use",
      investment: "Investment bars & coins",
      highPurity: "High-purity (rare)",
      indian: "Indian & Asian jewellery",
      middleEast: "Middle East jewellery",
      specialist: "Specialist & artisan",
      european: "European fine jewellery",
      western: "USA & Western jewellery",
      legalMinimum: "USA minimum legal gold"
    },
    worldmap: {
      title: "Crisis World Map",
      interactive: "Interactive",
      crisisMap: "Crisis Map"
    },
    wardamage: {
      title: "War Damage Assessment",
      infrastructure: "Infrastructure",
      impact: "Impact"
    },
    hormuz: {
      title: "Strait of Hormuz Monitor",
      straitStatus: "Strait Status",
      shipping: "Shipping"
    },
    markets: {
      title: "Global Financial Markets",
      financial: "Financial",
      data: "Data"
    },
    newsfeed: {
      title: "Live Intelligence Feed",
      dailyBriefing: "Daily Briefing",
      reports: "reports",
      lastRefreshed: "Last refreshed",
      liveUpdates: "LIVE UPDATES",
      fetching: "Fetching latest intelligence..."
    },
    currencies: {
      title: "Currency Exchange Rates",
      conversion: "Conversion",
      rates: "Rates"
    },
    airlines: {
      title: "Aviation Status & Airspace",
      airspace: "Airspace",
      status: "Status",
      fuelSurcharges: "Fuel Surcharges"
    },
    fuelprices: {
      title: "Fuel Price Calculator",
      calculator: "Calculator",
      livePrices: "Live Prices",
      tankSize: "Tank size",
      fullTank: "Full tank",
      preWar: "Pre-war",
      official: "Official"
    },
    sanctions: {
      title: "Sanctions Tracker",
      tracker: "Tracker",
      entities: "entities",
      individuals: "individuals",
      since: "Since"
    },
    common: {
      loading: "Loading...",
      error: "Error",
      refresh: "Refresh",
      today: "Today",
      live: "LIVE",
      new: "NEW",
      crisis: "Crisis",
      day: "Day"
    }
  },

  // ─── Bahasa Melayu ──────────────────────────────────────────────────────────
  bm: {
    header: {
      title: "PAPAN PEMUKA PERISIKAN EKONOMI PERANG",
      subtitle: "PEMANTAUAN KRISIS GLOBAL MASA NYATA",
      crisisDay: "HARI KRISIS"
    },
    navigation: {
      oil: "MINYAK & TENAGA",
      gold: "EMAS",
      worldmap: "PETA DUNIA",
      wardamage: "KEROSAKAN PERANG",
      hormuz: "HORMUZ",
      markets: "PASARAN",
      newsfeed: "SUAPAN BERITA",
      currencies: "MATA WANG",
      airlines: "PENERBANGAN",
      fuelprices: "HARGA BAHAN API",
      sanctions: "SEKATAN",
      scrollTabs: "TATAL UNTUK LEBIH ✈️ PENERBANGAN · ⛽ BAHAN API · 🚫 SEKATAN"
    },
    oil: {
      title: "Pemantau Krisis Minyak & Tenaga",
      brentCrude: "MINYAK MENTAH BRENT",
      wtiCrude: "MINYAK MENTAH WTI",
      perBarrel: "setiap tong",
      hormuzStatus: "STATUS HORMUZ",
      restricted: "TERHAD",
      transitsToday: "Transit Hari Ini",
      throughput: "Pemprosesan",
      stranded: "Terkandas",
      vessels: "kapal",
      dailyCost: "Kos Harian",
      insurance: "Insurans",
      normal: "biasa",
      timeline: "GARIS MASA HARGA MINYAK",
      events: "GARIS MASA PERISTIWA KRISIS"
    },
    gold: {
      title: "Perisikan Pasaran Emas",
      spotPrice: "Harga Spot Emas",
      perOz: "setiap auns troy",
      perGram: "setiap gram",
      allTimeHigh: "Tertinggi Sepanjang Masa",
      yearOnYear: "Tahun ke Tahun",
      karat: "Karat",
      purity: "Ketulenan",
      commonUse: "Penggunaan Biasa",
      investment: "Bar & syiling pelaburan",
      highPurity: "Ketulenan tinggi (jarang)",
      indian: "Barang kemas India & Asia",
      middleEast: "Barang kemas Timur Tengah",
      specialist: "Pakar & artisan",
      european: "Barang kemas halus Eropah",
      western: "Barang kemas USA & Barat",
      legalMinimum: "Emas legal minimum USA"
    },
    worldmap: {
      title: "Peta Dunia Krisis",
      interactive: "Interaktif",
      crisisMap: "Peta Krisis"
    },
    wardamage: {
      title: "Penilaian Kerosakan Perang",
      infrastructure: "Infrastruktur",
      impact: "Kesan"
    },
    hormuz: {
      title: "Pemantau Selat Hormuz",
      straitStatus: "Status Selat",
      shipping: "Perkapalan"
    },
    markets: {
      title: "Pasaran Kewangan Global",
      financial: "Kewangan",
      data: "Data"
    },
    newsfeed: {
      title: "Suapan Perisikan Langsung",
      dailyBriefing: "Taklimat Harian",
      reports: "laporan",
      lastRefreshed: "Terakhir disegarkan",
      liveUpdates: "KEMAS KINI LANGSUNG",
      fetching: "Mengambil perisikan terkini..."
    },
    currencies: {
      title: "Kadar Pertukaran Mata Wang",
      conversion: "Penukaran",
      rates: "Kadar"
    },
    airlines: {
      title: "Status Penerbangan & Ruang Udara",
      airspace: "Ruang Udara",
      status: "Status",
      fuelSurcharges: "Surcaj Bahan Api"
    },
    fuelprices: {
      title: "Kalkulator Harga Bahan Api",
      calculator: "Kalkulator",
      livePrices: "Harga Langsung",
      tankSize: "Saiz tangki",
      fullTank: "Tangki penuh",
      preWar: "Pra-perang",
      official: "Rasmi"
    },
    sanctions: {
      title: "Penjejak Sekatan",
      tracker: "Penjejak",
      entities: "entiti",
      individuals: "individu",
      since: "Sejak"
    },
    common: {
      loading: "Memuatkan...",
      error: "Ralat",
      refresh: "Segarkan",
      today: "Hari Ini",
      live: "LANGSUNG",
      new: "BARU",
      crisis: "Krisis",
      day: "Hari"
    }
  },

  // ─── Arabic ─────────────────────────────────────────────────────────────────
  ar: {
    header: {
      title: "لوحة تحكم استخبارات اقتصاد الحرب",
      subtitle: "مراقبة الأزمات العالمية في الوقت الفعلي",
      crisisDay: "يوم الأزمة"
    },
    navigation: {
      oil: "النفط والطاقة",
      gold: "الذهب",
      worldmap: "خريطة العالم",
      wardamage: "أضرار الحرب",
      hormuz: "هرمز",
      markets: "الأسواق",
      newsfeed: "الأخبار",
      currencies: "العملات",
      airlines: "الطيران",
      fuelprices: "أسعار الوقود",
      sanctions: "العقوبات",
      scrollTabs: "مرر للمزيد ✈️ الطيران · ⛽ الوقود · 🚫 العقوبات"
    },
    oil: {
      title: "مراقب أزمة النفط والطاقة",
      brentCrude: "خام برنت",
      wtiCrude: "خام WTI",
      perBarrel: "للبرميل",
      hormuzStatus: "حالة هرمز",
      restricted: "مقيد",
      transitsToday: "العبور اليوم",
      throughput: "الإنتاجية",
      stranded: "عالق",
      vessels: "سفينة",
      dailyCost: "التكلفة اليومية",
      insurance: "التأمين",
      normal: "عادي",
      timeline: "الجدول الزمني لأسعار النفط",
      events: "الجدول الزمني لأحداث الأزمة"
    },
    gold: {
      title: "استخبارات سوق الذهب",
      spotPrice: "سعر الذهب الفوري",
      perOz: "للأونصة الترويجية",
      perGram: "للجرام",
      allTimeHigh: "أعلى مستوى على الإطلاق",
      yearOnYear: "سنة بعد سنة",
      karat: "قيراط",
      purity: "النقاء",
      commonUse: "الاستخدام الشائع",
      investment: "سبائك وعملات استثمارية",
      highPurity: "نقاء عالي (نادر)",
      indian: "مجوهرات هندية وآسيوية",
      middleEast: "مجوهرات الشرق الأوسط",
      specialist: "متخصص وحرفي",
      european: "مجوهرات أوروبية راقية",
      western: "مجوهرات أمريكية وغربية",
      legalMinimum: "الحد الأدنى القانوني الأمريكي للذهب"
    },
    worldmap: {
      title: "خريطة الأزمات العالمية",
      interactive: "تفاعلية",
      crisisMap: "خريطة الأزمة"
    },
    wardamage: {
      title: "تقييم أضرار الحرب",
      infrastructure: "البنية التحتية",
      impact: "التأثير"
    },
    hormuz: {
      title: "مراقب مضيق هرمز",
      straitStatus: "حالة المضيق",
      shipping: "الشحن"
    },
    markets: {
      title: "الأسواق المالية العالمية",
      financial: "المالية",
      data: "البيانات"
    },
    newsfeed: {
      title: "تغذية الاستخبارات المباشرة",
      dailyBriefing: "الإحاطة اليومية",
      reports: "تقارير",
      lastRefreshed: "آخر تحديث",
      liveUpdates: "التحديثات المباشرة",
      fetching: "جلب أحدث المعلومات الاستخباراتية..."
    },
    currencies: {
      title: "أسعار صرف العملات",
      conversion: "التحويل",
      rates: "الأسعار"
    },
    airlines: {
      title: "حالة الطيران والمجال الجوي",
      airspace: "المجال الجوي",
      status: "الحالة",
      fuelSurcharges: "رسوم الوقود الإضافية"
    },
    fuelprices: {
      title: "حاسبة أسعار الوقود",
      calculator: "حاسبة",
      livePrices: "الأسعار المباشرة",
      tankSize: "حجم الخزان",
      fullTank: "خزان ممتلئ",
      preWar: "ما قبل الحرب",
      official: "رسمي"
    },
    sanctions: {
      title: "متتبع العقوبات",
      tracker: "متتبع",
      entities: "كيانات",
      individuals: "أفراد",
      since: "منذ"
    },
    common: {
      loading: "جاري التحميل...",
      error: "خطأ",
      refresh: "تحديث",
      today: "اليوم",
      live: "مباشر",
      new: "جديد",
      crisis: "الأزمة",
      day: "يوم"
    }
  },

  // ─── Chinese (Simplified) ───────────────────────────────────────────────────
  zh: {
    header: {
      title: "战争经济情报仪表板",
      subtitle: "实时全球危机监控",
      crisisDay: "危机日"
    },
    navigation: {
      oil: "石油与能源",
      gold: "黄金",
      worldmap: "世界地图",
      wardamage: "战争损害",
      hormuz: "霍尔木兹",
      markets: "市场",
      newsfeed: "新闻推送",
      currencies: "货币",
      airlines: "航空",
      fuelprices: "燃料价格",
      sanctions: "制裁",
      scrollTabs: "滑动查看更多 ✈️ 航空 · ⛽ 燃料 · 🚫 制裁"
    },
    oil: {
      title: "石油与能源危机监控",
      brentCrude: "布伦特原油",
      wtiCrude: "WTI原油",
      perBarrel: "每桶",
      hormuzStatus: "霍尔木兹状态",
      restricted: "受限",
      transitsToday: "今日过境",
      throughput: "吞吐量",
      stranded: "搁浅",
      vessels: "船只",
      dailyCost: "日成本",
      insurance: "保险",
      normal: "正常",
      timeline: "石油价格时间线",
      events: "危机事件时间线"
    },
    gold: {
      title: "黄金市场情报",
      spotPrice: "黄金现货价格",
      perOz: "每盎司",
      perGram: "每克",
      allTimeHigh: "历史最高",
      yearOnYear: "同比",
      karat: "K金",
      purity: "纯度",
      commonUse: "常见用途",
      investment: "投资金条与金币",
      highPurity: "高纯度（稀有）",
      indian: "印度与亚洲珠宝",
      middleEast: "中东珠宝",
      specialist: "专业与工艺",
      european: "欧洲精品珠宝",
      western: "美国与西方珠宝",
      legalMinimum: "美国法定最低黄金"
    },
    worldmap: {
      title: "全球危机地图",
      interactive: "互动",
      crisisMap: "危机地图"
    },
    wardamage: {
      title: "战争损害评估",
      infrastructure: "基础设施",
      impact: "影响"
    },
    hormuz: {
      title: "霍尔木兹海峡监控",
      straitStatus: "海峡状态",
      shipping: "航运"
    },
    markets: {
      title: "全球金融市场",
      financial: "金融",
      data: "数据"
    },
    newsfeed: {
      title: "实时情报推送",
      dailyBriefing: "每日简报",
      reports: "报告",
      lastRefreshed: "最后更新",
      liveUpdates: "实时更新",
      fetching: "正在获取最新情报..."
    },
    currencies: {
      title: "货币汇率",
      conversion: "兑换",
      rates: "汇率"
    },
    airlines: {
      title: "航空状态与领空",
      airspace: "领空",
      status: "状态",
      fuelSurcharges: "燃料附加费"
    },
    fuelprices: {
      title: "燃料价格计算器",
      calculator: "计算器",
      livePrices: "实时价格",
      tankSize: "油箱容量",
      fullTank: "满箱",
      preWar: "战前",
      official: "官方"
    },
    sanctions: {
      title: "制裁追踪器",
      tracker: "追踪器",
      entities: "实体",
      individuals: "个人",
      since: "自"
    },
    common: {
      loading: "加载中...",
      error: "错误",
      refresh: "刷新",
      today: "今天",
      live: "直播",
      new: "新",
      crisis: "危机",
      day: "日"
    }
  },

  // ─── Hindi ──────────────────────────────────────────────────────────────────
  hi: {
    header: {
      title: "युद्ध अर्थव्यवस्था खुफिया डैशबोर्ड",
      subtitle: "रियल-टाइम वैश्विक संकट निगरानी",
      crisisDay: "संकट दिवस"
    },
    navigation: {
      oil: "तेल और ऊर्जा",
      gold: "सोना",
      worldmap: "विश्व मानचित्र",
      wardamage: "युद्ध क्षति",
      hormuz: "हॉर्मुज",
      markets: "बाज़ार",
      newsfeed: "समाचार फ़ीड",
      currencies: "मुद्राएं",
      airlines: "एयरलाइन्स",
      fuelprices: "ईंधन मूल्य",
      sanctions: "प्रतिबंध",
      scrollTabs: "अधिक के लिए स्क्रॉल करें ✈️ एयरलाइन्स · ⛽ ईंधन · 🚫 प्रतिबंध"
    },
    oil: {
      title: "तेल और ऊर्जा संकट मॉनिटर",
      brentCrude: "ब्रेंट क्रूड",
      wtiCrude: "WTI क्रूड",
      perBarrel: "प्रति बैरल",
      hormuzStatus: "हॉर्मुज स्थिति",
      restricted: "प्रतिबंधित",
      transitsToday: "आज पारगमन",
      throughput: "थ्रूपुट",
      stranded: "फंसे हुए",
      vessels: "पोत",
      dailyCost: "दैनिक लागत",
      insurance: "बीमा",
      normal: "सामान्य",
      timeline: "तेल मूल्य समयरेखा",
      events: "संकट घटना समयरेखा"
    },
    gold: {
      title: "स्वर्ण बाज़ार खुफिया",
      spotPrice: "सोना स्पॉट मूल्य",
      perOz: "प्रति औंस",
      perGram: "प्रति ग्राम",
      allTimeHigh: "सर्वकालिक उच्च",
      yearOnYear: "साल-दर-साल",
      karat: "कैरेट",
      purity: "शुद्धता",
      commonUse: "सामान्य उपयोग",
      investment: "निवेश बार और सिक्के",
      highPurity: "उच्च शुद्धता (दुर्लभ)",
      indian: "भारतीय और एशियाई आभूषण",
      middleEast: "मध्य पूर्वी आभूषण",
      specialist: "विशेषज्ञ और कारीगर",
      european: "यूरोपीय बेहतरीन आभूषण",
      western: "अमेरिकी और पश्चिमी आभूषण",
      legalMinimum: "अमेरिकी न्यूनतम कानूनी सोना"
    },
    worldmap: {
      title: "वैश्विक संकट मानचित्र",
      interactive: "इंटरैक्टिव",
      crisisMap: "संकट मानचित्र"
    },
    wardamage: {
      title: "युद्ध क्षति मूल्यांकन",
      infrastructure: "अवसंरचना",
      impact: "प्रभाव"
    },
    hormuz: {
      title: "हॉर्मुज जलडमरूमध्य मॉनिटर",
      straitStatus: "जलडमरूमध्य स्थिति",
      shipping: "शिपिंग"
    },
    markets: {
      title: "वैश्विक वित्तीय बाज़ार",
      financial: "वित्तीय",
      data: "डेटा"
    },
    newsfeed: {
      title: "लाइव खुफिया फ़ीड",
      dailyBriefing: "दैनिक ब्रीफिंग",
      reports: "रिपोर्ट",
      lastRefreshed: "अंतिम अपडेट",
      liveUpdates: "लाइव अपडेट",
      fetching: "नवीनतम खुफिया जानकारी प्राप्त हो रही है..."
    },
    currencies: {
      title: "मुद्रा विनिमय दरें",
      conversion: "रूपांतरण",
      rates: "दरें"
    },
    airlines: {
      title: "विमानन स्थिति और हवाई क्षेत्र",
      airspace: "हवाई क्षेत्र",
      status: "स्थिति",
      fuelSurcharges: "ईंधन अधिभार"
    },
    fuelprices: {
      title: "ईंधन मूल्य कैलकुलेटर",
      calculator: "कैलकुलेटर",
      livePrices: "लाइव मूल्य",
      tankSize: "टैंक का आकार",
      fullTank: "पूरा टैंक",
      preWar: "युद्ध-पूर्व",
      official: "आधिकारिक"
    },
    sanctions: {
      title: "प्रतिबंध ट्रैकर",
      tracker: "ट्रैकर",
      entities: "संस्थाएं",
      individuals: "व्यक्ति",
      since: "से"
    },
    common: {
      loading: "लोड हो रहा है...",
      error: "त्रुटि",
      refresh: "ताज़ा करें",
      today: "आज",
      live: "लाइव",
      new: "नया",
      crisis: "संकट",
      day: "दिन"
    }
  },

  // ─── French ─────────────────────────────────────────────────────────────────
  fr: {
    header: {
      title: "TABLEAU DE BORD D'INTELLIGENCE ÉCONOMIQUE DE GUERRE",
      subtitle: "SURVEILLANCE MONDIALE DES CRISES EN TEMPS RÉEL",
      crisisDay: "JOUR DE CRISE"
    },
    navigation: {
      oil: "PÉTROLE ET ÉNERGIE",
      gold: "OR",
      worldmap: "CARTE DU MONDE",
      wardamage: "DOMMAGES DE GUERRE",
      hormuz: "HORMUZ",
      markets: "MARCHÉS",
      newsfeed: "ACTUALITÉS",
      currencies: "DEVISES",
      airlines: "COMPAGNIES AÉRIENNES",
      fuelprices: "PRIX DU CARBURANT",
      sanctions: "SANCTIONS",
      scrollTabs: "DÉFILER POUR PLUS ✈️ AÉRIEN · ⛽ CARBURANT · 🚫 SANCTIONS"
    },
    oil: {
      title: "Moniteur de Crise Pétrolière et Énergétique",
      brentCrude: "BRUT BRENT",
      wtiCrude: "BRUT WTI",
      perBarrel: "par baril",
      hormuzStatus: "STATUT HORMUZ",
      restricted: "RESTREINT",
      transitsToday: "Transits Aujourd'hui",
      throughput: "Débit",
      stranded: "Bloqué",
      vessels: "navires",
      dailyCost: "Coût Quotidien",
      insurance: "Assurance",
      normal: "normal",
      timeline: "CHRONOLOGIE DES PRIX DU PÉTROLE",
      events: "CHRONOLOGIE DES ÉVÉNEMENTS DE CRISE"
    },
    gold: {
      title: "Intelligence du Marché de l'Or",
      spotPrice: "Prix de l'Or au Comptant",
      perOz: "par once troy",
      perGram: "par gramme",
      allTimeHigh: "Plus Haut Historique",
      yearOnYear: "Année sur Année",
      karat: "Carat",
      purity: "Pureté",
      commonUse: "Usage Courant",
      investment: "Lingots et pièces d'investissement",
      highPurity: "Haute pureté (rare)",
      indian: "Bijoux indiens et asiatiques",
      middleEast: "Bijoux du Moyen-Orient",
      specialist: "Spécialiste et artisan",
      european: "Bijoux fins européens",
      western: "Bijoux américains et occidentaux",
      legalMinimum: "Or légal minimum américain"
    },
    worldmap: {
      title: "Carte Mondiale des Crises",
      interactive: "Interactif",
      crisisMap: "Carte de Crise"
    },
    wardamage: {
      title: "Évaluation des Dommages de Guerre",
      infrastructure: "Infrastructure",
      impact: "Impact"
    },
    hormuz: {
      title: "Moniteur du Détroit d'Hormuz",
      straitStatus: "Statut du Détroit",
      shipping: "Transport Maritime"
    },
    markets: {
      title: "Marchés Financiers Mondiaux",
      financial: "Financier",
      data: "Données"
    },
    newsfeed: {
      title: "Flux d'Intelligence en Direct",
      dailyBriefing: "Briefing Quotidien",
      reports: "rapports",
      lastRefreshed: "Dernière actualisation",
      liveUpdates: "MISES À JOUR EN DIRECT",
      fetching: "Récupération des dernières informations..."
    },
    currencies: {
      title: "Taux de Change des Devises",
      conversion: "Conversion",
      rates: "Taux"
    },
    airlines: {
      title: "Statut de l'Aviation et de l'Espace Aérien",
      airspace: "Espace Aérien",
      status: "Statut",
      fuelSurcharges: "Surtaxes Carburant"
    },
    fuelprices: {
      title: "Calculateur de Prix du Carburant",
      calculator: "Calculateur",
      livePrices: "Prix en Direct",
      tankSize: "Taille du réservoir",
      fullTank: "Plein",
      preWar: "Avant-guerre",
      official: "Officiel"
    },
    sanctions: {
      title: "Suivi des Sanctions",
      tracker: "Suivi",
      entities: "entités",
      individuals: "individus",
      since: "Depuis"
    },
    common: {
      loading: "Chargement...",
      error: "Erreur",
      refresh: "Actualiser",
      today: "Aujourd'hui",
      live: "EN DIRECT",
      new: "NOUVEAU",
      crisis: "Crise",
      day: "Jour"
    }
  },

  // ─── Spanish ────────────────────────────────────────────────────────────────
  es: {
    header: {
      title: "PANEL DE INTELIGENCIA ECONÓMICA DE GUERRA",
      subtitle: "MONITOREO GLOBAL DE CRISIS EN TIEMPO REAL",
      crisisDay: "DÍA DE CRISIS"
    },
    navigation: {
      oil: "PETRÓLEO Y ENERGÍA",
      gold: "ORO",
      worldmap: "MAPA MUNDIAL",
      wardamage: "DAÑOS DE GUERRA",
      hormuz: "HORMUZ",
      markets: "MERCADOS",
      newsfeed: "NOTICIAS",
      currencies: "DIVISAS",
      airlines: "AEROLÍNEAS",
      fuelprices: "PRECIOS COMBUSTIBLE",
      sanctions: "SANCIONES",
      scrollTabs: "DESPLAZAR PARA MÁS ✈️ AÉREAS · ⛽ COMBUSTIBLE · 🚫 SANCIONES"
    },
    oil: {
      title: "Monitor de Crisis de Petróleo y Energía",
      brentCrude: "CRUDO BRENT",
      wtiCrude: "CRUDO WTI",
      perBarrel: "por barril",
      hormuzStatus: "ESTADO HORMUZ",
      restricted: "RESTRINGIDO",
      transitsToday: "Tránsitos Hoy",
      throughput: "Rendimiento",
      stranded: "Varado",
      vessels: "buques",
      dailyCost: "Costo Diario",
      insurance: "Seguro",
      normal: "normal",
      timeline: "LÍNEA DE TIEMPO PRECIOS PETRÓLEO",
      events: "LÍNEA DE TIEMPO EVENTOS DE CRISIS"
    },
    gold: {
      title: "Inteligencia del Mercado del Oro",
      spotPrice: "Precio del Oro al Contado",
      perOz: "por onza troy",
      perGram: "por gramo",
      allTimeHigh: "Máximo Histórico",
      yearOnYear: "Año tras Año",
      karat: "Quilate",
      purity: "Pureza",
      commonUse: "Uso Común",
      investment: "Barras y monedas de inversión",
      highPurity: "Alta pureza (raro)",
      indian: "Joyería india y asiática",
      middleEast: "Joyería de Oriente Medio",
      specialist: "Especialista y artesano",
      european: "Joyería fina europea",
      western: "Joyería americana y occidental",
      legalMinimum: "Oro legal mínimo americano"
    },
    worldmap: {
      title: "Mapa Mundial de Crisis",
      interactive: "Interactivo",
      crisisMap: "Mapa de Crisis"
    },
    wardamage: {
      title: "Evaluación de Daños de Guerra",
      infrastructure: "Infraestructura",
      impact: "Impacto"
    },
    hormuz: {
      title: "Monitor del Estrecho de Hormuz",
      straitStatus: "Estado del Estrecho",
      shipping: "Envío"
    },
    markets: {
      title: "Mercados Financieros Globales",
      financial: "Financiero",
      data: "Datos"
    },
    newsfeed: {
      title: "Feed de Inteligencia en Vivo",
      dailyBriefing: "Briefing Diario",
      reports: "informes",
      lastRefreshed: "Última actualización",
      liveUpdates: "ACTUALIZACIONES EN VIVO",
      fetching: "Obteniendo última información de inteligencia..."
    },
    currencies: {
      title: "Tipos de Cambio de Divisas",
      conversion: "Conversión",
      rates: "Tasas"
    },
    airlines: {
      title: "Estado de Aviación y Espacio Aéreo",
      airspace: "Espacio Aéreo",
      status: "Estado",
      fuelSurcharges: "Recargos de Combustible"
    },
    fuelprices: {
      title: "Calculadora de Precios de Combustible",
      calculator: "Calculadora",
      livePrices: "Precios en Vivo",
      tankSize: "Tamaño del tanque",
      fullTank: "Tanque lleno",
      preWar: "Pre-guerra",
      official: "Oficial"
    },
    sanctions: {
      title: "Rastreador de Sanciones",
      tracker: "Rastreador",
      entities: "entidades",
      individuals: "individuos",
      since: "Desde"
    },
    common: {
      loading: "Cargando...",
      error: "Error",
      refresh: "Actualizar",
      today: "Hoy",
      live: "EN VIVO",
      new: "NUEVO",
      crisis: "Crisis",
      day: "Día"
    }
  },

  // ─── German ─────────────────────────────────────────────────────────────────
  de: {
    header: {
      title: "KRIEGSWIRTSCHAFTS-INTELLIGENCE-DASHBOARD",
      subtitle: "ECHTZEIT-ÜBERWACHUNG GLOBALER KRISEN",
      crisisDay: "KRISENTAG"
    },
    navigation: {
      oil: "ÖL & ENERGIE",
      gold: "GOLD",
      worldmap: "WELTKARTE",
      wardamage: "KRIEGSSCHÄDEN",
      hormuz: "HORMUZ",
      markets: "MÄRKTE",
      newsfeed: "NACHRICHTEN",
      currencies: "WÄHRUNGEN",
      airlines: "FLUGGESELLSCHAFTEN",
      fuelprices: "KRAFTSTOFFPREISE",
      sanctions: "SANKTIONEN",
      scrollTabs: "FÜR MEHR SCROLLEN ✈️ FLUG · ⛽ KRAFTSTOFF · 🚫 SANKTIONEN"
    },
    oil: {
      title: "Öl- und Energiekrisen-Monitor",
      brentCrude: "BRENT-ROHÖL",
      wtiCrude: "WTI-ROHÖL",
      perBarrel: "pro Barrel",
      hormuzStatus: "HORMUZ-STATUS",
      restricted: "EINGESCHRÄNKT",
      transitsToday: "Durchfahrten Heute",
      throughput: "Durchsatz",
      stranded: "Gestrandet",
      vessels: "Schiffe",
      dailyCost: "Tägliche Kosten",
      insurance: "Versicherung",
      normal: "normal",
      timeline: "ÖLPREIS-ZEITLINIE",
      events: "KRISEN-EREIGNIS-ZEITLINIE"
    },
    gold: {
      title: "Goldmarkt-Intelligence",
      spotPrice: "Gold-Kassapreis",
      perOz: "pro Feinunze",
      perGram: "pro Gramm",
      allTimeHigh: "Allzeithoch",
      yearOnYear: "Jahr für Jahr",
      karat: "Karat",
      purity: "Reinheit",
      commonUse: "Häufige Verwendung",
      investment: "Investment-Barren & Münzen",
      highPurity: "Hohe Reinheit (selten)",
      indian: "Indischer & asiatischer Schmuck",
      middleEast: "Nahost-Schmuck",
      specialist: "Spezialist & Handwerker",
      european: "Europäischer Feinschmuck",
      western: "US-amerikanischer & westlicher Schmuck",
      legalMinimum: "US-amerikanisches gesetzliches Minimum-Gold"
    },
    worldmap: {
      title: "Globale Krisenweltkarte",
      interactive: "Interaktiv",
      crisisMap: "Krisenkarte"
    },
    wardamage: {
      title: "Kriegsschadensbewertung",
      infrastructure: "Infrastruktur",
      impact: "Auswirkung"
    },
    hormuz: {
      title: "Straße-von-Hormuz-Monitor",
      straitStatus: "Meerengenstatus",
      shipping: "Schifffahrt"
    },
    markets: {
      title: "Globale Finanzmärkte",
      financial: "Finanziell",
      data: "Daten"
    },
    newsfeed: {
      title: "Live-Intelligence-Feed",
      dailyBriefing: "Tägliches Briefing",
      reports: "Berichte",
      lastRefreshed: "Zuletzt aktualisiert",
      liveUpdates: "LIVE-UPDATES",
      fetching: "Neueste Informationen werden abgerufen..."
    },
    currencies: {
      title: "Währungswechselkurse",
      conversion: "Umwandlung",
      rates: "Kurse"
    },
    airlines: {
      title: "Luftfahrt- und Luftraumstatus",
      airspace: "Luftraum",
      status: "Status",
      fuelSurcharges: "Treibstoffzuschläge"
    },
    fuelprices: {
      title: "Kraftstoffpreis-Rechner",
      calculator: "Rechner",
      livePrices: "Live-Preise",
      tankSize: "Tankgröße",
      fullTank: "Voller Tank",
      preWar: "Vorkriegszeit",
      official: "Offiziell"
    },
    sanctions: {
      title: "Sanktions-Tracker",
      tracker: "Tracker",
      entities: "Entitäten",
      individuals: "Individuen",
      since: "Seit"
    },
    common: {
      loading: "Laden...",
      error: "Fehler",
      refresh: "Aktualisieren",
      today: "Heute",
      live: "LIVE",
      new: "NEU",
      crisis: "Krise",
      day: "Tag"
    }
  },

  // ─── Japanese ───────────────────────────────────────────────────────────────
  ja: {
    header: {
      title: "戦争経済情報ダッシュボード",
      subtitle: "リアルタイム・グローバル危機モニタリング",
      crisisDay: "危機の日"
    },
    navigation: {
      oil: "石油・エネルギー",
      gold: "ゴールド",
      worldmap: "世界地図",
      wardamage: "戦争被害",
      hormuz: "ホルムズ",
      markets: "市場",
      newsfeed: "ニュースフィード",
      currencies: "通貨",
      airlines: "航空会社",
      fuelprices: "燃料価格",
      sanctions: "制裁",
      scrollTabs: "もっと見る ✈️ 航空 · ⛽ 燃料 · 🚫 制裁"
    },
    oil: {
      title: "石油・エネルギー危機モニター",
      brentCrude: "ブレント原油",
      wtiCrude: "WTI原油",
      perBarrel: "バレル当たり",
      hormuzStatus: "ホルムズ状況",
      restricted: "制限",
      transitsToday: "本日の通過",
      throughput: "スループット",
      stranded: "立ち往生",
      vessels: "船舶",
      dailyCost: "日間コスト",
      insurance: "保険",
      normal: "通常",
      timeline: "石油価格タイムライン",
      events: "危機イベントタイムライン"
    },
    gold: {
      title: "金市場インテリジェンス",
      spotPrice: "ゴールドスポット価格",
      perOz: "トロイオンス当たり",
      perGram: "グラム当たり",
      allTimeHigh: "史上最高値",
      yearOnYear: "前年比",
      karat: "カラット",
      purity: "純度",
      commonUse: "一般的な用途",
      investment: "投資用バー・コイン",
      highPurity: "高純度（希少）",
      indian: "インド・アジア系ジュエリー",
      middleEast: "中東ジュエリー",
      specialist: "専門・職人",
      european: "ヨーロッパ高級ジュエリー",
      western: "アメリカ・西欧ジュエリー",
      legalMinimum: "アメリカ法定最低ゴールド"
    },
    worldmap: {
      title: "グローバル危機世界地図",
      interactive: "インタラクティブ",
      crisisMap: "危機地図"
    },
    wardamage: {
      title: "戦争被害評価",
      infrastructure: "インフラ",
      impact: "影響"
    },
    hormuz: {
      title: "ホルムズ海峡モニター",
      straitStatus: "海峡状況",
      shipping: "海運"
    },
    markets: {
      title: "グローバル金融市場",
      financial: "金融",
      data: "データ"
    },
    newsfeed: {
      title: "ライブ・インテリジェンス・フィード",
      dailyBriefing: "日次ブリーフィング",
      reports: "レポート",
      lastRefreshed: "最終更新",
      liveUpdates: "ライブアップデート",
      fetching: "最新情報を取得中..."
    },
    currencies: {
      title: "通貨為替レート",
      conversion: "換算",
      rates: "レート"
    },
    airlines: {
      title: "航空・領空状況",
      airspace: "領空",
      status: "状況",
      fuelSurcharges: "燃油サーチャージ"
    },
    fuelprices: {
      title: "燃料価格計算機",
      calculator: "計算機",
      livePrices: "ライブ価格",
      tankSize: "タンクサイズ",
      fullTank: "満タン",
      preWar: "戦争前",
      official: "公式"
    },
    sanctions: {
      title: "制裁トラッカー",
      tracker: "トラッカー",
      entities: "エンティティ",
      individuals: "個人",
      since: "から"
    },
    common: {
      loading: "読み込み中...",
      error: "エラー",
      refresh: "更新",
      today: "今日",
      live: "ライブ",
      new: "新規",
      crisis: "危機",
      day: "日"
    }
  },

  // ─── Korean ─────────────────────────────────────────────────────────────────
  ko: {
    header: {
      title: "전쟁 경제 정보 대시보드",
      subtitle: "실시간 글로벌 위기 모니터링",
      crisisDay: "위기 일수"
    },
    navigation: {
      oil: "석유 및 에너지",
      gold: "금",
      worldmap: "세계 지도",
      wardamage: "전쟁 피해",
      hormuz: "호르무즈",
      markets: "시장",
      newsfeed: "뉴스 피드",
      currencies: "통화",
      airlines: "항공사",
      fuelprices: "연료 가격",
      sanctions: "제재",
      scrollTabs: "더 보기 스크롤 ✈️ 항공 · ⛽ 연료 · 🚫 제재"
    },
    oil: {
      title: "석유 및 에너지 위기 모니터",
      brentCrude: "브렌트 원유",
      wtiCrude: "WTI 원유",
      perBarrel: "배럴당",
      hormuzStatus: "호르무즈 상황",
      restricted: "제한됨",
      transitsToday: "오늘 통과",
      throughput: "처리량",
      stranded: "좌초",
      vessels: "선박",
      dailyCost: "일일 비용",
      insurance: "보험",
      normal: "정상",
      timeline: "석유 가격 타임라인",
      events: "위기 이벤트 타임라인"
    },
    gold: {
      title: "금 시장 인텔리전스",
      spotPrice: "금 현물 가격",
      perOz: "트로이 온스당",
      perGram: "그램당",
      allTimeHigh: "사상 최고치",
      yearOnYear: "전년 대비",
      karat: "캐럿",
      purity: "순도",
      commonUse: "일반적 용도",
      investment: "투자용 바 및 코인",
      highPurity: "고순도 (희귀)",
      indian: "인도 및 아시아 장신구",
      middleEast: "중동 장신구",
      specialist: "전문 및 수공예",
      european: "유럽 고급 장신구",
      western: "미국 및 서구 장신구",
      legalMinimum: "미국 법정 최소 금"
    },
    worldmap: {
      title: "글로벌 위기 세계 지도",
      interactive: "인터랙티브",
      crisisMap: "위기 지도"
    },
    wardamage: {
      title: "전쟁 피해 평가",
      infrastructure: "인프라",
      impact: "영향"
    },
    hormuz: {
      title: "호르무즈 해협 모니터",
      straitStatus: "해협 상황",
      shipping: "해운"
    },
    markets: {
      title: "글로벌 금융 시장",
      financial: "금융",
      data: "데이터"
    },
    newsfeed: {
      title: "실시간 인텔리전스 피드",
      dailyBriefing: "일일 브리핑",
      reports: "보고서",
      lastRefreshed: "마지막 새로고침",
      liveUpdates: "실시간 업데이트",
      fetching: "최신 정보 가져오는 중..."
    },
    currencies: {
      title: "환율",
      conversion: "변환",
      rates: "환율"
    },
    airlines: {
      title: "항공 상황 및 영공",
      airspace: "영공",
      status: "상황",
      fuelSurcharges: "연료할증료"
    },
    fuelprices: {
      title: "연료 가격 계산기",
      calculator: "계산기",
      livePrices: "실시간 가격",
      tankSize: "탱크 크기",
      fullTank: "만탱",
      preWar: "전쟁 전",
      official: "공식"
    },
    sanctions: {
      title: "제재 추적기",
      tracker: "추적기",
      entities: "기관",
      individuals: "개인",
      since: "이후"
    },
    common: {
      loading: "로딩 중...",
      error: "오류",
      refresh: "새로고침",
      today: "오늘",
      live: "라이브",
      new: "신규",
      crisis: "위기",
      day: "일"
    }
  },

  // ─── Turkish ────────────────────────────────────────────────────────────────
  tr: {
    header: {
      title: "SAVAŞ EKONOMİSİ İSTİHBARAT PANELİ",
      subtitle: "GERÇEK ZAMANLI KÜRESEL KRİZ İZLEME",
      crisisDay: "KRİZ GÜNÜ"
    },
    navigation: {
      oil: "PETROL VE ENERJİ",
      gold: "ALTIN",
      worldmap: "DÜNYA HARİTASI",
      wardamage: "SAVAŞ HASARI",
      hormuz: "HÜRMÜZ",
      markets: "PİYASALAR",
      newsfeed: "HABER AKIŞI",
      currencies: "PARA BİRİMLERİ",
      airlines: "HAVA YOLLARI",
      fuelprices: "YAKIT FİYATLARI",
      sanctions: "YAPTIRIMLAR",
      scrollTabs: "DAHA FAZLA İÇİN KAYDIRIN ✈️ HAVAYOLLARI · ⛽ YAKIT · 🚫 YAPTIRIMLAR"
    },
    oil: {
      title: "Petrol ve Enerji Krizi Monitörü",
      brentCrude: "BRENT HAM",
      wtiCrude: "WTI HAM",
      perBarrel: "varil başına",
      hormuzStatus: "HÜRMÜZ DURUMU",
      restricted: "KISITLI",
      transitsToday: "Bugünkü Geçişler",
      throughput: "Verim",
      stranded: "Mahsur",
      vessels: "gemi",
      dailyCost: "Günlük Maliyet",
      insurance: "Sigorta",
      normal: "normal",
      timeline: "PETROL FİYAT ZAMANÇİZGİSİ",
      events: "KRİZ OLAY ZAMANÇİZGİSİ"
    },
    gold: {
      title: "Altın Piyasası İstihbaratı",
      spotPrice: "Altın Spot Fiyatı",
      perOz: "troy ons başına",
      perGram: "gram başına",
      allTimeHigh: "Tüm Zamanların Rekoru",
      yearOnYear: "Yıllık",
      karat: "Karat",
      purity: "Saflık",
      commonUse: "Yaygın Kullanım",
      investment: "Yatırım çubukları ve madeni paralar",
      highPurity: "Yüksek saflık (nadir)",
      indian: "Hint ve Asya mücevherleri",
      middleEast: "Orta Doğu mücevherleri",
      specialist: "Uzman ve zanaatkâr",
      european: "Avrupa ince mücevherleri",
      western: "ABD ve Batı mücevherleri",
      legalMinimum: "ABD minimum yasal altın"
    },
    worldmap: {
      title: "Küresel Kriz Dünya Haritası",
      interactive: "Etkileşimli",
      crisisMap: "Kriz Haritası"
    },
    wardamage: {
      title: "Savaş Hasarı Değerlendirmesi",
      infrastructure: "Altyapı",
      impact: "Etki"
    },
    hormuz: {
      title: "Hürmüz Boğazı Monitörü",
      straitStatus: "Boğaz Durumu",
      shipping: "Nakliye"
    },
    markets: {
      title: "Küresel Finansal Piyasalar",
      financial: "Finansal",
      data: "Veri"
    },
    newsfeed: {
      title: "Canlı İstihbarat Akışı",
      dailyBriefing: "Günlük Brifing",
      reports: "rapor",
      lastRefreshed: "Son yenileme",
      liveUpdates: "CANLI GÜNCELLEMELER",
      fetching: "En son istihbarat bilgileri alınıyor..."
    },
    currencies: {
      title: "Döviz Kurları",
      conversion: "Dönüşüm",
      rates: "Oranlar"
    },
    airlines: {
      title: "Havacılık ve Hava Sahası Durumu",
      airspace: "Hava Sahası",
      status: "Durum",
      fuelSurcharges: "Yakıt Ek Ücretleri"
    },
    fuelprices: {
      title: "Yakıt Fiyat Hesaplayıcısı",
      calculator: "Hesaplayıcı",
      livePrices: "Canlı Fiyatlar",
      tankSize: "Depo boyutu",
      fullTank: "Tam depo",
      preWar: "Savaş öncesi",
      official: "Resmi"
    },
    sanctions: {
      title: "Yaptırım İzleyicisi",
      tracker: "İzleyici",
      entities: "kuruluş",
      individuals: "kişi",
      since: "Dan beri"
    },
    common: {
      loading: "Yükleniyor...",
      error: "Hata",
      refresh: "Yenile",
      today: "Bugün",
      live: "CANLI",
      new: "YENİ",
      crisis: "Kriz",
      day: "Gün"
    }
  },

  // ─── Russian ────────────────────────────────────────────────────────────────
  ru: {
    header: {
      title: "ПАНЕЛЬ РАЗВЕДКИ ВОЕННОЙ ЭКОНОМИКИ",
      subtitle: "МОНИТОРИНГ ГЛОБАЛЬНЫХ КРИЗИСОВ В РЕАЛЬНОМ ВРЕМЕНИ",
      crisisDay: "ДЕНЬ КРИЗИСА"
    },
    navigation: {
      oil: "НЕФТЬ И ЭНЕРГИЯ",
      gold: "ЗОЛОТО",
      worldmap: "КАРТА МИРА",
      wardamage: "ВОЕННЫЙ УЩЕРБ",
      hormuz: "ОРМУЗ",
      markets: "РЫНКИ",
      newsfeed: "НОВОСТИ",
      currencies: "ВАЛЮТЫ",
      airlines: "АВИАКОМПАНИИ",
      fuelprices: "ЦЕНЫ НА ТОПЛИВО",
      sanctions: "САНКЦИИ",
      scrollTabs: "ПРОКРУТИТЕ ДЛЯ БОЛЬШЕГО ✈️ АВИАЦИЯ · ⛽ ТОПЛИВО · 🚫 САНКЦИИ"
    },
    oil: {
      title: "Монитор Нефтяного и Энергетического Кризиса",
      brentCrude: "НЕФТЬ БРЕНТ",
      wtiCrude: "НЕФТЬ WTI",
      perBarrel: "за баррель",
      hormuzStatus: "СТАТУС ОРМУЗ",
      restricted: "ОГРАНИЧЕН",
      transitsToday: "Транзиты Сегодня",
      throughput: "Пропускная Способность",
      stranded: "Застрявшие",
      vessels: "судов",
      dailyCost: "Дневная Стоимость",
      insurance: "Страхование",
      normal: "нормально",
      timeline: "ХРОНОЛОГИЯ ЦЕН НА НЕФТЬ",
      events: "ХРОНОЛОГИЯ КРИЗИСНЫХ СОБЫТИЙ"
    },
    gold: {
      title: "Разведка Рынка Золота",
      spotPrice: "Спотовая Цена Золота",
      perOz: "за тройскую унцию",
      perGram: "за грамм",
      allTimeHigh: "Рекорд Всех Времен",
      yearOnYear: "Год к Году",
      karat: "Карат",
      purity: "Чистота",
      commonUse: "Обычное Использование",
      investment: "Инвестиционные слитки и монеты",
      highPurity: "Высокая чистота (редко)",
      indian: "Индийские и азиатские украшения",
      middleEast: "Ювелирные изделия Ближнего Востока",
      specialist: "Специалист и ремесленник",
      european: "Европейские изящные украшения",
      western: "Американские и западные украшения",
      legalMinimum: "Минимальное легальное золото США"
    },
    worldmap: {
      title: "Глобальная Кризисная Карта Мира",
      interactive: "Интерактивная",
      crisisMap: "Карта Кризиса"
    },
    wardamage: {
      title: "Оценка Военного Ущерба",
      infrastructure: "Инфраструктура",
      impact: "Воздействие"
    },
    hormuz: {
      title: "Монитор Ормузского Пролива",
      straitStatus: "Статус Пролива",
      shipping: "Судоходство"
    },
    markets: {
      title: "Глобальные Финансовые Рынки",
      financial: "Финансовые",
      data: "Данные"
    },
    newsfeed: {
      title: "Прямой Разведывательный Канал",
      dailyBriefing: "Ежедневный Брифинг",
      reports: "отчетов",
      lastRefreshed: "Последнее обновление",
      liveUpdates: "ПРЯМЫЕ ОБНОВЛЕНИЯ",
      fetching: "Получение последних разведданных..."
    },
    currencies: {
      title: "Курсы Обмена Валют",
      conversion: "Конвертация",
      rates: "Курсы"
    },
    airlines: {
      title: "Статус Авиации и Воздушного Пространства",
      airspace: "Воздушное Пространство",
      status: "Статус",
      fuelSurcharges: "Топливные Доплаты"
    },
    fuelprices: {
      title: "Калькулятор Цен на Топливо",
      calculator: "Калькулятор",
      livePrices: "Прямые Цены",
      tankSize: "Размер бака",
      fullTank: "Полный бак",
      preWar: "До войны",
      official: "Официальный"
    },
    sanctions: {
      title: "Трекер Санкций",
      tracker: "Трекер",
      entities: "субъекты",
      individuals: "лица",
      since: "С"
    },
    common: {
      loading: "Загрузка...",
      error: "Ошибка",
      refresh: "Обновить",
      today: "Сегодня",
      live: "ПРЯМОЙ",
      new: "НОВЫЙ",
      crisis: "Кризис",
      day: "День"
    }
  }
};

// Helper function to get translation
export function getTranslation(language: Language): Translation {
  return translations[language] || translations.en;
}

// Helper function to get available languages
export function getAvailableLanguages(): Array<{ code: Language; name: string; flag: string }> {
  return [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'bm', name: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ];
}
