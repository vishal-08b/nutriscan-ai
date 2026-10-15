import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  Target,
  Flame,
  Zap,
  Smartphone
} from 'lucide-react';
import { loginUser, registerUser, loginAsGuest } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';

export default function LoginPage({ onLoginSuccess }) {
  const { language, toggleLanguage, t } = useLanguage();
  
  // Tab state: 'login' | 'register'
  const [mode, setMode] = useState('login');

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState('Fat Loss & Lean Muscle');
  const [showPassword, setShowPassword] = useState(false);

  // Status & error handling
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const triggerWelcomeConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#14b8a6', '#06b6d4', '#f59e0b']
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      let res;
      if (mode === 'login') {
        res = loginUser({ email, password });
      } else {
        res = registerUser({ name, email, password, goal });
      }

      setIsLoading(false);

      if (res.success) {
        triggerWelcomeConfetti();
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
      } else {
        setErrorMessage(res.message);
      }
    }, 400);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const res = loginAsGuest(
        language === 'hi' ? 'अतिथि उपयोगकर्ता' : 'Guest Explorer',
        goal
      );
      setIsLoading(false);
      if (res.success) {
        triggerWelcomeConfetti();
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden px-4 py-6 sm:py-10">
      
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute -top-36 -left-36 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 -right-36 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Strip with Language Switcher */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold shrink-0">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            NutriScan AI
          </span>
        </div>

        {/* Language switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition text-xs font-bold cursor-pointer active:scale-95 shadow-sm"
          title="Switch Language / भाषा बदलें"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-md w-full mx-auto my-auto relative z-10 py-4">
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          
          {/* Logo & Headline */}
          <div className="text-center space-y-1.5 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/20">
              <Flame className="w-7 h-7 text-slate-950" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-2">
              {mode === 'login' 
                ? (language === 'hi' ? 'स्वागत है' : 'Welcome to NutriScan')
                : (language === 'hi' ? 'नया खाता बनाएं' : 'Create Free Account')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
              {language === 'hi' 
                ? 'भारतीय व्यंजनों के लिए AI विज़न पोषण और कैलोरी विश्लेषक' 
                : 'AI-Powered Vision & Calorie Tracking for Authentic Indian Cuisine'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`py-2 rounded-xl transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'hi' ? 'लॉग इन करें' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              className={`py-2 rounded-xl transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'hi' ? 'साइन अप करें' : 'Sign Up'}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center space-x-2 animate-shake">
              <span className="font-bold">✕</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field (Sign Up only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {language === 'hi' ? 'आपका पूरा नाम' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'hi' ? 'जैसे: विशाल शर्मा' : 'e.g. Vishal Sharma'}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Health Goal (Sign Up only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'hi' ? 'स्वास्थ्य लक्ष्य चुनें' : 'Your Primary Health Goal'}</span>
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition cursor-pointer"
                >
                  <option value="Fat Loss & Lean Muscle">🔥 Fat Loss & Lean Muscle (वज़न घटाना व फिट रहना)</option>
                  <option value="Muscle Building & Bulking">💪 Muscle Building & High Protein (मांसपेशियां बढ़ाना)</option>
                  <option value="Balanced Indian Nutrition">🥗 Balanced Indian Nutrition (संतुलित भारतीय आहार)</option>
                  <option value="Diabetes & Low GI Control">🩺 Diabetes & Low Sugar Care (ब्लड शुगर नियंत्रण)</option>
                </select>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'hi' ? 'ईमेल पता' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {language === 'hi' ? 'पासवर्ड' : 'Password'}
                </label>
                {mode === 'login' && (
                  <span className="text-[10px] text-slate-500">
                    {language === 'hi' ? 'डेमो: 123456' : 'Default demo: 123456'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition flex items-center justify-center space-x-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>{language === 'hi' ? 'कृपया प्रतीक्षा करें...' : 'Verifying...'}</span>
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? (language === 'hi' ? 'लॉग इन करें' : 'Sign In to NutriScan')
                      : (language === 'hi' ? 'खाता बनाएं' : 'Create Free Account')}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-mono">
                {language === 'hi' ? 'या तुरंत शुरू करें' : 'or continue instantly'}
              </span>
            </div>
          </div>

          {/* Quick 1-Click Guest Login */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-xs transition active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {language === 'hi' ? '⚡ 1-क्लिक अतिथि पहुंच (तुरंत प्रवेश)' : '⚡ 1-Click Guest Access (Instant Entry)'}
            </span>
          </button>

          {/* Trust & Local Privacy Badge */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center space-x-2 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {language === 'hi' 
                ? '100% ऑन-डिवाइस गोपनीयता • आपका डेटा सुरक्षित है' 
                : '100% On-Device Privacy • Meals saved locally'}
            </span>
          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="max-w-md w-full mx-auto text-center space-y-1 relative z-10 pt-2">
        <p className="text-[11px] text-slate-400">
          {language === 'hi' ? 'निर्मित व डिज़ाइन किया गया' : 'Engineered with ❤️ by'}{' '}
          <strong className="text-emerald-400 font-bold">Vishal</strong>
        </p>
        <p className="text-[10px] text-slate-500 font-mono">
          NutriScan AI v2.5.0-pro • Web & Android APK
        </p>
      </footer>

    </div>
  );
}
