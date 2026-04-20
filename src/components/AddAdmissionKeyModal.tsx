import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, 
  Loader2, 
  X, 
  Phone, 
  User, 
  MapPin, 
  Target, 
  MessageSquare, 
  Plus, 
  Trash2, 
  GraduationCap, 
  ChevronDown, 
  Search,
  Check
} from 'lucide-react';
import { Button } from './ui/Button';
import { AdmissionKeyData, CreateAdmissionKeyPayload, AdmissionKeyStudent } from '../types/api/admission-key';
import { useClasses } from '../hooks/use-class';

interface AddAdmissionKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: CreateAdmissionKeyPayload) => void;
  isLoading?: boolean;
  initialData?: AdmissionKeyData | null;
  mode?: 'create' | 'edit';
  branchId: number;
}

export const AddAdmissionKeyModal: React.FC<AddAdmissionKeyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading: isSubmitLoading,
  initialData,
  mode = 'create',
  branchId
}) => {
  const { data: classes, isLoading: isClassesLoading } = useClasses(branchId);
  
  const [formData, setFormData] = useState({
    key: '',
    visitor_name: '',
    address: '',
    purpose: '',
    remarks: '',
  });
  
  const [students, setStudents] = useState<AdmissionKeyStudent[]>([
    { name: '', class: '' }
  ]);
  
  const [error, setError] = useState('');
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (error) setError('');
  };

  const handleStudentChange = (index: number, field: keyof AdmissionKeyStudent, value: string) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
    if (activeDropdownIndex !== null) setActiveDropdownIndex(null);
  };

  const addStudent = () => {
    setStudents([...students, { name: '', class: '' }]);
  };

  const removeStudent = (index: number) => {
    if (students.length > 1) {
      setStudents(students.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key) {
      setError('Phone number is required');
      return;
    }
    if (formData.key.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    if (!formData.visitor_name) {
      setError('Visitor name is required');
      return;
    }

    const payload: CreateAdmissionKeyPayload = {
      ...formData,
      branch_id: branchId,
      students: students.filter(s => s.name || s.class)
    };

    onConfirm(payload);
  };

  // Reset state when modal state changes
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          key: initialData.key || '',
          visitor_name: initialData.visitor_name || '',
          address: initialData.address || '',
          purpose: initialData.purpose || '',
          remarks: initialData.remarks || '',
        });
        setStudents(initialData.students?.length > 0 ? [...initialData.students] : [{ name: '', class: '' }]);
      } else {
        setFormData({
          key: '',
          visitor_name: '',
          address: '',
          purpose: '',
          remarks: '',
        });
        setStudents([{ name: '', class: '' }]);
      }
      setError('');
    }
  }, [isOpen, initialData]);

  const isLoading = isSubmitLoading || isClassesLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-100 relative max-h-[90vh] flex flex-col"
          >
            <div className="p-8 pb-4 flex justify-between items-start shrink-0">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center shadow-sm">
                  <Key size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                    {mode === 'edit' ? 'Edit Admission Key' : 'Generate New Key'}
                  </h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-0.5">
                    Admission Information
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-8 pt-2 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Visitor Name */}
                  <div className="space-y-2">
                    <label htmlFor="visitor_name" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Visitor Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                      <input
                        id="visitor_name"
                        type="text"
                        placeholder="e.g. Hassan Raza"
                        value={formData.visitor_name}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-sm font-bold outline-none transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label htmlFor="key" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Phone Number (Key)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                      <input
                        id="key"
                        type="tel"
                        placeholder="e.g. 03403877126"
                        value={formData.key}
                        onChange={handleInputChange}
                        className={`w-full bg-slate-50 border-2 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold outline-none transition-all ${
                          error && !formData.key ? 'border-rose-100 focus:border-rose-500 bg-rose-50/30' : 'border-transparent focus:border-brand-500 focus:bg-white'
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="address" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 text-slate-300 w-4 h-4" />
                      <textarea
                        id="address"
                        placeholder="e.g. Lahore, Pakistan"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-sm font-bold outline-none transition-all resize-none"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="space-y-2">
                    <label htmlFor="purpose" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Purpose
                    </label>
                    <div className="relative">
                      <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                      <input
                        id="purpose"
                        type="text"
                        placeholder="e.g. Meeting"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-sm font-bold outline-none transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="space-y-2">
                    <label htmlFor="remarks" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Remarks
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                      <input
                        id="remarks"
                        type="text"
                        placeholder="e.g. First time visit"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-sm font-bold outline-none transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Students Section */}
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={18} className="text-brand-500" />
                      <h4 className="text-sm font-extrabold text-slate-800">Student Details</h4>
                    </div>
                    <button
                      type="button"
                      onClick={addStudent}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors"
                    >
                      <Plus size={14} />
                      ADD STUDENT
                    </button>
                  </div>

                  <div className="space-y-4 pb-20"> {/* pb to avoid overflow issues with dropdown */}
                    {students.map((student, index) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={index} 
                        className="flex gap-3 items-start"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <input
                            placeholder="Student Name"
                            value={student.name}
                            onChange={(e) => handleStudentChange(index, 'name', e.target.value)}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-xl py-3 px-4 text-xs font-bold outline-none transition-all"
                          />
                          
                          {/* Custom Dropdown */}
                          <div className="relative" ref={activeDropdownIndex === index ? dropdownRef : null}>
                            <button
                              type="button"
                              onClick={() => setActiveDropdownIndex(activeDropdownIndex === index ? null : index)}
                              className={`w-full flex items-center justify-between bg-slate-50 border-2 rounded-xl py-3 px-4 text-left transition-all ${
                                activeDropdownIndex === index ? 'border-brand-500 bg-white shadow-sm' : 'border-transparent'
                              }`}
                              disabled={isClassesLoading}
                            >
                              <span className={`text-xs font-bold truncate ${!student.class ? 'text-slate-400' : 'text-slate-800'}`}>
                                {student.class || 'Select Class'}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeDropdownIndex === index ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {activeDropdownIndex === index && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                  className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-2xl ring-1 ring-slate-100 p-2 overflow-hidden border border-slate-50"
                                >
                                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                    {classes && classes.length > 0 ? (
                                      classes.map((cls) => (
                                        <button
                                          key={cls.id}
                                          type="button"
                                          onClick={() => handleStudentChange(index, 'class', cls.name)}
                                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                                            student.class === cls.name 
                                              ? 'bg-brand-50 text-brand-600' 
                                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                          }`}
                                        >
                                          {cls.name}
                                          {student.class === cls.name && <Check className="w-3.5 h-3.5" />}
                                        </button>
                                      ))
                                    ) : (
                                      <div className="py-8 text-center">
                                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                          <Search className="w-5 h-5 text-slate-300" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No classes found</p>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        {students.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStudent(index)}
                            className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-bold text-rose-500 ml-1"
                  >
                    {error}
                  </motion.p>
                )}
                
                <div className="flex gap-4 pt-4 border-t border-slate-50 mt-8 shrink-0">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="flex-1 py-4 rounded-2xl font-bold"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <button 
                    type="submit"
                    disabled={isLoading || !formData.key || !formData.visitor_name}
                    className="flex-1 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-brand-100 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {isSubmitLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Key size={18} />
                        {mode === 'edit' ? 'Save Changes' : 'Generate Key'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
