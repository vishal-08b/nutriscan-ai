import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  Trash2,
  Cpu,
  Layers,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  User,
  Download,
  FileSpreadsheet,
  Vibrate,
  Bell,
  Camera,
  GlassWater,
  Scale,
  HardDrive,
  Heart,
  Palette,
  Globe,
  Crown
} from 'lucide-react';
import UpgradeModal from './UpgradeModal';
import { 
  getMembershipTier, 
  getDailyScanStats 
} from '../services/membershipService';
import { 
  hasBuiltInApiKey,
  getCustomApiKey,
  getStoredApiKey, 
  setStoredApiKey, 
  getStoredMockMode, 
  setStoredMockMode,
  getStoredPreferredModel,
  setStoredPreferredModel,
  testGeminiModels
} from '../services/aiVisionService';
import {
  getUserPreferences,
  setUserPreferences,
  exportDiaryAsJSON,
  exportDiaryAsCSV,
  getStorageStats
} from '../services/preferencesService';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsModal({
  isOpen,
  onClose,
  onSettingsUpdated,
  onResetAllData,
  meals = [],
  goals
}) {
  if (!isOpen) return null;

  // Tabs: 'ai' | 'profile' | 'features' | 'data'
  const [activeTab, setActiveTab] = useState('profile');

  // Multi-language support (English & Hindi)
  const { language, setLanguage, t } = useLanguage();

  // AI Service state
  const hasBuiltIn = hasBuiltInApiKey();
  const [customKey, setCustomKey] = useState(getCustomApiKey());
  const [showCustomKeySection, setShowCustomKeySection] = useState(Boolean(getCustomApiKey()));
  const [showKey, setShowKey] = useState(false);
  const [mockMode, setMockMode] = useState(getStoredMockMode());
  const [preferredModel, setPreferredModel] = useState(getStoredPreferredModel());
  const [testStatus, setTestStatus] = useState(null); // 'testing', 'success', 'error'
  const [testMessage, setTestMessage] = useState('');

  // User preferences state (10+ configurable features)
  const [prefs, setPrefs] = useState(() => getUserPreferences());
  const [storageStats, setStorageStats] = useState(() => getStorageStats());
  const [tier, setTier] = useState(() => getMembershipTier());
  const [scanStats, setScanStats] = useState(() => getDailyScanStats());
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  useEffect(() => {
    setPrefs(getUserPreferences());
    setStorageStats(getStorageStats());
    setTier(getMembershipTier());
    setScanStats(getDailyScanStats());
  }, [isOpen]);

  const updatePref = (key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setStoredApiKey(customKey);
    setStoredMockMode(mockMode);
    setStoredPreferredModel(preferredModel);
    setUserPreferences(prefs);
    if (onSettingsUpdated) {
      onSettingsUpdated(prefs);
    }
    onClose();
  };

  const handleTestApiKey = async () => {
    const keyToTest = customKey.trim() || getStoredApiKey();
    if (!keyToTest) {
      setTestStatus('error');
      setTestMessage('No API key available to test.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Detecting available models and verifying quotas...');

    try {
      const { bestWorkingModel, modelResults } = await testGeminiModels(keyToTest);

      if (bestWorkingModel) {
        setTestStatus('success');
        setTestMessage(`Connected! Active model: "${bestWorkingModel}" with live quotas.`);
      } else {
        const hasExhausted = modelResults.some((r) => r.status === 'exhausted');
        if (hasExhausted) {
          setTestStatus('error');
          setTestMessage('Free Tier quota exhausted for tested models. Switch to Demo Mode below to continue testing.');
        } else {
          setTestStatus('error');
          setTestMessage('Failed to find an active model. Check your key in Google AI Studio.');
        }
      }
    } catch (e) {
      setTestStatus('error');
      setTestMessage(e.message || 'Failed to connect to Google Gemini API');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">{t('appSettingsTitle')}</h3>
              <p className="text-[11px] text-slate-400">{t('appSettingsSub')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className={`border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg transition ${
          tier === 'pro'
            ? 'bg-gradient-to-r from-emerald-950/50 via-slate-950 to-teal-950/40 border-emerald-500/30'
            : 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-slate-950 text-xl font-black shadow-lg ring-2 select-none ${
              tier === 'pro'
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/25 ring-emerald-400/40'
                : 'bg-gradient-to-tr from-slate-700 to-slate-500 text-white shadow-slate-900/50 ring-slate-600'
            }`}>
              {prefs.userName && prefs.userName.trim() ? (
                prefs.userName.trim().charAt(0).toUpperCase()
              ) : (
                <User className={`w-6 h-6 ${tier === 'pro' ? 'text-slate-950' : 'text-white'}`} />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-extrabold text-white tracking-tight">
                  {prefs.userName && prefs.userName.trim() ? prefs.userName.trim() : t('myProfile')}
                </h4>
                
                {tier === 'pro' ? (
                  <button
                    type="button"
                    onClick={() => setIsUpgradeOpen(true)}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 cursor-pointer hover:bg-emerald-500/30 transition"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                    <span>{t('proMember')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsUpgradeOpen(true)}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center space-x-1 cursor-pointer hover:bg-slate-700 transition"
                  >
                    <span>{t('freePlan')}</span>
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                {tier === 'pro' ? (
                  <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{language === 'hi' ? 'असीमित AI विज़न सक्रिय' : 'Unlimited AI Vision Active'}</span>
                  </span>
                ) : (
                  <span className="text-amber-400/90 font-medium flex items-center space-x-1">
                    <span>⚡ {scanStats.remaining} / 5 {language === 'hi' ? 'दैनिक स्कैन शेष' : 'Free Scans Left Today'}</span>
                  </span>
                )}
                {prefs.userName && prefs.userName.trim() && (
                  <span className="text-slate-500">• {prefs.userGoal}</span>
                )}
              </div>
            </div>
          </div>

          <div className="self-end sm:self-auto shrink-0">
            {tier === 'pro' ? (
              <button
                type="button"
                onClick={() => setIsUpgradeOpen(true)}
                className="text-right block cursor-pointer group"
              >
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">{t('edition')}</span>
                <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1 justify-end group-hover:underline">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t('fullAccess')}</span>
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsUpgradeOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 hover:opacity-90 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-slate-950" />
                <span>{t('upgradeToPro')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Pill Strip */}
        <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('profile', 'Profile')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'features'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('features', 'Features')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('aiEngine', 'AI Engine')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'data'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('backupInfo', 'Backup & Info')}
          </button>
        </div>

        {/* TAB 1: PROFILE & PERSONALIZATION */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fadeIn">

            {/* Language Selector Card */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col xs:flex-row xs:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-teal-400" />
                  <span>{t('changeLanguage', 'Language / भाषा')}</span>
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'hi' ? 'ऐप की भाषा चुनें (अंग्रेजी या हिन्दी)' : 'Select app interface language (English or Hindi)'}
                </p>
              </div>
              <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0 self-start xs:self-auto">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    language === 'en' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    language === 'hi' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>
            
            {/* Feature 1: User Display Name */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('yourName', 'Your Name (Optional)')}</span>
              </label>
              <input
                type="text"
                value={prefs.userName || ''}
                onChange={(e) => updatePref('userName', e.target.value)}
                placeholder={t('enterYourName', 'Enter your name (e.g. Vishal)...')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none font-medium transition"
              />
            </div>

            {/* Feature 2: Health & Fitness Goal Focus */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('primaryGoal')}</span>
              </label>
              <select
                value={prefs.userGoal}
                onChange={(e) => updatePref('userGoal', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none cursor-pointer"
              >
                <option value="Fat Loss & Lean Muscle">{language === 'hi' ? '🔥 फैट लॉस व लीन मसल्स (कैलोरी डेफिसिट)' : '🔥 Fat Loss & Lean Muscle (Calorie Deficit)'}</option>
                <option value="Healthy Maintenance">{language === 'hi' ? '⚖️ स्वस्थ वजन बनाए रखना (स्थिर ऊर्जा)' : '⚖️ Healthy Maintenance (Steady Energy)'}</option>
                <option value="Bulking & Strength">{language === 'hi' ? '💪 बल्किंग व स्ट्रेंथ (हाई कैलोरी व प्रोटीन)' : '💪 Bulking & Muscle Gain (High Calorie & Protein)'}</option>
                <option value="Low Carb & Keto">{language === 'hi' ? '🥑 लो कार्ब व कीटोजेनिक' : '🥑 Low Carb & Ketogenic Focus'}</option>
                <option value="Diabetes & Low GI">{language === 'hi' ? '🩺 ब्लड शुगर संतुलन व लो जीआई' : '🩺 Blood Sugar Balance & Low GI'}</option>
              </select>
            </div>

            {/* Feature 3: Dietary Preference / Cuisine Filter */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('dietPreference')}</span>
              </label>
              <select
                value={prefs.dietType}
                onChange={(e) => updatePref('dietType', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none cursor-pointer"
              >
                <option value="All Indian Foods">{language === 'hi' ? '🍛 सभी भारतीय व्यंजन (Pan-India)' : '🍛 All Authentic Indian Dishes (Pan-India)'}</option>
                <option value="Pure Vegetarian (Shakahari)">{language === 'hi' ? '🥬 शुद्ध शाकाहारी' : '🥬 Pure Vegetarian (Shakahari Only)'}</option>
                <option value="Vegan (100% Plant-Based)">{language === 'hi' ? '🌱 वीगन (डेयरी व घी मुक्त)' : '🌱 Vegan (No Dairy, No Ghee)'}</option>
                <option value="Jain (No Root Veg / Onion / Garlic)">{language === 'hi' ? '🪷 जैन आहार (बिना प्याज, लहसुन, आलू)' : '🪷 Jain Diet (No Onion, Garlic, Potatoes)'}</option>
                <option value="Eggitarian">{language === 'hi' ? '🍳 एगिटेरियन (शाकाहारी + अंडा)' : '🍳 Eggitarian (Vegetarian + Eggs)'}</option>
                <option value="High Protein Non-Veg">{language === 'hi' ? '🍗 हाई प्रोटीन नॉन-वेज (चिकन, मछली, अंडे)' : '🍗 High Protein Non-Veg (Chicken, Fish, Eggs)'}</option>
              </select>
            </div>

            {/* Feature 4: Units of Measurement */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">{t('measurementSystem')}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t('unitsDesc')}
                </p>
              </div>
              <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => updatePref('units', 'metric')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    prefs.units === 'metric' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  {t('metric')}
                </button>
                <button
                  type="button"
                  onClick={() => updatePref('units', 'imperial')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    prefs.units === 'imperial' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  {t('imperial')}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: APP FEATURES & CONTROLS */}
        {activeTab === 'features' && (
          <div className="space-y-3.5 animate-fadeIn">
            
            {/* Feature 5: Water Glass Increment Size */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <GlassWater className="w-3.5 h-3.5 text-sky-400" />
                  <span>{t('glassIncrement')}</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  {t('glassIncrementDesc')}
                </p>
              </div>
              <select
                value={prefs.waterGlassSize}
                onChange={(e) => updatePref('waterGlassSize', Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-1.5 outline-none font-bold cursor-pointer"
              >
                <option value={200}>{language === 'hi' ? '200 मिली (छोटा कप)' : '200 ml (Small Cup)'}</option>
                <option value={250}>{language === 'hi' ? '250 मिली (मानक ग्लास)' : '250 ml (Standard Glass)'}</option>
                <option value={300}>{language === 'hi' ? '300 मिली (मग)' : '300 ml (Mug)'}</option>
                <option value={500}>{language === 'hi' ? '500 मिली (बोतल)' : '500 ml (Bottle)'}</option>
              </select>
            </div>

            {/* Feature 6: Sci-Fi Camera HUD & Laser Beam */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('hudLaser')}</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  {t('hudLaserDesc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={prefs.sciFiHudEnabled}
                  onChange={(e) => updatePref('sciFiHudEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Feature 7: Camera Resolution Quality */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('cameraResolution')}</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  {t('cameraResolutionDesc')}
                </p>
              </div>
              <select
                value={prefs.cameraQuality}
                onChange={(e) => updatePref('cameraQuality', e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-1.5 outline-none font-bold cursor-pointer"
              >
                <option value="1080p">{language === 'hi' ? '1080p (क्रिस्टल स्पष्ट AI)' : '1080p (Crystal AI)'}</option>
                <option value="720p">{language === 'hi' ? '720p (बैटरी सेवर)' : '720p (Battery Saver)'}</option>
              </select>
            </div>

            {/* Feature 8: Auto-Analyze on Photo Capture */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('autoAnalyze')}</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  {t('autoAnalyzeDesc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={prefs.autoAnalyzeOnCapture}
                  onChange={(e) => updatePref('autoAnalyzeOnCapture', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Feature 9: Haptic Vibration on Scan & Tap */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Vibrate className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t('hapticFeedback')}</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  {t('hapticFeedbackDesc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={prefs.hapticFeedback}
                  onChange={(e) => updatePref('hapticFeedback', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Feature 10: Celebration Confetti */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('confettiEffects')}</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  {t('confettiEffectsDesc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={prefs.celebrationConfetti}
                  onChange={(e) => updatePref('celebrationConfetti', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Feature 11: Hydration Reminder Notifications */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Bell className="w-3.5 h-3.5 text-sky-400" />
                  <span>{t('hydrationNudges')}</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  {t('hydrationNudgesDesc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={prefs.hydrationReminders}
                  onChange={(e) => updatePref('hydrationReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

          </div>
        )}

        {/* TAB 3: AI ENGINE & QUOTAS */}
        {activeTab === 'ai' && (
          <div className="space-y-4 animate-fadeIn">
            {hasBuiltIn ? (
              <div className="space-y-3">
                {/* Built-in Status Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('cloudAiTitle')}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                            {t('activePermanent')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t('cloudAiDesc')}
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{t('keyProtected')}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleTestApiKey}
                      disabled={testStatus === 'testing'}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                    >
                      {testStatus === 'testing' ? t('testingConnection') : t('testConnection')}
                    </button>
                  </div>

                  {testStatus && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex flex-col space-y-2 ${
                        testStatus === 'success'
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                          : testStatus === 'error'
                          ? 'bg-red-950/40 border-red-800 text-red-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {testStatus === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        ) : testStatus === 'error' ? (
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin shrink-0" />
                        )}
                        <span className="font-medium">{testMessage}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Collapsible custom key override */}
                <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/40">
                  <button
                    type="button"
                    onClick={() => setShowCustomKeySection(!showCustomKeySection)}
                    className="w-full p-3.5 text-left flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition cursor-pointer"
                  >
                    <span className="flex items-center space-x-2 font-medium">
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('advancedKeyOverride')}</span>
                    </span>
                    {showCustomKeySection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showCustomKeySection && (
                    <div className="p-4 pt-1 border-t border-slate-800 space-y-3">
                      <p className="text-[11px] text-slate-400">
                        {t('personalKeyHelp')}
                      </p>
                      <div className="relative">
                        <input
                          type={showKey ? 'text' : 'password'}
                          value={customKey}
                          onChange={(e) => setCustomKey(e.target.value)}
                          placeholder={t('personalKeyPlaceholder')}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white pr-20 outline-none font-mono transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-2 top-2.5 p-1 text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {customKey && (
                        <button
                          type="button"
                          onClick={() => setCustomKey('')}
                          className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                        >
                          {t('clearPersonalKey')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                      <Key className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('personalKeyHelp', 'Custom Gemini API Key')}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {language === 'hi' ? 'लाइव भोजन स्कैनिंग के लिए अपनी जेमिनी एपीआई कुंजी दर्ज करें' : 'Enter your Google Gemini API key to enable live AI food vision'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder={t('personalKeyPlaceholder')}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white pr-20 outline-none font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-2.5 p-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    {language === 'hi' ? 'निःशुल्क API Key प्राप्त करें ↗' : 'Get free API Key at Google AI Studio ↗'}
                  </a>
                  <button
                    type="button"
                    onClick={handleTestApiKey}
                    disabled={testStatus === 'testing' || !customKey.trim()}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer disabled:opacity-50"
                  >
                    {testStatus === 'testing' ? t('testingConnection') : t('testConnection')}
                  </button>
                </div>

                {testStatus && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex flex-col space-y-2 ${
                      testStatus === 'success'
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                        : testStatus === 'error'
                        ? 'bg-red-950/40 border-red-800 text-red-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {testStatus === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      ) : testStatus === 'error' ? (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin shrink-0" />
                      )}
                      <span className="font-medium">{testMessage}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Model Failover Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('aiStrategy')}</span>
              </label>
              <select
                value={preferredModel}
                onChange={(e) => setPreferredModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
              >
                <option value="auto">{language === 'hi' ? 'ऑटो-फेलओवर (अनुशंसित - हाई कोटा और स्पीड)' : 'Auto-Failover (Recommended - fast & generous quota)'}</option>
                <option value="gemini-flash-lite-latest">gemini-flash-lite-latest (Fastest Vision)</option>
                <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (High Quota)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Stable)</option>
                <option value="gemini-3.5-flash">gemini-3.5-flash (High Reasoning)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (Latest Flagship)</option>
              </select>
            </div>

            {/* Offline Demo Mode */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('offlineDemoTitle')}</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  {t('offlineDemoDesc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={mockMode}
                  onChange={(e) => setMockMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 4: BACKUP, EXPORT & APP INFO */}
        {activeTab === 'data' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Feature 12 & 13: Export JSON / CSV Backup */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('exportBackup')}</span>
              </span>
              <p className="text-[11px] text-slate-400">
                {t('exportBackupDesc')}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => exportDiaryAsJSON(meals, goals)}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('exportJson')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportDiaryAsCSV(meals)}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('exportCsv')}</span>
                </button>
              </div>
            </div>

            {/* Feature 14: Storage Usage Stats */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{t('localStorage')}</span>
                  <p className="text-[11px] text-slate-400">
                    {storageStats.itemsCount} {t('storedRecords')}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {storageStats.formatted}
              </span>
            </div>

            {/* Feature 15: Danger Zone: Clear Diary */}
            <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-300 block">{t('clearDiary')}</span>
                <p className="text-[11px] text-slate-400">
                  {t('clearDiaryDesc')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t('clearConfirm'))) {
                    onResetAllData();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
              >
                {t('resetHistory')}
              </button>
            </div>

          </div>
        )}

        {/* Creator & App Credits Footer (Featured Name: Vishal) */}
        <div className="pt-3 border-t border-slate-800/80 text-center space-y-1">
          <p className="text-xs text-slate-300 flex items-center justify-center space-x-1.5">
            <span>{t('craftedBy')}</span>
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            {t('leadArchitect')}
          </p>
        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            {t('cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
          >
            {t('saveSettings', 'Save All Preferences')}
          </button>
        </div>

      </div>

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => {
          setIsUpgradeOpen(false);
          setTier(getMembershipTier());
          setScanStats(getDailyScanStats());
        }}
        onTierChanged={(newTier) => {
          setTier(newTier);
          setScanStats(getDailyScanStats());
        }}
      />
    </div>
  );
}
