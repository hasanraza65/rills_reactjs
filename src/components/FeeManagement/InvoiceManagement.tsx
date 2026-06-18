import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Trash2,
  Wallet,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useInvoices, useDeleteInvoice } from '../../hooks/use-invoice';
import { useBranchStore } from '../../store/use-branch-store';
import { cn } from '../../types';
import { InvoiceData, InvoiceStatus } from '../../types/api/invoice';
import { EmptyState } from '../ui/EmptyState';
import { GenerateInvoiceModal } from './GenerateInvoiceModal';
import { InvoiceDetailsModal } from './InvoiceDetailsModal';
import { InvoicePaymentModal } from './InvoicePaymentModal';
import { ConfirmationModal } from '../ui/ConfirmationModal';

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  paid: {
    label: 'Paid',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  partial: {
    label: 'Partial',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  unpaid: {
    label: 'Unpaid',
    dot: 'bg-slate-400',
    badge: 'bg-slate-50 text-slate-500 border-slate-100',
  },
  carried_forward: {
    label: 'Carried',
    dot: 'bg-violet-500',
    badge: 'bg-violet-50 text-violet-600 border-violet-100',
  },
};

function statusCfg(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.unpaid;
}

// ─── Component ─────────────────────────────────────────────────────────────────

type DateFilter = 'all' | 'this_month' | 'last_month';
type StatusFilter = 'all' | InvoiceStatus;

export const InvoiceManagement: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId ?? 1;

  const { data: invoices, isLoading, error } = useInvoices(branchId);
  const deleteInvoiceMutation = useDeleteInvoice();

  const [isGenerateOpen, setIsGenerateOpen]   = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen]     = useState(false);
  const [isPaymentOpen, setIsPaymentOpen]     = useState(false);
  const [deleteTargetId, setDeleteTargetId]   = useState<number | null>(null);
  const [deleteError, setDeleteError]         = useState<string | null>(null);

  const [searchQuery, setSearchQuery]     = useState('');
  const [dateFilter, setDateFilter]       = useState<DateFilter>('all');
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>('all');

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];

    const now   = new Date();
    const month = now.getMonth();
    const year  = now.getFullYear();

    return invoices.filter((inv) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          inv.invoice_no?.toLowerCase().includes(q) ||
          inv.status.toLowerCase().includes(q) ||
          String(inv.id).includes(q);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;

      // Date filter
      if (dateFilter !== 'all') {
        const issueDate = new Date(inv.issue_date);
        if (dateFilter === 'this_month') {
          if (issueDate.getMonth() !== month || issueDate.getFullYear() !== year) return false;
        } else if (dateFilter === 'last_month') {
          const lastMonth = month === 0 ? 11 : month - 1;
          const lastYear  = month === 0 ? year - 1 : year;
          if (issueDate.getMonth() !== lastMonth || issueDate.getFullYear() !== lastYear) return false;
        }
      }

      return true;
    });
  }, [invoices, searchQuery, statusFilter, dateFilter]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openDetails = (inv: InvoiceData) => {
    setSelectedInvoice(inv);
    setIsDetailsOpen(true);
  };

  const openPayment = (inv: InvoiceData) => {
    setSelectedInvoice(inv);
    setIsPaymentOpen(true);
  };

  const handleDeleteClick = (inv: InvoiceData) => {
    if (inv.status === 'paid' || inv.status === 'partial') {
      setDeleteError('Paid or partially paid invoices cannot be deleted.');
      return;
    }
    setDeleteError(null);
    setDeleteTargetId(inv.id);
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    deleteInvoiceMutation.mutate(deleteTargetId, {
      onSuccess: () => setDeleteTargetId(null),
      onError: (err: any) => {
        setDeleteTargetId(null);
        setDeleteError(err?.response?.data?.message ?? 'Failed to delete invoice.');
      },
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Invoice Management</h3>
          <p className="text-slate-500 text-sm font-medium">Generate and manage student fee vouchers</p>
        </div>
        <button
          onClick={() => setIsGenerateOpen(true)}
          className="w-full sm:w-auto px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Generate Invoice
        </button>
      </div>

      {/* Error banner */}
      {deleteError && (
        <div className="flex items-center gap-3 px-5 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium">
          <AlertTriangle size={16} className="shrink-0" />
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="ml-auto text-rose-400 hover:text-rose-600 font-bold">✕</button>
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 sm:p-6 border-b border-slate-50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              placeholder="Search by invoice # or status…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none font-medium"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none"
            >
              <option value="all">All Dates</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="carried_forward">Carried Forward</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issue Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                      <p className="text-sm font-bold uppercase tracking-widest">Loading Invoices…</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center text-rose-500 font-bold">
                    Failed to load invoices. Please try again.
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <EmptyState
                      icon={FileText}
                      title="No Invoices Found"
                      description={searchQuery ? `No records match "${searchQuery}"` : 'Start by generating your first invoice.'}
                      actionLabel="Generate Invoice"
                      onAction={() => setIsGenerateOpen(true)}
                    />
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const cfg = statusCfg(inv.status);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Invoice */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{inv.invoice_no || `#${inv.id}`}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fee Voucher</p>
                          </div>
                        </div>
                      </td>

                      {/* Issue date */}
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-slate-600">
                          {new Date(inv.issue_date).toLocaleDateString()}
                        </p>
                      </td>

                      {/* Due date */}
                      <td className="px-8 py-5">
                        <p className={cn(
                          'text-sm font-bold',
                          inv.is_overdue ? 'text-rose-500' : 'text-slate-600'
                        )}>
                          {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}
                          {inv.is_overdue && (
                            <span className="ml-1.5 text-[9px] bg-rose-50 text-rose-500 border border-rose-100 px-1.5 py-0.5 rounded-full font-bold uppercase">
                              Overdue
                            </span>
                          )}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-slate-800">
                          Rs. {Number(inv.total_amount).toLocaleString()}
                        </p>
                        {inv.total_paid > 0 && inv.status !== 'paid' && (
                          <p className="text-[10px] text-emerald-600 font-bold">
                            Paid: Rs. {Number(inv.total_paid).toLocaleString()}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-8 py-5">
                        <span className={cn(
                          'px-3 py-1 rounded-lg text-[10px] font-bold uppercase w-fit flex items-center gap-1.5 border',
                          cfg.badge
                        )}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetails(inv)}
                            className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>

                          {inv.status !== 'paid' && inv.status !== 'carried_forward' && (
                            <button
                              onClick={() => openPayment(inv)}
                              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                              title="Make Payment"
                            >
                              <Wallet size={18} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteClick(inv)}
                            disabled={inv.status === 'paid' || inv.status === 'partial'}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Delete Invoice"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <GenerateInvoiceModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
      />

      <InvoiceDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        invoiceId={selectedInvoice?.id ?? null}
        onMakePayment={(inv) => {
          setIsDetailsOpen(false);
          openPayment(inv);
        }}
      />

      <InvoicePaymentModal
        key={selectedInvoice?.id ?? 'none'}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        invoiceId={selectedInvoice?.id ?? null}
      />

      <ConfirmationModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        isLoading={deleteInvoiceMutation.isPending}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
};
