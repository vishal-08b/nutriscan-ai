import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Check, 
  Copy, 
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplet, 
  Sparkles, 
  ShieldCheck, 
  Send
} from 'lucide-react';

export default function ShareModal({
  isOpen,
  onClose,
  data, // Can be day summary ({ date, calories, goalCalories, protein, carbs, fat, waterMl, mealsCount, grade }) or single meal ({ foodName, calories, macros, grade, healthScore, image })
  type = 'day' // 'day' | 'meal'
}) {
  if (!isOpen || !data) return null;

  const [copied, setCopied] = useState(false);

  const isDay = type === 'day';
  const appUrl = 'https://nutriscan-ai.vercel.app'; // Or current window.location.origin

  // Prepare text content for social sharing
  const generateShareText = () => {
    if (isDay) {
      return `🥗 My Nutrition Progress with NutriScan AI (${data.date || 'Today'}):\n` +
        `🔥 Calories: ${data.calories || 0} / ${data.goalCalories || 2000} kcal\n` +
        `💪 Protein: ${data.protein || 0}g | 🌾 Carbs: ${data.carbs || 0}g | 🥑 Fat: ${data.fat || 0}g\n` +
        `💧 Hydration: ${data.waterMl || 0} ml\n` +
        `🏆 NutriGrade: Grade ${data.grade || 'A'} (${data.mealsCount || 0} meals tracked)\n\n` +
        `Track your meals with AI Food Vision: ${appUrl} #NutriScanAI #Fitness`;
    } else {
      return `🍽️ Just analyzed with NutriScan AI:\n` +
        `🍛 ${data.foodName || 'Indian Meal'}\n` +
        `🔥 Calories: ${data.calories || 0} kcal\n` +
        `💪 ${data.macros?.protein || 0}g Protein | 🌾 ${data.macros?.carbs || 0}g Carbs | 🥑 ${data.macros?.fat || 0}g Fat\n` +
        `⭐ Grade ${data.nutriGrade || 'A'} (${data.healthScore || 9}/10 Health Score)\n\n` +
        `Scan any meal instantly: ${appUrl} #NutriScanAI #Diet`;
    }
  };

  const shareText = generateShareText();

  // Handle Native Mobile Share (Opens Instagram Stories, WhatsApp, Snapchat, Messages)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isDay ? 'My Daily Nutrition - NutriScan AI' : `${data.foodName} - NutriScan AI`,
          text: shareText,
          url: appUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Share canceled or failed:', err);
        }
      }
    } else {
      handleCopyText();
    }
  };

  // WhatsApp
  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  // X / Twitter
  const handleShareX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  // Facebook
  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  // Copy text to clipboard
  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950">
              <Share2 className="w-4 h-4 font-bold" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Share to Socials</h3>
              <p className="text-[11px] text-slate-400">WhatsApp, Instagram, X & Facebook</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Story Preview Card (Aesthetic Instagram-style preview) */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-xs text-white tracking-tight">NutriScan AI</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              {isDay ? (data.date || 'Today') : 'Food Verified'}
            </span>
          </div>

          {/* Core Stat */}
          {isDay ? (
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Daily Calorie Intake</div>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-3xl font-black text-white tracking-tight">{data.calories || 0}</span>
                <span className="text-sm text-slate-400 font-semibold">/ {data.goalCalories || 2000} kcal</span>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-base font-bold text-white line-clamp-1">{data.foodName}</h4>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-2xl font-black text-white tracking-tight">{data.calories || 0}</span>
                <span className="text-xs text-emerald-400 font-semibold">kcal estimated</span>
              </div>
            </div>
          )}

          {/* Macro Split Pill Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950/70 border border-cyan-500/20 rounded-xl p-2 text-center">
              <span className="text-[10px] text-cyan-400 font-bold block">Protein</span>
              <span className="text-xs font-black text-white">{isDay ? data.protein : data.macros?.protein}g</span>
            </div>
            <div className="bg-slate-950/70 border border-amber-500/20 rounded-xl p-2 text-center">
              <span className="text-[10px] text-amber-400 font-bold block">Carbs</span>
              <span className="text-xs font-black text-white">{isDay ? data.carbs : data.macros?.carbs}g</span>
            </div>
            <div className="bg-slate-950/70 border border-rose-500/20 rounded-xl p-2 text-center">
              <span className="text-[10px] text-rose-400 font-bold block">Fat</span>
              <span className="text-xs font-black text-white">{isDay ? data.fat : data.macros?.fat}g</span>
            </div>
          </div>

          {/* Footer watermark */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>AI Vision Verified</span>
            </span>
            <span className="font-semibold text-emerald-300">Grade {data.grade || data.nutriGrade || 'A'}</span>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Share Directly:
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {/* WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition cursor-pointer active:scale-95"
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </button>

            {/* X / Twitter */}
            <button
              onClick={handleShareX}
              className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs transition cursor-pointer active:scale-95"
            >
              <span className="font-bold">𝕏</span>
              <span>X (Twitter)</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleShareFacebook}
              className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold text-xs transition cursor-pointer active:scale-95"
            >
              <span>📘</span>
              <span>Facebook</span>
            </button>

            {/* Instagram & System Share Sheet */}
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-200 border border-pink-500/30 font-semibold text-xs transition cursor-pointer active:scale-95"
            >
              <span>📸</span>
              <span>Instagram / More</span>
            </button>
          </div>

          {/* Copy to clipboard button */}
          <button
            onClick={handleCopyText}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied Summary to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Summary Text</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
