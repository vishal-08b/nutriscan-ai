import React, { useState } from 'react';
import { 
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplet, 
  Plus, 
  Trash2, 
  Camera, 
  Check, 
  Share2, 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  GlassWater
} from 'lucide-react';
import MacroRings from './MacroRings';
import SmartMealSuggester from './SmartMealSuggester';
import ShareModal from './ShareModal';

export default function DailyTracker({
  meals = [],
  onDeleteMeal,
  onAddManualMeal,
  onSwitchToScanner,
  goals,
  waterMl,
  onUpdateWater,
  selectedDate,
  setSelectedDate
}) {
  const [showManualModal, setShowManualModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualMealType, setManualMealType] = useState('Breakfast');

  // Filter meals for the selected date
  const filteredMeals = meals.filter((m) => m.date === selectedDate);

  // Compute daily totals
  const totalCalories = filteredMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = Math.round(filteredMeals.reduce((sum, m) => sum + (m.macros?.protein || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(filteredMeals.reduce((sum, m) => sum + (m.macros?.carbs || 0), 0) * 10) / 10;
  const totalFat = Math.round(filteredMeals.reduce((sum, m) => sum + (m.macros?.fat || 0), 0) * 10) / 10;

  const remainingCalories = Math.max(0, (goals?.dailyCalories || 2000) - totalCalories);
  const caloriePercent = Math.min(100, Math.round((totalCalories / (goals?.dailyCalories || 2000)) * 100));

  const proteinGoal = goals?.proteinGrams || 140;
  const carbsGoal = goals?.carbsGrams || 210;
  const fatGoal = goals?.fatGrams || 65;
  const waterGoal = goals?.waterMl || 2500;

  const proteinPercent = Math.min(100, Math.round((totalProtein / proteinGoal) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / carbsGoal) * 100));
  const fatPercent = Math.min(100, Math.round((totalFat / fatGoal) * 100));
  const waterPercent = Math.min(100, Math.round((waterMl / waterGoal) * 100));

  // Group meals by category
  const mealCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  const getMealsByCategory = (cat) => {
    return filteredMeals.filter(
      (m) => m.mealType?.toLowerCase() === cat.toLowerCase()
    );
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualName.trim() || !manualCalories) return;

    const newMeal = {
      id: 'manual_' + Date.now(),
      foodName: manualName.trim(),
      mealType: manualMealType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: selectedDate,
      image: null,
      portionMultiplier: 1,
      weightGrams: 200,
      calories: parseInt(manualCalories, 10),
      macros: {
        protein: parseFloat(manualProtein) || 0,
        carbs: parseFloat(manualCarbs) || 0,
        fat: parseFloat(manualFat) || 0,
      },
      healthScore: 8.0,
      nutriGrade: 'B'
    };

    onAddManualMeal(newMeal);
    setShowManualModal(false);
    setManualName('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
  };

  const handleSelectSuggestion = (dish) => {
    const newMeal = {
      id: 'sugg_' + Date.now(),
      foodName: dish.name,
      mealType: 'Snacks',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: selectedDate,
      image: dish.image,
      portionMultiplier: 1,
      weightGrams: dish.estimatedWeightGrams || 200,
      calories: dish.calories,
      macros: {
        protein: dish.macros?.protein || 0,
        carbs: dish.macros?.carbs || 0,
        fat: dish.macros?.fat || 0,
      },
      healthScore: dish.healthScore || 8.5,
      nutriGrade: dish.nutriGrade || 'A'
    };
    if (onAddManualMeal) {
      onAddManualMeal(newMeal);
    }
  };

  const exportSummary = () => {
    setShowShareModal(true);
  };

  const changeDay = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-fadeIn">
      
      {/* Date Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 border border-slate-700">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isToday ? "Today's Nutrition Diary" : `Diary: ${selectedDate}`}
              </h2>
              {isToday && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {filteredMeals.length} {filteredMeals.length === 1 ? 'meal' : 'meals'} logged
            </p>
          </div>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => changeDay(-1)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl outline-none focus:border-emerald-500 cursor-pointer"
          />

          <button
            onClick={() => changeDay(1)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={exportSummary}
            className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 transition flex items-center space-x-1.5 shadow-sm active:scale-95"
            title="Share Daily Summary to WhatsApp, Instagram, X, FB"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-xs font-bold">Share</span>
          </button>
        </div>
      </div>

      {/* Hero Calorie & Macro Dashboard Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          {/* Concentric Neon Macro Rings */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <MacroRings
              calories={totalCalories}
              calorieGoal={goals?.dailyCalories || 2000}
              protein={totalProtein}
              proteinGoal={proteinGoal}
              carbs={totalCarbs}
              carbsGoal={carbsGoal}
              fat={totalFat}
              fatGoal={fatGoal}
              size={185}
            />

            <div className="mt-2 text-center">
              <span className="text-xs text-slate-400">
                {caloriePercent >= 100 ? (
                  <span className="text-amber-400 font-semibold">Daily calorie target reached!</span>
                ) : (
                  <span>{remainingCalories} kcal left to reach target</span>
                )}
              </span>
            </div>
          </div>

          {/* Macronutrients & Water Progress Bars */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Daily Macronutrient Targets
            </h3>

            {/* Protein */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-cyan-400 flex items-center space-x-1.5">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Protein</span>
                </span>
                <span className="text-slate-300 font-medium">
                  <strong className="text-white">{totalProtein}g</strong> / {proteinGoal}g ({proteinPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${proteinPercent}%` }} 
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-amber-400 flex items-center space-x-1.5">
                  <Wheat className="w-3.5 h-3.5" />
                  <span>Carbohydrates</span>
                </span>
                <span className="text-slate-300 font-medium">
                  <strong className="text-white">{totalCarbs}g</strong> / {carbsGoal}g ({carbsPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${carbsPercent}%` }} 
                />
              </div>
            </div>

            {/* Fats */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-rose-400 flex items-center space-x-1.5">
                  <Droplet className="w-3.5 h-3.5" />
                  <span>Healthy Fats</span>
                </span>
                <span className="text-slate-300 font-medium">
                  <strong className="text-white">{totalFat}g</strong> / {fatGoal}g ({fatPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${fatPercent}%` }} 
                />
              </div>
            </div>

            {/* Water Tracker Strip */}
            <div className="bg-slate-950/60 border border-sky-500/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <GlassWater className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-sky-300">
                    Water Hydration: <strong className="text-white">{waterMl} ml</strong> / {waterGoal} ml
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {Math.round(waterMl / 250)} glasses ({waterPercent}%)
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onUpdateWater(Math.max(0, waterMl - 250))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
                  title="Remove 250ml"
                >
                  -250ml
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateWater(waterMl + 250)}
                  className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-md shadow-sky-500/20 transition flex items-center space-x-1"
                  title="Add 250ml Glass"
                >
                  <Plus className="w-3 h-3 text-slate-950" />
                  <span>+ Glass (250ml)</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* AI Smart Meal Suggester Engine ("What should I eat next?") */}
      <SmartMealSuggester
        remainingCalories={remainingCalories}
        remainingProtein={Math.max(0, Math.round(proteinGoal - totalProtein))}
        onSelectSuggestion={handleSelectSuggestion}
      />

      {/* Quick Actions Row */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">
          Logged Meals
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>Manual Add</span>
          </button>
          <button
            onClick={onSwitchToScanner}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition"
          >
            <Camera className="w-3.5 h-3.5 text-slate-950" />
            <span>Scan with Camera</span>
          </button>
        </div>
      </div>

      {/* Categorized Meal Lists */}
      <div className="space-y-4">
        {mealCategories.map((category) => {
          const categoryMeals = getMealsByCategory(category);
          const categoryCalories = categoryMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

          return (
            <div
              key={category}
              className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 sm:p-5 backdrop-blur-sm"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {category === 'Breakfast' ? '🍳' : category === 'Lunch' ? '🥗' : category === 'Dinner' ? '🍲' : '🍎'}
                  </span>
                  <h4 className="text-sm font-bold text-white">{category}</h4>
                  <span className="text-xs text-slate-500">
                    ({categoryMeals.length} {categoryMeals.length === 1 ? 'item' : 'items'})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400">{categoryCalories}</span>
                  <span className="text-xs text-slate-400 ml-1">kcal</span>
                </div>
              </div>

              {/* Items in this category */}
              {categoryMeals.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
                  <span>No {category.toLowerCase()} logged yet today.</span>
                  <button
                    onClick={onSwitchToScanner}
                    className="text-emerald-400 hover:underline font-medium"
                  >
                    Scan meal
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {categoryMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="group bg-slate-950/50 hover:bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between transition"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {meal.image ? (
                          <img
                            src={meal.image}
                            alt={meal.foodName}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                            <Flame className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h5 className="text-xs sm:text-sm font-bold text-slate-200 truncate group-hover:text-emerald-300 transition-colors">
                            {meal.foodName}
                          </h5>
                          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{meal.time}</span>
                            </span>
                            <span>•</span>
                            <span className="text-cyan-400">{meal.macros?.protein || 0}g P</span>
                            <span className="text-amber-400">{meal.macros?.carbs || 0}g C</span>
                            <span className="text-rose-400">{meal.macros?.fat || 0}g F</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0 ml-3">
                        <div className="text-right">
                          <span className="text-sm font-black text-white">{meal.calories}</span>
                          <span className="text-[11px] text-slate-500 ml-1">kcal</span>
                        </div>
                        <button
                          onClick={() => onDeleteMeal(meal.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete meal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual Add Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Manual Quick Add Meal</h3>
            <p className="text-xs text-slate-400">
              Log an item directly with custom calories and macronutrients.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Food / Dish Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Whey Protein Shake, Banana, Apple"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Meal Type
                  </label>
                  <select
                    value={manualMealType}
                    onChange={(e) => setManualMealType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 250"
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-cyan-400 font-medium block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="25"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-amber-400 font-medium block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="30"
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-rose-400 font-medium block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="5"
                    value={manualFat}
                    onChange={(e) => setManualFat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Social Media Share Modal (WhatsApp, Instagram, X, Facebook) */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        type="day"
        data={{
          date: selectedDate,
          calories: totalCalories,
          goalCalories: goals?.dailyCalories || 2000,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
          waterMl: waterMl,
          mealsCount: filteredMeals.length,
          grade: totalCalories <= (goals?.dailyCalories || 2000) ? 'A' : 'B'
        }}
      />

    </div>
  );
}
