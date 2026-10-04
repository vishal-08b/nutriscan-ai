import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplet, 
  ShieldCheck, 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  ArrowLeft, 
  ChevronRight, 
  Info, 
  Lightbulb, 
  Scale, 
  Utensils,
  Edit3,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SAMPLE_FOODS } from '../data/sampleFoods';

export default function AnalysisResult({
  result: initialResult,
  imageSrc,
  dailyGoalCalories = 2000,
  onAddToDiary,
  onReset
}) {
  const [currentResult, setCurrentResult] = useState(initialResult);
  const [portionMultiplier, setPortionMultiplier] = useState(1.0);
  const [selectedMealType, setSelectedMealType] = useState(initialResult.category || 'Lunch');
  const [isLogged, setIsLogged] = useState(false);
  const [isChangingDish, setIsChangingDish] = useState(false);

  useEffect(() => {
    setCurrentResult(initialResult);
  }, [initialResult]);

  const result = currentResult;

  // Scaled nutritional metrics based on portion multiplier
  const calories = Math.round((result.calories || 0) * portionMultiplier);
  const weightGrams = Math.round((result.estimatedWeightGrams || 250) * portionMultiplier);
  
  const protein = Math.round((result.macros?.protein || 0) * portionMultiplier * 10) / 10;
  const carbs = Math.round((result.macros?.carbs || 0) * portionMultiplier * 10) / 10;
  const fat = Math.round((result.macros?.fat || 0) * portionMultiplier * 10) / 10;
  const fiber = Math.round((result.macros?.fiber || 0) * portionMultiplier * 10) / 10;
  const sodium = Math.round((result.macros?.sodium || 0) * portionMultiplier);
  const sugar = Math.round((result.macros?.sugar || 0) * portionMultiplier * 10) / 10;

  // Macro calorie ratios
  const proteinCal = protein * 4;
  const carbsCal = carbs * 4;
  const fatCal = fat * 9;
  const totalMacroCal = proteinCal + carbsCal + fatCal || 1;
  const proteinPct = Math.round((proteinCal / totalMacroCal) * 100);
  const carbsPct = Math.round((carbsCal / totalMacroCal) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  // Daily target percentages
  const calorieDailyPct = Math.round((calories / dailyGoalCalories) * 100);

  const handleSelectDifferentDish = (dish) => {
    setCurrentResult({
      ...dish,
      foodName: dish.name,
      isSimulated: true,
    });
    setSelectedMealType(dish.category || 'Lunch');
    setIsChangingDish(false);
  };

  const handleLogMeal = () => {
    const mealEntry = {
      id: 'meal_' + Date.now(),
      foodName: result.foodName || result.name,
      mealType: selectedMealType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      image: imageSrc || result.image,
      portionMultiplier,
      weightGrams,
      calories,
      macros: {
        protein,
        carbs,
        fat,
        fiber,
        sodium,
        sugar
      },
      healthScore: result.healthScore || 8.0,
      nutriGrade: result.nutriGrade || 'A'
    };

    onAddToDiary(mealEntry);
    setIsLogged(true);

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#10b981', '#14b8a6', '#06b6d4', '#f59e0b']
    });
  };

  const getNutriGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'bg-emerald-500 text-slate-950 border-emerald-400';
      case 'B': return 'bg-teal-500 text-slate-950 border-teal-400';
      case 'C': return 'bg-amber-500 text-slate-950 border-amber-400';
      default: return 'bg-rose-500 text-white border-rose-400';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs sm:text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Scan Another Meal</span>
        </button>

        {result.isSimulated && (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs">
            <Info className="w-3.5 h-3.5" />
            <span>Curated Demo Analysis</span>
          </span>
        )}
      </div>

      {/* Main Analysis Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Header Hero Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-b border-slate-800/80">
          
          {/* Image & Quick Badges */}
          <div className="md:col-span-5 relative aspect-[16/10] md:aspect-auto min-h-[240px] bg-slate-950">
            <img
              src={imageSrc || result.image}
              alt={result.foodName || result.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent md:hidden" />
            
            {/* Nutri-grade & Health Score Pill */}
            <div className="absolute top-3 left-3 flex items-center space-x-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wider uppercase border shadow-lg ${getNutriGradeColor(result.nutriGrade)}`}>
                Grade {result.nutriGrade || 'A'}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/90 text-white border border-slate-700/80 backdrop-blur-md shadow-lg flex items-center space-x-1">
                <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                <span>{result.healthScore || '9.0'}/10</span>
              </span>
            </div>
          </div>

          {/* Dish Details & Main Metrics */}
          <div className="md:col-span-7 p-4 sm:p-8 flex flex-col justify-between space-y-4 sm:space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
                  <span>{result.cuisine || 'Indian Regional'}</span>
                  <span>•</span>
                  <span className="text-slate-400">{result.confidence || 'High Confidence'}</span>
                </div>
                {/* Switch Dish Button */}
                <button
                  type="button"
                  onClick={() => setIsChangingDish(!isChangingDish)}
                  className="text-xs text-amber-300 hover:text-amber-200 font-semibold px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Wrong dish? Change</span>
                  <ChevronDown className="w-3 h-3 text-amber-400" />
                </button>
              </div>

              {/* Dish Selector Dropdown */}
              {isChangingDish && (
                <div className="mb-3 p-3 bg-slate-950 border border-amber-500/40 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">Select Correct Indian Dish:</span>
                    <button
                      type="button"
                      onClick={() => setIsChangingDish(false)}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Close ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-52 overflow-y-auto pr-1">
                    {SAMPLE_FOODS.map((dish) => (
                      <button
                        key={dish.id}
                        type="button"
                        onClick={() => handleSelectDifferentDish(dish)}
                        className={`text-left p-2 rounded-xl text-xs font-medium border transition truncate ${
                          result.id === dish.id
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="truncate font-semibold">{dish.name}</div>
                        <div className="text-[10px] text-slate-500">{dish.calories} kcal • {dish.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {result.foodName || result.name}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                {result.servingDescription || 'Standard single serving portion'}
              </p>
            </div>

            {/* Calories Highlight Card */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
              <div>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium mb-1">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Estimated Calories</span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {calories}
                  </span>
                  <span className="text-sm font-semibold text-amber-400">kcal</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {calorieDailyPct}% of {dailyGoalCalories} kcal goal
                </span>
              </div>

              <div>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium mb-1">
                  <Scale className="w-4 h-4 text-teal-400" />
                  <span>Estimated Mass</span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {weightGrams}
                  </span>
                  <span className="text-sm font-semibold text-teal-400">grams</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Portion: {portionMultiplier}x serving
                </span>
              </div>
            </div>

            {/* Interactive Portion Multiplier */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
                <span>Adjust Portion Size</span>
                <span className="text-emerald-400 font-semibold">{portionMultiplier}x</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {[
                  { label: '0.5x', value: 0.5, desc: 'Half' },
                  { label: '0.75x', value: 0.75, desc: 'Small' },
                  { label: '1.0x', value: 1.0, desc: 'Regular' },
                  { label: '1.5x', value: 1.5, desc: 'Large' },
                  { label: '2.0x', value: 2.0, desc: 'Double' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setPortionMultiplier(item.value)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition border ${
                      portionMultiplier === item.value
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[10px] opacity-75 font-normal">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Nutritional Breakdown Body */}
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          
          {/* Macronutrients Cards & Calorie Ratio Bar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Macronutrients Breakdown
              </h3>
              <span className="text-xs text-slate-400">Calculated per adjusted portion</span>
            </div>

            {/* 3 Main Macro Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {/* Protein */}
              <div className="bg-slate-950/60 border border-cyan-500/20 rounded-2xl p-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-cyan-400 flex items-center space-x-1.5">
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span>Protein</span>
                  </span>
                  <span className="text-xs font-bold text-cyan-400/80">{proteinPct}% cals</span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-white">{protein}</span>
                  <span className="text-xs text-slate-400">g</span>
                </div>
                <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${proteinPct}%` }} />
                </div>
              </div>

              {/* Carbohydrates */}
              <div className="bg-slate-950/60 border border-amber-500/20 rounded-2xl p-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-400 flex items-center space-x-1.5">
                    <Wheat className="w-3.5 h-3.5" />
                    <span>Carbs</span>
                  </span>
                  <span className="text-xs font-bold text-amber-400/80">{carbsPct}% cals</span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-white">{carbs}</span>
                  <span className="text-xs text-slate-400">g</span>
                </div>
                <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${carbsPct}%` }} />
                </div>
              </div>

              {/* Fats */}
              <div className="bg-slate-950/60 border border-rose-500/20 rounded-2xl p-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-rose-400 flex items-center space-x-1.5">
                    <Droplet className="w-3.5 h-3.5" />
                    <span>Healthy Fats</span>
                  </span>
                  <span className="text-xs font-bold text-rose-400/80">{fatPct}% cals</span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-white">{fat}</span>
                  <span className="text-xs text-slate-400">g</span>
                </div>
                <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-400 h-full rounded-full" style={{ width: `${fatPct}%` }} />
                </div>
              </div>
            </div>

            {/* Secondary Nutrients Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
                <span className="text-xs text-slate-400">Dietary Fiber</span>
                <span className="text-sm font-bold text-slate-200">{fiber}g</span>
              </div>
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
                <span className="text-xs text-slate-400">Sugars</span>
                <span className="text-sm font-bold text-slate-200">{sugar}g</span>
              </div>
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
                <span className="text-xs text-slate-400">Sodium</span>
                <span className="text-sm font-bold text-slate-200">{sodium}mg</span>
              </div>
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
                <span className="text-xs text-slate-400">Energy Density</span>
                <span className="text-sm font-bold text-emerald-400">
                  {((calories / (weightGrams || 1))).toFixed(1)} kcal/g
                </span>
              </div>
            </div>

            {/* Micronutrients Pill Tags */}
            {result.micros && result.micros.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <span className="text-xs text-slate-400 font-medium mr-2">Key Micronutrients:</span>
                <div className="inline-flex flex-wrap gap-2 mt-1">
                  {result.micros.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300"
                    >
                      <strong className="text-white">{m.name}:</strong> {m.amount}{' '}
                      <span className="text-emerald-400">({m.dailyValue})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Itemized Detected Ingredients */}
          {result.ingredients && result.ingredients.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-emerald-400" />
                <span>Detected Ingredients & Portions</span>
              </h3>

              <div className="divide-y divide-slate-800/60 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
                {result.ingredients.map((ing, idx) => {
                  const ingGrams = Math.round(parseFloat(ing.amount) * portionMultiplier) || ing.amount;
                  const ingCals = Math.round((ing.calories || 0) * portionMultiplier);
                  return (
                    <div key={idx} className="p-3.5 sm:px-4 flex items-center justify-between text-xs sm:text-sm hover:bg-slate-900/40 transition">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <div>
                          <p className="font-semibold text-slate-200">{ing.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {typeof ing.amount === 'string' && ing.amount.includes('g') ? `${ingGrams}g` : ing.amount}
                            {ing.protein ? ` • ${Math.round(ing.protein * portionMultiplier)}g protein` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white">{ingCals}</span>
                        <span className="text-slate-500 text-xs ml-1">kcal</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dietary Tags & Allergen Warnings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dietary Flags */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Dietary & Nutritional Attributes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(result.dietaryFlags || ['Balanced', 'Whole Food']).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium"
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Allergens Warning */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Allergen & Sensitivity Alerts</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(result.allergens || ['None identified']).map((al, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-medium"
                  >
                    ⚠ {al}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dietitian Insights & Smart Swaps */}
          {(result.nutritionistReview || result.healthierSwaps) && (
            <div className="bg-gradient-to-r from-emerald-950/30 to-teal-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Lightbulb className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  AI Dietitian Insight & Healthy Swaps
                </h4>
              </div>

              {result.nutritionistReview && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{result.nutritionistReview}"
                </p>
              )}

              {result.healthierSwaps && result.healthierSwaps.length > 0 && (
                <ul className="space-y-1.5 pt-1 text-xs text-slate-300">
                  {result.healthierSwaps.map((swap, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{swap}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Meal Logging Action Area */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Log this meal to your Daily Diary
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select meal slot and click add to log your daily intake.
                </p>
              </div>

              {/* Meal slot selector */}
              <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedMealType(slot)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedMealType === slot
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Log Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400">
                Total to log:{' '}
                <strong className="text-emerald-400 font-bold text-sm">
                  {calories} kcal
                </strong>{' '}
                ({protein}g P • {carbs}g C • {fat}g F)
              </span>

              <button
                type="button"
                onClick={handleLogMeal}
                disabled={isLogged}
                className={`flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-xl ${
                  isLogged
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:scale-105 active:scale-95 shadow-emerald-500/25'
                }`}
              >
                {isLogged ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Logged to Today's Diary!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>Add to {selectedMealType}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
