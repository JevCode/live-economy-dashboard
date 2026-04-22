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

// REMOVED 'stats' from Tab type - STATS TAB COMPLETELY REMOVED
type Tab = 'oil' | 'gold' | 'worldmap' | 'wardamage' | 'hormuz' | 'markets' | 'newsfeed' | 'currencies' | 'airlines' | 'fuelprices' | 'sanctions';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('oil');
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isDark, setIsDark] = useState(false);

  // Get translations for current language - FIXED TRANSLATION SYSTEM
  const t = translations[language];

  // Tab configuration - STATS TAB COMPLETELY REMOVED - Only 11 tabs now
  const tabs: { id: Tab; icon: string; label: keyof typeof t.navigation; isNew?: boolean }[] = [
    { id: 'oil', icon: '🛢', label: 'oil' },
    { id: 'gold', icon: '🥇', label: 'gold' },
    { id: 'worldmap', icon: '🌍', label: 'worldmap' },
    { id: 'wardamage', icon: '💥', label: 'wardamage' },
    { id: 'hormuz', icon: '⚓', label: 'hormuz' },
    { id: 'markets', icon: '📈', label: 'markets' },
    { id: 'newsfeed', icon: '📰', label: 'newsfeed' },
    { id: 'currencies', icon: '💱', label: 'currencies' },
    { id: 'airlines', icon: '✈️', label: 'airlines', isNew: true },
    { id: 'fuelprices', icon: '⛽', label: 'fuelprices', isNew: true },
    { id: 'sanctions', icon: '🚫', label: 'sanctions', isNew: true }
    // STATS TAB REMOVED - was { id: 'stats', icon: '📊', label: 'stats' }
  ];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Language options - All 12 languages supported
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
    { code: 'ru', flag: '🇷🇺', name: 'Русский' }
  ];

  const currencyOptions = Object.entries(currencies).map(([code, currency]) => ({
    code: code as Currency,
    flag: currency.flag,
    name: currency.name
  }));

  // FIXED: Render content function with all working components and removed stats case
  const renderContent = () => {
    switch (activeTab) {
      case 'oil': return <OilTab language={language} currency={currency} />;
      case 'gold': return <GoldTab language={language} currency={currency} />;
      case 'worldmap': return <WorldMapTab language={language} currency={currency} />;
      case 'wardamage': return <WarDamageTab language={language} currency={currency} />;
      case 'hormuz': return <HormuzTab language={language} currency={currency} />;
      case 'markets': return <MarketsTab language={language} currency={currency} />;
      case 'newsfeed': return <NewsFeedTab language={language} currency={currency} />;
      case 'currencies': return <CurrenciesTab language={language} currency={currency} />;
      case 'airlines': return <AirlinesTab language={language} currency={currency} />;
      case 'fuelprices': return <FuelPricesTab language={language} currency={currency} />;
      case 'sanctions': return <SanctionsTab language={language} currency={currency} />;
      // REMOVED: case 'stats': return <StatsTab language={language} currency={currency} />;
      default: return <OilTab language={language} currency={currency} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-mono">
        
        {/* Header */}
        <header className="border-b border-orange-500/30 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="text-orange-500 text-2xl font-bold">
                  <span className="text-white">Crisis</span>
                  <span className="text-orange-500">Market</span>
                  <span className="text-orange-300">.Live</span>
                </div>
              </div>

              {/* Header Info */}
              <div className="text-center">
                <div className="text-orange-400 text-xs uppercase tracking-wide">
                  {t.header.subtitle}
                </div>
                <div className="text-white text-sm font-semibold">
                  22 APR 2026 • {t.header.crisisDay} 54 • <span className="text-green-400">● LIVE</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                
                {/* Theme Toggle */}
                <button
                  onClick={() => setIsDark(!isDark)}
                  className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                  title="Switch to light mode"
                >
                  {isDark ? '☀️' : '🌙'}
                </button>

                {/* Language Selector - FIXED TO USE PROPER TRANSLATIONS */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-gray-800/50 border border-orange-500/30 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                >
                  {languageOptions.map(lang => (
                    <option key={lang.code} value={lang.code} className="bg-gray-900">
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>

                {/* Currency Selector */}
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="bg-gray-800/50 border border-orange-500/30 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                >
                  {currencyOptions.map(curr => (
                    <option key={curr.code} value={curr.code} className="bg-gray-900">
                      {curr.flag} {curr.code} — {curr.name}
                    </option>
                  ))}
                </select>

              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation - FIXED: Only 11 tabs (Stats removed) */}
        <nav className="bg-black/20 border-b border-orange-500/20 overflow-x-auto">
          <div className="container mx-auto px-4">
            <div className="flex gap-1 py-2 min-w-max">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap relative
                    ${activeTab === tab.id 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{t.navigation[tab.label]}</span>
                  {tab.isNew && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded">
                      NEW
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Scroll indicator for mobile */}
          <div className="text-center text-xs text-gray-500 py-1 md:hidden">
            ← {t.navigation.scrollTabs} →
          </div>
        </nav>

        {/* Main Content - FIXED: All tab components working */}
        <main className="container mx-auto px-4 py-6">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="mt-12 py-8 border-t border-gray-800 bg-black/40">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-2">
                CrisisMarket.Live · Apr 22, 2026 · Crisis Day 54 ·{' '}
                <a href="https://github.com/JevCode/live-economy-dashboard" 
                   className="text-orange-400 hover:text-orange-300 transition-colors">
                  GitHub
                </a>
              </div>
              <div className="text-gray-500 text-xs mb-2">
                Data sources: BBC · Reuters · Al Jazeera · Middle East Insider · Barchart · OilPrice.com · Pound Sterling Live · XE.com · Yahoo Finance
              </div>
              <div className="text-gray-500 text-xs mb-2">
                Auto-refreshes daily 08:00 UAE
              </div>
              <div className="text-gray-500 text-xs">
                ⚠️ For informational and educational purposes only. Not financial, investment, or trading advice. 
                Markets are volatile during crisis periods.
              </div>
            </div>
          </div>
        </footer>

      </div>
    </QueryClientProvider>
  );
}

export default App;
