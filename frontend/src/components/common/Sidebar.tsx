import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Receipt, ArrowLeftRight, BarChart3,
  FolderKanban, Users, Sparkles, MessageSquare, Settings,
  HelpCircle, LogOut, Search, ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  onSearchClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSearchClick }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('scope2pay_token');
    navigate('/dashboard');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-[#0F172A] text-white shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 pb-4 flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
              Scope2Pay
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 py-0.2 rounded-full">AI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">From Talk to Cash</div>
          </div>
        </NavLink>
      </div>

      {/* Search Input Button */}
      <div className="px-4 mb-3">
        <button
          onClick={onSearchClick}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200/80 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            Search
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 text-slate-500 rounded font-mono">⌘ K</kbd>
        </button>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 space-y-6">
        {/* Main Menu */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Main Menu
          </div>
          <nav className="space-y-1">
            <NavLink to="/dashboard" className={navItemClass}>
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </NavLink>

            <NavLink to="/transcripts" className={navItemClass}>
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Transcripts & AI</span>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800">
                Live
              </span>
            </NavLink>

            <NavLink to="/invoices" className={navItemClass}>
              <div className="flex items-center gap-3">
                <Receipt className="w-4 h-4" />
                <span>Invoices</span>
              </div>
            </NavLink>

            <NavLink to="/transactions" className={navItemClass}>
              <div className="flex items-center gap-3">
                <ArrowLeftRight className="w-4 h-4" />
                <span>Transactions</span>
              </div>
            </NavLink>

            <NavLink to="/reports" className={navItemClass}>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">20</span>
            </NavLink>
          </nav>
        </div>

        {/* Features */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Features
          </div>
          <nav className="space-y-1">
            <NavLink to="/projects" className={navItemClass}>
              <div className="flex items-center gap-3">
                <FolderKanban className="w-4 h-4" />
                <span>Projects</span>
              </div>
            </NavLink>

            <NavLink to="/clients" className={navItemClass}>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Clients</span>
              </div>
            </NavLink>

            <NavLink to="/payments" className={navItemClass}>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>PayPal Hub</span>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                v2
              </span>
            </NavLink>

            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-slate-400" />
                <span>Subscriptions</span>
              </div>
              <span className="text-[11px] text-slate-400">16</span>
            </div>

            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>Feedback</span>
              </div>
            </div>
          </nav>
        </div>

        {/* General */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            General
          </div>
          <nav className="space-y-1">
            <NavLink to="/settings" className={navItemClass}>
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </NavLink>

            <a
              href="#help"
              onClick={(e) => { e.preventDefault(); alert("Scope2Pay AI Docs & PayPal Sandbox guide available in Settings!"); }}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help Desk</span>
            </a>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Upgrade Pro / PayPal Sandbox Box */}
      <div className="p-4 pt-2">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
              PayPal Sandbox 🚀
            </div>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
            Connected to Orders API v2 for automatic invoice settlement.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/payments')}
              className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors text-center shadow-sm"
            >
              Test Checkout
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="py-1.5 px-2.5 text-slate-600 hover:text-slate-900 font-medium text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Config
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
