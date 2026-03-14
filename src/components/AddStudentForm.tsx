import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  GraduationCap, 
  Users, 
  CreditCard, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Plus, 
  CheckCircle2, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  FileText,
  DollarSign,
  X,
  Loader2
} from 'lucide-react';
import { cn, FeeHead } from '../types';
import { AddClassModal } from './AddClassModal';
import { useClasses } from '../hooks/use-class';
import { useParents } from '../hooks/use-parent';
import { useSections } from '../hooks/use-section';
import { useCreateStudent, useUpdateStudent } from '../hooks/use-student';
import { StudentData } from '../types/api/student';

interface AddStudentFormProps {
  onClose: () => void;
  onSave: (student: any) => void;
  editingStudent?: StudentData | null;
}

const STEPS = [
  { id: 1, title: 'Personal', icon: User },
  { id: 2, title: 'Academic', icon: GraduationCap },
  { id: 3, title: 'Family', icon: Users },
  { id: 4, title: 'Fees', icon: CreditCard },
];

export const AddStudentForm: React.FC<AddStudentFormProps> = ({ onClose, onSave, editingStudent }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  
  // API Hooks
  const { data: classesList } = useClasses();
  const { data: parentsList } = useParents(1); // Branch ID 1
  const { data: sectionsList } = useSections();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  
  // Form State
  const [formData, setFormData] = useState({
    name: editingStudent?.name || '',
    dob: editingStudent?.dob ? editingStudent.dob.split('T')[0] : '',
    gender: (editingStudent?.gender?.toLowerCase() === 'male' ? 'MALE' : 'FEMALE') as 'MALE' | 'FEMALE',
    branchId: editingStudent?.branch_id || 1,
    classId: editingStudent?.class_id?.toString() || '',
    sectionId: editingStudent?.section_id?.toString() || '',
    nationality: editingStudent?.nationality || 'Pakistani',
    address: editingStudent?.address || '',
    home_contact: editingStudent?.home_contact || '',
    currently_studying: editingStudent?.currently_studying || '',
    health_details: editingStudent?.health_details || '',
    parentOption: 'EXISTING' as 'EXISTING' | 'NEW',
    selectedParentId: editingStudent?.parent_id?.toString() || '',
    newParent: {
      name: '',
      cnic: '',
      phone: '',
      email: '',
      address: '',
    },
    // Keep fees for UI consistency but API might not use them yet
    feeHeads: [
      { id: 'fh1', name: 'Tuition Fee', amount: 8000, isEnabled: true },
      { id: 'fh2', name: 'Transport', amount: 3000, isEnabled: true },
      { id: 'fh3', name: 'Lab Charges', amount: 1500, isEnabled: true },
      { id: 'fh4', name: 'Library Fee', amount: 500, isEnabled: true },
    ] as FeeHead[],
  });

  const [parentSearch, setParentSearch] = useState('');

  const filteredParents = useMemo(() => {
    if (!parentSearch || !parentsList) return [];
    return parentsList.filter(p => 
      p.father_name.toLowerCase().includes(parentSearch.toLowerCase()) || 
      p.father_cnic?.includes(parentSearch)
    );
  }, [parentSearch, parentsList]);

  const totalMonthlyFee = useMemo(() => {
    return formData.feeHeads
      .filter(fh => fh.isEnabled)
      .reduce((sum, fh) => sum + fh.amount, 0);
  }, [formData.feeHeads]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const toggleFeeHead = (id: string) => {
    setFormData(prev => ({
      ...prev,
      feeHeads: prev.feeHeads.map(fh => 
        fh.id === id ? { ...fh, isEnabled: !fh.isEnabled } : fh
      )
    }));
  };

  const renderStep1 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Ali Khan"
              className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date of Birth</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="date"
              value={formData.dob}
              onChange={e => setFormData({...formData, dob: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender</label>
        <div className="flex gap-4">
          {['MALE', 'FEMALE'].map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setFormData({...formData, gender: g as any})}
              className={cn(
                "flex-1 py-3.5 rounded-2xl border-2 transition-all font-bold text-sm",
                formData.gender === g ? "border-brand-500 bg-brand-50 text-brand-600" : "border-slate-100 text-slate-500 hover:border-slate-200"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nationality</label>
          <input 
            value={formData.nationality}
            onChange={e => setFormData({...formData, nationality: e.target.value})}
            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Home Contact</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              value={formData.home_contact}
              onChange={e => setFormData({...formData, home_contact: e.target.value})}
              placeholder="e.g. 03001234567"
              className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Branch</label>
        <select 
          value={formData.branchId}
          onChange={e => setFormData({...formData, branchId: parseInt(e.target.value)})}
          className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
        >
          <option value={1}>Main Branch</option>
        </select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Class</label>
          <button 
            type="button"
            onClick={() => setIsClassModalOpen(true)}
            className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
          >
            <Plus size={14} /> Add New Class
          </button>
        </div>
        <select 
          value={formData.classId}
          onChange={e => setFormData({...formData, classId: e.target.value})}
          className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
        >
          <option value="">Select a class...</option>
          {classesList?.filter(c => c.branch_id === formData.branchId).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Section</label>
        <select 
          value={formData.sectionId}
          onChange={e => setFormData({...formData, sectionId: e.target.value})}
          className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
        >
          <option value="">Select a section...</option>
          {sectionsList?.filter(s => s.school_class_id === parseInt(formData.classId)).map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => setFormData({...formData, parentOption: 'EXISTING'})}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
            formData.parentOption === 'EXISTING' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
          )}
        >
          Select Existing Parent
        </button>
        <button
          type="button"
          onClick={() => setFormData({...formData, parentOption: 'NEW'})}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
            formData.parentOption === 'NEW' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
          )}
        >
          Create New Family
        </button>
      </div>

      <AnimatePresence mode="wait">
        {formData.parentOption === 'EXISTING' ? (
          <motion.div 
            key="existing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                value={parentSearch}
                onChange={e => setParentSearch(e.target.value)}
                placeholder="Search by Parent Name or CNIC..."
                className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {filteredParents.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setFormData({...formData, selectedParentId: p.id})}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between",
                    formData.selectedParentId === p.id ? "border-brand-500 bg-brand-50" : "border-slate-50 hover:border-slate-100"
                  )}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.cnic}</p>
                  </div>
                  {formData.selectedParentId === p.id && <CheckCircle2 className="text-brand-500" size={20} />}
                </button>
              ))}
              {parentSearch && filteredParents.length === 0 && (
                <p className="text-center py-4 text-xs text-slate-400 italic">No parents found matching your search.</p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="new"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Father/Guardian Name</label>
                <input 
                  value={formData.newParent.name}
                  onChange={e => setFormData({...formData, newParent: {...formData.newParent, name: e.target.value}})}
                  className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">CNIC Number</label>
                <input 
                  value={formData.newParent.cnic}
                  onChange={e => setFormData({...formData, newParent: {...formData.newParent, cnic: e.target.value}})}
                  placeholder="00000-0000000-0"
                  className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                <input 
                  value={formData.newParent.phone}
                  onChange={e => setFormData({...formData, newParent: {...formData.newParent, phone: e.target.value}})}
                  className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                <input 
                  value={formData.newParent.email}
                  onChange={e => setFormData({...formData, newParent: {...formData.newParent, email: e.target.value}})}
                  className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Residential Address</label>
              <textarea 
                rows={2}
                value={formData.newParent.address}
                onChange={e => setFormData({...formData, newParent: {...formData.newParent, address: e.target.value}})}
                className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none resize-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fee Heads Customization</label>
          <div className="space-y-3">
            {formData.feeHeads.map(fh => (
              <div 
                key={fh.id}
                onClick={() => toggleFeeHead(fh.id)}
                className={cn(
                  "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between",
                  fh.isEnabled ? "border-brand-100 bg-brand-50/30" : "border-slate-50 bg-slate-50/50 opacity-60"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    fh.isEnabled ? "bg-brand-100 text-brand-600" : "bg-slate-200 text-slate-400"
                  )}>
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{fh.name}</p>
                    <p className="text-xs text-slate-500">PKR {fh.amount.toLocaleString()}</p>
                  </div>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  fh.isEnabled ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300"
                )}>
                  {fh.isEnabled && <CheckCircle2 size={14} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Fee Summary</h4>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Monthly Total</span>
                <span className="font-bold">PKR {totalMonthlyFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Annual Total</span>
                <span className="font-bold text-brand-400">PKR {(totalMonthlyFee * 12).toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-800" />
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Total Yearly Payable</span>
                <span className="text-xl font-extrabold text-brand-400">PKR {(totalMonthlyFee * 12).toLocaleString()}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              * Annual total is calculated as (Monthly Total × 12 months), including all enabled fee heads.
            </p>
          </div>

          <div className="p-6 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <FileText size={24} />
            </div>
            <p className="text-xs font-bold text-slate-800">Fee Voucher Preview</p>
            <p className="text-[10px] text-slate-400">Voucher will be generated automatically after saving.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const handleSave = async (data: any) => {
    const payload = {
      name: data.name,
      dob: data.dob,
      gender: data.gender.toLowerCase(),
      branch_id: data.branchId,
      class_id: parseInt(data.classId),
      section_id: parseInt(data.sectionId),
      nationality: data.nationality,
      address: data.address || 'N/A',
      home_contact: data.home_contact,
      currently_studying: data.currently_studying,
      health_details: data.health_details,
      parent_id: parseInt(data.selectedParentId),
      source: 'Direct',
      photo: '',
      previous_schools: [],
      health_issues: [],
      attachments: []
    };

    if (editingStudent) {
      await updateStudent.mutateAsync({ id: editingStudent.id, data: payload });
    } else {
      await createStudent.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-lg shadow-brand-100">
              <Plus size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Admission Form</h3>
              <p className="text-sm text-slate-500">Academic Session 2024-25</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-colors text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-12 py-6 bg-white border-b border-slate-50">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 z-0" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-500 z-0 transition-all duration-500" 
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
            {STEPS.map(step => (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                  currentStep >= step.id ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "bg-white border-2 border-slate-100 text-slate-300"
                )}>
                  <step.icon size={18} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  currentStep >= step.id ? "text-brand-600" : "text-slate-300"
                )}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-12">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-0"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-8 py-4 rounded-2xl text-slate-400 text-sm font-bold hover:text-slate-600 transition-all"
            >
              Cancel
            </button>
            {currentStep < 4 ? (
              <div className="flex gap-4">
                {editingStudent && (
                  <button
                    onClick={() => handleSave(formData)}
                    disabled={updateStudent.isPending}
                    className="px-8 py-4 rounded-2xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 flex items-center gap-2 disabled:opacity-50"
                  >
                    {updateStudent.isPending ? <Loader2 className="animate-spin" /> : 'Update Now'}
                    <CheckCircle2 size={20} />
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-10 py-4 rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 flex items-center gap-2"
                >
                  Next Step
                  <ChevronRight size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleSave(formData)}
                disabled={createStudent.isPending || updateStudent.isPending}
                className="px-10 py-4 rounded-2xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 disabled:opacity-50"
              >
                {createStudent.isPending || updateStudent.isPending ? <Loader2 className="animate-spin" /> : editingStudent ? 'Update Admission' : 'Complete Admission'}
                <CheckCircle2 size={20} />
              </button>
            )}
          </div>
        </div>

        <AddClassModal 
          isOpen={isClassModalOpen}
          onClose={() => setIsClassModalOpen(false)}
          branchId={formData.branchId}
          onSave={(newClass) => {
            setFormData({...formData, classId: newClass.id.toString()});
          }}
        />
      </motion.div>
    </div>
  );
};
