import React, { useState } from 'react';
import { Sparkles, Utensils, ChevronRight, Flame, Dumbbell, Compass } from 'lucide-react';
import { SAMPLE_FOODS } from '../data/sampleFoods';

export default function SmartMealSuggester({
  remainingCalories = 600,
  remainingProtein = 35,
  onSelectSuggestion
}) {
  const [mealFocus, setMealFocus] = useState('smart'); // 'smart' | 'protein' | 'light'

  // Pick intelligent Indian dishes matching current remaining budget
  const getSuggestions = () => {
    let pool = [...SAMPLE_FOODS];

    if (mealFocus === 'protein') {
      // Prioritize protein (> 12g) and under remaining calories
      return pool
        .filter((f) => (f.macros?.protein || 0) >= 12 && f.calories <= Math.max(450, remainingCalories + 100))
        .sort((a, b) => (b.macros?.protein || 0) - (a.macros?.protein || 0))
        .slice(0, 3);
    } else if (mealFocus === 'light') {
      // Prioritize low calorie (< 380 kcal) and high digestion score
      return pool
        .filter((f) => f.calories <= 380)
        .sort((a, b) => a.calories - b.calories)
        .slice(0, 3);
    } else {
      // Smart balance: matches remaining calorie budget closely
      const target = Math.max(300, remainingCalories);
      return pool
        .sort((a, b) => Math.abs(a.calories - target) - Math.abs(b.calories - target))
        .slice(0, 3);
    }
  };

  const suggestions = getSuggestions();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 backdrop-blur-md">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5">
              <span>What Should I Eat Next?</span>
              <span className="text-[10px] uppercase font-bold text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                AI Coach
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Budget: <strong className="text-emerald-400">{remainingCalories} kcal</strong> & <strong className="text-cyan-400">{remainingProtein}g protein</strong> remaining today
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {[
            { id: 'smart', label: 'Balanced' },
            { id: 'protein', label: 'High Protein' },
            { id: 'light', label: 'Light' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMealFocus(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                mealFocus === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Indian Dishes Carousel / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {suggestions.map((dish) => (
          <div
            key={dish.id}
            onClick={() => onSelectSuggestion && onSelectSuggestion(dish)}
            className="group bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-2.5 transition flex items-center space-x-3 cursor-pointer active:scale-98 shadow-sm"
          >
            {/* Image Thumbnail */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0 relative">
              <img
                src={dish.image}
                alt={dish.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 pointer-events-none select-none"
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                {dish.name}
              </h5>
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                <span className="flex items-center space-x-0.5 text-amber-400 font-semibold">
                  <Flame className="w-3 h-3 inline" />
                  <span>{dish.calories} kcal</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-0.5 text-cyan-400 font-semibold">
                  <Dumbbell className="w-3 h-3 inline" />
                  <span>{dish.macros?.protein}g P</span>
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
