import React from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Phone, 
  Loader2,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Eye
} from 'lucide-react';
import { useBranches, useDeleteBranch } from '../../hooks/use-branch';
import { EmptyState } from '../ui/EmptyState';
import { motion } from 'motion/react';
import { BranchFormModal } from './BranchFormModal';
import { BranchDetailsModal } from './BranchDetailsModal';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';
import { Branch } from '../../types/models/branch';

export const BranchManagement: React.FC = () => {
  const { data: branches, isLoading, error } = useBranches();
  const deleteMutation = useDeleteBranch();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedBranch, setSelectedBranch] = React.useState<Branch | null>(null);

  const filteredBranches = branches?.filter(branch => 
    branch.branch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.branch_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.branch_address.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAdd = () => {
    setSelectedBranch(null);
    setIsFormOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsFormOpen(true);
  };

  const handleViewDetail = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsDetailsOpen(true);
  };

  const handleDeleteClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedBranch) {
      try {
        await deleteMutation.mutateAsync(selectedBranch.id);
        setIsDeleteOpen(false);
        setSelectedBranch(null);
      } catch (error) {
        console.error('Failed to delete branch:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Loading Branches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-50 rounded-3xl border border-rose-100">
        <p className="text-rose-600 font-bold">Failed to load branches. Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Branch Directory</h3>
          <p className="text-slate-500 font-medium">Manage and monitor all school branches across different cities</p>
        </div>
        <button 
          onClick={handleAdd}
          className="px-6 py-4 rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Branch
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              placeholder="Search branches by name, city or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm outline-none font-medium focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredBranches.length === 0 ? (
            <div className="py-20">
              <EmptyState 
                icon={Building2}
                title="No Branches Found"
                description={searchQuery ? `No branches match your search "${searchQuery}"` : "Register your first branch to get started."}
                actionLabel={searchQuery ? "Clear Search" : "Add New Branch"}
                onAction={searchQuery ? () => setSearchQuery('') : handleAdd}
              />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Branch Information</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBranches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg shadow-sm border border-brand-100">
                          {branch.branch_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{branch.branch_name}</p>
                          <p className="text-xs text-slate-400 font-medium">ID: BR-{branch.id?.toString().padStart(3, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin size={14} className="text-brand-500" />
                        <div className="text-sm font-medium">
                          <p className="text-slate-800">{branch.branch_city}</p>
                          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{branch.branch_address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={14} className="text-emerald-500" />
                        <span className="text-sm font-bold tabular-nums">{branch.branch_phone}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-slate-500">{new Date(branch.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewDetail(branch)}
                          className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(branch)}
                          className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                          title="Edit Branch"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(branch)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          title="Delete Branch"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <BranchFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        branch={selectedBranch}
      />

      <BranchDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        branchId={selectedBranch?.id || null}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Branch"
        message={`Are you sure you want to delete ${selectedBranch?.branch_name}? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </motion.div>
  );
};
