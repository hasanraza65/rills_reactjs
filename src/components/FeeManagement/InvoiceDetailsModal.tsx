import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, FileText, User, Download, Wallet,
  Loader2, AlertTriangle, History, Receipt,
} from 'lucide-react';
import { useInvoice } from '../../hooks/use-invoice';
import { cn } from '../../types';
import { InvoiceData, InvoiceItem, PaymentRecord } from '../../types/api/invoice';
import { InvoicePDFTemplate } from './InvoicePDFTemplate';
import { renderToString } from 'react-dom/server';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number | null;
  onMakePayment?: (invoice: InvoiceData) => void;
}

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  paid:            'bg-emerald-50 text-emerald-600 border-emerald-100',
  partial:         'bg-amber-50 text-amber-600 border-amber-100',
  unpaid:          'bg-slate-50 text-slate-500 border-slate-100',
  carried_forward: 'bg-violet-50 text-violet-600 border-violet-100',
};
const STATUS_DOT: Record<string, string> = {
  paid:            'bg-emerald-500',
  partial:         'bg-amber-500',
  unpaid:          'bg-slate-400',
  carried_forward: 'bg-violet-500',
};
const STATUS_LABEL: Record<string, string> = {
  paid: 'Paid', partial: 'Partial', unpaid: 'Unpaid', carried_forward: 'Carried Forward',
};

// ─── Component ─────────────────────────────────────────────────────────────────

