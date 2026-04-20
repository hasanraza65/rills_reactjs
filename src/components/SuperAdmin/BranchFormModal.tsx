import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, MapPin, Phone, Loader2, Home, Hash, Calendar, Mail } from 'lucide-react';
import { Branch, CreateBranchInput } from '../../types/models/branch';
import { useCreateBranch, useUpdateBranch } from '../../hooks/use-branch';

interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch?: Branch | null;
}

export const BranchFormModal: React.FC<BranchFormModalProps> = ({ isOpen, onClose, branch }) => {
  const [formData, setFormData] = useState<CreateBranchInput>({
    branch_name: '',
    branch_city: '',
    branch_address: '',
    branch_phone: '',
    branch_code: '',
    campus_start_date: '',
    campus_email: '',
  });

  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (branch) {
      setFormData({
        branch_name: branch.branch_name,
        branch_city: branch.branch_city,
        branch_address: branch.branch_address,
        branch_phone: branch.branch_phone,
        branch_code: branch.branch_code || '',
        campus_start_date: branch.campus_start_date || '',
        campus_email: branch.campus_email || '',
      });
    } else {
      setFormData({
        branch_name: '',
        branch_city: '',
        branch_address: '',
        branch_phone: '',
        branch_code: '',
        campus_start_date: '',
        campus_email: '',
      });
    }
  }, [branch, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (branch) {
        await updateMutation.mutateAsync({ id: branch.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save branch:', error);
    }
  };

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
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{branch ? 'Edit Branch' : 'Add New Branch'}</h3>
                <p className="text-sm text-slate-500">{branch ? 'Update branch details' : 'Create a new campus location'}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="space-y-5">
                {/* Branch Name & Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Branch Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        required
                        value={formData.branch_name}
                        onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                        placeholder="e.g. Main Campus"
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Branch Code</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        required
                        value={formData.branch_code}
                        onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })}
                        placeholder="TST"
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* City & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        required
                        value={formData.branch_city}
                        onChange={(e) => setFormData({ ...formData, branch_city: e.target.value })}
                        placeholder="e.g. Lahore"
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        required
                        type="tel"
                        value={formData.branch_phone}
                        onChange={(e) => setFormData({ ...formData, branch_phone: e.target.value })}
                        placeholder="03001234567"
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Email & Start Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Campus Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        required
                        type="email"
                        value={formData.campus_email}
                        onChange={(e) => setFormData({ ...formData, campus_email: e.target.value })}
                        placeholder="campus@school.com"
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Establishment Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        required
                        type="date"
                        value={formData.campus_start_date}
                        onChange={(e) => setFormData({ ...formData, campus_start_date: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Full Address</label>
                  <div className="relative">
                    <Home className="absolute left-4 top-4 text-slate-300" size={18} />
                    <textarea
                      required
                      value={formData.branch_address}
                      onChange={(e) => setFormData({ ...formData, branch_address: e.target.value })}
                      placeholder="e.g. 123 Model Town, Block A"
                      rows={2}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none font-medium resize-none shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-600 text-sm font-bold hover:bg-slate-100 transition-all border border-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-4 rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Building2 size={18} />}
                  {branch ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
