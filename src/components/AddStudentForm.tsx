import React, { useState, useMemo, useRef } from 'react';
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
  Loader2,
  Layers,
  Image,
  Upload
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
  /** If true, the form will be rendered as a standalone page instead of a modal overlay */
  isPage?: boolean;
}

const STEPS = [
  { id: 1, title: 'Personal', icon: User },
  { id: 2, title: 'Academic', icon: GraduationCap },
  { id: 3, title: 'Family', icon: Users },
  { id: 4, title: 'Documents', icon: FileText },
  { id: 5, title: 'Fees', icon: CreditCard },
];

export const AddStudentForm: React.FC<AddStudentFormProps> = ({ onClose, onSave, editingStudent, isPage }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [activeDocKey, setActiveDocKey] = useState<string | null>(null);
  
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
    previous_schools: editingStudent?.previous_schools || [],
    health_issues: editingStudent?.health_issues || [],
    source: editingStudent?.source || '',
    photo: (editingStudent?.photo || '') as string | File,
    attachments: (editingStudent?.attachments || []) as (string | File)[],
    parentOption: 'EXISTING' as 'EXISTING' | 'NEW',
    selectedParentId: editingStudent?.parent_id?.toString() || '',
    newParent: {
      name: '',
      cnic: '',
      phone: '',
      email: '',
      address: '',
    },
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

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const toggleFeeHead = (id: string) => {
    setFormData(prev => ({
      ...prev,
      feeHeads: prev.feeHeads.map(fh => 
        fh.id === id ? { ...fh, isEnabled: !fh.isEnabled } : fh
      )
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeDocKey) {
      const current = formData.attachments;
      // Filter out existing ones with same name if any, or just add
      // Usually we want to associate the file with the specific doc key (birth_cert, etc.)
      // but the user's payload has an "attachments" array.
      // I'll keep the current logic but store the File object.
      setFormData({ ...formData, attachments: [...current, file] });
      setActiveDocKey(null);
    }
  };

  const renderStep1 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Photograph</label>
          <input 
            type="file"
            ref={photoInputRef}
            onChange={handlePhotoChange}
            accept="image/*"
            className="hidden"
          />
          <div 
            className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-2 text-center group hover:border-brand-500 transition-all cursor-pointer overflow-hidden relative"
            onClick={() => photoInputRef.current?.click()}
          >
            {formData.photo ? (
              <>
                <div className="w-full h-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xs uppercase text-center p-2">
                  {formData.photo instanceof File ? formData.photo.name : formData.photo}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData({...formData, photo: ''});
                  }}
                  className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <Image className="text-slate-300 group-hover:text-brand-500 transition-colors" size={24} />
                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Upload Photo</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Ahmed Khan"
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
                    "flex-1 py-3 rounded-2xl border-2 transition-all font-bold text-xs uppercase tracking-wider",
                    formData.gender === g ? "border-brand-500 bg-brand-50 text-brand-600" : "border-slate-100 text-slate-500 hover:border-slate-200"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Residential Address</label>
        <div className="relative">
          <MapPin className="absolute left-4 top-4 text-slate-300" size={18} />
          <textarea 
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
            placeholder="Complete residential address..."
            rows={2}
            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none resize-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Health Information</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {['Eyesight', 'Asthma', 'Allergies', 'Physical', 'Other'].map(issue => (
            <button
              key={issue}
              type="button"
              onClick={() => {
                const current = formData.health_issues;
                const next = current.includes(issue) 
                  ? current.filter(i => i !== issue)
                  : [...current, issue];
                setFormData({...formData, health_issues: next});
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium",
                formData.health_issues.includes(issue)
                  ? "border-rose-500 bg-rose-50 text-rose-600"
                  : "border-slate-50 bg-slate-50/50 text-slate-500 hover:border-slate-200"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                formData.health_issues.includes(issue) ? "border-rose-500 bg-rose-500" : "border-slate-300"
              )}>
                {formData.health_issues.includes(issue) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              {issue}
            </button>
          ))}
        </div>
        <textarea 
          value={formData.health_details}
          onChange={e => setFormData({...formData, health_details: e.target.value})}
          placeholder="Additional health details (if any)..."
          className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none resize-none"
          rows={2}
        />
      </div>

      <div className="space-y-4">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source of Information</label>
        <div className="flex flex-wrap gap-4">
          {['Facebook', 'Newspaper', 'Referral', 'Flyer', 'Other'].map(src => (
            <label key={src} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="source" 
                value={src}
                checked={formData.source === src}
                onChange={e => setFormData({...formData, source: e.target.value})}
                className="hidden"
              />
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                formData.source === src ? "border-brand-500 bg-brand-500" : "border-slate-300 group-hover:border-slate-400"
              )}>
                {formData.source === src && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className={cn("text-sm font-medium", formData.source === src ? "text-slate-900" : "text-slate-500")}>{src}</span>
            </label>
          ))}
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

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Currently Studying (Level)</label>
        <div className="relative">
          <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            value={formData.currently_studying}
            onChange={e => setFormData({...formData, currently_studying: e.target.value})}
            placeholder="e.g. Grade 1"
            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Previous Schools</label>
          <button 
            type="button"
            onClick={() => setFormData({...formData, previous_schools: [...formData.previous_schools, '']})}
            className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
          >
            <Plus size={14} /> Add School
          </button>
        </div>
        <div className="space-y-3">
          {formData.previous_schools.map((school, index) => (
            <div key={index} className="flex gap-2">
              <input 
                value={school}
                onChange={e => {
                  const next = [...formData.previous_schools];
                  next[index] = e.target.value;
                  setFormData({...formData, previous_schools: next});
                }}
                placeholder="School Name"
                className="flex-1 bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none"
              />
              <button 
                type="button"
                onClick={() => {
                  const next = formData.previous_schools.filter((_, i) => i !== index);
                  setFormData({...formData, previous_schools: next});
                }}
                className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {formData.previous_schools.length === 0 && (
            <p className="text-xs text-slate-400 italic">No previous schools added.</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <input 
        type="file"
        ref={docInputRef}
        onChange={handleDocumentChange}
        className="hidden"
      />
      <div className="bg-brand-50/50 p-6 rounded-[2rem] border border-brand-100/50">
        <h4 className="text-sm font-bold text-brand-800 flex items-center gap-2 mb-2">
          <FileText size={18} /> Required Documentation
        </h4>
        <p className="text-xs text-brand-600 font-medium">Please ensure you have dummy names for the following required documents:</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Birth Certificate', key: 'birth_certificate.pdf' },
          { label: 'Last School Report', key: 'last_report.pdf' },
          { label: 'School Leaving Certificate', key: 'slc.pdf' },
          { label: 'B-Form / ID Copy', key: 'id_copy.pdf' }
        ].map((doc) => (
          <div 
            key={doc.label}
            onClick={() => {
              const isIncluded = formData.attachments.some(a => 
                (a instanceof File && a.name === doc.key) || a === doc.key
              );
              if (isIncluded) {
                setFormData({
                  ...formData,
                  attachments: formData.attachments.filter(a => 
                    !((a instanceof File && a.name === doc.key) || a === doc.key)
                  )
                });
              } else {
                setActiveDocKey(doc.key);
                docInputRef.current?.click();
              }
            }}
            className={cn(
              "p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
              formData.attachments.some(a => (a instanceof File && a.name === doc.key) || a === doc.key)
                ? "border-brand-500 bg-brand-50/50"
                : "border-slate-50 bg-slate-50/50 hover:border-slate-200"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl transition-all",
                formData.attachments.some(a => (a instanceof File && a.name === doc.key) || a === doc.key) ? "bg-brand-500 text-white" : "bg-white text-slate-300 group-hover:text-slate-400"
              )}>
                <Upload size={18} />
              </div>
              <div>
                <p className={cn("text-sm font-bold", formData.attachments.some(a => (a instanceof File && a.name === doc.key) || a === doc.key) ? "text-slate-900" : "text-slate-500")}>
                  {doc.label}
                </p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                  {(() => {
                    const attachment = formData.attachments.find(a => 
                      (a instanceof File && a.name === doc.key) || a === doc.key
                    );
                    if (!attachment) return 'Not Uploaded';
                    return attachment instanceof File ? attachment.name : attachment;
                  })()}
                </p>
              </div>
            </div>
            {formData.attachments.some(a => (a instanceof File && a.name === doc.key) || a === doc.key) && <CheckCircle2 size={20} className="text-brand-500" />}
          </div>
        ))}
      </div>

      <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2rem] text-center space-y-4">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto">
          <Upload size={32} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">Other Attachments</p>
          <p className="text-xs text-slate-400 mt-1">Upload any other supporting documents here.</p>
        </div>
        <button 
          type="button"
          className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          Select Files
        </button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    const formDataObj = new FormData();
    
    // Add simple fields
    formDataObj.append('name', data.name);
    formDataObj.append('dob', data.dob);
    formDataObj.append('gender', data.gender.toLowerCase());
    formDataObj.append('branch_id', data.branchId.toString());
    formDataObj.append('class_id', data.classId.toString());
    formDataObj.append('section_id', data.sectionId.toString());
    formDataObj.append('nationality', data.nationality);
    formDataObj.append('address', data.address || 'N/A');
    formDataObj.append('home_contact', data.home_contact);
    formDataObj.append('currently_studying', data.currently_studying);
    formDataObj.append('health_details', data.health_details);
    formDataObj.append('parent_id', data.selectedParentId.toString());
    formDataObj.append('source', data.source || 'Facebook');

    // Add Photograph
    if (data.photo instanceof File) {
      formDataObj.append('photo', data.photo);
    } else if (typeof data.photo === 'string' && data.photo) {
      formDataObj.append('photo', data.photo);
    }

    // Add Arrays (Previous Schools, Health Issues)
    data.previous_schools.forEach((school: string, index: number) => {
      if (school) formDataObj.append(`previous_schools[${index}]`, school);
    });

    data.health_issues.forEach((issue: string, index: number) => {
      formDataObj.append(`health_issues[${index}]`, issue);
    });

    // Add Attachments
    data.attachments.forEach((attachment: any, index: number) => {
      if (attachment instanceof File) {
        formDataObj.append(`attachments[${index}]`, attachment);
      } else if (typeof attachment === 'string' && attachment) {
        formDataObj.append(`attachments[${index}]`, attachment);
      }
    });

    if (editingStudent) {
      // For updates, some APIs require _method=PUT when using FormData via POST
      // formDataObj.append('_method', 'PUT');
      await updateStudent.mutateAsync({ id: editingStudent.id, data: formDataObj as any });
    } else {
      await createStudent.mutateAsync(formDataObj as any);
    }
    onClose();
  };

  const renderForm = () => (
    <motion.div
      initial={!isPage ? { opacity: 0, scale: 0.95, y: 20 } : { opacity: 0, y: 10 }}
      animate={!isPage ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, y: 0 }}
      className={cn(
        "relative w-full bg-white overflow-hidden flex flex-col",
        !isPage ? "max-w-4xl rounded-2xl sm:rounded-[3rem] shadow-2xl max-h-[95vh] sm:max-h-[90vh]" : "rounded-3xl border border-slate-100 shadow-sm min-h-[70vh]"
      )}
    >

      {/* Header */}
      <div className={cn(
        "p-5 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50",
        isPage && "sm:p-10"
      )}>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg shadow-brand-100 shrink-0">
            <Plus size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">Admission Form</h3>
            <p className="text-[10px] sm:text-sm text-slate-500">Session 2024-25</p>
          </div>
        </div>
        {!isPage && (
          <button onClick={onClose} className="p-2 sm:p-3 hover:bg-white rounded-xl sm:rounded-2xl transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        )}
      </div>


      {/* Progress Bar */}
      <div className="px-6 sm:px-12 py-4 sm:py-6 bg-white border-b border-slate-50 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between relative min-w-[300px]">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 z-0" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-500 z-0 transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />
          {STEPS.map(step => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 text-sm sm:text-base",
                currentStep >= step.id ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "bg-white border-2 border-slate-100 text-slate-300"
              )}>
                <step.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
              </div>
              <span className={cn(
                "text-[8px] sm:text-[10px] font-bold uppercase tracking-wider",
                currentStep >= step.id ? "text-brand-600" : "text-slate-300"
              )}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>


      {/* Form Content */}
      <div className={cn("flex-1 overflow-y-auto p-6 sm:p-12", isPage && "sm:p-16")}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep5()}
        {currentStep === 5 && renderStep4()}
      </div>


      {/* Footer */}
      <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-0"
        >
          <ChevronLeft size={18} />
          Back
        </button>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          {!isPage && (
            <button
              onClick={onClose}
              className="px-8 py-2 text-slate-400 text-xs sm:text-sm font-bold hover:text-slate-600 transition-all sm:order-1"
            >
              Cancel
            </button>
          )}
          <div className="flex gap-2 sm:gap-4 w-full sm:w-auto sm:order-2">
            {editingStudent && (
              <button
                onClick={() => handleSave(formData)}
                disabled={updateStudent.isPending}
                className="flex-1 sm:flex-none px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updateStudent.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <><span className="hidden sm:inline">Update Now</span><span className="sm:hidden">Update</span></>}
                <CheckCircle2 size={18} />
              </button>
            )}
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
              >
                <span className="hidden sm:inline">Next Step</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={() => handleSave(formData)}
                disabled={createStudent.isPending || updateStudent.isPending}
                className="flex-1 sm:flex-none px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {createStudent.isPending || updateStudent.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : !!editingStudent ? 'Update' : 'Complete'}
                <CheckCircle2 size={18} />
              </button>
            )}
          </div>
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
  );

  if (isPage) {
    return <div className="w-full max-w-6xl mx-auto">{renderForm()}</div>;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {renderForm()}
    </div>
  );
};
