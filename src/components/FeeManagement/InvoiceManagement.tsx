import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Trash2,
  Calendar,
  Loader2,
  Wallet
} from 'lucide-react';
import { useInvoices, useDeleteInvoice } from '../../hooks/use-invoice';
import { useBranchStore } from '../../store/use-branch-store';
import { cn } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { GenerateInvoiceModal } from './GenerateInvoiceModal';
import { InvoiceDetailsModal } from './InvoiceDetailsModal';
import { InvoicePaymentModal } from './InvoicePaymentModal';
import { ConfirmationModal } from '../ui/ConfirmationModal';
// import { toast } from 'react-hot-toast';

export const InvoiceManagement: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const { data: invoices, isLoading, error } = useInvoices(selectedBranchId || 1);
  const deleteInvoiceMutation = useDeleteInvoice();

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvoices = invoices?.filter(inv => 
    inv.id.toString().includes(searchQuery) || 
    inv.invoice_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.status.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleShowDetails = (inv: any) => {
    setSelectedInvoice(inv);
    setIsDetailsModalOpen(true);
  };

  const handleMakePayment = (inv: any) => {
    setSelectedInvoice(inv);
    setIsPaymentModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setInvoiceToDelete(id);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoiceMutation.mutate(invoiceToDelete, {
        onSuccess: () => {
          // toast.success('Invoice deleted successfully');
          setInvoiceToDelete(null);
        },
        onError: () => {
          // toast.error('Failed to delete invoice');
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Invoice Management</h3>
          <p className="text-slate-500 text-sm font-medium">Generate and manage student fee vouchers</p>
        </div>
        <button 
          onClick={() => setIsGenerateModalOpen(true)}
          className="w-full sm:w-auto px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Generate Invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              placeholder="Search invoices by ID, number or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 lg:flex-none flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-transparent">
              <Calendar size={16} className="text-slate-400" />
              <select className="bg-transparent border-none text-sm font-bold text-slate-600 outline-none w-full lg:w-32">
                <option>All Dates</option>
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all border border-transparent font-bold text-sm">
              <Filter size={18} />
              <span className="lg:hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto lg:block">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice ID</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issue Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                      <p className="text-sm font-bold uppercase tracking-widest">Loading Invoices...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-rose-500 font-bold">
                    Failed to load invoices. Please try again.
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <EmptyState 
                      icon={FileText}
                      title="No Invoices Found"
                      description={searchQuery ? `No records match "${searchQuery}"` : "Start by generating your first invoice."}
                      actionLabel="Generate Invoice"
                      onAction={() => setIsGenerateModalOpen(true)}
                    />
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{inv.invoice_no || `#${inv.id}`}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fee Voucher</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-600">{new Date(inv.issue_date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-600">{new Date(inv.due_date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase w-fit flex items-center gap-1.5",
                        inv.status.toLowerCase() === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", inv.status.toLowerCase() === 'paid' ? "bg-emerald-500" : "bg-amber-500")} />
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 transition-all">
                        <button 
                          onClick={() => handleShowDetails(inv)}
                          className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {inv.status.toLowerCase() !== 'paid' && (
                          <button 
                            onClick={() => handleMakePayment(inv)}
                            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Make Payment"
                          >
                            <Wallet size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteClick(inv.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <GenerateInvoiceModal 
        isOpen={isGenerateModalOpen} 
        onClose={() => setIsGenerateModalOpen(false)} 
      />

      <InvoiceDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        invoiceId={selectedInvoice?.id || null}
        initialInvoice={selectedInvoice}
        onMakePayment={(inv) => {
          setIsDetailsModalOpen(false);
          handleMakePayment(inv);
        }}
      />

      <InvoicePaymentModal 
        key={selectedInvoice?.id || 'new'}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoiceId={selectedInvoice?.id}
        initialData={selectedInvoice}
      />

      <ConfirmationModal 
        isOpen={!!invoiceToDelete}
        onClose={() => setInvoiceToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={deleteInvoiceMutation.isPending}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
};
