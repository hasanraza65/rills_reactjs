import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, MapPin, Phone, Loader2, Calendar, User, Hash } from 'lucide-react';
import { useBranch } from '../../hooks/use-branch';

interface BranchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: number | null;
}

export const BranchDetailsModal: React.FC<BranchDetailsModalProps> = ({ isOpen, onClose, branchId }) => {
  const { data: branch, isLoading, error } = useBranch(branchId);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
            className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-100">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Branch Details</h3>
                  <p className="text-sm text-slate-500">Full information for {branch?.branch_name || 'Loading...'}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">Fetching Branch Data...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center bg-rose-50 rounded-3xl border border-rose-100">
                  <p className="text-rose-600 font-bold">Failed to load branch details. Please try again.</p>
                </div>
              ) : branch ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Hash size={12} className="text-brand-500" />
                        Branch ID
                      </p>
                      <p className="text-sm font-bold text-slate-800">BR-{branch.id?.toString().padStart(3, '0')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <User size={12} className="text-brand-500" />
                        Added By
                      </p>
                      <p className="text-sm font-bold text-slate-800">Admin User (ID: {branch.added_by})</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Building2 size={12} className="text-brand-500" />
                      Branch Name
                    </p>
                    <p className="text-lg font-extrabold text-slate-800">{branch.branch_name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={12} className="text-brand-500" />
                        City
                      </p>
                      <p className="text-sm font-bold text-slate-800">{branch.branch_city}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Phone size={12} className="text-brand-500" />
                        Phone Number
                      </p>
                      <p className="text-sm font-bold text-slate-800">{branch.branch_phone}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={12} className="text-brand-500" />
                      Full Address
                    </p>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-slate-600 text-sm font-medium">
                      {branch.branch_address}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} className="text-slate-400" />
                        Created At
                      </p>
                      <p className="text-xs font-bold text-slate-500">{new Date(branch.created_at).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-end">
                        <Calendar size={12} className="text-slate-400" />
                        Last Updated
                      </p>
                      <p className="text-xs font-bold text-slate-500">{new Date(branch.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-8">
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-900 transition-all shadow-lg shadow-brand-100"
                >
                  Close Details
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
