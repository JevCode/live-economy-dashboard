import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { translations, Language } from './lib/i18n';
import { currencies, Currency } from './lib/currencies';

// Import all tab components
import OilTab from './components/OilTab';
import GoldTab from './components/GoldTab';
import NewsFeedTab from './components/NewsFeedTab';
import {
  WorldMapTab,
  WarDamageTab,
  HormuzTab,
  MarketsTab,
  CurrenciesTab,
  AirlinesTab,
  FuelPricesTab,
  SanctionsTab
} from './components/AllTabComponents';

const queryClient = new QueryClient();

type Tab = 'oil' | 'gold' | 'worldmap' | 'wardamage' | 'hormuz' | 'markets' | 'newsfeed' | 'currencies' | 'airlines' | 'fuelprices' | 'sanctions';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('oil');
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isDark, setIsDark] = useState(false);

  const t = translations[language];

  const tabs: { id: Tab; icon: string; label: keyof typeof t.navigation; isNew?: boolean }[] = [
    { id: 'oil',        icon: '🛢',  label: 'oil' },
    { id: 'gold',       icon: '🥇',  label: 'gold' },
    { id: 'worldmap',   icon: '🌍',  label: 'worldmap' },
    { id: 'wardamage',  icon: '💥',  label: 'wardamage' },
    { id: 'hormuz',     icon: '⚓',  label: 'hormuz' },
    { id: 'markets',    icon: '📈',  label: 'markets' },
    { id: 'newsfeed',   icon: '📰',  label: 'newsfeed' },
    { id: 'currencies', icon: '💱',  label: 'currencies' },
    { id: 'airlines',   icon: '✈️',  label: 'airlines',   isNew: true },
    { id: 'fuelprices', icon: '⛽',  label: 'fuelprices', isNew: true },
    { id: 'sanctions',  icon: '🚫',  label: 'sanctions',  isNew: true },
  ];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.title = t.header.title;
  }, [isDark, t]);

  const languageOptions: { code: Language; flag: string; name: string }[] = [
    { code: 'en', flag: '🇺🇸', name: 'English' },
    { code: 'bm', flag: '🇲🇾', name: 'Bahasa Melayu' },
    { code: 'ar', flag: '🇸🇦', name: 'العربية' },
    { code: 'zh', flag: '🇨🇳', name: '中文' },
    { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
    { code: 'fr', flag: '🇫🇷', name: 'Français' },
    { code: 'es', flag: '🇪🇸', name: 'Español' },
    { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
    { code: 'ja', flag: '🇯🇵', name: '日本語' },
    { code: 'ko', flag: '🇰🇷', name: '한국어' },
    { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
    { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  ];

  const currencyOptions = Object.entries(currencies).map(([code, cur]) => ({
    code: code as Currency,
    flag: cur.flag,
    name: cur.name,
  }));

  const renderContent = () => {
    switch (activeTab) {
      case 'oil':        return <OilTab language={language} currency={currency} />;
      case 'gold':       return <GoldTab language={language} currency={currency} />;
      case 'worldmap':   return <WorldMapTab language={language} />;
      case 'wardamage':  return <WarDamageTab language={language} />;
      case 'hormuz':     return <HormuzTab language={language} />;
      case 'markets':    return <MarketsTab language={language} currency={currency} />;
      case 'newsfeed':   return <NewsFeedTab language={language} />;
      case 'currencies': return <CurrenciesTab language={language} currency={currency} />;
      case 'airlines':   return <AirlinesTab language={language} />;
      case 'fuelprices': return <FuelPricesTab language={language} currency={currency} />;
      case 'sanctions':  return <SanctionsTab language={language} />;
      default:           return <OilTab language={language} currency={currency} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen ${isDark ? 'dark bg-gray-950' : 'bg-gray-100'}`}>

        {/* Header */}
        <header className={`sticky top-0 z-50 border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

            {/* Logo + Title */}
            <div className="flex items-center gap-3 min-w-0">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-label="War Economy Intelligence Dashboard" className="shrink-0">
                <rect width="36" height="36" rx="8" fill="#f97316"/>
                <polygon points="18,8 28,26 8,26" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                <circle cx="18" cy="19" r="2.5" fill="white"/>
                <line x1="18" y1="12" x2="18" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div className="min-w-0">
                <h1 className={`text-sm font-bold tracking-widest leading-tight truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t.header.title}
                </h1>
                <p className={`text-xs tracking-wider ${isDark ? 'text-orange-400' : 'text-orange-500'}`}>
                  {t.header.subtitle}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Crisis Day badge */}
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"/>
                {t.header.crisisDay} 127
              </span>

              {/* Currency selector */}
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as Currency)}
                className={`text-xs px-2 py-1.5 rounded-lg border font-medium cursor-pointer ${
                  isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-700'
                }`}
              >
                {currencyOptions.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>

              {/* Language selector */}
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as Language)}
                className={`text-xs px-2 py-1.5 rounded-lg border font-medium cursor-pointer ${
                  isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-700'
                }`}
              >
                {languageOptions.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                ))}
              </select>

              {/* Dark mode toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700'
                    : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {isDark ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="max-w-screen-2xl mx-auto px-4">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                      transition-all whitespace-nowrap relative shrink-0
                      ${activeTab === tab.id
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                        : isDark
                          ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span>{tab.icon}</span>
                    <span>{t.navigation[tab.label]}</span>
                    {tab.isNew && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full leading-tight">
                        NEW
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className={`text-center text-xs py-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                ← {t.navigation.scrollTabs} →
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-screen-2xl mx-auto px-4 py-6">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className={`border-t mt-12 py-6 ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <div className="max-w-screen-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className={`text-xs tracking-wider font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t.header.title}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              {t.header.subtitle} · {t.common.live}
            </p>
          </div>
        </footer>

      </div>
    </QueryClientProvider>
  );
}

export default App;