export const InvoiceDetailsModal: React.FC<Props> = ({ isOpen, onClose, invoiceId, onMakePayment }) => {
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const [activeTab, setActiveTab] = React.useState<'breakdown' | 'history'>('breakdown');

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    const htmlString = renderToString(<InvoicePDFTemplate invoice={invoice as any} />);
    const opt = {
      margin: 10,
      filename: `Invoice_${invoice.invoice_no || invoice.id}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        onclone: (doc: Document) => {
          doc.querySelectorAll('style,link[rel="stylesheet"]').forEach((el) => el.remove());
        },
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };
    try {
      await html2pdf().set(opt).from(htmlString).save();
    } catch (e) {
      console.error('PDF error:', e);
    }
  };

  const formatDate = (d?: string | null) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  const canPay = invoice && invoice.status !== 'paid' && invoice.status !== 'carried_forward';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Invoice Details</h3>
                <p className="text-sm text-slate-500">Detailed fee breakdown and payment history</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-100">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                  <p className="text-sm font-bold uppercase tracking-widest">Loading…</p>
                </div>
              ) : !invoice ? (
                <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
                  <AlertTriangle size={32} className="text-rose-400" />
                  <p className="font-bold">Failed to load invoice.</p>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* ── Invoice header card ── */}
                  <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-[2rem] border-2 border-slate-50 shadow-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice No.</p>
                      <p className="text-xl font-black text-brand-600">#{invoice.invoice_no || invoice.id}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500">
                        <span>Issued: <strong className="text-slate-700">{formatDate(invoice.issue_date)}</strong></span>
                        <span>Due: <strong className={cn(invoice.is_overdue ? 'text-rose-500' : 'text-slate-700')}>
                          {formatDate(invoice.due_date)}
                          {invoice.is_overdue && ' (Overdue)'}
                        </strong></span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                      <span className={cn(
                        'px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase inline-flex items-center gap-1.5 border',
                        STATUS_BADGE[invoice.status] ?? STATUS_BADGE.unpaid
                      )}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[invoice.status] ?? STATUS_DOT.unpaid)} />
                        {STATUS_LABEL[invoice.status] ?? invoice.status}
                      </span>
                      {invoice.wallet_balance !== undefined && invoice.wallet_balance > 0 && (
                        <p className="text-[10px] text-emerald-600 font-bold mt-1">
                          Wallet: Rs. {invoice.wallet_balance.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ── Parent info ── */}
                  <div className="grid grid-cols-2 gap-4">
                    <ParentCard label="Father / Guardian" name={invoice.parent?.father_name} cnic={invoice.parent?.father_cnic} contact={invoice.parent?.father_contact_no} extra={invoice.parent?.father_occupation} />
                    <ParentCard label="Mother Details" name={invoice.parent?.mother_name} cnic={invoice.parent?.mother_cnic} contact={invoice.parent?.mother_contact_no} extra={invoice.parent?.address} extraLabel="Address" color="rose" />
                  </div>

                  {/* ── Tabs ── */}
                  <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl w-fit">
                    <TabBtn active={activeTab === 'breakdown'} onClick={() => setActiveTab('breakdown')} icon={<Receipt size={14} />} label="Fee Breakdown" />
                    <TabBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={14} />} label={`Payments (${invoice.payments?.length ?? 0})`} />
                  </div>

                  {/* ── Fee Breakdown ── */}
                  {activeTab === 'breakdown' && (
                    <div className="border-2 border-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm bg-white">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50">
                            <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase">Student / Fee Head</th>
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Amount</th>
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Paid</th>
                            <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Remaining</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {invoice.items?.map((item: InvoiceItem) => (
                            <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                                    {item.student?.name?.charAt(0) ?? '?'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-slate-800">{item.student?.name ?? 'Student'}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                      <span className="text-[10px] text-brand-600 font-bold uppercase">{item.head_name}</span>
                                      <span className="text-[10px] text-slate-300">•</span>
                                      <span className="text-[10px] text-slate-400">{item.head_frequency}</span>
                                      {item.carried_from && (
                                        <>
                                          <span className="text-[10px] text-slate-300">•</span>
                                          <span className="text-[10px] text-violet-500 font-bold">
                                            Carried from {item.carried_from.invoice_no}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    {item.previous_paid > 0 && (
                                      <p className="text-[10px] text-slate-400 mt-0.5">
                                        Previously paid: Rs. {item.previous_paid.toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <p className="text-sm font-bold text-slate-600">Rs. {item.amount.toLocaleString()}</p>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <p className="text-sm font-bold text-emerald-600">Rs. {item.paid.toLocaleString()}</p>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <p className={cn(
                                  'text-sm font-black',
                                  item.remaining > 0 ? 'text-rose-600' : 'text-emerald-600'
                                )}>
                                  Rs. {item.remaining.toLocaleString()}
                                </p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-brand-50/50">
                            <td className="px-5 py-5 font-black text-brand-800 text-sm">Total</td>
                            <td className="px-4 py-5 text-right font-black text-brand-700">
                              Rs. {invoice.total_amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-5 text-right font-black text-emerald-700">
                              Rs. {invoice.total_paid.toLocaleString()}
                            </td>
                            <td className="px-5 py-5 text-right font-black text-rose-600 text-lg">
                              Rs. {invoice.remaining.toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}

                  {/* ── Payment History ── */}
                  {activeTab === 'history' && (
                    <div className="border-2 border-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm bg-white">
                      {!invoice.payments || invoice.payments.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                          <History size={32} className="mx-auto mb-3 opacity-30" />
                          <p className="font-bold text-sm">No payments recorded yet.</p>
                        </div>
                      ) : (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50/50">
                              <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase">Date</th>
                              <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase">Method</th>
                              <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase">Reference</th>
                              <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Wallet Used</th>
                              <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {invoice.payments.map((p: PaymentRecord) => (
                              <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-5 py-4">
                                  <p className="text-sm font-bold text-slate-700">
                                    {formatDate(p.payment_date ?? p.created_at)}
                                  </p>
                                  <p className="text-[10px] text-slate-400">{new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </td>
                                <td className="px-4 py-4">
                                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-bold uppercase text-slate-600">
                                    {p.payment_method.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <p className="text-xs font-medium text-slate-600">{p.bank_name ?? ''}</p>
                                  <p className="text-[10px] text-slate-400">{p.reference_no ?? '—'}</p>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  {p.wallet_used > 0 ? (
                                    <span className="text-xs font-bold text-brand-600">Rs. {p.wallet_used.toLocaleString()}</span>
                                  ) : (
                                    <span className="text-xs text-slate-300">—</span>
                                  )}
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <p className="text-sm font-black text-emerald-600">Rs. {p.amount_paid.toLocaleString()}</p>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3 shrink-0">
              <button onClick={onClose} className="flex-1 py-3.5 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all text-sm">
                Close
              </button>
              {canPay && (
                <button
                  onClick={() => invoice && onMakePayment?.(invoice)}
                  className="flex-1 py-3.5 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 text-sm"
                >
                  <Wallet size={16} />
                  Make Payment
                </button>
              )}
              <button
                onClick={handleDownloadPDF}
                className="flex-1 py-3.5 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2 text-sm"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────────

interface ParentCardProps {
  label: string;
  name?: string;
  cnic?: string;
  contact?: string;
  extra?: string;
  extraLabel?: string;
  color?: 'brand' | 'rose';
}

const ParentCard: React.FC<ParentCardProps> = ({
  label, name, cnic, contact, extra, extraLabel = 'Occupation', color = 'brand',
}) => (
  <div className="space-y-2">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{label}</p>
    <div className="p-4 bg-white border-2 border-slate-50 rounded-[2rem] space-y-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner',
          color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-brand-50 text-brand-600'
        )}>
          {name?.charAt(0) ?? <User size={20} />}
        </div>
        <div>
          <p className="font-black text-slate-800 text-sm leading-tight">{name ?? 'N/A'}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{extraLabel}</p>
        </div>
      </div>
      <div className="pt-2 border-t border-slate-50 space-y-1.5">
        <InfoRow label="CNIC" value={cnic} />
        <InfoRow label="Contact" value={contact} />
        <InfoRow label={extraLabel} value={extra} />
      </div>
    </div>
  </div>
);

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
    <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{value ?? 'N/A'}</span>
  </div>
);

interface TabBtnProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabBtn: React.FC<TabBtnProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all',
      active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
    )}
  >
    {icon}
    {label}
  </button>
);
