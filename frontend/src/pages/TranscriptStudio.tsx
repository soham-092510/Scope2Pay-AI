import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Pause, Sparkles, Share2, FileText, ArrowRight, Upload,
  CheckCircle2, AlertTriangle, Shield, Check, Volume2, Search,
  Zap, Clock, Tag
} from 'lucide-react';
import { api } from '../services/api';
import { Transcript, AnalysisResult, AnalysisResponse } from '../types';

export const TranscriptStudio: React.FC = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(23 * 60 + 14); // 23:14 in seconds
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load transcripts on mount
  useEffect(() => {
    loadTranscripts();
  }, []);

  const loadTranscripts = async () => {
    try {
      const list = await api.getTranscripts();
      setTranscripts(list);
      if (list.length > 0) {
        setSelectedTranscript(list[0]);
        // Auto trigger or fetch analysis
        runAiAnalysis(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runAiAnalysis = async (transcriptId: string) => {
    setIsAnalyzing(true);
    try {
      const res = await api.runAnalysis(transcriptId);
      setAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const newT = await api.uploadTranscriptFile(file);
      setTranscripts(prev => [newT, ...prev]);
      setSelectedTranscript(newT);
      setUploadModalOpen(false);
      runAiAnalysis(newT.id);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  const handleCreatePasted = async () => {
    if (!pastedText.trim()) return;
    try {
      const newT = await api.createTranscriptText(pastedText, 'Client_Call_Transcript.txt');
      setTranscripts(prev => [newT, ...prev]);
      setSelectedTranscript(newT);
      setPastedText('');
      setUploadModalOpen(false);
      runAiAnalysis(newT.id);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Convert to Invoice: saves deliverables and redirects to InvoiceBuilder
  const handleConvertToInvoice = () => {
    if (!analysis) return;
    const deliverables = analysis.result.deliverables;
    const customer = analysis.result.client.name || 'PT Nusantara Digital Solusi';
    
    // Store in sessionStorage for InvoiceBuilder prefill
    sessionStorage.setItem('prefill_invoice', JSON.stringify({
      customer_name: customer,
      items: deliverables.map(d => ({
        description: d.title,
        quantity: 1,
        unit_price: d.estimated_amount || 5000,
        total_amount: d.estimated_amount || 5000
      })),
      discount_amount: analysis.result.financial_terms.discount || 500,
      tax_rate: analysis.result.financial_terms.tax_rate || 11.0,
      analysis_id: analysis.id
    }));

    navigate('/invoices/new');
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Top Search Bar (Image 2 style) */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
        <input
          type="text"
          placeholder="Search meetings, deals, topics..."
          className="w-full bg-white border border-slate-200/90 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      {/* Meeting Header Bar (Image 2) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Status Badges */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200/60 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              LIVE · REC
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200/60 uppercase tracking-wider">
              DISCOVERY CALL
            </span>
            <span className="text-xs text-slate-400">
              Today, 10:32 AM · 23 min elapsed
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {analysis?.result?.project?.name || 'Acme Corp — Product Discovery'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Attendees: Jordan Smith (you), Morgan Lee, Priya Patel · <span className="font-semibold text-slate-700">Deal: $184K ARR</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload Call</span>
          </button>

          <button
            onClick={() => alert("Summary and evidence citations exported.")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Summary</span>
          </button>

          <button
            onClick={() => alert("Meeting transcript and AI analysis link shared.")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors shadow-indigo-500/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {/* Core Action: Convert to Invoice (PayPal pipeline) */}
          <button
            onClick={handleConvertToInvoice}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200" />
            <span>Convert to Invoice</span>
          </button>
        </div>
      </div>

      {/* Audio Waveform Player Bar (Image 2) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 px-5 py-3 shadow-card flex items-center justify-between gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all shadow-sm shadow-indigo-600/20 active:scale-95 shrink-0"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Current Time */}
        <span className="text-xs font-mono font-semibold text-slate-700 shrink-0">
          {formatTime(currentTime)}
        </span>

        {/* Waveform Bars */}
        <div className="flex-1 flex items-center gap-1 h-7 overflow-hidden cursor-pointer">
          {Array.from({ length: 65 }).map((_, i) => {
            const heightPct = Math.sin(i * 0.28) * 40 + 50;
            const isPlayed = i < 35;
            return (
              <div
                key={i}
                style={{ height: `${heightPct}%` }}
                className={`flex-1 min-w-[2px] rounded-full transition-colors ${
                  isPlayed ? 'bg-indigo-600' : 'bg-slate-200 hover:bg-slate-300'
                }`}
              />
            );
          })}
        </div>

        {/* Total Duration & Speed */}
        <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-slate-500">
          <span>42:18</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[11px] font-semibold text-slate-700">1.0x</span>
        </div>
      </div>

      {/* Main Split Section: Left Live Transcript | Right AI Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Transcript (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4">
          {/* Header & Speaker Legend */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Live Transcript</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                AI TRANSCRIBING
              </span>
            </div>

            {/* Speaker Badges */}
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                Jordan (You)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                Morgan Lee
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Priya Patel
              </span>
            </div>
          </div>

          {/* Dialogue Feed */}
          <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2 text-xs leading-relaxed">
            {/* Turn 1: Jordan */}
            <div className="p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                  JS
                </span>
                <span className="font-bold text-slate-800">Jordan Smith</span>
                <span className="text-[11px] text-slate-400">18:42</span>
              </div>
              <p className="text-slate-700 pl-7">
                Before we dive into pricing, I want to understand the current workflow. Walk me through what happens when your reps finish a call today.
              </p>
            </div>

            {/* Turn 2: Morgan Lee */}
            <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/50">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center">
                  ML
                </span>
                <span className="font-bold text-slate-800">Morgan Lee</span>
                <span className="text-[11px] text-slate-400">19:08</span>
              </div>
              <p className="text-slate-700 pl-7">
                Honestly, it's messy. Reps type rough notes into Salesforce — <mark className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-medium">maybe 40% of what was actually discussed</mark>. My managers have no visibility into what's really happening in calls, and coaching is just based on vibes.
              </p>
            </div>

            {/* Turn 3: Priya Patel */}
            <div className="p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
                  PP
                </span>
                <span className="font-bold text-slate-800">Priya Patel</span>
                <span className="text-[11px] text-slate-400">20:15</span>
              </div>
              <p className="text-slate-700 pl-7">
                And we've been burned by tools before. The last platform we tried felt like it was built for enterprise — 9-month rollout, seat minimums, our ops team hated it.
              </p>
            </div>

            {/* Turn 4: Jordan */}
            <div className="p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                  JS
                </span>
                <span className="font-bold text-slate-800">Jordan Smith</span>
                <span className="text-[11px] text-slate-400">21:02</span>
              </div>
              <p className="text-slate-700 pl-7">
                That's exactly why we built Scope2Pay differently. No seat minimums, you're live in under a week, and every call is auto-synced back to Salesforce with full context — not just what reps remember to type.
              </p>
            </div>

            {/* Turn 5: Morgan Lee (SPEAKING) */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-200/60 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center">
                  ML
                </span>
                <span className="font-bold text-slate-800">Morgan Lee</span>
                <span className="text-[11px] text-slate-400">22:40</span>
                <span className="inline-flex items-center px-2 py-0.2 rounded text-[10px] font-bold bg-indigo-600 text-white tracking-wider uppercase">
                  SPEAKING
                </span>
              </div>
              <p className="text-slate-700 pl-7">
                Okay, I'm listening. What would onboarding look like for a team of 22? And does this integrate with HubSpot too — <mark className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-medium">we have a few holdouts on the SDR side</mark>.
              </p>
            </div>

            {/* Turn 6: Priya Patel */}
            <div className="p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
                  PP
                </span>
                <span className="font-bold text-slate-800">Priya Patel</span>
                <span className="text-[11px] text-slate-400">23:34</span>
              </div>
              <p className="text-slate-700 pl-7">
                What about security? We're SOC 2 Type II ourselves and our InfoSec team will want <mark className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-medium">SSO, SCIM and an audit trail</mark> before they sign anything.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: AI Intelligence & Insights (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: AI Summary (Image 2 style) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">AI Summary</h3>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Morgan surfaced two pains: <strong className="text-slate-900">rep note quality (~40%)</strong> and zero coaching visibility. Priya has a prior-tool scar — worried about rollout speed & seat minimums. Team mix includes 22 reps, split Salesforce / HubSpot.
            </p>
          </div>

          {/* Card 2: Topics & Trackers (Image 2 style) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900">Topics & Trackers</h3>
              <span className="text-[10px] text-slate-400">7 active tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white">
                Pricing <span className="opacity-80 text-[10px] ml-1">6</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200/60">
                Competitor <span className="opacity-80 text-[10px] ml-1">3</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-200/60">
                Integration <span className="opacity-80 text-[10px] ml-1">4</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200/60">
                Objection <span className="opacity-80 text-[10px] ml-1">2</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                Next Steps <span className="opacity-80 text-[10px] ml-1">1</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-200/60">
                Rollout <span className="opacity-80 text-[10px] ml-1">2</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                PayPal Net 14 <span className="opacity-80 text-[10px] ml-1">✓</span>
              </span>
            </div>

            {/* Call Sentiment Timeline */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-700 mb-1.5">Call Sentiment</div>
              <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-100">
                <div className="w-[15%] bg-amber-400"></div>
                <div className="w-[20%] bg-rose-400"></div>
                <div className="w-[35%] bg-emerald-500"></div>
                <div className="w-[30%] bg-indigo-500"></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>00:00</span>
                <span>10:00</span>
                <span>20:00</span>
                <span>30:00</span>
                <span>42:18</span>
              </div>
            </div>
          </div>

          {/* Card 3: Key Moments (Image 2 style) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Key Moments</h3>
              <span className="text-[10px] font-semibold text-slate-500">5 detected</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Moment 1 */}
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">+</span>
                <div>
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <span>Competitor mentioned</span>
                    <span className="font-mono text-[10px] opacity-75">08:24</span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    "...the last platform we tried felt built for enterprise..."
                  </p>
                </div>
              </div>

              {/* Moment 2 */}
              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/60 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-rose-900 flex items-center gap-1.5">
                    <span>Pain point surfaced</span>
                    <span className="font-mono text-[10px] opacity-75">19:08</span>
                  </div>
                  <p className="text-[11px] text-rose-800 mt-0.5">
                    "40% of what was actually discussed" — rep note quality gap
                  </p>
                </div>
              </div>

              {/* Moment 3 */}
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <span>Buying signal</span>
                    <span className="font-mono text-[10px] opacity-75">22:40</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    "Okay, I'm listening" + onboarding + integration question
                  </p>
                </div>
              </div>

              {/* Moment 4 */}
              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/60 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                    <span>Scope agreed & Approved</span>
                    <span className="font-mono text-[10px] opacity-75">23:45</span>
                  </div>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Dashboard UI ($7,500) + Mobile App ($5,000) under Net 14 terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Generate Invoice Pill */}
            <div className="pt-2">
              <button
                onClick={handleConvertToInvoice}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Draft Invoice from Findings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Call Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-dropdown space-y-4">
            <h3 className="text-base font-bold text-slate-900">Upload or Paste Client Transcript</h3>
            <p className="text-xs text-slate-500">
              Supports .txt, .pdf, .docx, .srt, .vtt. Gemini will extract deliverables, prices, and evidence.
            </p>

            {/* Drag & Drop Box */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-700">Drag and drop file here, or click to browse</div>
              <div className="text-[10px] text-slate-400 mt-1">Up to 15MB</div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".txt,.pdf,.docx,.srt,.vtt,.md"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </div>

            {/* Or Paste Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Or paste dialogue directly:</label>
              <textarea
                rows={4}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="[10:32 AM] Jordan: Let's agree on scope..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePasted}
                disabled={!pastedText.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                Analyze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
