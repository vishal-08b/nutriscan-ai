import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CameraCapture from './components/CameraCapture';
import AnalysisResult from './components/AnalysisResult';
import DailyTracker from './components/DailyTracker';
import GoalsModal from './components/GoalsModal';
import SettingsModal from './components/SettingsModal';
import { DEFAULT_GOALS, SAMPLE_FOODS } from './data/sampleFoods';
import { 
  analyzeFoodImage, 
  getStoredApiKey, 
  getStoredMockMode,
  setStoredMockMode 
} from './services/aiVisionService';
import { AlertCircle, Camera, CheckCircle2, Sparkles, Settings } from 'lucide-react';

const STORAGE_MEALS_KEY = 'nutriscan_logged_meals_v2';
const STORAGE_GOALS_KEY = 'nutriscan_goals_v2';
const STORAGE_WATER_KEY = 'nutriscan_water_v2';

export default function App() {
  const todayStr = new Date().toISOString().split('T')[0];

  // Active navigation tab: 'scanner' | 'diary'
  const [activeTab, setActiveTab] = useState('scanner');
  
  // Modals
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings status
  const [hasApiKey, setHasApiKey] = useState(Boolean(getStoredApiKey()));
  const [isMockMode, setIsMockMode] = useState(getStoredMockMode());

  // Goals
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GOALS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  });

  // Selected date for Diary
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Logged meals (seeded with initial healthy Indian meals)
  const [meals, setMeals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MEALS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Seed with authentic Indian meals for today
    return [
      {
        id: 'seed_1',
        foodName: 'Steamed Idli (3 pcs) with Sambar & Podi Ghee',
        mealType: 'Breakfast',
        time: '08:30 AM',
        date: todayStr,
        image: SAMPLE_FOODS[1].image,
        portionMultiplier: 1,
        weightGrams: 320,
        calories: 330,
        macros: { protein: 14, carbs: 62, fat: 3.5, fiber: 7, sodium: 480, sugar: 3 },
        healthScore: 9.6,
        nutriGrade: 'A'
      },
      {
        id: 'seed_2',
        foodName: 'Home-Style Punjabi Rajma Chawal with Kachumber',
        mealType: 'Lunch',
        time: '01:15 PM',
        date: todayStr,
        image: SAMPLE_FOODS[6].image,
        portionMultiplier: 1,
        weightGrams: 420,
        calories: 520,
        macros: { protein: 21, carbs: 88, fat: 9, fiber: 14, sodium: 520, sugar: 4 },
        healthScore: 9.5,
        nutriGrade: 'A'
      }
    ];
  });

  // Water hydration tracking
  const [waterMl, setWaterMl] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_WATER_KEY}_${todayStr}`);
      return saved ? Number(saved) : 1250;
    } catch {
      return 1250;
    }
  });

  // Scanner state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzedImageSrc, setAnalyzedImageSrc] = useState(null);

  // Persist meals
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MEALS_KEY, JSON.stringify(meals));
    } catch (e) {
      console.error('Failed to save meals to localStorage', e);
    }
  }, [meals]);

  // Persist goals
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_GOALS_KEY, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save goals', e);
    }
  }, [goals]);

  // Persist water
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_WATER_KEY}_${selectedDate}`, waterMl.toString());
    } catch (e) {
      console.error('Failed to save water', e);
    }
  }, [waterMl, selectedDate]);

  // Sync settings
  const refreshSettings = () => {
    setHasApiKey(Boolean(getStoredApiKey()));
    setIsMockMode(getStoredMockMode());
  };

  const [lastAnalysisParams, setLastAnalysisParams] = useState(null);

  // Switch to smart demo mode and immediately retry analysis of current photo
  const handleSwitchToDemoAndRetry = async () => {
    setStoredMockMode(true);
    setIsMockMode(true);
    setAnalysisError(null);
    if (lastAnalysisParams?.imageSrc) {
      await handleAnalyze({
        ...lastAnalysisParams,
      });
    }
  };

  // Perform AI Food Analysis
  const handleAnalyze = async ({ imageSrc, customHint, presetData }) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalyzedImageSrc(imageSrc);
    setLastAnalysisParams({ imageSrc, customHint, presetData });

    try {
      if (presetData) {
        // Fast instant demo preset
        await new Promise((r) => setTimeout(r, 600));
        setAnalysisResult({
          ...presetData,
          foodName: presetData.name,
          isSimulated: true,
        });
      } else {
        const result = await analyzeFoodImage({
          imageSrc,
          customHint,
        });
        setAnalysisResult(result);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setAnalysisError(err.message || 'Failed to analyze food image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add meal to diary
  const handleAddToDiary = (mealEntry) => {
    setMeals((prev) => [mealEntry, ...prev]);
  };

  // Delete meal
  const handleDeleteMeal = (mealId) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
  };

  // Add manual meal
  const handleAddManualMeal = (manualMeal) => {
    setMeals((prev) => [manualMeal, ...prev]);
  };

  // Reset all data
  const handleResetAllData = () => {
    localStorage.removeItem(STORAGE_MEALS_KEY);
    setMeals([]);
    setWaterMl(0);
    setAnalysisResult(null);
  };

  // Reset scanner
  const handleResetScanner = () => {
    setAnalysisResult(null);
    setAnalyzedImageSrc(null);
    setAnalysisError(null);
  };

  // Calculate today's total calories
  const todayMeals = meals.filter((m) => m.date === todayStr);
  const todayCalories = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'scanner') {
            // Keep analysis view if already analyzing or result present
          }
        }}
        onOpenGoals={() => setIsGoalsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMockMode={isMockMode}
        hasApiKey={hasApiKey}
        todayCalories={todayCalories}
        dailyGoalCalories={goals.dailyCalories}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* API Key missing notice banner (subtle, helpful) */}
        {!hasApiKey && !isMockMode && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Running in Offline Demo Mode: </span>
                <span className="text-slate-300">
                  Instant realistic nutritional analyses are active. Add a free Google Gemini API key anytime to scan real custom photos live!
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 self-start sm:self-auto transition shadow-sm"
            >
              Add Gemini Key
            </button>
          </div>
        )}

        {/* Error notification */}
        {analysisError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-800 text-red-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start space-x-3 w-full">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-white">Analysis Error / Quota Notice</p>
                <p className="text-red-300 text-xs mt-0.5 leading-relaxed">{analysisError}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <button
                    onClick={handleSwitchToDemoAndRetry}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Switch to Smart Demo & Scan Now</span>
                  </button>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Manage Key / Models</span>
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setAnalysisError(null)}
              className="text-xs text-red-300 hover:text-white px-2 py-1 rounded-lg hover:bg-red-900/40 self-end sm:self-start"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <>
            {analysisResult ? (
              <AnalysisResult
                result={analysisResult}
                imageSrc={analyzedImageSrc}
                dailyGoalCalories={goals.dailyCalories}
                onAddToDiary={handleAddToDiary}
                onReset={handleResetScanner}
              />
            ) : (
              <CameraCapture
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
              />
            )}
          </>
        )}

        {/* Daily Diary Tab */}
        {activeTab === 'diary' && (
          <DailyTracker
            meals={meals}
            onDeleteMeal={handleDeleteMeal}
            onAddManualMeal={handleAddManualMeal}
            onSwitchToScanner={() => {
              handleResetScanner();
              setActiveTab('scanner');
            }}
            goals={goals}
            waterMl={waterMl}
            onUpdateWater={setWaterMl}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">NutriScan AI</span>
            <span>•</span>
            <span>Computer Vision & Calorie Estimation Engine</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-slate-500">
            <span>Powered by Google Gemini 3.8 Flash</span>
            <span>•</span>
            <span>Local & Private</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GoalsModal
        isOpen={isGoalsOpen}
        onClose={() => setIsGoalsOpen(false)}
        currentGoals={goals}
        onSaveGoals={setGoals}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={refreshSettings}
        onResetAllData={handleResetAllData}
      />

    </div>
  );
}
