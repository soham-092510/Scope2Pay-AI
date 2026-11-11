import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt, Plus, Search, Filter, Download, ExternalLink,
  CheckCircle2, Clock, ShieldCheck, ArrowRight, Printer
} from 'lucide-react';
import { api } from '../services/api';
import { Invoice } from '../types';

export const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const filter = statusFilter === 'all' ? undefined : statusFilter;
      const data = await api.getInvoices(filter);
      setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = invoices.filter(inv =>
    inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Invoice Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track deliverables, payment terms, and PayPal settlements</p>
        </div>

        <button
          onClick={() => navigate('/invoices/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'draft', 'approved', 'pending_payment', 'paid'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 w-64"
          />
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold">
                <th className="py-3.5 px-5">Invoice #</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Issue Date</th>
                <th className="py-3.5 px-5">Due Date</th>
                <th className="py-3.5 px-5">Terms</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-5 font-bold font-mono text-slate-900 flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{inv.invoice_number}</span>
                  </td>
                  <td className="py-4 px-5 font-semibold text-slate-800">{inv.customer_name}</td>
                  <td className="py-4 px-5 text-slate-500">{inv.issue_date}</td>
                  <td className="py-4 px-5 text-slate-500">{inv.due_date}</td>
                  <td className="py-4 px-5 text-slate-600 font-medium">{inv.payment_terms}</td>
                  <td className="py-4 px-5 font-extrabold text-slate-900">
                    ${Number(inv.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                      inv.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : inv.status === 'pending_payment'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        : inv.status === 'approved'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {inv.status === 'paid' && '✓ '}
                      {inv.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/api/v1/invoices/${inv.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        title="Print / PDF View"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </a>

                      {inv.status !== 'paid' ? (
                        <button
                          onClick={() => navigate(`/payments?invoice_id=${inv.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold text-xs shadow-sm transition-all"
                        >
                          <span>PayPal Pay</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Settled
                        </span>
                      )}
                    </div>
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
