import React, { useState, useEffect } from 'react';
import {
  X, Wallet, AlertCircle, ChevronRight, Loader2,
  CheckCircle2, CreditCard, FileText, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../types';
import { useInvoice } from '../../hooks/use-invoice';
import { usePayInvoice } from '../../hooks/use-payment';
import { PaymentMethod, InvoiceItem } from '../../types/api/invoice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number | null;
}

// Per-item payment amount keyed by item index
type ItemAmounts = Record<number, number>;

export const InvoicePaymentModal: React.FC<Props> = ({ isOpen, onClose, invoiceId }) => {
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const payMutation = usePayInvoice();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [itemAmounts, setItemAmounts]     = useState<ItemAmounts>({});
  const [useWallet, setUseWallet]         = useState(false);
  const [bankDetails, setBankDetails]     = useState({ bank_name: '', reference_no: '', payment_date: '' });
  const [isSuccess, setIsSuccess]         = useState(false);
  const [errorMsg, setErrorMsg]           = useState<string | null>(null);

  // Initialise item amounts to their remaining balances when invoice loads
  useEffect(() => {
    if (invoice?.items) {
      const initial: ItemAmounts = {};
      invoice.items.forEach((item, idx) => {
        initial[idx] = item.remaining > 0 ? item.remaining : 0;
      });
      setItemAmounts(initial);
    }
  }, [invoice]);

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setErrorMsg(null);
      setUseWallet(false);
      setPaymentMethod('cash');
      setBankDetails({ bank_name: '', reference_no: '', payment_date: '' });
    }
  }, [isOpen]);

  const walletBalance  = invoice?.wallet_balance ?? 0;
  const totalFromItems: number = (Object.values(itemAmounts) as number[]).reduce((s, v) => s + (Number(v) || 0), 0);

  // Compute how much of the wallet would be used
  const invoiceRemaining: number = invoice ? Math.max(0, invoice.remaining) : 0;
  const walletDeduction: number  = useWallet && walletBalance > 0
    ? Math.min(walletBalance, Math.max(0, invoiceRemaining - totalFromItems))
    : 0;

  const grandTotal: number = totalFromItems + walletDeduction;

  const handleAmountChange = (idx: number, raw: string) => {
    const num = raw === '' ? 0 : parseFloat(raw);
    setItemAmounts((prev) => ({ ...prev, [idx]: isNaN(num) ? 0 : num }));
  };

  const fillAll = () => {
    if (!invoice) return;
    const all: ItemAmounts = {};
    invoice.items.forEach((item, idx) => { all[idx] = item.remaining; });
    setItemAmounts(all);
  };

  const clearAll = () => {
    if (!invoice) return;
    const all: ItemAmounts = {};
    invoice.items.forEach((_, idx) => { all[idx] = 0; });
    setItemAmounts(all);
  };

  const handleSubmit = async () => {
    if (!invoice) return;
    setErrorMsg(null);

    const items = invoice.items
      .map((item, idx) => ({ invoice_item_id: item.id, amount: Number(itemAmounts[idx] ?? 0) }))
      .filter((x) => x.amount > 0);

    if (items.length === 0 && !useWallet) {
      setErrorMsg('Please enter a payment amount for at least one item.');
      return;
    }

    payMutation.mutate(
      {
        invoice_id:     invoice.id,
        payment_method: paymentMethod,
        use_wallet:     useWallet,
        items,
        ...(paymentMethod !== 'cash' && {
          bank_name:    bankDetails.bank_name,
          reference_no: bankDetails.reference_no,
          payment_date: bankDetails.payment_date || undefined,
        }),
      },
      {
        onSuccess: () => setIsSuccess(true),
        onError: (err: any) => {
          setErrorMsg(err?.response?.data?.message ?? err?.message ?? 'Payment processing failed.');
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* ── Loading ── */}
            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading…</p>
              </div>
            )}

            {/* ── Success ── */}
            {!isLoading && isSuccess && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
                    <CheckCircle2 size={40} />
                  </motion.div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-800">Payment Recorded!</h3>
                  <p className="text-sm text-slate-500">The payment has been saved to the invoice.</p>
                </div>
                <button onClick={onClose} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all">
                  Done
                </button>
              </div>
            )}

            {/* ── No invoice ── */}
            {!isLoading && !isSuccess && !invoice && (
              <div className="p-12 text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <p className="text-slate-500 font-bold text-sm">Failed to load invoice data.</p>
                <button onClick={onClose} className="text-brand-500 text-sm font-bold hover:underline">Close</button>
              </div>
            )}

            {/* ── Main form ── */}
            {!isLoading && !isSuccess && invoice && (
              <>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800 leading-tight">Pay Invoice</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        #{invoice.invoice_no || invoice.id}
                      </p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-xl hover:bg-white text-slate-400 transition-all border border-transparent hover:border-slate-100">
                    <X size={20} />
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                  {/* Summary card */}
                  <div className="p-5 rounded-3xl bg-slate-900 text-white relative overflow-hidden shadow-xl">
                    <div className="relative z-10 space-y-1">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">This Payment</p>
                      <p className="text-2xl font-black text-emerald-400">Rs. {grandTotal.toLocaleString()}</p>
                      <div className="flex gap-4 mt-2 text-[10px] font-bold text-slate-400">
                        <span>Invoice Total: <span className="text-white">Rs. {invoice.total_amount.toLocaleString()}</span></span>
                        <span>Remaining: <span className="text-amber-400">Rs. {invoice.remaining.toLocaleString()}</span></span>
                      </div>
                      {walletDeduction > 0 && (
                        <p className="text-[10px] text-emerald-400 font-bold mt-1">
                          Wallet: Rs. {walletDeduction.toLocaleString()} applied
                        </p>
                      )}
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full -mr-8 -mt-8 blur-3xl" />
                  </div>

                  {/* Quick fill */}
                  <div className="flex gap-2">
                    <button onClick={fillAll} className="flex-1 py-2 rounded-xl border-2 border-dashed border-emerald-100 text-emerald-600 text-[10px] font-bold uppercase hover:bg-emerald-50 transition-all">
                      Fill All Remaining
                    </button>
                    <button onClick={clearAll} className="flex-1 py-2 rounded-xl border-2 border-dashed border-slate-100 text-slate-500 text-[10px] font-bold uppercase hover:bg-slate-50 transition-all">
                      Clear All
                    </button>
                  </div>

                  {/* Per-item allocation */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Per-Item Allocation</p>
                    {invoice.items.map((item: InvoiceItem, idx: number) => {
                      const remaining = item.remaining;
                      const value     = itemAmounts[idx] ?? 0;
                      const isPaid    = remaining <= 0;
                      return (
                        <div key={item.id} className={cn(
                          'p-4 rounded-2xl border transition-all',
                          isPaid ? 'bg-emerald-50/50 border-emerald-100 opacity-60' : 'bg-slate-50/50 border-slate-100'
                        )}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-xs font-black text-slate-700">{item.head_name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{item.student?.name ?? 'Student'} · {item.head_frequency}</p>
                              {item.carried_from && (
                                <p className="text-[9px] text-violet-500 font-bold">
                                  Carried from {item.carried_from.invoice_no}
                                </p>
                              )}
                            </div>
                            {isPaid ? (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">PAID</span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                                Rem: Rs. {remaining.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {!isPaid && (
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">Rs.</span>
                              <input
                                type="number"
                                min={0}
                                max={remaining}
                                value={value === 0 ? '' : value}
                                onChange={(e) => handleAmountChange(idx, e.target.value)}
                                placeholder="0"
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 pl-9 text-xs font-bold text-slate-700 outline-none focus:border-emerald-300 transition-all shadow-sm"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Wallet toggle */}
                  {walletBalance > 0 && (
                    <button
                      onClick={() => setUseWallet((p) => !p)}
                      className={cn(
                        'w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all',
                        useWallet
                          ? 'bg-brand-50 border-brand-200 text-brand-700'
                          : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Wallet size={16} />
                        <div className="text-left">
                          <p className="text-xs font-black">Use Wallet Balance</p>
                          <p className="text-[10px] font-bold text-slate-400">Available: Rs. {walletBalance.toLocaleString()}</p>
                        </div>
                      </div>
                      {useWallet
                        ? <ToggleRight size={22} className="text-brand-500" />
                        : <ToggleLeft size={22} className="text-slate-300" />
                      }
                    </button>
                  )}

                  {/* Payment method */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Payment Method</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['cash', 'bank_transfer', 'cheque'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={cn(
                            'px-3 py-3 rounded-xl text-[10px] font-bold uppercase transition-all border-2 flex flex-col items-center gap-1',
                            paymentMethod === m
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                          )}
                        >
                          {m === 'cash' && <Wallet size={14} />}
                          {m === 'bank_transfer' && <CreditCard size={14} />}
                          {m === 'cheque' && <FileText size={14} />}
                          {m.split('_')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bank / cheque details */}
                  {(paymentMethod === 'bank_transfer' || paymentMethod === 'cheque') && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Bank Name</label>
                          <input
                            value={bankDetails.bank_name}
                            onChange={(e) => setBankDetails((p) => ({ ...p, bank_name: e.target.value }))}
                            placeholder="e.g. HBL"
                            className="w-full bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-300"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">
                            {paymentMethod === 'cheque' ? 'Cheque #' : 'Reference #'}
                          </label>
                          <input
                            value={bankDetails.reference_no}
                            onChange={(e) => setBankDetails((p) => ({ ...p, reference_no: e.target.value }))}
                            placeholder="TXN-123"
                            className="w-full bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-300"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Payment Date</label>
                        <input
                          type="date"
                          value={bankDetails.payment_date}
                          onChange={(e) => setBankDetails((p) => ({ ...p, payment_date: e.target.value }))}
                          className="w-full bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-300"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Error */}
                  {errorMsg && (
                    <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-medium">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      {errorMsg}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
                  <button
                    disabled={grandTotal <= 0 || payMutation.isPending}
                    onClick={handleSubmit}
                    className="w-full py-4 rounded-2xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {payMutation.isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Confirm Payment · Rs. {grandTotal.toLocaleString()}
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
