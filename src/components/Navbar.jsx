import React from 'react';
import { 
  Sparkles, 
  Flame, 
  CalendarDays, 
  Camera, 
  Settings, 
  Sliders, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenGoals,
  onOpenSettings,
  isMockMode,
  hasApiKey,
  todayCalories,
  dailyGoalCalories
}) {
  const percentComplete = Math.min(100, Math.round((todayCalories / (dailyGoalCalories || 2000)) * 100));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md pt-[max(0px,env(safe-area-inset-top))] transition-all">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center space-x-2.5 cursor-pointer active:scale-95 transition-transform" 
          onClick={() => setActiveTab('scanner')}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                NutriScan AI
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Indian Cuisine
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
              Visual Food Recognition & Smart Calorie Estimator
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
            <span>AI Scanner</span>
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
            <span>Daily Diary</span>
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
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          {/* Daily Quick Gauge Pill */}
          <div 
            onClick={onOpenGoals}
            title="Click to adjust daily target"
            className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl cursor-pointer transition text-[11px] sm:text-xs"
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <div className="font-semibold text-slate-200">
              <span>{todayCalories}</span>
              <span className="text-slate-500 hidden sm:inline"> / {dailyGoalCalories} kcal</span>
            </div>
            <div className="w-7 sm:w-10 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden xs:block">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* AI Mode Badge */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold border transition ${
              isMockMode || !hasApiKey
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title="Click to configure Gemini API Key or Demo Mode"
          >
            {isMockMode || !hasApiKey ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Demo</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                <span>Live AI</span>
              </>
            )}
          </button>

          {/* Desktop Goals button */}
          <button
            onClick={onOpenGoals}
            className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80 transition"
            title="Customize Daily Goals & Macros"
            aria-label="Customize Goals"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Desktop Settings button */}
          <button
            onClick={onOpenSettings}
            className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80 transition"
            title="API Key & Application Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
