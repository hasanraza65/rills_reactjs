import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Mail, Lock, MapPin, CheckCircle2 } from 'lucide-react';
import { cn, PlanType } from '../../types';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName: string;
  onSave: (data: any) => void;
}

export const BranchModal: React.FC<BranchModalProps> = ({ isOpen, onClose, schoolName, onSave }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [plan, setPlan] = useState<PlanType>('FREE');
  const [generatedCreds, setGeneratedCreds] = useState<{ email: string; pass: string } | null>(null);

  const handleGenerate = () => {
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}.${schoolName.toLowerCase().split(' ')[0]}@eduflow.pk`;
    const pass = Math.random().toString(36).slice(-8).toUpperCase();
    setGeneratedCreds({ email, pass });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, location, plan, ...generatedCreds });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Add New Branch</h3>
                <p className="text-sm text-slate-500">Creating branch for {schoolName}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Branch Name</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Model Town Campus"
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Lahore, Pakistan"
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Branch Plan</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPlan('FREE')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-left",
                        plan === 'FREE' ? "border-brand-500 bg-brand-50/50" : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <p className={cn("text-sm font-bold mb-1", plan === 'FREE' ? "text-brand-600" : "text-slate-700")}>Free Plan</p>
                      <p className="text-[10px] text-slate-500">Limited features, 0 cost</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlan('PAID')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-left",
                        plan === 'PAID' ? "border-indigo-500 bg-indigo-50/50" : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <p className={cn("text-sm font-bold mb-1", plan === 'PAID' ? "text-indigo-600" : "text-slate-700")}>Paid Plan</p>
                      <p className="text-[10px] text-slate-500">Full features, monthly billing</p>
                    </button>
                  </div>
                </div>
              </div>

              {!generatedCreds ? (
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="w-full py-3 rounded-2xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-900 transition-all"
                >
                  Generate Admin Credentials
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-3"
                >
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Credentials Generated</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase">Email</p>
                      <p className="text-sm font-mono text-slate-700 truncate">{generatedCreds.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase">Password</p>
                      <p className="text-sm font-mono text-slate-700">{generatedCreds.pass}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-600 text-sm font-bold hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!generatedCreds}
                  className="flex-1 py-4 rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 disabled:opacity-50 disabled:shadow-none"
                >
                  Create Branch
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
