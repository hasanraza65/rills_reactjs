import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  AlertCircle,
  ChevronRight,
  Loader2,
  CheckCircle2,
  CreditCard,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../types';
import { useInvoice } from '../../hooks/use-invoice';
import { usePayInvoice } from '../../hooks/use-payment';

interface InvoicePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId?: number | null;
  initialData?: any;
}

export const InvoicePaymentModal: React.FC<InvoicePaymentModalProps> = ({ isOpen, onClose, invoiceId, initialData }) => {
  const { data: fetchedInvoice, isLoading: isFetching } = useInvoice(!initialData ? invoiceId || null : null);
  const invoice = initialData || fetchedInvoice;
  const isLoading = !invoice && isFetching;
  const payMutation = usePayInvoice();
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'cheque'>('cash');
  const [itemPayments, setItemPayments] = useState<Record<number, number>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    bank_name: '',
    reference_no: '',
    cheque_no: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (invoice?.items) {
      const initialPayments: Record<number, number> = {};
      invoice.items.forEach((item: any, index: number) => {
        const total = Number(item.total_amount || item.amount || 0);
        const paid = Number(item.paid || 0);
        const remaining = Number(item.remaining || (total - paid));
        initialPayments[index] = isNaN(remaining) ? 0 : remaining;
      });
      setItemPayments(initialPayments);
    }
  }, [invoice]);

  const handleAmountChange = (index: number, val: string) => {
    if (val === '') {
      setItemPayments(prev => ({ ...prev, [index]: 0 }));
      return;
    }
    const num = parseFloat(val);
    setItemPayments(prev => ({ ...prev, [index]: isNaN(num) ? 0 : num }));
  };

  const handleConfirmPayment = async () => {
    if (!invoice?.items) {
      alert("Invoice data not found.");
      return;
    }

    const itemsToPay: { invoice_item_id: number; amount: number }[] = [];
    for (let index = 0; index < invoice.items.length; index++) {
      const item: any = invoice.items[index];
      const amount = Number(itemPayments[index] || 0);
      if (amount <= 0) continue;

      // Robust ID detection: checking all possible keys used by various API versions
      const actualId = 
        item.id || 
        item.invoice_item_id || 
        item.invoice_detail_id || 
        item.invoice_item?.id || 
        item.invoice_item_detail_id;

      if (!actualId) {
        alert(`Unable to determine invoice item id for item "${item.head_name || 'at position ' + (index + 1)}". Please check console.`);
        return;
      }

      itemsToPay.push({ invoice_item_id: Number(actualId), amount });
    }

    if (itemsToPay.length === 0) {
      alert("Please enter a payment amount for at least one item.");
      return;
    }

    const payload = {
      invoice_id: Number(invoice.id),
      payment_method: paymentMethod,
      items: itemsToPay,
      ...((paymentMethod === 'bank_transfer' || paymentMethod === 'cheque') && {
        bank_name: paymentDetails.bank_name,
        reference_no: paymentMethod === 'cheque' ? paymentDetails.cheque_no : paymentDetails.reference_no,
        payment_date: paymentDetails.date
      })
    };

    payMutation.mutate(payload as any, {
      onSuccess: () => {
        setIsSuccess(true);
        // queryClient.invalidateQueries will be handled by the hook
      },
      onError: (error: any) => {
        const msg = error.response?.data?.message || error.message || "Payment processing failed";
        alert(msg);
      }
    });
  };

  const totalToPay = Object.values(itemPayments).reduce((sum: number, val: number) => sum + (Number(val) || 0), 0) as number;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col min-h-[400px]"
          >
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Items...</p>
              </div>
            ) : isSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                  >
                    <CheckCircle2 size={40} />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-800">Payment Recorded!</h3>
                  <p className="text-sm text-slate-500 font-medium">The payment has been successfully added to the invoice history.</p>
                </div>
                <div className="flex flex-col w-full gap-3">
                  <button 
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
                  >
                    Done
                  </button>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Receipt generated automatically</p>
                </div>
              </div>
            ) : invoice ? (
              <>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800 leading-tight">Pay Invoice</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">#{invoice.invoice_no || invoice.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-white text-slate-400 transition-all border border-transparent hover:border-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[60vh] custom-scrollbar">
                  {/* Summary Card */}
                  <div className="p-6 rounded-3xl bg-slate-900 text-white relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Payment</p>
                      <span className="text-2xl font-black text-emerald-400">Rs. {totalToPay.toLocaleString()}</span>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full -mr-8 -mt-8 blur-3xl" />
                  </div>

                  {/* Quick Action */}
                  {totalToPay === 0 && (
                    <button 
                      onClick={() => {
                        const all: Record<number, number> = {};
                        invoice.items.forEach((item: any, i: number) => {
                          all[i] = Number(item.remaining || (item.total_amount - (item.paid || 0)));
                        });
                        setItemPayments(all);
                      }}
                      className="w-full py-3 rounded-xl border-2 border-dashed border-emerald-100 text-emerald-600 text-[10px] font-bold uppercase hover:bg-emerald-50 transition-all"
                    >
                      Pay All Items
                    </button>
                  )}

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Allocation</label>
                    <div className="space-y-3">
                      {invoice.items?.map((item: any, index: number) => {
                        const total = Number(item.total_amount || item.amount || 0);
                        const paid = Number(item.paid || 0);
                        const remaining = Number(item.remaining || (total - paid));
                        const displayRemaining = isNaN(remaining) ? 0 : remaining;
                        const itemId = item.id || item.invoice_item_id || index;
                        return (
                          <div key={itemId} className="space-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-700">{item.head_name}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">{item.student?.name || 'Student'}</span>
                              </div>
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">Rem: {displayRemaining.toLocaleString()}</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">Rs.</span>
                              <input 
                                type="number"
                                value={itemPayments[index] ?? ''}
                                onChange={(e) => handleAmountChange(index, e.target.value)}
                                placeholder="0"
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 pl-9 text-xs font-bold text-slate-700 outline-none focus:border-emerald-300 transition-all shadow-sm"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['cash', 'bank_transfer', 'cheque'] as const).map((method) => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={cn(
                            "px-3 py-3 rounded-xl text-[10px] font-bold uppercase transition-all border-2 flex flex-col items-center gap-1",
                            paymentMethod === method 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                              : "bg-white border-slate-50 text-slate-500 hover:border-slate-100"
                          )}
                        >
                          {method === 'cash' && <Wallet size={14} />}
                          {method === 'bank_transfer' && <CreditCard size={14} />}
                          {method === 'cheque' && <FileText size={14} />}
                          {method.split('_')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Conditional Details */}
                  {(paymentMethod === 'bank_transfer' || paymentMethod === 'cheque') && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Bank Name</label>
                          <input 
                            value={paymentDetails.bank_name}
                            onChange={(e) => setPaymentDetails(p => ({ ...p, bank_name: e.target.value }))}
                            placeholder="e.g. HBL"
                            className="w-full bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-300"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                            {paymentMethod === 'cheque' ? 'Cheque #' : 'Reference #'}
                          </label>
                          <input 
                            value={paymentMethod === 'cheque' ? paymentDetails.cheque_no : paymentDetails.reference_no}
                            onChange={(e) => setPaymentDetails(p => ({ 
                              ...p, 
                              [paymentMethod === 'cheque' ? 'cheque_no' : 'reference_no']: e.target.value 
                            }))}
                            placeholder="TXN-123"
                            className="w-full bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-300"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Payment Date</label>
                        <input 
                          type="date"
                          value={paymentDetails.date}
                          onChange={(e) => setPaymentDetails(p => ({ ...p, date: e.target.value }))}
                          className="w-full bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-300"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                  <button 
                    disabled={(totalToPay as number) <= 0 || payMutation.isPending}
                    onClick={handleConfirmPayment}
                    className="w-full py-4 rounded-2xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {payMutation.isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Pay Now
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
                <p className="text-slate-500 font-bold text-sm">Failed to load invoice items.</p>
                <button onClick={onClose} className="mt-4 text-brand-500 text-sm font-bold hover:underline">Close</button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
