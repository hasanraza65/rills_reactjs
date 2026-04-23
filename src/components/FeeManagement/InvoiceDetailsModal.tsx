import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, User, Calendar, CreditCard, Receipt, Loader2, Download } from 'lucide-react';
import { useInvoice } from '../../hooks/use-invoice';
import { cn } from '../../types';

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number | null;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ isOpen, onClose, invoiceId }) => {
  const { data: invoice, isLoading } = useInvoice(invoiceId);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Invoice Details</h3>
                <p className="text-sm text-slate-500">View detailed breakdown of fee voucher</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600 shadow-sm border border-transparent hover:border-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[32rem] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="py-20 text-center flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Details...</p>
                </div>
              ) : invoice ? (
                <div className="space-y-8">
                  {/* Header Info */}
                  <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100/50">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice Number</p>
                      <p className="text-lg font-black text-brand-600">#{invoice.invoice_no || invoice.id}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase inline-flex items-center gap-1.5 ml-auto",
                        invoice.status.toLowerCase() === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", invoice.status.toLowerCase() === 'paid' ? "bg-emerald-500" : "bg-amber-500")} />
                        {invoice.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issue Date</p>
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(invoice.issue_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</p>
                      <div className="flex items-center gap-2 text-slate-700 font-bold justify-end">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Parent Info */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Parent Details</label>
                    <div className="flex items-center gap-4 p-4 bg-white border-2 border-slate-50 rounded-2xl">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl">
                        {invoice.parent?.father_name?.charAt(0) || <User size={24} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{invoice.parent?.father_name || 'N/A'}</p>
                        <p className="text-xs text-slate-500 font-medium">{invoice.parent?.father_contact_no || 'No contact'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items Breakdown */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Fee Breakdown</label>
                    <div className="border-2 border-slate-50 rounded-[2rem] overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50">
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Student / Head</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {invoice.items?.map((item: any) => (
                            <tr key={item.id}>
                              <td className="px-6 py-4">
                                <p className="text-sm font-bold text-slate-800">{item.student?.name || 'Student'}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.head_name}</p>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <p className="text-sm font-black text-slate-700">Rs. {Number(item.amount).toLocaleString()}</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-brand-50/30">
                            <td className="px-6 py-5 font-bold text-slate-800">Total Amount</td>
                            <td className="px-6 py-5 text-right">
                              <p className="text-lg font-black text-brand-600 underline decoration-brand-200 decoration-4 underline-offset-4">
                                Rs. {Number(invoice.total_amount).toLocaleString()}
                              </p>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-slate-400 font-bold">Failed to load invoice details.</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all"
              >
                Close
              </button>
              <button
                className="flex-1 py-4 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
