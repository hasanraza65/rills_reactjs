import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { cn, FeeHead, FeeFrequency } from '../types';
import { apiClient } from '../lib/api-client';
import { AddClassModal } from './AddClassModal';
import { useClasses } from '../hooks/use-class';
import { useParents, useCreateParent } from '../hooks/use-parent';
import { useSections, useSectionsByClass } from '../hooks/use-section';
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
  { id: 1, title: 'Parent', icon: Users },
  { id: 2, title: 'Personal', icon: User },
  { id: 3, title: 'Academic', icon: GraduationCap },
  { id: 4, title: 'Documents', icon: FileText },
  { id: 5, title: 'Fees', icon: CreditCard },
];

export const AddStudentForm: React.FC<AddStudentFormProps> = ({ onClose, onSave, editingStudent, isPage }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [activeDocKey, setActiveDocKey] = useState<string | null>(null);
  
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
      father_name: '',
      father_cnic: '',
      father_education: '',
      father_occupation: '',
      father_contact_no: '',
      mother_name: '',
      mother_cnic: '',
      mother_education: '',
      mother_occupation: '',
      mother_contact_no: '',
      address: '',
      guardian_type: 'father' as 'father' | 'mother',
    },
    feeHeads: [
      { id: 'fh1', name: 'Tuition Fee', amount: 8000, isEnabled: true },
      { id: 'fh2', name: 'Transport', amount: 3000, isEnabled: true },
      { id: 'fh2', name: 'Transport', amount: 3000, isEnabled: true },
      { id: 'fh3', name: 'Lab Charges', amount: 1500, isEnabled: true },
      { id: 'fh4', name: 'Library Fee', amount: 500, isEnabled: true },
    ] as FeeHead[],
  });

  // API Hooks
  const { data: classesList } = useClasses();
  const { data: parentsList } = useParents(1); // Branch ID 1
  const { data: sectionsList } = useSectionsByClass(formData.classId ? parseInt(formData.classId) : null);
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const createParent = useCreateParent();

  const [parentSearch, setParentSearch] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Update preview when photo changes
  useEffect(() => {
    let objectUrl: string | null = null;
    if (formData.photo instanceof File) {
      objectUrl = URL.createObjectURL(formData.photo);
      setPhotoPreview(objectUrl);
    } else if (typeof formData.photo === 'string' && formData.photo) {
      setPhotoPreview(formData.photo);
    } else {
      setPhotoPreview(null);
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [formData.photo]);

  // Fetch Fee Heads when section changes
  useEffect(() => {
    const fetchSectionFees = async () => {
      if (!formData.sectionId) return;
      
      try {
        const response = await apiClient.get(`/feeheads_by_section/${formData.sectionId}`);
        if (response.data.status) {
          const apiHeads = response.data.data.map((h: any) => ({
            id: h.id.toString(),
            name: h.head_name,
            amount: parseFloat(h.head_amount),
            frequency: mapBackendToFrontendFreq(h.head_frequency),
            isEnabled: true
          }));
          
          setFormData(prev => ({
            ...prev,
            feeHeads: apiHeads
          }));
        }
      } catch (err) {
        console.error('Failed to fetch fee heads for section:', err);
      }
    };
    
    fetchSectionFees();
  }, [formData.sectionId]);

  const mapBackendToFrontendFreq = (freq: string): any => {
    switch (freq.toLowerCase()) {
      case 'monthly': return 'MONTHLY';
      case 'annual': return 'ANNUAL';
      case 'one time': return 'ONE_TIME';
      case 'quarterly': return 'QUARTERLY';
      default: return 'MONTHLY';
    }
  };

  const mapFrontendToBackendFreq = (freq: FeeFrequency): string => {
    switch (freq) {
      case 'ONE_TIME': return 'One Time';
      case 'MONTHLY': return 'Monthly';
      case 'QUARTERLY': return 'Quarterly';
      case 'ANNUAL': return 'Annual';
      default: return 'Monthly';
    }
  };

  const filteredParents = useMemo(() => {
    if (!parentsList) return [];
    
    // Extract array from various common API response structures
    let list: any[] = [];
    if (Array.isArray(parentsList)) {
      list = parentsList;
    } else if (parentsList && typeof parentsList === 'object') {
      const pList = parentsList as any;
      list = pList.data || pList.parents || pList.items || [];
    }
      
    if (!Array.isArray(list)) list = [];

    if (!parentSearch) return list;
    
    const query = parentSearch.toLowerCase().trim();
    const strippedQuery = query.replace(/[- ]/g, '');
    
    return list.filter(p => {
      // Basic text search for names
      const father_name = (p.father_name || '').toLowerCase();
      const mother_name = (p.mother_name || '').toLowerCase();
      
      // Dash-insensitive search for CNIC and phone numbers
      const father_cnic = (p.father_cnic || '').replace(/[- ]/g, '');
      const mother_cnic = (p.mother_cnic || '').replace(/[- ]/g, '');
      const father_phone = (p.father_contact_no || '').replace(/[- ]/g, '');
      const mother_phone = (p.mother_contact_no || '').replace(/[- ]/g, '');
      
      // Search by sibling names (if available)
      const sibling_names = (p.students || []).map((s: any) => (s.name || '').toLowerCase()).join(' ');

      return father_name.includes(query) || 
             mother_name.includes(query) || 
             father_cnic.includes(strippedQuery) || 
             mother_cnic.includes(strippedQuery) || 
             father_phone.includes(strippedQuery) || 
             mother_phone.includes(strippedQuery) ||
             sibling_names.includes(query);
    });
  }, [parentSearch, parentsList]);

  const selectedParent = useMemo(() => {
    if (!formData.selectedParentId || !parentsList) return null;
    
    let list: any[] = [];
    if (Array.isArray(parentsList)) {
      list = parentsList;
    } else if (parentsList && typeof parentsList === 'object') {
      const pList = parentsList as any;
      list = pList.data || pList.parents || pList.items || [];
    }
    
    if (!Array.isArray(list)) list = [];
    return list.find(p => p.id.toString() === formData.selectedParentId);
  }, [formData.selectedParentId, parentsList]);

  const totalMonthlyFee = useMemo(() => {
    return formData.feeHeads
      .filter(fh => fh.isEnabled && fh.frequency === 'MONTHLY')
      .reduce((sum, fh) => sum + fh.amount, 0);
  }, [formData.feeHeads]);

  const totalAnnualTotal = useMemo(() => {
    // Standard calculation: Sum of all enabled heads multiplied as per frequency
    return formData.feeHeads
      .filter(fh => fh.isEnabled)
      .reduce((sum, fh) => {
        if (fh.frequency === 'MONTHLY') return sum + (fh.amount * 12);
        if (fh.frequency === 'QUARTERLY') return sum + (fh.amount * 4);
        return sum + fh.amount; // ONE_TIME or ANNUAL
      }, 0);
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
      // We store attachments as { key: string, file: File | string } to track them reliably
      const newAttachment = { key: activeDocKey, file };
      
      // Filter out any existing attachment for this specific document key
      const filtered = current.filter((a: any) => 
        !(a.key === activeDocKey || a === activeDocKey || (a instanceof File && a.name === activeDocKey))
      );
      
      setFormData({ 
        ...formData, 
        attachments: [...filtered, newAttachment] 
      });
      setActiveDocKey(null);
      // Reset input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const renderStep1 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
        <div className="space-y-4 flex flex-col items-center sm:items-start">
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
            {photoPreview ? (
              <>
                <div className="w-full h-full relative overflow-hidden group">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload size={20} className="text-white" />
                  </div>
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

        <div className="w-full sm:flex-1 space-y-6 text-left">
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
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Class</label>
            <button 
              type="button"
              onClick={() => setIsClassModalOpen(true)}
              className="text-[10px] font-bold text-brand-600 flex items-center gap-1 hover:underline"
            >
              <Plus size={12} /> Add New
            </button>
          </div>
          <select 
            value={formData.classId}
            onChange={e => setFormData({...formData, classId: e.target.value, sectionId: ''})}
            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none appearance-none"
          >
            <option value="">Select a class...</option>
            {classesList?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Section</label>
          <select 
            value={formData.sectionId}
            onChange={e => setFormData({...formData, sectionId: e.target.value})}
            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none appearance-none"
            disabled={!formData.classId}
          >
            <option value="">Select a section...</option>
            {sectionsList?.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      {/* Document input has been moved to renderForm for better stability */}
      <div className="bg-brand-50/50 p-6 rounded-[2rem] border border-brand-100/50">
        <h4 className="text-sm font-bold text-brand-800 flex items-center gap-2 mb-2">
          <FileText size={18} /> Required Documentation
        </h4>
        <p className="text-xs text-brand-600 font-medium">Please ensure you have dummy names for the following required documents:</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {[
          { label: 'Birth Certificate', key: 'birth_certificate.pdf' },
          { label: 'Last School Report', key: 'last_report.pdf' },
          { label: 'School Leaving Certificate', key: 'slc.pdf' },
          { label: 'B-Form / ID Copy', key: 'id_copy.pdf' }
        ].map((doc) => (
          <div 
            key={doc.label}
            onClick={() => {
              const attachment = formData.attachments.find((a: any) => 
                a.key === doc.key || a === doc.key || (a instanceof File && a.name === doc.key)
              );
              
              if (attachment) {
                setFormData({
                  ...formData,
                  attachments: formData.attachments.filter((a: any) => a !== attachment)
                });
              } else {
                setActiveDocKey(doc.key);
                // Use a small timeout to ensure state update has been scheduled
                setTimeout(() => docInputRef.current?.click(), 0);
              }
            }}
            className={cn(
              "p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
              formData.attachments.some((a: any) => a.key === doc.key || a === doc.key || (a instanceof File && a.name === doc.key))
                ? "border-brand-500 bg-brand-50/50"
                : "border-slate-50 bg-slate-50/50 hover:border-slate-200"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                "p-2.5 rounded-xl transition-all shrink-0",
                formData.attachments.some((a: any) => a.key === doc.key || a === doc.key || (a instanceof File && a.name === doc.key)) ? "bg-brand-500 text-white" : "bg-white text-slate-300 group-hover:text-slate-400"
              )}>
                <Upload size={18} />
              </div>
              <div className="min-w-0">
                <p className={cn("text-xs sm:text-sm font-bold truncate", formData.attachments.some((a: any) => a.key === doc.key || a === doc.key || (a instanceof File && a.name === doc.key)) ? "text-slate-900" : "text-slate-500")}>
                  {doc.label}
                </p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight truncate">
                  {(() => {
                    const attachment = formData.attachments.find((a: any) => 
                      a.key === doc.key || a === doc.key || (a instanceof File && a.name === doc.key)
                    );
                    if (!attachment) return 'Not Uploaded';
                    if (attachment.file) return attachment.file.name;
                    return attachment instanceof File ? attachment.name : attachment;
                  })()}
                </p>
              </div>
            </div>
            {formData.attachments.some((a: any) => a.key === doc.key || a === doc.key || (a instanceof File && a.name === doc.key)) && <CheckCircle2 size={18} className="text-brand-500 shrink-0 ml-2" />}
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
          Create New Parent
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
                placeholder="Search by Parent..."
                className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredParents.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setFormData({...formData, selectedParentId: p.id.toString()})}
                  className={cn(
                    "w-full p-3 sm:p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between",
                    formData.selectedParentId === p.id.toString() ? "border-brand-500 bg-brand-50" : "border-slate-50 hover:border-slate-100"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-bold text-slate-800 truncate">{p.father_name}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-brand-600 bg-brand-50/50 px-2 py-0.5 rounded-lg shrink-0">
                        {p.father_contact_no}
                        {p.father_contact_no && p.mother_contact_no && <span className="opacity-30">|</span>}
                        {p.mother_contact_no}
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">{p.father_cnic}</p>
                  </div>
                  {formData.selectedParentId === p.id.toString() && <CheckCircle2 className="text-brand-500 shrink-0 ml-2" size={20} />}
                </button>
              ))}
              {parentSearch && filteredParents.length === 0 && (
                <div className="text-center py-6 px-4 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                  <p className="text-xs text-slate-400 italic mb-3">No parents found matching "{parentSearch}"</p>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, parentOption: 'NEW'})}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-600 hover:bg-brand-50 transition-all shadow-sm"
                  >
                    Create New Record
                  </button>
                </div>
              )}
            </div>

            {/* Sibling Information for Existing Parent */}
            <AnimatePresence>
              {selectedParent && selectedParent.students && selectedParent.students.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mt-6 pt-6 border-t border-slate-100 overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="text-brand-500" size={18} />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Registered Siblings</h4>
                    <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full text-[10px] font-bold leading-none">
                      {selectedParent.students.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedParent.students.map((student: any) => (
                      <div 
                        key={student.id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/50 group hover:border-brand-100 transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-brand-500 shadow-sm font-bold text-xs uppercase tracking-tighter">
                          {student.name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{student.name || 'Untitled'}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight truncate">
                            {student.admission_no} • {student.currently_studying || 'No Grade'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            key="new"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar"
          >
            {/* Father Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                  <User size={14} />
                </div>
                <h4 className="font-bold text-slate-800 uppercase text-[9px] tracking-widest">Father Details</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Father Name</label>
                  <input 
                    value={formData.newParent.father_name}
                    onChange={e => setFormData({...formData, newParent: {...formData.newParent, father_name: e.target.value}})}
                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/10 transition-all font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Father CNIC</label>
                  <input 
                    value={formData.newParent.father_cnic}
                    onChange={e => setFormData({...formData, newParent: {...formData.newParent, father_cnic: e.target.value}})}
                    placeholder="35201-XXXXXXX-X"
                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/10 transition-all font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Education</label>
                  <input 
                    value={formData.newParent.father_education}
                    onChange={e => setFormData({...formData, newParent: {...formData.newParent, father_education: e.target.value}})}
                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/10 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Occupation</label>
                  <input 
                    value={formData.newParent.father_occupation}
                    onChange={e => setFormData({...formData, newParent: {...formData.newParent, father_occupation: e.target.value}})}
                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/10 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input 
                      value={formData.newParent.father_contact_no}
                      onChange={e => setFormData({...formData, newParent: {...formData.newParent, father_contact_no: e.target.value}})}
                      className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/10 transition-all font-medium"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mother Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <User size={14} />
                </div>
                <h4 className="font-bold text-slate-800 uppercase text-[9px] tracking-widest">Mother Details</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mother Name</label>
                  <input 
                    value={formData.newParent.mother_name}
                    onChange={e => setFormData({...formData, newParent: {...formData.newParent, mother_name: e.target.value}})}
                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/10 transition-all font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mother CNIC</label>
                  <input 
                    value={formData.newParent.mother_cnic}
                    onChange={e => setFormData({...formData, newParent: {...formData.newParent, mother_cnic: e.target.value}})}
                    placeholder="35201-XXXXXXX-X"
                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/10 transition-all font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Education</label>
                  <input 
                    value={formData.newParent.mother_education}
                    onChange={e => setFormData({...formData, newParent: {...formData.newParent, mother_education: e.target.value}})}
                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/10 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Occupation</label>
                  <input 
                    value={formData.newParent.mother_occupation}
                    onChange={e => setFormData({...formData, newParent: {...formData.newParent, mother_occupation: e.target.value}})}
                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/10 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input 
                      value={formData.newParent.mother_contact_no}
                      onChange={e => setFormData({...formData, newParent: {...formData.newParent, mother_contact_no: e.target.value}})}
                      className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/10 transition-all font-medium"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                  <Shield size={14} />
                </div>
                <h4 className="font-bold text-slate-800 uppercase text-[9px] tracking-widest">Preferences</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guardian Type</label>
                  <select
                    value={formData.newParent.guardian_type}
                    onChange={(e) => setFormData({...formData, newParent: {...formData.newParent, guardian_type: e.target.value as 'father' | 'mother'}})}
                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/10 appearance-none font-medium"
                    required
                  >
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Residential Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3 text-slate-300" size={14} />
                    <textarea 
                      rows={2}
                      value={formData.newParent.address}
                      onChange={e => setFormData({...formData, newParent: {...formData.newParent, address: e.target.value}})}
                      className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/10 transition-all font-medium resize-none shadow-sm"
                      placeholder="Complete residential address..."
                    />
                  </div>
                </div>
              </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {formData.feeHeads.map(fh => (
              <div 
                key={fh.id}
                onClick={() => toggleFeeHead(fh.id)}
                className={cn(
                  "p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between",
                  fh.isEnabled ? "border-brand-100 bg-brand-50/30" : "border-slate-50 bg-slate-50/50 opacity-60"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    fh.isEnabled ? "bg-brand-100 text-brand-600" : "bg-slate-200 text-slate-400"
                  )}>
                    <DollarSign size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{fh.name}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500">PKR {fh.amount.toLocaleString()}</p>
                  </div>
                </div>
                <div className={cn(
                  "w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ml-2",
                  fh.isEnabled ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300"
                )}>
                  {fh.isEnabled && <CheckCircle2 size={14} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
                {/* Summary Card */}
                <div className="lg:col-span-1">
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-500/20 transition-all" />
                    
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Fee Summary</h4>
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm font-bold">Monthly Total</span>
                        <span className="text-lg font-black tracking-tight">PKR {totalMonthlyFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm font-bold">Annual Total</span>
                        <span className="text-brand-400 text-lg font-black tracking-tight">PKR {totalAnnualTotal.toLocaleString()}</span>
                      </div>
                      
                      <div className="pt-6 border-t border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Total Yearly Payable</span>
                          <span className="text-2xl font-black text-brand-400">PKR {totalAnnualTotal.toLocaleString()}</span>
                        </div>
                        <p className="text-[9px] text-slate-500 italic leading-relaxed">* Annual total is calculated based on enabled fee heads frequency.</p>
                      </div>
                    </div>
                  </div>
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
    let finalParentId = data.selectedParentId;

    if (data.parentOption === 'NEW') {
      try {
        const parentResponse = await createParent.mutateAsync({
          branch_id: data.branchId,
          ...data.newParent
        });
        // Assuming parentResponse.id exists
        finalParentId = parentResponse.id.toString();
      } catch (err) {
        console.error("Failed to create parent:", err);
        return; // Stop if parent creation fails
      }
    }

    formDataObj.append('parent_id', finalParentId.toString());
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
      const fileToAppend = attachment.file || attachment;
      if (fileToAppend instanceof File) {
        formDataObj.append(`attachments[${index}]`, fileToAppend);
      } else if (typeof fileToAppend === 'string' && fileToAppend) {
        formDataObj.append(`attachments[${index}]`, fileToAppend);
      }
    });

    // Add Fee Heads
    data.feeHeads.filter((fh: any) => fh.isEnabled).forEach((fh: any, index: number) => {
      formDataObj.append(`fee_heads[${index}][head_name]`, fh.name);
      formDataObj.append(`fee_heads[${index}][head_amount]`, fh.amount.toString());
      formDataObj.append(`fee_heads[${index}][head_frequency]`, mapFrontendToBackendFreq(fh.frequency));
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
      <div className="px-4 sm:px-12 py-4 sm:py-6 bg-white border-b border-slate-50 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between relative min-w-[280px]">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 sm:h-1 bg-slate-100 z-0" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 sm:h-1 bg-brand-500 z-0 transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />
          {STEPS.map(step => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5 sm:gap-2">
              <div className={cn(
                "w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 text-xs sm:text-base",
                currentStep >= step.id ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "bg-white border-2 border-slate-100 text-slate-300"
              )}>
                <step.icon size={14} className="sm:w-[18px] sm:h-[18px]" />
              </div>
              <span className={cn(
                "text-[7px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:block",
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
        {currentStep === 1 && renderStep3()}
        {currentStep === 2 && renderStep1()}
        {currentStep === 3 && renderStep2()}
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
      
      {/* Hidden inputs for file uploads */}
      <input 
        type="file"
        ref={docInputRef}
        onChange={handleDocumentChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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
