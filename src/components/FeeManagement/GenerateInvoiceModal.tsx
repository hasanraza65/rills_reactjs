import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, User, Check, Calendar, Save, Search, ChevronDown } from 'lucide-react';
import { cn } from '../../types';
import { useParents } from '../../hooks/use-parent';
import { useStudentsByParent } from '../../hooks/use-student';
import { useGenerateInvoice } from '../../hooks/use-invoice';
import { useBranchStore } from '../../store/use-branch-store';
import { Button } from '../ui/Button';

interface GenerateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GenerateInvoiceModal: React.FC<GenerateInvoiceModalProps> = ({ isOpen, onClose }) => {
  const { selectedBranchId } = useBranchStore();
  const { data: parents } = useParents(selectedBranchId || 1);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const { data: students, isLoading: isLoadingStudents } = useStudentsByParent(selectedParentId, selectedBranchId || 1);
  const generateInvoiceMutation = useGenerateInvoice();

  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const [parentSearchQuery, setParentSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedParent = parents?.find(p => p.id === selectedParentId);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsParentDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredParents = parents?.filter(p => {
    const name = (p.father_name || p.mother_name || '').toLowerCase();
    const contact = (p.father_contact_no || p.mother_contact_no || '').toLowerCase();
    const query = parentSearchQuery.toLowerCase();
    return name.includes(query) || contact.includes(query);
  });

  const studentsList = useMemo(() => {
    if (!students) return [];
    
    // Extract from possible wrappers (handle { data: [...] }, { students: [...] }, etc.)
    let list: any[] = [];
    if (Array.isArray(students)) {
      list = students;
    } else if (students && typeof students === 'object') {
      const s = students as any;
      list = s.data || s.students || s.items || [];
    }
    
    return Array.isArray(list) ? list : [];
  }, [students]);
  
  const filteredStudents = useMemo(() => {
    return studentsList;
  }, [studentsList]);

  // Set default due date to 10 days after issue date
  useEffect(() => {
    if (issueDate) {
      const date = new Date(issueDate);
      date.setDate(date.getDate() + 10);
      setDueDate(date.toISOString().split('T')[0]);
    }
  }, [issueDate]);

  // Check all students by default when parent changes
  useEffect(() => {
    if (studentsList.length > 0) {
      setSelectedStudentIds(studentsList.map(s => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  }, [studentsList]);

  const toggleStudent = (id: number) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId || selectedStudentIds.length === 0) return;

    try {
      await generateInvoiceMutation.mutateAsync({
        branch_id: selectedBranchId || 1,
        issue_date: issueDate,
        due_date: dueDate,
        student_ids: selectedStudentIds
      });
      onClose();
    } catch (err) {
      console.error('Failed to generate invoice:', err);
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
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Generate Invoice</h3>
                <p className="text-sm text-slate-500">Create new fee vouchers for students</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Select Parent</label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsParentDropdownOpen(!isParentDropdownOpen)}
                      className={cn(
                        "w-full bg-slate-50 border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-sm flex items-center justify-between transition-all font-medium",
                        isParentDropdownOpen ? "border-brand-500/20 bg-white shadow-sm ring-2 ring-brand-500/10" : "hover:bg-slate-100/50"
                      )}
                    >
                      <User className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", isParentDropdownOpen ? "text-brand-500" : "text-slate-300")} size={18} />
                      <span className={cn(selectedParent ? "text-slate-800" : "text-slate-400")}>
                        {selectedParent ? `${selectedParent.father_name || selectedParent.mother_name} (${selectedParent.father_contact_no || selectedParent.mother_contact_no})` : "Select a parent..."}
                      </span>
                      <ChevronDown size={18} className={cn("text-slate-400 transition-transform", isParentDropdownOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {isParentDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden"
                        >
                          <div className="p-4 border-b border-slate-50">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                              <input
                                autoFocus
                                placeholder="Search by name or contact..."
                                value={parentSearchQuery}
                                onChange={(e) => setParentSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-500/10 outline-none"
                              />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {filteredParents?.length === 0 ? (
                              <div className="py-8 text-center">
                                <p className="text-sm text-slate-400">No parents found</p>
                              </div>
                            ) : (
                              filteredParents?.map(p => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedParentId(p.id);
                                    setIsParentDropdownOpen(false);
                                    setParentSearchQuery('');
                                  }}
                                  className={cn(
                                    "w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group",
                                    selectedParentId === p.id ? "bg-brand-50 text-brand-700" : "hover:bg-slate-50 text-slate-600"
                                  )}
                                >
                                  <div>
                                    <p className="text-sm font-bold">{p.father_name || p.mother_name}</p>
                                    <p className="text-[10px] opacity-70 font-bold uppercase tracking-wider">{p.father_contact_no || p.mother_contact_no}</p>
                                  </div>
                                  {selectedParentId === p.id && <Check size={16} className="text-brand-500" />}
                                </button>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Scrollable Content Area */}
                {selectedParentId && (
                  <div className="md:col-span-2 max-h-[18rem] overflow-y-auto pr-2 custom-scrollbar space-y-8">
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Select Students</label>
                      {isLoadingStudents ? (
                        <div className="py-8 text-center flex flex-col items-center gap-2 bg-slate-50 rounded-3xl">
                          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-xs text-slate-500 font-medium">Fetching students...</p>
                        </div>
                      ) : studentsList.length === 0 ? (
                        <div className="py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                          <p className="text-sm text-slate-400 font-medium">No students found for this parent.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {studentsList.map((student: any) => (
                            <div 
                              key={student.id}
                              onClick={() => toggleStudent(student.id)}
                              className={cn(
                                "flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border-2",
                                selectedStudentIds.includes(student.id)
                                  ? "bg-brand-50/50 border-brand-200"
                                  : "bg-slate-50 border-transparent hover:bg-slate-100"
                              )}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center font-bold text-brand-600 shadow-sm border border-brand-100/50">
                                  {student.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800 line-clamp-1">{student.name || 'Unnamed Student'}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    {student.class?.name || 'No Class'} - {student.section?.name || 'No Section'}
                                  </p>
                                </div>
                              </div>
                              <div className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center transition-all border-2",
                                selectedStudentIds.includes(student.id)
                                  ? "bg-brand-500 border-brand-500 text-white"
                                  : "bg-white border-slate-200"
                              )}>
                                {selectedStudentIds.includes(student.id) && <Check size={14} />}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-8 pb-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Issue Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input
                            type="date"
                            required
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Due Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input
                            type="date"
                            required
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer is below */}

              <div className="flex gap-4 pt-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl h-auto font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={generateInvoiceMutation.isPending}
                  disabled={!selectedParentId || selectedStudentIds.length === 0}
                  className="flex-1 py-4 rounded-2xl h-auto font-bold shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Generate Invoices
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
