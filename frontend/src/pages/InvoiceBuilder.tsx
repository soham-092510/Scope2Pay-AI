import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, Plus, Trash2, Calendar, CheckCircle2,
  Receipt, ShieldCheck, Download
} from 'lucide-react';
import { api } from '../services/api';
import { InvoiceItem } from '../types';

export const InvoiceBuilder: React.FC = () => {
  const navigate = useNavigate();

  // State initialized with prefilled values from sessionStorage or sensible defaults (Image 3)
  const [customerName, setCustomerName] = useState('PT Nusantara Digital Solusi');
  const [billingAddress, setBillingAddress] = useState('Jl. Jendral Sudirman No. 45 Jakarta Selatan, DKI Jakarta 12190 Indonesia');
  const [issueDate, setIssueDate] = useState('29 January 2026');
  const [dueDate, setDueDate] = useState('12 February 2026');
  const [paymentTerms, setPaymentTerms] = useState('Net 14');
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState(11.0);
  const [discountAmount, setDiscountAmount] = useState(500.0);
  const [notes, setNotes] = useState('Thank you for your trust. Please complete the payment before the due date. For any questions, feel free to contact us.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Dashboard UI Design', quantity: 10, unit_price: 750, total_amount: 7500 },
    { description: 'Mobile App', quantity: 100, unit_price: 50, total_amount: 5000 },
  ]);

  // Read prefilled data if converted from Transcript Studio
  useEffect(() => {
    const prefilled = sessionStorage.getItem('prefill_invoice');
    if (prefilled) {
      try {
        const parsed = JSON.parse(prefilled);
        if (parsed.customer_name) setCustomerName(parsed.customer_name);
        if (parsed.items && parsed.items.length > 0) setItems(parsed.items);
        if (parsed.discount_amount !== undefined) setDiscountAmount(parsed.discount_amount);
        if (parsed.tax_rate !== undefined) setTaxRate(parsed.tax_rate);
      } catch (e) {
        console.error(e);
      }
      sessionStorage.removeItem('prefill_invoice');
    }
  }, []);

  // Update item
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      const q = field === 'quantity' ? Number(value) || 0 : next[index].quantity;
      const p = field === 'unit_price' ? Number(value) || 0 : next[index].unit_price;
      next[index].total_amount = q * p;
    }
    setItems(next);
  };

  const addItem = () => {
    setItems([...items, { description: 'New Deliverable Item', quantity: 1, unit_price: 1000, total_amount: 1000 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + (it.total_amount || 0), 0);
  const taxAmount = (subtotal * (taxRate / 100));
  const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);

  // Actions
  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const invoice = await api.createInvoice({
        customer_name: customerName,
        billing_address: billingAddress,
        issue_date: issueDate,
        due_date: dueDate,
        payment_terms: paymentTerms,
        currency,
        tax_rate: taxRate,
        discount_amount: discountAmount,
        notes,
        items
      });
      alert(`Invoice #${invoice.invoice_number} saved as draft!`);
      navigate('/invoices');
    } catch (err: any) {
      alert(`Error saving invoice: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAndApprove = async () => {
    setIsSubmitting(true);
    try {
      const invoice = await api.createInvoice({
        customer_name: customerName,
        billing_address: billingAddress,
        issue_date: issueDate,
        due_date: dueDate,
        payment_terms: paymentTerms,
        currency,
        tax_rate: taxRate,
        discount_amount: discountAmount,
        notes,
        items
      });
      
      // Auto-approve and go directly to PayPal Checkout payment page
      await api.approveInvoice(invoice.id);
      navigate(`/payments?invoice_id=${invoice.id}`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header Bar (Image 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create New Invoice</h1>
        </div>

        {/* Buttons (Save as Draft & Send Invoice matching Image 3) */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Save as Draft</span>
          </button>

          <button
            onClick={handleSendAndApprove}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Invoice & Pay</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Column Split (50% Form / 50% Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Invoice Details Form (Image 3 left) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Invoice Details</h2>

          {/* Customer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              placeholder="e.g. PT Nusantara Digital Solusi"
            />
          </div>

          {/* Billing Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Billing Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed font-medium"
              placeholder="Full billing address..."
            />
          </div>

          {/* Issue Date, Due Date, Payment Terms Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Issue Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full text-xs p-2.5 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs p-2.5 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Terms <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white font-medium cursor-pointer"
              >
                <option>Net 14</option>
                <option>Net 30</option>
                <option>Due upon receipt</option>
                <option>50% Deposit Milestone</option>
              </select>
            </div>
          </div>

          {/* Items Details */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Items Details <span className="text-rose-500">*</span>
              </label>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-400 px-1">
                <div className="col-span-5">Item</div>
                <div className="col-span-2 text-center">QTY</div>
                <div className="col-span-2 text-right">Cost</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      className="w-full text-xs p-1.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      className="w-full text-xs p-1.5 text-center bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                      className="w-full text-xs p-1.5 text-right bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                    />
                  </div>
                  <div className="col-span-2 text-right text-xs font-bold text-slate-800 pr-1">
                    ${item.total_amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addItem}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-emerald-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Discount, Tax, Total Inputs (Image 3) */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Discount *</label>
              <div className="relative">
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tax (PPN 11%) *</label>
              <div className="relative">
                <input
                  type="number"
                  value={taxAmount}
                  readOnly
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total *</label>
              <div className="relative">
                <input
                  type="text"
                  value={`$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  readOnly
                  className="w-full text-xs p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/50 font-extrabold text-emerald-900"
                />
              </div>
            </div>
          </div>

          {/* Notes to Customer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes to Customer *</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed font-medium"
            />
          </div>
        </div>

        {/* Right Column: Live Pristine Invoice Preview Sheet (Image 3 right) */}
        <div className="lg:col-span-6 bg-slate-100/70 p-6 rounded-3xl border border-slate-200/80">
          <div className="text-xs font-bold text-slate-500 mb-3 flex items-center justify-between">
            <span>Preview</span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Live Sync
            </span>
          </div>

          {/* White Paper Invoice Sheet */}
          <div className="bg-white rounded-2xl shadow-dropdown border border-slate-200/60 p-8 space-y-6 text-xs text-slate-800">
            {/* Invoice Top Brand */}
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm">
                S2P
              </div>

              <div className="grid grid-cols-3 gap-6 text-right text-[11px]">
                <div>
                  <div className="text-slate-400 font-medium">Issue Date</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{issueDate}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Due Date</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{dueDate}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Payment Terms</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{paymentTerms}</div>
                </div>
              </div>
            </div>

            {/* Billed By & Billed To */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-[11px]">
              <div>
                <div className="text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">Billed by:</div>
                <div className="font-bold text-slate-900 text-xs">Studio Arsa Digital</div>
                <div className="text-slate-500 mt-0.5 leading-relaxed">
                  Jl. Jambu No 5, Somanding, Sumbersekar, Kec. Dau, Malang, Jawa Timur 65151
                </div>
              </div>

              <div>
                <div className="text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">Billed to:</div>
                <div className="font-bold text-slate-900 text-xs">{customerName}</div>
                <div className="text-slate-500 mt-0.5 leading-relaxed">
                  {billingAddress}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="pt-2">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="py-2 font-semibold">Item</th>
                    <th className="py-2 text-center font-semibold">QTY</th>
                    <th className="py-2 text-right font-semibold">Cost</th>
                    <th className="py-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-medium text-slate-800">{it.description}</td>
                      <td className="py-2.5 text-center text-slate-500">{it.quantity} page</td>
                      <td className="py-2.5 text-right text-slate-600">${it.unit_price.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">${it.total_amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Bank / PayPal Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="text-[11px] space-y-1">
                <div className="font-semibold text-slate-700">Payment Gateway:</div>
                <div className="font-bold text-blue-900 flex items-center gap-1">
                  <span>PayPal Orders v2</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold">SANDBOX</span>
                </div>
                <div className="text-slate-500 text-[10px]">Instant capture & verification</div>
              </div>

              <div className="space-y-1.5 text-right text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Discount</span>
                  <span>-${discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax (11%)</span>
                  <span>+${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-500 leading-relaxed">
              <strong>Notes:</strong> {notes}
            </div>

            {/* Interactive PayPal Sandbox Checkout Trigger Button */}
            <div className="pt-2">
              <button
                onClick={handleSendAndApprove}
                className="w-full py-2.5 rounded-xl bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>PayPal</span>
                <span className="font-normal text-[11px] text-[#003087]">Checkout with Sandbox</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
