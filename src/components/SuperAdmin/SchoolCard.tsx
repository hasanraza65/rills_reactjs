import React, { useState } from 'react';
import { motion } from 'motion/react';
import { School as SchoolType, cn } from '../../types';
import { 
  Plus, 
  MapPin, 
  Mail, 
  User, 
  ChevronRight, 
  MoreVertical,
  ShieldCheck,
  CreditCard,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { BranchModal } from './BranchModal';

interface SchoolCardProps {
  school: SchoolType;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({ school }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
    >
      <div className="p-8 border-b border-slate-50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-lg shadow-brand-100">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">{school.name}</h3>
              <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <User size={14} />
                  {school.adminName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={14} />
                  {school.adminEmail}
                </span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
            <MoreVertical size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-2">
            <ShieldCheck size={14} className="text-brand-500" />
            {school.branches.length} Branches
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-50 text-brand-600 text-xs font-bold flex items-center gap-2 hover:bg-brand-100 transition-all"
          >
            <Plus size={14} />
            Add Branch
          </button>
        </div>
      </div>

      <div className="p-6 bg-slate-50/50">
        <div className="space-y-3">
          {school.branches.length > 0 ? (
            school.branches.map((branch) => (
              <div 
                key={branch.id}
                className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group/branch hover:border-brand-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    branch.plan === 'PAID' ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {branch.plan === 'PAID' ? <CreditCard size={18} /> : <ShieldCheck size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{branch.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <MapPin size={10} />
                      {branch.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    branch.plan === 'PAID' ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {branch.plan}
                  </div>
                  <button className={cn(
                    "transition-colors",
                    branch.isActive ? "text-emerald-500" : "text-slate-300"
                  )}>
                    {branch.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                  <ChevronRight size={16} className="text-slate-300 group-hover/branch:text-brand-500 transition-all" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400 font-medium italic">No branches added yet.</p>
            </div>
          )}
        </div>
      </div>

      <BranchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        schoolName={school.name}
        onSave={(data) => console.log('New Branch:', data)}
      />
    </motion.div>
  );
};
