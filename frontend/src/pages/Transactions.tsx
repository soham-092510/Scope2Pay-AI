import React, { useState, useEffect } from 'react';
import {
  Download, Filter, Calendar, Search, ChevronDown, Check,
  ArrowDownLeft, ArrowUpRight, Equal, Building2, ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { Invoice } from '../types';

interface TransactionRow {
  id: string;
  dueDate: string;
  entity: string;
  entityLogo: string;
  status: 'Completed' | 'Pending Review' | 'Canceled';
  amount: number;
  currency: string;
  account: string;
  method: string;
}

export const Transactions: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const list = await api.getInvoices();
      setInvoices(list);
    } catch (e) {
      console.error(e);
    }
  };

  // Combine live invoices with realistic financial transactions (matching Image 4)
  const defaultTransactions: TransactionRow[] = [
    {
      id: 'tx-1',
      dueDate: 'Oct 12-2026',
      entity: 'Google Workspace',
      entityLogo: 'https://www.google.com/favicon.ico',
      status: 'Completed',
      amount: 129.00,
      currency: 'USD',
      account: 'Checking ...23456',
      method: 'Wire 5663 654 ******'
    },
    {
      id: 'tx-2',
      dueDate: 'Oct 12-2026',
      entity: 'Google PTE. LTD...',
      entityLogo: 'https://www.google.com/favicon.ico',
      status: 'Canceled',
      amount: 289.00,
      currency: 'USD',
      account: 'Checking ...13425',
      method: 'Wire 5663 654 ******'
    },
    {
      id: 'tx-3',
      dueDate: 'Oct 12-2026',
      entity: 'Google Workspace',
      entityLogo: 'https://www.google.com/favicon.ico',
      status: 'Pending Review',
      amount: 129.00,
      currency: 'USD',
      account: 'Checking ...23456',
      method: 'Wire 5663 654 ******'
    },
    {
      id: 'tx-4',
      dueDate: 'Oct 12-2026',
      entity: 'Google PTE. LTD...',
      entityLogo: 'https://www.google.com/favicon.ico',
      status: 'Completed',
      amount: 289.00,
      currency: 'USD',
      account: 'Checking ...13425',
      method: 'Wire 5663 654 ******'
    },
    {
      id: 'tx-5',
      dueDate: 'Oct 12-2026',
      entity: 'Google Workspace',
      entityLogo: 'https://www.google.com/favicon.ico',
      status: 'Pending Review',
      amount: 129.00,
      currency: 'USD',
      account: 'Checking ...23456',
      method: 'PayPal Sandbox'
    },
    {
      id: 'tx-6',
      dueDate: 'Oct 12-2026',
      entity: 'Google PTE. LTD...',
      entityLogo: 'https://www.google.com/favicon.ico',
      status: 'Canceled',
      amount: 289.00,
      currency: 'USD',
      account: 'Checking ...13425',
      method: 'Wire 5663 654 ******'
    },
  ];

  // Map real database invoices into transaction rows
  const invoiceRows: TransactionRow[] = invoices.map(inv => ({
    id: inv.id,
    dueDate: inv.due_date || 'Oct 12-2026',
    entity: inv.customer_name,
    entityLogo: 'https://avatar.vercel.sh/' + encodeURIComponent(inv.customer_name),
    status: inv.status === 'paid' ? 'Completed' : (inv.status === 'canceled' ? 'Canceled' : 'Pending Review'),
    amount: Number(inv.total_amount),
    currency: inv.currency,
    account: inv.paypal_order_id ? `PayPal ...${inv.paypal_order_id.slice(-5)}` : 'Checking ...87654',
    method: inv.paypal_order_id ? 'PayPal Sandbox' : 'Wire 5663 654 ******'
  }));

  const allRows = [...invoiceRows, ...defaultTransactions];

  const filtered = allRows.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchKeyword && !r.entity.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedRows.length === filtered.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filtered.map(r => r.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(r => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'ID,Due Date,Entity,Status,Amount,Currency,Account,Method\n';
    const rows = filtered.map(r => `"${r.id}","${r.dueDate}","${r.entity}","${r.status}",${r.amount},"${r.currency}","${r.account}","${r.method}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Scope2Pay_Transactions.csv';
    a.click();
  };

  return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-7 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Transactions</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your accounts and balances</p>
        </div>

        {/* Right Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-sm w-56"
          />
        </div>
      </div>

      {/* Row 1: Three Pastel Gradient Cards (Image 4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Net Change */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-6 shadow-card">
          {/* Pastel Gradient Glow */}
          <div className="absolute right-0 top-0 w-36 h-36 bg-gradient-to-br from-indigo-300/40 via-sky-300/30 to-purple-400/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Equal className="w-4 h-4" />
            </div>
          </div>

          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            +2,844.00 USD
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            Net change this month
          </div>
        </div>

        {/* Card 2: Money In */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-6 shadow-card">
          {/* Pastel Gradient Glow */}
          <div className="absolute right-0 top-0 w-36 h-36 bg-gradient-to-br from-amber-300/40 via-orange-300/30 to-rose-300/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>

          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            +4,234.00 USD
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            Money in
          </div>
        </div>

        {/* Card 3: Money Out */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-6 shadow-card">
          {/* Pastel Gradient Glow */}
          <div className="absolute right-0 top-0 w-36 h-36 bg-gradient-to-br from-purple-400/40 via-pink-400/30 to-rose-400/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            -1,123.00 USD
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            Money Out
          </div>
        </div>
      </div>

      {/* Row 2: Filter Toolbar (Image 4) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="text-sm font-bold text-slate-900">
          Transactions <span className="text-xs font-normal text-slate-400 ml-1">({filtered.length})</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50">
            <span>Data Views</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div
            onClick={() => setFilterStatus(filterStatus === 'Completed' ? 'all' : 'Completed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm cursor-pointer transition-colors ${
              filterStatus === 'Completed' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50">
            <span>Date</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50">
            <span>Keywords</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Row 3: Transactions Data Table (Image 4 Table) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-medium">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded text-slate-900 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 font-semibold text-slate-500">Due date</th>
                <th className="py-3 px-4 font-semibold text-slate-500">To/From</th>
                <th className="py-3 px-4 font-semibold text-slate-500">Status</th>
                <th className="py-3 px-4 font-semibold text-slate-500">Amount</th>
                <th className="py-3 px-4 font-semibold text-slate-500">Account</th>
                <th className="py-3 px-4 font-semibold text-slate-500">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => {
                const isSelected = selectedRows.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-slate-50' : ''}`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(row.id)}
                        className="rounded text-slate-900 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{row.dueDate}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 flex items-center gap-2.5">
                      <img
                        src={row.entityLogo}
                        alt="Logo"
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                        className="w-4 h-4 rounded-sm object-contain"
                      />
                      <span>{row.entity}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        row.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : row.status === 'Pending Review'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium font-mono text-[11px]">
                      {row.account}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[11px]">💳</span>
                      <span>{row.method}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
