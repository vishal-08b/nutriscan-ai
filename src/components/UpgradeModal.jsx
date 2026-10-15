import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  KeyRound, 
  RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getMembershipTier, 
  setMembershipTier, 
  redeemProCode, 
  getDailyScanStats 
} from '../services/membershipService';
import { useLanguage } from '../context/LanguageContext';

export default function UpgradeModal({ isOpen, onClose, onTierChanged }) {
  if (!isOpen) return null;

  const { t, language } = useLanguage();
  const currentTier = getMembershipTier();
  const stats = getDailyScanStats();

  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'],
    });
  };

  const handleInstantUpgrade = () => {
    setMembershipTier('pro');
    triggerConfetti();
    if (onTierChanged) onTierChanged('pro');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const res = redeemProCode(promoCode);
    if (res.success) {
      setPromoSuccess(language === 'hi' ? 'प्रो मेम्बरशिप अनलॉक हो गई!' : 'PRO Unlocked Successfully!');
      triggerConfetti();
      if (onTierChanged) onTierChanged('pro');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setPromoError(language === 'hi' ? 'अमान्य कोड! कोड "PRO2026" आज़माएं' : 'Invalid code! Try code: PRO2026');
    }
  };

  const handleSwitchToFree = () => {
    setMembershipTier('free');
    if (onTierChanged) onTierChanged('free');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-400 mx-auto flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <Crown className="w-6 h-6 text-slate-950" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {language === 'hi' ? 'NutriScan प्रो में अपग्रेड करें' : 'Upgrade to NutriScan PRO'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {language === 'hi' 
              ? 'असीमित AI विज़न फूड स्कैन, विस्तृत माइक्रोन्यूट्रिएंट्स और प्राथमिकता गति प्राप्त करें।'
              : 'Unlock unlimited AI vision meal scans, in-depth micronutrient analytics, and priority speeds.'}
          </p>
        </div>

        {/* Plan Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Free Card */}
          <div className={`p-4 rounded-2xl border transition relative ${
            currentTier === 'free' 
              ? 'bg-slate-950/80 border-slate-700 ring-1 ring-slate-600' 
              : 'bg-slate-950/40 border-slate-800 opacity-80'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {language === 'hi' ? 'मुफ़्त योजना' : 'Free Plan'}
              </span>
              {currentTier === 'free' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {language === 'hi' ? 'सक्रिय' : 'Current'}
                </span>
              )}
            </div>
            <div className="text-xl font-black text-white mb-3">
              ₹0 <span className="text-xs font-normal text-slate-400">/ {language === 'hi' ? 'हमेशा' : 'forever'}</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span><strong>5 {language === 'hi' ? 'स्कैन / दिन' : 'Scans / day'}</strong> ({stats.remaining} {language === 'hi' ? 'शेष' : 'left'})</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{language === 'hi' ? 'दैनिक कैलोरी व मैक्रोज़ डायरी' : 'Daily Calorie & Macro Diary'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{language === 'hi' ? 'द्विभाषी हिन्दी व अंग्रेजी' : 'Hindi & English Interface'}</span>
              </li>
            </ul>
          </div>

          {/* Pro Card */}
          <div className={`p-4 rounded-2xl border transition relative overflow-hidden ${
            currentTier === 'pro' 
              ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/50' 
              : 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-500/40 ring-1 ring-amber-500/30'
          }`}>
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-emerald-500 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-bl-lg tracking-wider uppercase">
              {language === 'hi' ? 'अनुशंसित' : 'BEST VALUE'}
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>PRO</span>
              </span>
              {currentTier === 'pro' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {language === 'hi' ? 'सक्रिय' : 'Active'}
                </span>
              )}
            </div>
            <div className="text-xl font-black text-white mb-3">
              ₹0 <span className="text-xs font-normal text-amber-300 line-through mr-1">₹499</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                100% {language === 'hi' ? 'मुफ़्त' : 'FREE'}
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>{language === 'hi' ? 'असीमित AI विज़न स्कैन' : 'Unlimited AI Vision Scans'}</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{language === 'hi' ? 'विटामिन व मिनरल्स विश्लेषण' : 'Full Micronutrients Analytics'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{language === 'hi' ? 'प्राथमिकता AI प्रोसेसिंग' : 'Fast Priority Processing'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{language === 'hi' ? 'JSON व CSV बैकअप एक्सपोर्ट' : 'Data Backup (CSV / JSON)'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Button */}
        {currentTier === 'free' ? (
          <div className="space-y-3">
            <button
              onClick={handleInstantUpgrade}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 hover:opacity-95 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Crown className="w-4 h-4 text-slate-950" />
              <span>{language === 'hi' ? 'मुफ़्त प्रो पास क्लेम करें (1-क्लिक अनलॉक)' : 'Claim Free PRO Pass (1-Click Unlock)'}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={language === 'hi' ? 'प्रोमो कोड दर्ज करें (उदा. PRO2026)' : 'Enter promo code (e.g. PRO2026)'}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl border border-slate-700 cursor-pointer"
                >
                  {language === 'hi' ? 'लागू करें' : 'Apply'}
                </button>
              </div>
              {promoError && <p className="text-[11px] text-red-400 mt-1">{promoError}</p>}
              {promoSuccess && <p className="text-[11px] text-emerald-400 mt-1 font-semibold">{promoSuccess}</p>}
            </form>
          </div>
        ) : (
          <div className="space-y-2 text-center pt-2">
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">
                {language === 'hi' ? 'आप वर्तमान में प्रो सदस्य हैं (असीमित पहुंच सक्रिय)' : 'You are currently a PRO Member (Unlimited Access Active)'}
              </span>
            </div>
            <button
              onClick={handleSwitchToFree}
              className="text-[11px] text-slate-500 hover:text-slate-300 underline cursor-pointer"
            >
              {language === 'hi' ? 'परीक्षण के लिए मुफ़्त योजना पर स्विच करें' : 'Switch back to Free Plan for testing'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
