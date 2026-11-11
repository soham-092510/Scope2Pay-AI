import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, PiggyBank, TrendingUp, MoreHorizontal, ArrowRight,
  Plus, RotateCcw, Search, Filter, CheckCircle2, Clock, XCircle,
  FileText, Receipt, ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardMetrics } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('This Month');
  const [searchQuery, setSearchQuery] = useState('');
  const [cashFlowMode, setCashFlowMode] = useState<'monthly' | 'yearly'>('yearly');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>('Mar');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboard();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activities = metrics?.recent_activities.filter(a =>
    a.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.order_id.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Overview Header Line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-sm text-slate-500">Here is the summary of overall data</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none bg-white border border-slate-200/90 rounded-xl px-4 py-2 pr-9 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-300 focus:outline-none cursor-pointer"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
              <option>Year to Date</option>
            </select>
            <span className="absolute right-3 top-2.5 text-slate-400 pointer-events-none text-xs">▼</span>
          </div>

          {/* Reset Data */}
          <button
            onClick={loadData}
            className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Row 1: Three Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: My Balance (Green Gradient from Image 1) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#02542D] via-[#046A38] to-[#064E3B] text-white p-6 shadow-elevated flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90">My balance</h3>
                  <p className="text-[11px] text-white/60">Wallet Overview & Spending</p>
                </div>
              </div>
              <button className="text-white/60 hover:text-white transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <div className="text-3xl font-extrabold tracking-tight">
                ${metrics?.balance ? metrics.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '20,520.32'}
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-400/25 text-emerald-200 backdrop-blur-md">
                +1.5% ↑
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-medium text-white/80 hover:text-white cursor-pointer group" onClick={() => navigate('/transactions')}>
            <span>See details</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Card 2: Savings Account */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Savings account</h3>
                  <p className="text-[11px] text-slate-400">Steady Growth Savings</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                ${metrics?.savings ? metrics.savings.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '15,800.45'}
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                +3.2% ↑
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer group" onClick={() => navigate('/reports')}>
            <span>View summary</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Card 3: Investment Portfolio / Settlements */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Investment portfolio</h3>
                  <p className="text-[11px] text-slate-400">Track Your Wealth Growth</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                ${metrics?.portfolio ? metrics.portfolio.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '50,120.78'}
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                +4.7% ↑
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer group" onClick={() => navigate('/transactions')}>
            <span>Analyze performance</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* Row 2: Middle Section (My Wallet & Cash Flow) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: My Wallet (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Wallet</h2>
              <p className="text-xs text-slate-400 mt-0.5">Today 1 USD = 122.20 BDT</p>
            </div>
            <button
              onClick={() => alert("Added multi-currency sub-account in PayPal Sandbox sandbox.")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Add New</span>
            </button>
          </div>

          {/* 4 Currency Cards */}
          <div className="grid grid-cols-2 gap-3.5">
            {metrics?.wallets.map((wallet, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{wallet.flag}</span>
                    <span className="text-xs font-bold text-slate-800">{wallet.currency}</span>
                  </div>
                  <MoreHorizontal className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                </div>

                <div className="text-base font-extrabold text-slate-900 mb-1">
                  {wallet.symbol}{wallet.balance}
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 truncate max-w-[90px]">{wallet.limit}</span>
                  <span className={`font-semibold ${wallet.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {wallet.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Scope2Pay Quick Launcher */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
            <button
              onClick={() => navigate('/transcripts')}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Analyze Meeting</span>
            </button>
            <button
              onClick={() => navigate('/invoices/new')}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Create Invoice</span>
            </button>
          </div>
        </div>

        {/* Right Column: Cash Flow (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-xs text-slate-400 font-medium">Cash Flow</div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                ${metrics?.cash_flow_total ? metrics.cash_flow_total.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '342,323.44'}
              </div>
            </div>

            {/* Toggle Monthly / Yearly */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setCashFlowMode('monthly')}
                className={`px-3 py-1 rounded-lg transition-all ${cashFlowMode === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setCashFlowMode('yearly')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${cashFlowMode === 'yearly' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Yearly</span>
              </button>
            </div>
          </div>

          {/* Bar Chart Canvas with March Active Highlight from Image 1 */}
          <div className="relative h-56 mt-4 flex items-end justify-between px-4 pb-2 border-b border-slate-100">
            {/* Background grid guidelines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-300">
              <div className="border-b border-slate-100/80 w-full h-0">50k</div>
              <div className="border-b border-slate-100/80 w-full h-0">40k</div>
              <div className="border-b border-slate-100/80 w-full h-0">30k</div>
              <div className="border-b border-slate-100/80 w-full h-0">20k</div>
              <div className="border-b border-slate-100/80 w-full h-0">10k</div>
              <div className="w-full h-0">0k</div>
            </div>

            {/* Bars */}
            {metrics?.cash_flow_monthly.map((point) => {
              const isSelected = hoveredMonth === point.month || point.highlighted;
              return (
                <div
                  key={point.month}
                  className="flex flex-col items-center gap-2 z-10 cursor-pointer group"
                  onMouseEnter={() => setHoveredMonth(point.month)}
                >
                  {/* Floating Tooltip matching Image 1 */}
                  {isSelected && (
                    <div className="absolute -top-3 left-[36%] md:left-[38%] -translate-x-1/2 bg-[#0F172A] text-white rounded-xl p-2.5 shadow-dropdown text-[11px] pointer-events-none z-20 min-w-[130px] animate-in fade-in zoom-in-95 duration-150">
                      <div className="text-slate-400 text-[10px] mb-1 font-medium">{point.date || 'July 23, 2026'}</div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-400 font-normal">Cashflow</span>
                        <span>{point.cashflow || '$33,847.00'}</span>
                      </div>
                      <div className="flex justify-between font-semibold mt-0.5">
                        <span className="text-slate-400 font-normal">Inflow</span>
                        <span className="text-emerald-400">{point.inflow || '-$7,456.00'}</span>
                      </div>
                    </div>
                  )}

                  <div className="w-11 md:w-12 h-44 flex items-end">
                    <div
                      style={{ height: point.height }}
                      className={`w-full rounded-2xl transition-all duration-300 relative ${
                        isSelected
                          ? 'bg-gradient-to-t from-emerald-800 via-emerald-700 to-emerald-600 shadow-md shadow-emerald-700/20'
                          : 'bg-slate-100/90 hover:bg-slate-200'
                      }`}
                    >
                      {/* Highlight indicator dot on top of active bar */}
                      {isSelected && (
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-500/30"></div>
                      )}
                    </div>
                  </div>

                  <span className={`text-xs font-semibold transition-colors ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                    {point.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activities Table (Image 1 Bottom) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-bold text-slate-900">Recent Activities</h2>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 transition-all"
              />
            </div>

            {/* Filter Pill */}
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium">
                <th className="py-3 px-3 w-8">
                  <input type="checkbox" className="rounded text-emerald-600 focus:ring-0" />
                </th>
                <th className="py-3 px-3 font-semibold text-slate-500">Activity</th>
                <th className="py-3 px-3 font-semibold text-slate-500">Order ID</th>
                <th className="py-3 px-3 font-semibold text-slate-500">Date</th>
                <th className="py-3 px-3 font-semibold text-slate-500">Time</th>
                <th className="py-3 px-3 font-semibold text-slate-500">Price</th>
                <th className="py-3 px-3 font-semibold text-slate-500">Status</th>
                <th className="py-3 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="py-3.5 px-3">
                    <input type="checkbox" className="rounded text-emerald-600 focus:ring-0" />
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                      {act.activity.includes('Flight') ? '✈' : 'A'}
                    </div>
                    <span>{act.activity}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{act.order_id}</td>
                  <td className="py-3.5 px-3 text-slate-600">{act.date}</td>
                  <td className="py-3.5 px-3 text-slate-400">{act.time}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    ${Number(act.price).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      act.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : act.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${act.status === 'Completed' ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                      {act.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
