import React, { useState } from 'react';
import { 
  Book, 
  Plus, 
  FileText, 
  Share2, 
  Download, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle2,
  Building2,
  School as SchoolIcon,
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, CLASSES, SYLLABUS_DATA, BRANCHES, SCHOOLS, UserRole, Syllabus } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';

interface SyllabusManagerProps {
  role: UserRole;
}

export const SyllabusManager: React.FC<SyllabusManagerProps> = ({ role }) => {
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>(SYLLABUS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeSyllabus, setActiveSyllabus] = useState<Syllabus | null>(null);

  const filteredSyllabus = syllabuses.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || s.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleAssign = (syllabus: Syllabus) => {
    setActiveSyllabus(syllabus);
    setIsAssignModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Syllabus Management</h3>
          <p className="text-slate-500 font-bold mt-1 text-sm sm:text-base">Create and distribute academic syllabus across branches</p>
        </div>
        {(role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN') && (
          <Button icon={Plus} size="lg" className="w-full sm:w-auto shadow-xl shadow-brand-100 justify-center">
            Create New Syllabus
          </Button>
        )}
      </div>

      <Card className="p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or subject..."
              className="w-full bg-slate-50 border-none rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="flex-1 lg:flex-none bg-slate-50 border-none rounded-xl px-4 py-3.5 text-xs sm:text-sm font-black text-slate-600 outline-none shadow-sm cursor-pointer min-w-[120px]"
            >
              <option value="ALL">All Classes</option>
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Button variant="outline" className="p-3.5 bg-slate-50 border-transparent shrink-0">
              <Filter size={20} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredSyllabus.map((syl, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                key={syl.id}
                className="group p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-slate-50 border-2 border-transparent hover:border-brand-100 hover:bg-white hover:shadow-premium transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-brand-500 shadow-sm group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                    <Book size={28} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 text-slate-400 hover:text-brand-500 transition-colors bg-white rounded-xl shadow-sm">
                      <Download size={18} />
                    </button>
                    {(role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN') && (
                      <button className="p-2.5 text-slate-400 hover:text-rose-500 transition-colors bg-white rounded-xl shadow-sm">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest">
                      {CLASSES.find(c => c.id === syl.classId)?.name}
                    </span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">•</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{syl.subject}</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors tracking-tight">{syl.title}</h4>
                  <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">{syl.description}</p>
                </div>

                <div className="pt-6 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {syl.assignedBranches.slice(0, 3).map((bId, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm" title={BRANCHES.find(b => b.id === bId)?.name}>
                        {BRANCHES.find(b => b.id === bId)?.name.charAt(0)}
                      </div>
                    ))}
                    {syl.assignedBranches.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-50 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                        +{syl.assignedBranches.length - 3}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleAssign(syl)}
                    className="flex items-center gap-1.5 text-xs font-black text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-widest"
                  >
                    <Share2 size={14} />
                    Assign
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredSyllabus.length === 0 && (
          <EmptyState 
            icon={Book}
            title="No syllabus found"
            description="Try searching with a different title or subject."
          />
        )}
      </Card>

      {/* Assign Modal */}
      <AnimatePresence>
        {isAssignModalOpen && activeSyllabus && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsAssignModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl sm:rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 sm:p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3 sm:gap-5">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-xl shadow-brand-100">
                    <Share2 size={20} sm:size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Assign Syllabus</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-bold mt-0.5 sm:mt-1">{activeSyllabus.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAssignModalOpen(false)}
                  className="p-2 sm:p-3 hover:bg-white rounded-xl sm:rounded-2xl transition-all text-slate-400 hover:text-slate-600 shadow-sm"
                >
                  <X size={20} sm:size={24} />
                </button>
              </div>

              <div className="p-6 sm:p-10 space-y-8 sm:space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {role === 'SUPER_ADMIN' && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <SchoolIcon size={14} />
                      Assign to Schools
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {SCHOOLS.map(school => (
                        <button
                          key={school.id}
                          className={cn(
                            "flex items-center justify-between p-5 rounded-2xl border-2 transition-all shadow-sm",
                            activeSyllabus.assignedSchools.includes(school.id)
                              ? "border-brand-500 bg-brand-50 text-brand-700"
                              : "border-slate-50 hover:border-slate-100 text-slate-600 bg-white"
                          )}
                        >
                          <span className="text-sm font-black">{school.name}</span>
                          {activeSyllabus.assignedSchools.includes(school.id) && <CheckCircle2 size={20} className="text-brand-500" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Building2 size={14} />
                    Assign to Branches
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {BRANCHES.map(branch => (
                      <button
                        key={branch.id}
                        className={cn(
                          "flex items-center justify-between p-5 rounded-2xl border-2 transition-all shadow-sm",
                          activeSyllabus.assignedBranches.includes(branch.id)
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-50 hover:border-slate-100 text-slate-600 bg-white"
                        )}
                      >
                        <span className="text-sm font-black">{branch.name}</span>
                        {activeSyllabus.assignedBranches.includes(branch.id) && <CheckCircle2 size={20} className="text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-10 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <Button variant="outline" onClick={() => setIsAssignModalOpen(false)} className="bg-white w-full sm:w-auto">
                  Cancel
                </Button>
                <Button className="w-full sm:px-10 shadow-xl shadow-brand-100">
                  Save Assignments
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
