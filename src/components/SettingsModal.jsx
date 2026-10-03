import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import { 
  getStoredApiKey, 
  setStoredApiKey, 
  getStoredMockMode, 
  setStoredMockMode,
  getStoredPreferredModel,
  setStoredPreferredModel,
  testGeminiModels
} from '../services/aiVisionService';

export default function SettingsModal({
  isOpen,
  onClose,
  onSettingsUpdated,
  onResetAllData
}) {
  if (!isOpen) return null;

  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [showKey, setShowKey] = useState(false);
  const [mockMode, setMockMode] = useState(getStoredMockMode());
  const [preferredModel, setPreferredModel] = useState(getStoredPreferredModel());
  const [testStatus, setTestStatus] = useState(null); // 'testing', 'success', 'error'
  const [testMessage, setTestMessage] = useState('');
  const [detailedResults, setDetailedResults] = useState([]);

  const handleSave = () => {
    setStoredApiKey(apiKey);
    setStoredMockMode(mockMode);
    setStoredPreferredModel(preferredModel);
    onSettingsUpdated();
    onClose();
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Detecting available models and verifying quotas...');
    setDetailedResults([]);

    try {
      const { bestWorkingModel, modelResults } = await testGeminiModels(apiKey.trim());
      setDetailedResults(modelResults);

      if (bestWorkingModel) {
        setTestStatus('success');
        setTestMessage(`Connected! Best active model: "${bestWorkingModel}" with available quota.`);
      } else {
        const hasExhausted = modelResults.some((r) => r.status === 'exhausted');
        if (hasExhausted) {
          setTestStatus('error');
          setTestMessage('Google Gemini Free Tier Quota is currently exhausted for tested models. Switch to Demo Mode below to continue testing.');
        } else {
          setTestStatus('error');
          setTestMessage('Failed to find an active model for this API key. Verify your key in Google AI Studio.');
        }
      }
    } catch (e) {
      setTestStatus('error');
      setTestMessage(e.message || 'Failed to connect to Google Gemini API');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Vision & System Settings</h3>
              <p className="text-xs text-slate-400">Configure Gemini API Key & auto-failover</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gemini Vision API Key Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Gemini API Key</span>
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>Get Free Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
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

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Your key stays safely stored in your browser's localStorage.
            </p>
            <button
              type="button"
              onClick={handleTestApiKey}
              disabled={testStatus === 'testing'}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              {testStatus === 'testing' ? 'Testing Quotas...' : 'Test Connection'}
            </button>
          </div>

          {testStatus && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex flex-col space-y-2 ${
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

              {detailedResults.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Model Quota Breakdown:</p>
                  <div className="grid grid-cols-1 gap-1">
                    {detailedResults.map((r) => (
                      <div key={r.model} className="flex items-center justify-between text-[11px] bg-slate-900/60 px-2 py-1 rounded">
                        <span className="font-mono text-slate-300">{r.model}</span>
                        <span className={r.status === 'ready' ? 'text-emerald-400 font-semibold' : r.status === 'exhausted' ? 'text-amber-400' : 'text-red-400'}>
                          {r.status === 'ready' ? '✓ Ready' : r.status === 'exhausted' ? '⚠️ Quota Exceeded (20/day limit)' : '✗ Not Available'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Model Selection / Auto Failover */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Vision Model Strategy</span>
          </label>
          <select
            value={preferredModel}
            onChange={(e) => setPreferredModel(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
          >
            <option value="auto">Auto-Failover (Recommended - prioritized for generous quotas)</option>
            <option value="gemini-2.0-flash">gemini-2.0-flash (1,500 req/day quota)</option>
            <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite (fast & high quota)</option>
            <option value="gemini-2.5-flash">gemini-2.5-flash</option>
            <option value="gemini-1.5-flash">gemini-1.5-flash</option>
            <option value="gemini-3.8-flash">gemini-3.8-flash (Preview - 20 req/day limit)</option>
          </select>
          <p className="text-[11px] text-slate-400">
            Auto-Failover automatically tries generous models first, and smoothly shifts to another model if one hits a rate limit.
          </p>
        </div>

        {/* Demo / Mock Mode Toggle */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-0.5 pr-4">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline Demo & Sample Mode</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-normal">
              Zero API calls required. Instant nutrition analyses for authentic Indian dishes even when Google API free tier quotas are exhausted.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={mockMode}
              onChange={(e) => setMockMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Danger Zone: Reset Data */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all meal entries and return to default demo data?')) {
                onResetAllData();
                onClose();
              }
            }}
            className="flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Diary History</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
