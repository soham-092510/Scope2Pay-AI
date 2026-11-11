import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, ArrowRight, ExternalLink,
  Receipt, CreditCard, Lock, Sparkles, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { Invoice } from '../types';

export const PaymentCenter: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invoiceIdParam = searchParams.get('invoice_id');

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [captureResult, setCaptureResult] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'review' | 'paypal_approval' | 'captured'>('review');

  useEffect(() => {
    loadInvoices();
  }, [invoiceIdParam]);

  const loadInvoices = async () => {
    try {
      const list = await api.getInvoices();
      setInvoices(list);
      if (invoiceIdParam) {
        const found = list.find(i => i.id === invoiceIdParam);
        if (found) setSelectedInvoice(found);
      } else if (list.length > 0) {
        setSelectedInvoice(list[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);
    try {
      const res = await api.createPayPalOrder(selectedInvoice.id);
      setOrderId(res.order_id);
      setStep('paypal_approval');
    } catch (err: any) {
      alert(`PayPal Order Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCaptureOrder = async () => {
    if (!selectedInvoice || !orderId) return;
    setIsProcessing(true);
    try {
      const res = await api.capturePayPalOrder(selectedInvoice.id, orderId);
      setCaptureResult(res);
      setStep('captured');

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      alert(`Capture Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PayPal Orders v2 · Sandbox Verification Hub</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">PayPal Payment Center</h1>
        <p className="text-xs text-slate-500 mt-0.5">Authoritative server-side checkout and capture without frontend tampering</p>
      </div>

      {/* Select Invoice Picker */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <label className="text-xs font-semibold text-slate-700">Select Invoice to Settle:</label>
        <select
          value={selectedInvoice?.id || ''}
          onChange={(e) => {
            const found = invoices.find(i => i.id === e.target.value);
            if (found) {
              setSelectedInvoice(found);
              setStep('review');
              setOrderId(null);
              setCaptureResult(null);
            }
          }}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-md w-full"
        >
          {invoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.invoice_number} — {inv.customer_name} (${Number(inv.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}) [{inv.status}]
            </option>
          ))}
        </select>
      </div>

      {selectedInvoice && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Invoice Summary Card (Left 5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Invoice</span>
                <div className="font-extrabold text-slate-900 text-sm">{selectedInvoice.invoice_number}</div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                selectedInvoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {selectedInvoice.status.replace('_', ' ')}
              </span>
            </div>

            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Customer</div>
              <div className="font-bold text-slate-900 text-xs">{selectedInvoice.customer_name}</div>
              <div className="text-slate-500 text-[11px] mt-0.5">{selectedInvoice.billing_address}</div>
            </div>

            {/* Line Items */}
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Agreed Deliverables</div>
              <div className="space-y-2">
                {selectedInvoice.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-800">{it.description}</div>
                      <div className="text-[10px] text-slate-400">{it.quantity} unit @ ${Number(it.unit_price).toFixed(2)}</div>
                    </div>
                    <div className="font-bold text-slate-900">${Number(it.total_amount).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-600">Settlement Total:</span>
              <span className="text-2xl font-black text-slate-900">
                ${Number(selectedInvoice.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {selectedInvoice.currency}
              </span>
            </div>
          </div>

          {/* PayPal Workflow Interaction (Right 7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-6">
            {step === 'review' && (
              <div className="space-y-6 text-center py-6">
                <div className="w-14 h-14 rounded-3xl bg-blue-50 text-[#003087] flex items-center justify-center mx-auto shadow-sm">
                  <CreditCard className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">Initiate PayPal Sandbox Checkout</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    Creates an official PayPal Orders v2 record. The server enforces currency, line items, and prevents frontend price manipulation.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCreateOrder}
                    disabled={isProcessing}
                    className="py-3 px-8 rounded-2xl bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-black text-sm inline-flex items-center gap-2.5 shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span>PayPal</span>
                    <span className="font-bold text-xs">Create Sandbox Order</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {step === 'paypal_approval' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Simulated PayPal Checkout Modal Banner */}
                <div className="p-4 rounded-2xl bg-[#003087] text-white flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg tracking-tight">PayPal</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">SANDBOX CHECKOUT</span>
                  </div>
                  <span className="text-xs text-white/80 font-mono">ID: {orderId}</span>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Authorized Buyer:</span>
                    <span className="font-bold text-slate-800">Morgan Lee (PT Nusantara Digital)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Funding Source:</span>
                    <span className="font-bold text-slate-800">PayPal Sandbox Wallet (Balance: $45,000 USD)</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-700">Amount to Authorize:</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ${Number(selectedInvoice.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>
                </div>

                {/* Capture Button */}
                <div className="text-center pt-2">
                  <button
                    onClick={handleCaptureOrder}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4 text-emerald-200" />
                    <span>Authorize & Capture Payment</span>
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Server executes <code className="text-slate-600 font-mono">POST /v2/checkout/orders/{'{id}'}/capture</code>
                  </p>
                </div>
              </div>
            )}

            {step === 'captured' && (
              <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Payment Successfully Captured!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Invoice #{selectedInvoice.invoice_number} is now marked as <strong>PAID</strong> in database.
                  </p>
                </div>

                {/* Receipt Details Box */}
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 max-w-md mx-auto text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capture ID:</span>
                    <span className="font-mono font-bold text-emerald-800">{captureResult?.capture_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order ID:</span>
                    <span className="font-mono text-slate-700">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payer Name:</span>
                    <span className="font-semibold text-slate-800">{captureResult?.payer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payer Email:</span>
                    <span className="font-semibold text-slate-800">{captureResult?.payer_email}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-emerald-200/60 font-bold">
                    <span className="text-emerald-900">Amount Captured:</span>
                    <span className="text-emerald-900">${Number(captureResult?.amount).toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-colors"
                  >
                    View in Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/invoices')}
                    className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
                  >
                    Back to Invoices
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
