import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, User, Calendar, CreditCard, Receipt, Loader2, Download, Wallet } from 'lucide-react';
import { useInvoice } from '../../hooks/use-invoice';
import { cn } from '../../types';
import { InvoicePDFTemplate } from './InvoicePDFTemplate';
import { renderToString } from 'react-dom/server';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number | null;
  initialInvoice?: any;
  onMakePayment?: (invoice: any) => void;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  invoiceId, 
  initialInvoice,
  onMakePayment 
}) => {
  const { data: fetchedInvoice, isLoading } = useInvoice(invoiceId);
  
  // MERGE LOGIC: If fetchedInvoice is missing IDs in items, try to recover them from initialInvoice
  const invoice = React.useMemo(() => {
    if (!fetchedInvoice) return null;
    if (!initialInvoice?.items) return fetchedInvoice;

    const mergedItems = fetchedInvoice.items.map((item: any) => {
      if (item.id) return item; // Already has ID
      
      // Find matching item in initialInvoice (from list API)
      const match = initialInvoice.items.find((i: any) => 
        i.head_name === item.head_name && 
        (i.student_id === item.student_id || i.student?.id === item.student?.id)
      );

      return match ? { ...item, id: match.id } : item;
    });

    return { ...fetchedInvoice, items: mergedItems };
  }, [fetchedInvoice, initialInvoice]);
  const pdfRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // Return raw string if invalid but not null
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr || 'N/A';
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    
    // Render template to HTML string
    const htmlString = renderToString(<InvoicePDFTemplate invoice={invoice} />);

    const opt = {
      margin: 10,
      filename: `Invoice_${invoice.invoice_no || invoice.id}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        logging: false,
        // CRITICAL: Remove all external styles from the clone to avoid oklch errors
        onclone: (clonedDoc: Document) => {
          const styleElements = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          styleElements.forEach(el => el.remove());
        }
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(htmlString).save();
    } catch (error) {
      console.error('PDF Generation Error:', error);
    }
  };

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
                  <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-[2rem] border-2 border-slate-50 shadow-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice Number</p>
                      <p className="text-xl font-black text-brand-600">#{invoice.invoice_no || invoice.id}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                      <span className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase inline-flex items-center gap-1.5 ml-auto",
                        invoice.status.toLowerCase() === 'paid' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                        invoice.status.toLowerCase() === 'partial' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        "bg-slate-50 text-slate-600 border border-slate-100"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", 
                          invoice.status.toLowerCase() === 'paid' ? "bg-emerald-500" : 
                          invoice.status.toLowerCase() === 'partial' ? "bg-amber-500" :
                          "bg-slate-400"
                        )} />
                        {invoice.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Parent & Family Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Father / Guardian</label>
                      <div className="p-4 bg-white border-2 border-slate-50 rounded-[2rem] space-y-3 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl shadow-inner">
                            {invoice.parent?.father_name?.charAt(0) || <User size={24} />}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 leading-tight">{invoice.parent?.father_name || 'N/A'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{invoice.parent?.father_occupation || 'Occupation'}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-50 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">CNIC</span>
                            <span className="text-xs font-bold text-slate-600">{invoice.parent?.father_cnic || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Contact</span>
                            <span className="text-xs font-bold text-slate-600">{invoice.parent?.father_contact_no || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Education</span>
                            <span className="text-xs font-bold text-slate-600">{invoice.parent?.father_education || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Mother Details</label>
                      <div className="p-4 bg-white border-2 border-slate-50 rounded-[2rem] space-y-3 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl shadow-inner">
                            {invoice.parent?.mother_name?.charAt(0) || <User size={24} />}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 leading-tight">{invoice.parent?.mother_name || 'N/A'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{invoice.parent?.mother_occupation || 'Occupation'}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-50 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">CNIC</span>
                            <span className="text-xs font-bold text-slate-600">{invoice.parent?.mother_cnic || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Contact</span>
                            <span className="text-xs font-bold text-slate-600">{invoice.parent?.mother_contact_no || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Address</span>
                            <span className="text-xs font-bold text-slate-600 truncate max-w-[100px]">{invoice.parent?.address || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Breakdown */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Fee Breakdown</label>
                    <div className="border-2 border-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm bg-white">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Student / Description</th>
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Total</th>
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Paid</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Remaining</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {invoice.items?.map((item: any, idx: number) => (
                            <tr key={item.id || `${item.student_id}-${item.head_name}-${idx}`} className="hover:bg-slate-50/30 transition-colors">
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                    {item.student?.name?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-slate-800">{item.student?.name || 'Student'}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <p className="text-[10px] text-brand-600 font-bold uppercase tracking-wider">{item.head_name}</p>
                                      <span className="text-[10px] text-slate-300">•</span>
                                      <p className="text-[10px] text-slate-400 font-medium">{item.student?.admission_no}</p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-5 text-right">
                                <p className="text-sm font-bold text-slate-600">Rs. {Number(item.total_amount || item.amount).toLocaleString()}</p>
                              </td>
                              <td className="px-4 py-5 text-right">
                                <p className="text-sm font-bold text-emerald-600">Rs. {Number(item.previous_paid || 0).toLocaleString()}</p>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <p className="text-sm font-black text-rose-600">Rs. {Number(item.remaining || (item.total_amount - (item.paid || 0))).toLocaleString()}</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-brand-50/50">
                            <td className="px-6 py-6 font-black text-brand-800">Grand Total Payable</td>
                            <td colSpan={3} className="px-6 py-6 text-right">
                              <p className="text-2xl font-black text-brand-600 underline decoration-brand-200 decoration-4 underline-offset-8">
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
              {invoice?.status?.toLowerCase() !== 'paid' && (
                <button
                  onClick={() => invoice && onMakePayment?.(invoice)}
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                >
                  <Wallet size={18} />
                  Make Payment
                </button>
              )}
              <button
                onClick={handleDownloadPDF}
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

