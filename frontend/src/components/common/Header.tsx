import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HelpCircle, Mail, Bell, Share2, ChevronDown, Sparkles } from 'lucide-react';

interface HeaderProps {
  onShareClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShareClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('transcripts')) return 'Transcripts & AI Studio';
    if (path.includes('invoices/new')) return 'Create New Invoice';
    if (path.includes('invoices')) return 'Invoices';
    if (path.includes('transactions')) return 'Transactions';
    if (path.includes('projects')) return 'Projects';
    if (path.includes('clients')) return 'Clients';
    if (path.includes('payments')) return 'PayPal Checkout & Capture';
    if (path.includes('reports')) return 'Financial Reports';
    if (path.includes('settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumb path */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-1.5 text-slate-400">
          <button onClick={() => navigate(-1)} className="hover:text-slate-700 transition-colors">←</button>
          <button onClick={() => navigate(1)} className="hover:text-slate-700 transition-colors">→</button>
        </div>
        <span className="text-slate-400">|</span>
        <span className="text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => navigate('/dashboard')}>
          Scope2Pay
        </span>
        <span className="text-slate-300">›</span>
        <span className="text-slate-800 font-semibold">{getPageTitle()}</span>
      </div>

      {/* Right icons & Profile */}
      <div className="flex items-center gap-3">
        {/* Help */}
        <button
          onClick={() => navigate('/settings')}
          className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          title="Help & Guides"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Mail */}
        <button
          onClick={() => alert("All notifications and payment receipts are sent to your verified email.")}
          className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          title="Inbox Messages"
        >
          <Mail className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          onClick={() => alert("Notification: PayPal Sandbox order #SANDBOX-ORD-7A9B3F4C1 verified!")}
          className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Divider */}
        <div className="h-5 w-[1px] bg-slate-200 mx-1"></div>

        {/* User Profile Avatar */}
        <div
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="User Avatar"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">Jordan Smith</div>
            <div className="text-[10px] text-slate-400">Studio Arsa Digital</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        </div>

        {/* Share Button (Green Pill matching Image 1) */}
        <button
          onClick={onShareClick || (() => alert("Invoice and project summary link copied to clipboard!"))}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition-all shadow-emerald-600/20 active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>
    </header>
  );
};
