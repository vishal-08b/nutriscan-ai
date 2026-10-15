import React from 'react';
import { 
  Sparkles, 
  CalendarDays, 
  Camera, 
  Settings, 
  Sliders, 
  Globe 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenGoals,
  onOpenSettings,
  isMockMode,
  hasApiKey,
  todayCalories,
  dailyGoalCalories,
  streak = 3,
  scanStats,
  onOpenUpgrade
}) {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md pt-[max(0px,env(safe-area-inset-top))] transition-all">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center space-x-2.5 cursor-pointer active:scale-95 transition-transform" 
          onClick={() => setActiveTab('scanner')}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#00F5A0] via-[#00E5B8] to-[#00D9F5] flex items-center justify-center shadow-lg shadow-[#00F5A0]/25 text-slate-950 font-bold shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-base sm:text-xl tracking-tight bg-gradient-to-r from-[#00F5A0] via-[#00E5B8] to-[#00D9F5] bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(0,245,160,0.3)]">
                {t('appName')}
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-extrabold rounded-full bg-[#00F5A0]/15 text-[#00F5A0] border border-[#00F5A0]/30 shadow-sm">
                {t('indianCuisine')}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on mobile - mobile uses bottom bar) */}
        <div className="hidden sm:flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'scanner'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t('aiScanner')}</span>
          </button>

          <button
            onClick={() => setActiveTab('diary')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
              activeTab === 'diary'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>{t('dailyDiary')}</span>
            {todayCalories > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'diary' ? 'bg-slate-900 text-emerald-300' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {todayCalories} kcal
              </span>
            )}
          </button>
        </div>

        {/* Right Action Icons & Status */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Quick Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition text-[11px] sm:text-xs font-bold cursor-pointer active:scale-95"
            title="Switch Language / भाषा बदलें"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Pro / Free Plan Badge Button */}
          {scanStats?.tier === 'pro' ? (
            <button
              onClick={onOpenUpgrade}
              className="flex items-center space-x-1 px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] sm:text-xs font-extrabold hover:bg-emerald-500/30 transition cursor-pointer active:scale-95 shadow-sm"
              title={language === 'hi' ? 'प्रो सदस्यता सक्रिय' : 'Pro Membership Active'}
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>PRO</span>
            </button>
          ) : (
            <button
              onClick={onOpenUpgrade}
              className="flex items-center space-x-1 px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 text-slate-950 font-black text-[11px] sm:text-xs transition shadow-sm cursor-pointer active:scale-95"
              title={language === 'hi' ? 'प्रो में अपग्रेड करें' : 'Upgrade to Pro'}
            >
              <span>⚡ {scanStats?.remaining ?? 5}/5</span>
              <span className="hidden xs:inline">PRO</span>
            </button>
          )}





          {/* Desktop Goals button */}
          <button
            onClick={onOpenGoals}
            className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80 transition"
            title={language === 'hi' ? 'दैनिक लक्ष्य और पोषक तत्व बदलें' : 'Customize Daily Goals & Macros'}
            aria-label="Customize Goals"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Desktop Settings button */}
          <button
            onClick={onOpenSettings}
            className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80 transition"
            title={language === 'hi' ? 'सेटिंग्स और प्रोफ़ाइल' : 'API Key & Application Settings'}
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
