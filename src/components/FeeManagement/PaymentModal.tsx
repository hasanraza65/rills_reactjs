import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, Student, PaymentRecord } from '../../types';

interface PaymentModalProps {
  student: Student;
  onClose: () => void;
  onSave: (payment: Partial<PaymentRecord>) => void;
}

const months = [
  { id: '2024-01', label: 'January', amount: 10000, status: 'PAID' },
  { id: '2024-02', label: 'February', amount: 10000, status: 'PAID' },
  { id: '2024-03', label: 'March', amount: 10000, status: 'PAID' },
  { id: '2024-04', label: 'April', amount: 10000, status: 'PAID' },
  { id: '2024-05', label: 'May', amount: 10000, status: 'PAID' },
  { id: '2024-06', label: 'June', amount: 10000, status: 'PAID' },
  { id: '2024-07', label: 'July', amount: 10000, status: 'PAID' },
  { id: '2024-08', label: 'August', amount: 10000, status: 'PAID' },
  { id: '2024-09', label: 'September', amount: 10000, status: 'PARTIAL', remaining: 5000 },
  { id: '2024-10', label: 'October', amount: 10000, status: 'PENDING' },
  { id: '2024-11', label: 'November', amount: 10000, status: 'PENDING' },
  { id: '2024-12', label: 'December', amount: 10000, status: 'PENDING' },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({ student, onClose, onSave }) => {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CHEQUE'>('CASH');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');

  const toggleMonth = (monthId: string) => {
    setSelectedMonths(prev => {
      const newSelection = prev.includes(monthId) 
        ? prev.filter(id => id !== monthId)
        : [...prev, monthId];
      
      // Auto-calculate amount based on selection
      const total = newSelection.reduce((sum, id) => {
        const m = months.find(month => month.id === id);
        return sum + (m?.status === 'PARTIAL' ? (m.remaining || 0) : (m?.amount || 0));
      }, 0);
      setAmount(total);
      
      return newSelection;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-100">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Collect Fee</h3>
              <p className="text-slate-500 font-medium">Recording payment for {student.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 rounded-2xl hover:bg-slate-100 text-slate-400 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Calendar size={16} />
                  Select Months
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {months.map((m) => (
                    <button
                      key={m.id}
                      disabled={m.status === 'PAID'}
                      onClick={() => toggleMonth(m.id)}
                      className={cn(
                        "p-4 rounded-2xl text-left transition-all border group relative",
                        m.status === 'PAID' ? "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed" :
                        selectedMonths.includes(m.id) ? "bg-brand-50 border-brand-200 ring-2 ring-brand-500/10" :
                        "bg-white border-slate-100 hover:border-brand-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "text-xs font-bold",
                          selectedMonths.includes(m.id) ? "text-brand-700" : "text-slate-600"
                        )}>{m.label}</span>
                        {m.status === 'PAID' ? (
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        ) : selectedMonths.includes(m.id) ? (
                          <div className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center">
                            <CheckCircle2 size={12} className="text-white" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-200 group-hover:border-brand-300" />
                        )}
                      </div>
                      <p className={cn(
                        "text-sm font-extrabold",
                        selectedMonths.includes(m.id) ? "text-brand-800" : "text-slate-800"
                      )}>
                        ${m.status === 'PARTIAL' ? m.remaining : m.amount}
                      </p>
                      {m.status === 'PARTIAL' && (
                        <span className="absolute top-2 right-2 text-[8px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">PARTIAL</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-8 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Payable</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold">${amount.toLocaleString()}</span>
                    <span className="text-slate-400 text-sm font-bold">USD</span>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-slate-400 text-xs">
                    <Info size={14} />
                    <span>Includes {selectedMonths.length} selected months</span>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full -mr-10 -mt-10 blur-3xl" />
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['CASH', 'BANK_TRANSFER', 'CHEQUE'] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-xs font-bold transition-all border",
                          paymentMethod === method 
                            ? "bg-brand-50 border-brand-200 text-brand-700" 
                            : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        {method.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Reference #</label>
                    <input 
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="REC-001"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-300 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Actual Amount ($)</label>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-300 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Notes (Optional)</label>
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add any additional details..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-300 transition-all h-24 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">Payment will be recorded instantly.</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button 
              disabled={amount <= 0 || selectedMonths.length === 0}
              onClick={() => onSave({ amount, paymentMethod, referenceNumber: reference, note, months: selectedMonths })}
              className="px-10 py-4 rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Confirm Payment
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
