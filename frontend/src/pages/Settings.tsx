import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Sparkles, Check, Key, Lock, AlertCircle, Save } from 'lucide-react';
import { api } from '../services/api';
import { SettingsStatus } from '../types';

export const Settings: React.FC = () => {
  const [status, setStatus] = useState<SettingsStatus | null>(null);
  const [geminiKey, setGeminiKey] = useState('');
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalSecret, setPaypalSecret] = useState('');
  const [paypalMode, setPaypalMode] = useState('sandbox');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const s = await api.getSettings();
      setStatus(s);
      setPaypalMode(s.paypal_mode || 'sandbox');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.updateSettings({
        gemini_api_key: geminiKey || undefined,
        paypal_client_id: paypalClientId || undefined,
        paypal_client_secret: paypalSecret || undefined,
        paypal_mode: paypalMode
      });
      setStatus(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      setGeminiKey('');
      setPaypalSecret('');
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System & API Configuration</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage PayPal Sandbox keys, Google Gemini credentials, and runtime parameters</p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Configuration updated successfully!</span>
        </div>
      )}

      {/* Integration Status Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PayPal Status */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#003087] flex items-center justify-center font-bold">
              PP
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">PayPal Developer Sandbox</div>
              <div className="text-[11px] text-slate-400">Orders API v2 & Captures</div>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
            status?.paypal_configured
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {status?.paypal_configured ? '● Live Sandbox Connected' : '● Sandbox Ready (Default)'}
          </span>
        </div>

        {/* Gemini Status */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Google Gemini AI Engine</div>
              <div className="text-[11px] text-slate-400">Model: {status?.gemini_model || 'gemini-1.5-flash'}</div>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
            status?.gemini_configured
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {status?.gemini_configured ? '● Custom API Key Active' : '● Intelligent Engine Active'}
          </span>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-6">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">API Credentials</h2>

        {/* PayPal Credentials */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>PayPal Orders v2 Credentials</span>
              <span className="text-[10px] text-slate-400 font-normal">(Never exposed to frontend)</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Mode: {paypalMode}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">PayPal Client ID</label>
            <input
              type="text"
              value={paypalClientId}
              onChange={(e) => setPaypalClientId(e.target.value)}
              placeholder={status?.paypal_client_id_preview || "Enter PayPal Sandbox Client ID"}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">PayPal Client Secret</label>
            <input
              type="password"
              value={paypalSecret}
              onChange={(e) => setPaypalSecret(e.target.value)}
              placeholder="••••••••••••••••••••••••••••••••"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Gemini API Key */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span>Google Gemini API Key</span>
            <span className="text-[10px] text-slate-400 font-normal">(For direct multi-turn prompt extraction)</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">API Key</label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder={status?.gemini_configured ? "••••••••••••••••••••••••" : "AIzaSy..."}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Updating...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
