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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('scanner')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                NutriScan AI
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v3.8 Multimodal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Visual Food Recognition & Smart Calorie Estimator
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
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
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Daily Quick Gauge Pill */}
          <div 
            onClick={onOpenGoals}
            title="Click to adjust daily target"
            className="hidden md:flex items-center space-x-2 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 px-3 py-1.5 rounded-lg cursor-pointer transition text-xs"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-slate-200 font-semibold">{todayCalories}</span>
              <span className="text-slate-500"> / {dailyGoalCalories} kcal</span>
            </div>
            <div className="w-10 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* AI Mode Badge */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              isMockMode || !hasApiKey
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title="Click to configure Gemini API Key or Demo Mode"
          >
            {isMockMode || !hasApiKey ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Demo Mode</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Gemini Live</span>
              </>
            )}
          </button>

          {/* Goals button */}
          <button
            onClick={onOpenGoals}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80 transition"
            title="Customize Daily Goals & Macros"
            aria-label="Customize Goals"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80 transition"
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
