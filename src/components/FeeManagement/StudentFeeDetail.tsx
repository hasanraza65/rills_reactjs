import React, { useState } from 'react';
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  Download, 
  Printer, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  Plus,
  Edit3,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, Student, CLASSES, StudentFeeStatus } from '../../types';

interface StudentFeeDetailProps {
  student: Student;
  onBack: () => void;
  onCollect: () => void;
}

// Mock data for a student's fee status
const mockFeeStatus: StudentFeeStatus = {
  studentId: 'st1',
  totalAnnualFee: 132000,
  totalPaid: 85000,
  totalPending: 47000,
  installments: [
    { month: '2024-01', amount: 11000, paid: 11000, status: 'PAID' },
    { month: '2024-02', amount: 11000, paid: 11000, status: 'PAID' },
    { month: '2024-03', amount: 11000, paid: 11000, status: 'PAID' },
    { month: '2024-04', amount: 11000, paid: 11000, status: 'PAID' },
    { month: '2024-05', amount: 11000, paid: 11000, status: 'PAID' },
    { month: '2024-06', amount: 11000, paid: 11000, status: 'PAID' },
    { month: '2024-07', amount: 11000, paid: 11000, status: 'PAID' },
    { month: '2024-08', amount: 11000, paid: 8000, status: 'PARTIAL' },
    { month: '2024-09', amount: 11000, paid: 0, status: 'PENDING' },
    { month: '2024-10', amount: 11000, paid: 0, status: 'PENDING' },
    { month: '2024-11', amount: 11000, paid: 0, status: 'PENDING' },
    { month: '2024-12', amount: 11000, paid: 0, status: 'PENDING' },
  ]
};

const history = [
  { id: '1', date: '2024-03-05', amount: 10000, method: 'Cash', ref: 'REC-9921', status: 'Success' },
  { id: '2', date: '2024-02-04', amount: 10000, method: 'Bank Transfer', ref: 'TXN-8812', status: 'Success' },
  { id: '3', date: '2024-01-02', amount: 10000, method: 'Cash', ref: 'REC-7734', status: 'Success' },
];

export const StudentFeeDetail: React.FC<StudentFeeDetailProps> = ({ student, onBack, onCollect }) => {
  const [activeView, setActiveView] = useState<'installments' | 'history' | 'customization'>('installments');

  const studentClass = CLASSES.find(c => c.id === student.classId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-brand-500 hover:border-brand-100 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{student.name}'s Fee Profile</h3>
            <p className="text-slate-500 font-medium">
              Roll #{student.rollNumber} • {studentClass?.name} - {studentClass?.section}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Printer size={20} />
          </button>
          <button 
            onClick={onCollect}
            className="px-6 py-4 rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 flex items-center gap-2"
          >
            <CreditCard size={20} />
            Collect Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Financial Summary</h4>
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Annual Total</p>
                <p className="text-2xl font-extrabold text-slate-800">${mockFeeStatus.totalAnnualFee.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Paid</p>
                  <p className="text-lg font-extrabold text-emerald-700">${mockFeeStatus.totalPaid.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">Outstanding</p>
                  <p className="text-lg font-extrabold text-rose-700">${mockFeeStatus.totalPending.toLocaleString()}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">Payment Progress</span>
                  <span className="text-xs font-extrabold text-brand-600">71%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: '71%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fee Heads</h4>
              <button className="text-brand-600 text-xs font-bold flex items-center gap-1">
                <Edit3 size={14} />
                Customize
              </button>
            </div>
            <div className="space-y-4">
              {student.feeCustomization.map((head) => (
                <div key={head.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      head.isEnabled ? "bg-brand-500" : "bg-slate-300"
                    )} />
                    <span className="text-sm font-bold text-slate-700">{head.name}</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-800">${head.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-slate-100 w-fit shadow-sm">
            <button 
              onClick={() => setActiveView('installments')}
              className={cn(
                "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
                activeView === 'installments' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <Calendar size={18} />
              Installments
            </button>
            <button 
              onClick={() => setActiveView('history')}
              className={cn(
                "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
                activeView === 'history' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <History size={18} />
              Payment History
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeView === 'installments' && (
              <motion.div
                key="installments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {mockFeeStatus.installments.map((inst, idx) => (
                  <div 
                    key={inst.month}
                    className={cn(
                      "p-6 rounded-3xl border transition-all",
                      inst.status === 'PAID' ? "bg-white border-slate-100" : 
                      inst.status === 'PARTIAL' ? "bg-amber-50 border-amber-100" : 
                      "bg-white border-slate-100 border-dashed"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center",
                          inst.status === 'PAID' ? "bg-emerald-50 text-emerald-600" : 
                          inst.status === 'PARTIAL' ? "bg-amber-100 text-amber-600" : 
                          "bg-slate-50 text-slate-400"
                        )}>
                          {inst.status === 'PAID' ? <CheckCircle2 size={16} /> : 
                           inst.status === 'PARTIAL' ? <Clock size={16} /> : 
                           <AlertCircle size={16} />}
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          {new Date(inst.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg",
                        inst.status === 'PAID' ? "bg-emerald-100 text-emerald-700" : 
                        inst.status === 'PARTIAL' ? "bg-amber-200 text-amber-800" : 
                        "bg-slate-100 text-slate-500"
                      )}>
                        {inst.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount Due</p>
                        <p className="text-lg font-extrabold text-slate-800">${inst.amount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid</p>
                        <p className={cn(
                          "text-lg font-extrabold",
                          inst.paid > 0 ? "text-emerald-600" : "text-slate-400"
                        )}>${inst.paid.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeView === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
              >
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reference</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Method</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {history.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-slate-800">{new Date(item.date).toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-medium text-slate-600">{item.ref}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                            {item.method}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-extrabold text-emerald-600">${item.amount.toLocaleString()}</p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="p-2 text-slate-300 hover:text-brand-500 transition-colors">
                            <Download size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
