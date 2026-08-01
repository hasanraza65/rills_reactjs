import React, { useMemo } from 'react';
import {
  ArrowLeft,
  FileText,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../types';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { useInvoices } from '../../hooks/use-invoice';
import { useBranchStore } from '../../store/use-branch-store';
import type { StudentData } from '../../types/api/student';
import type { InvoiceData, InvoiceStatus } from '../../types/api/invoice';

interface StudentFeeDetailProps {
  student: StudentData;
  onBack: () => void;
}

const rupees = (n: number) => `Rs. ${Math.round(n).toLocaleString()}`;

const statusStyle: Record<InvoiceStatus, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-600' },
  partial: { label: 'Partial', className: 'bg-amber-50 text-amber-600' },
  unpaid: { label: 'Unpaid', className: 'bg-slate-100 text-slate-500' },
  carried_forward: { label: 'Carried Forward', className: 'bg-indigo-50 text-indigo-600' },
};

export const StudentFeeDetail: React.FC<StudentFeeDetailProps> = ({ student, onBack }) => {
  const { selectedBranchId } = useBranchStore();
  const { data: invoices, isLoading } = useInvoices(selectedBranchId || 1);

  /** Invoices that bill this student, either directly or as part of a family invoice. */
  const studentInvoices = useMemo<InvoiceData[]>(() => {
    return (invoices ?? []).filter(inv =>
      inv.student_id === student.id ||
      inv.items?.some(item => item.student_id === student.id)
    );
  }, [invoices, student.id]);

  /** Only the line items billed to this student — the one per-student figure the list endpoint gives us. */
  const totalInvoiced = useMemo(() => {
    return studentInvoices.reduce((sum, inv) => {
      const own = (inv.items ?? [])
        .filter(item => (item.student_id ?? inv.student_id) === student.id)
        .reduce((s, item) => s + (Number(item.amount) || 0), 0);
      return sum + own;
    }, 0);
  }, [studentInvoices, student.id]);

  const outstandingInvoices = studentInvoices.filter(inv => inv.status !== 'paid').length;
  const overdueInvoices = studentInvoices.filter(inv => inv.is_overdue && inv.status !== 'paid').length;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-brand-500 hover:border-brand-100 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{student.name}'s Fee Profile</h3>
          <p className="text-slate-500 font-medium text-sm">
            {student.admission_no}
            {student.class?.name ? ` • ${student.class.name}` : ''}
            {student.section?.name ? ` • Section ${student.section.name}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Invoiced</p>
          <p className="text-2xl font-extrabold text-slate-800">
            {isLoading ? '—' : rupees(totalInvoiced)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Outstanding Invoices</p>
          <p className="text-2xl font-extrabold text-amber-600">
            {isLoading ? '—' : outstandingInvoices}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Overdue</p>
          <p className="text-2xl font-extrabold text-rose-600">
            {isLoading ? '—' : overdueInvoices}
          </p>
        </Card>
      </div>

      <Card>
        <h4 className="text-xl font-bold text-slate-800 mb-6">Invoices</h4>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : studentInvoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Invoices"
            description="This student has not been invoiced yet."
          />
        ) : (
          <div className="space-y-4">
            {studentInvoices.map((inv, i) => {
              const style = statusStyle[inv.status] ?? statusStyle.unpaid;
              const isFamilyInvoice = inv.student_id === null;

              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-extrabold text-slate-800">{inv.invoice_no}</p>
                        <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider", style.className)}>
                          {style.label}
                        </span>
                        {inv.is_overdue && inv.status !== 'paid' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 flex items-center gap-1">
                            <AlertCircle size={10} /> Overdue
                          </span>
                        )}
                        {isFamilyInvoice && (
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 flex items-center gap-1"
                            title="Billed to the family — the amounts below cover every child on this invoice."
                          >
                            <Users size={10} /> Family
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        Issued {inv.issue_date}
                        {inv.due_date ? ` • Due ${inv.due_date}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice Total</p>
                        <p className="text-sm font-extrabold text-slate-800">{rupees(inv.total_amount)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid</p>
                        <p className="text-sm font-extrabold text-emerald-600">{rupees(inv.total_paid)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remaining</p>
                        <p className={cn("text-sm font-extrabold", inv.remaining > 0 ? "text-rose-500" : "text-slate-400")}>
                          {rupees(inv.remaining)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* This student's own line items on the invoice. */}
                  <div className="mt-4 pt-4 border-t border-slate-200/70 space-y-1.5">
                    {(inv.items ?? [])
                      .filter(item => (item.student_id ?? inv.student_id) === student.id)
                      .map(item => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-600">
                            {item.head_name}
                            <span className="text-slate-400 font-medium ml-2">{item.head_frequency}</span>
                          </span>
                          <span className="font-extrabold text-slate-700">{rupees(Number(item.amount) || 0)}</span>
                        </div>
                      ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isLoading && studentInvoices.some(inv => inv.student_id === null) && (
          <p className="mt-6 text-xs text-slate-400 font-medium flex items-start gap-2">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            Invoice totals on family invoices cover every child billed on them. The line items listed under each
            invoice are the ones charged to {student.name}.
          </p>
        )}
      </Card>
    </div>
  );
};
