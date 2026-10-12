import React, { useState } from 'react';
import { X, Sliders, Check, Flame, Dumbbell, Wheat, Droplet, Sparkles } from 'lucide-react';
import { GOAL_PRESETS } from '../data/sampleFoods';
import { useLanguage } from '../context/LanguageContext';

export default function GoalsModal({ isOpen, onClose, currentGoals, onSaveGoals }) {
  if (!isOpen) return null;

  const { t, language } = useLanguage();
  const [calories, setCalories] = useState(currentGoals.dailyCalories || 2000);
  const [protein, setProtein] = useState(currentGoals.proteinGrams || 140);
  const [carbs, setCarbs] = useState(currentGoals.carbsGrams || 210);
  const [fat, setFat] = useState(currentGoals.fatGrams || 65);
  const [water, setWater] = useState(currentGoals.waterMl || 2500);

  const presetNameMap = {
    'Fat Loss & Cutting': language === 'hi' ? 'फैट लॉस व कटिंग' : 'Fat Loss & Cutting',
    'Balanced Indian Diet': language === 'hi' ? 'संतुलित भारतीय आहार' : 'Balanced Indian Diet',
    'Muscle Gain & Bulking': language === 'hi' ? 'मसल्स गेन व बल्किंग' : 'Muscle Gain & Bulking',
    'Low Carb / High Protein': language === 'hi' ? 'लो कार्ब / हाई प्रोटीन' : 'Low Carb / High Protein',
  };

  const applyPreset = (preset) => {
    setCalories(preset.calories);
    setProtein(preset.protein);
    setCarbs(preset.carbs);
    setFat(preset.fat);
  };

  const handleSave = () => {
    onSaveGoals({
      dailyCalories: Number(calories),
      proteinGrams: Number(protein),
      carbsGrams: Number(carbs),
      fatGrams: Number(fat),
      waterMl: Number(water),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('customizeGoals')}</h3>
              <p className="text-xs text-slate-400">{t('setDailyTargets')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            {t('goalPresets')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {GOAL_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`p-3 rounded-xl border text-left transition ${
                  calories === preset.calories && protein === preset.protein
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="font-semibold text-xs text-white">
                  {presetNameMap[preset.name] || preset.name}
                </div>
                <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
                  {preset.calories} kcal
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {preset.protein}g {t('protein')} • {preset.carbs}g {t('carbs')} • {preset.fat}g {t('fat')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Calories Slider & Input */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{t('dailyCalorieTarget')}</span>
            </span>
            <div className="flex items-baseline space-x-1">
              <input
                type="number"
                min="1000"
                max="5000"
                step="50"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-sm font-bold text-white outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-slate-500">kcal</span>
            </div>
          </div>
          <input
            type="range"
            min="1200"
            max="4000"
            step="50"
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>

        {/* Macros Breakdown Inputs */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            {t('macroTargetsGrams')}
          </span>

          <div className="grid grid-cols-3 gap-3">
            {/* Protein */}
            <div className="bg-slate-950/60 border border-cyan-500/20 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-cyan-400 block mb-1">{t('protein')}</span>
              <div className="flex items-baseline space-x-1">
                <input
                  type="number"
                  min="30"
                  max="350"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm font-bold text-white outline-none focus:border-cyan-500"
                />
                <span className="text-xs text-slate-500">g</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {Math.round((protein * 4 * 100) / (calories || 1))}% cals
              </span>
            </div>

            {/* Carbs */}
            <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-amber-400 block mb-1">{t('carbs')}</span>
              <div className="flex items-baseline space-x-1">
                <input
                  type="number"
                  min="20"
                  max="600"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm font-bold text-white outline-none focus:border-amber-500"
                />
                <span className="text-xs text-slate-500">g</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {Math.round((carbs * 4 * 100) / (calories || 1))}% cals
              </span>
            </div>

            {/* Fat */}
            <div className="bg-slate-950/60 border border-rose-500/20 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-rose-400 block mb-1">{t('fat')}</span>
              <div className="flex items-baseline space-x-1">
                <input
                  type="number"
                  min="20"
                  max="200"
                  value={fat}
                  onChange={(e) => setFat(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm font-bold text-white outline-none focus:border-rose-500"
                />
                <span className="text-xs text-slate-500">g</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {Math.round((fat * 9 * 100) / (calories || 1))}% cals
              </span>
            </div>
          </div>
        </div>

        {/* Water Intake Goal */}
        <div className="bg-slate-950/60 border border-sky-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-sky-400 block">{t('dailyHydrationTarget')}</span>
            <span className="text-[11px] text-slate-400">{t('hydrationRecommended')}</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <input
              type="number"
              min="1000"
              max="6000"
              step="250"
              value={water}
              onChange={(e) => setWater(Number(e.target.value))}
              className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-sm font-bold text-white outline-none focus:border-sky-500"
            />
            <span className="text-xs text-slate-500">ml</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition"
          >
            {t('applyTargets')}
          </button>
        </div>

      </div>
    </div>
  );
}
