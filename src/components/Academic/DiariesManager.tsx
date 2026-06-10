import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Download,
  X,
  BookOpen,
  Layers,
  CheckCircle,
  Clock,
  ArrowLeft,
  ChevronDown,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { classSubjectService } from '../../lib/services/class-subject-service';
import { ClassSubjectData } from '../../types/api/class-subject';
import { diaryService } from '../../lib/services/diary-service';
import { DiaryData } from '../../types/api/diary';
import { sectionService } from '../../lib/services/section-service';
import { SectionData } from '../../types/api/section';
import { classService } from '../../lib/services/class-service';
import { ClassData } from '../../types/api/class';

interface DiaryRow {
  id: number;
  sectionName: string;
  className: string;
  todayApprove: string;
  raw: DiaryData;
}

const DiaryDetailView: React.FC<{ section: DiaryRow, onBack: () => void }> = ({ section, onBack }) => {
  const [selectedDate, setSelectedDate] = useState(section.raw.date);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [tempDate, setTempDate] = useState(section.raw.date);
  const [diaryDetail, setDiaryDetail] = useState(section.raw);
  const [detailLoading, setDetailLoading] = useState(true);

  useEffect(() => {
    diaryService.getDiaryById(section.raw.id)
      .then(res => setDiaryDetail(res.data))
      .catch(() => setDiaryDetail(section.raw))
      .finally(() => setDetailLoading(false));
  }, [section.raw.id]);

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedDate(tempDate);
    setIsDateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Class Diary
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">View daily logs and homework</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setIsDateModalOpen(true)} leftIcon={<Calendar size={18} />}>
            Select Date
          </Button>
        </div>
      </div>

      {/* Document View */}
      <Card className="w-full overflow-hidden p-0 border-t-4 border-t-brand-500 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-b from-brand-50/50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center shadow-sm">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">What I have Learnt</h1>
              <p className="text-sm sm:text-base font-bold text-slate-500 mt-0.5">{section.className} ({section.sectionName})</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm mt-4 sm:mt-0">
             <Calendar size={16} className="text-brand-500" /> Date: {new Date(selectedDate).toDateString()}
          </div>
        </div>

        <div className="p-6 sm:p-10">
          {detailLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-400 font-medium text-sm">
              Loading...
            </div>
          ) : (
           <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-200 shadow-inner">
             {[
               { label: 'Subject', value: diaryDetail.class_subject?.subject_name ?? '-' },
               { label: 'Topic', value: diaryDetail.topic ?? '-' },
               { label: 'Description', value: diaryDetail.description ?? '-' },
               { label: 'Date', value: diaryDetail.date ?? '-' },
               { label: 'Status', value: diaryDetail.status ?? 'Not created' },
             ].map((row, idx) => (
               <div key={idx} className="flex flex-col sm:flex-row p-4 sm:p-5 hover:bg-white transition-colors group">
                 <div className="w-full sm:w-1/4 font-black text-slate-400 text-xs sm:text-sm uppercase tracking-widest group-hover:text-brand-500 transition-colors pt-0.5">
                   {row.label}
                 </div>
                 <div className="w-full sm:w-3/4 font-bold text-slate-700 text-sm sm:text-base mt-1 sm:mt-0 leading-relaxed">
                   {row.value}
                 </div>
               </div>
             ))}
           </div>
          )}
        </div>
      </Card>
      
      <div className="flex justify-start w-full pt-2">
        <Button leftIcon={<Download size={18} />} variant="outline" className="bg-white hover:bg-slate-50">
          Download
        </Button>
      </div>

      {/* Date Selection Modal */}
      <AnimatePresence>
        {isDateModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">Filter Date</h3>
                <button onClick={() => setIsDateModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleDateSubmit}>
                <div className="p-6 space-y-4">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Select Date</label>
                  <input 
                    type="date"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700" 
                  />
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsDateModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface EditDiaryForm { topic: string; description: string; date: string; status: string; }

// ─── Edit Modal ──────────────────────────────────────────────────────────────
const EditDiaryModal: React.FC<{ diary: DiaryRow; onClose: () => void; onSuccess: () => void }> = ({ diary, onClose, onSuccess }) => {
  const [form, setForm] = useState<EditDiaryForm>({
    topic: diary.raw.topic ?? '',
    description: diary.raw.description ?? '',
    date: diary.raw.date ?? '',
    status: diary.raw.status ?? 'Pending',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: EditDiaryForm) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await diaryService.updateDiary(diary.raw.id, { ...form, _method: 'PUT' });
      onSuccess();
      onClose();
    } catch {
      setSubmitError('Failed to update diary. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-0.5">Class Diary</p>
            <h3 className="text-lg font-bold text-slate-900">Edit Diary</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Topic</label>
              <input type="text" name="topic" value={form.topic} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Status</label>
                <div className="relative">
                  <select name="status" value={form.status} onChange={handleChange}
                    className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm pr-10">
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-start gap-3">
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</Button>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            {submitError && <p className="text-sm text-red-500 font-medium">{submitError}</p>}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal: React.FC<{ diary: DiaryRow; onClose: () => void; onSuccess: () => void }> = ({ diary, onClose, onSuccess }) => {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await diaryService.deleteDiary(diary.raw.id);
      onSuccess();
      onClose();
    } catch {
      setDeleteError('Failed to delete diary. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
      >
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Delete Diary?</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Are you sure you want to delete <span className="text-slate-700 font-bold">"{diary.raw.topic}"</span>? This action cannot be undone.
            </p>
          </div>
          {deleteError && <p className="text-sm text-red-500 font-medium">{deleteError}</p>}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={deleting}>Cancel</Button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const today = new Date().toISOString().split('T')[0];

interface AddDiaryStep2Form {
  topic: string;
  page_number: string;
  resources: string;
  date: string;
  link: string;
  activity: string;
  home_work: string;
}

const AddDiaryModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 — cascading selects
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [subjects, setSubjects] = useState<ClassSubjectData[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Step 2 — details form
  const [form, setForm] = useState<AddDiaryStep2Form>({
    topic: '', page_number: '', resources: '', date: today, link: '', activity: '', home_work: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load classes on mount
  useEffect(() => {
    classService.getClasses(1)
      .then(res => setClasses(res ?? []))
      .catch(() => setClasses([]))
      .finally(() => setLoadingClasses(false));
  }, []);

  // Load sections when class changes
  useEffect(() => {
    if (!selectedClassId) { setSections([]); setSelectedSectionId(''); setSubjects([]); setSelectedSubjectId(''); return; }
    setLoadingSections(true);
    setSections([]);
    setSelectedSectionId('');
    setSubjects([]);
    setSelectedSubjectId('');
    sectionService.getSectionsByClass(Number(selectedClassId))
      .then(res => setSections(res ?? []))
      .catch(() => setSections([]))
      .finally(() => setLoadingSections(false));
  }, [selectedClassId]);

  // Load subjects when section changes
  useEffect(() => {
    if (!selectedSectionId) { setSubjects([]); setSelectedSubjectId(''); return; }
    setLoadingSubjects(true);
    setSubjects([]);
    setSelectedSubjectId('');
    classSubjectService.getSubjectsBySection(Number(selectedSectionId))
      .then(res => setSubjects(res.data ?? []))
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSubjects(false));
  }, [selectedSectionId]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: AddDiaryStep2Form) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await diaryService.createDiary({
        class_subject_id: Number(selectedSubjectId),
        topic: form.topic,
        description: form.activity,
        date: form.date,
        status: 'Pending',
        branch_id: 1,
      });
      onSuccess();
      onClose();
    } catch {
      setSubmitError('Failed to create diary. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm";
  const selectCls = `${inputCls} appearance-none pr-10`;
  const labelCls = "text-xs font-bold text-slate-700 uppercase tracking-widest";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-0.5">Class Diary</p>
            <h3 className="text-lg font-bold text-slate-900">Create New</h3>
          </div>
          <div className="flex items-center gap-4">
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 1 ? 'bg-brand-500 text-white' : 'bg-emerald-500 text-white'}`}>1</div>
              <div className={`w-8 h-0.5 rounded ${step === 2 ? 'bg-brand-500' : 'bg-slate-200'}`} />
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 2 ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-400'}`}>2</div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Step 1 — Class / Section / Subject */}
        {step === 1 && (
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Class */}
            <div className="space-y-1.5">
              <label className={labelCls}>Class</label>
              <div className="relative">
                <select
                  value={selectedClassId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedClassId(e.target.value)}
                  className={selectCls}
                >
                  <option value="" disabled>{loadingClasses ? 'Loading...' : 'Choose Class'}</option>
                  {classes.map((c: ClassData) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Section */}
            <div className="space-y-1.5">
              <label className={labelCls}>Section</label>
              <div className="relative">
                <select
                  value={selectedSectionId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSectionId(e.target.value)}
                  disabled={!selectedClassId || loadingSections}
                  className={`${selectCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="" disabled>
                    {loadingSections ? 'Loading...' : !selectedClassId ? 'Select class first' : 'Choose Section'}
                  </option>
                  {sections.map((s: SectionData) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className={labelCls}>Subject</label>
              <div className="relative">
                <select
                  value={selectedSubjectId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSubjectId(e.target.value)}
                  disabled={!selectedSectionId || loadingSubjects}
                  className={`${selectCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="" disabled>
                    {loadingSubjects ? 'Loading...' : !selectedSectionId ? 'Select section first' : 'Choose Subject'}
                  </option>
                  {subjects.map((s: ClassSubjectData) => (
                    <option key={s.id} value={s.id}>{s.subject_name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 2 && (
          <form id="diary-step2" onSubmit={handleSubmit} className="overflow-y-auto">
            <div className="p-6 space-y-5">
              {/* Topic / Page Number / Resources / Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>Topic</label>
                  <input type="text" name="topic" value={form.topic} onChange={handleFormChange} placeholder="Topic" className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Page Number</label>
                  <input type="text" name="page_number" value={form.page_number} onChange={handleFormChange} placeholder="e.g 1-3" className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Resources</label>
                  <input type="text" name="resources" value={form.resources} onChange={handleFormChange} placeholder="e.g Book" className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Date</label>
                  <input type="date" name="date" value={form.date} onChange={handleFormChange} required className={inputCls} />
                </div>
              </div>

              {/* Link */}
              <div className="space-y-1.5">
                <label className={labelCls}>Link</label>
                <input type="url" name="link" value={form.link} onChange={handleFormChange} placeholder="Enter Link" className={inputCls} />
              </div>

              {/* Activity / Home Work */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>Activity</label>
                  <textarea name="activity" value={form.activity} onChange={handleFormChange} rows={4} className={`${inputCls} resize-none`} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Home Work</label>
                  <textarea name="home_work" value={form.home_work} onChange={handleFormChange} rows={4} className={`${inputCls} resize-none`} />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          {step === 1 ? (
            <>
              <span />
              <Button
                type="button"
                disabled={!selectedClassId || !selectedSectionId || !selectedSubjectId}
                onClick={() => setStep(2)}
              >
                Next →
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-800 font-bold text-sm transition-colors"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <div className="flex items-center gap-3">
                {submitError && <p className="text-sm text-red-500 font-medium">{submitError}</p>}
                <Button type="submit" form="diary-step2" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export const DiariesManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [diariesList, setDiariesList] = useState<DiaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<DiaryRow | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DiaryRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DiaryRow | null>(null);

  const loadDiaries = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const [diariesRes, sectionsRes, classesRes] = await Promise.all([
        diaryService.getDiaries(1),
        sectionService.getSections(1),
        classService.getClasses(1),
      ]);
      const sectionMap = new Map((sectionsRes ?? []).map(s => [s.id, s.name]));
      const classMap = new Map((classesRes ?? []).map(c => [c.id, c.name]));
      const rows: DiaryRow[] = (diariesRes.data ?? []).map(diary => ({
        id: diary.id,
        sectionName: sectionMap.get(diary.class_subject?.section_id) ?? String(diary.class_subject?.section_id ?? '-'),
        className: classMap.get(diary.class_subject?.class_id) ?? String(diary.class_subject?.class_id ?? '-'),
        todayApprove: diary.status || 'Not created',
        raw: diary,
      }));
      setDiariesList(rows);
    } catch {
      setFetchError('Failed to load diaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDiaries(); }, []);

  const filteredList = diariesList.filter((d: DiaryRow) =>
    d.sectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedSection) {
    return <DiaryDetailView section={selectedSection} onBack={() => setSelectedSection(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center sm:text-left">Diaries</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base text-center sm:text-left">Manage what I have learnt</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
          <Button variant="outline" className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200">
            All Diaries
          </Button>
          <Button leftIcon={<Plus size={18} />} onClick={() => setIsAddModalOpen(true)}>
            Add New
          </Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="Search sections or classes..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all border border-transparent font-bold text-sm w-full sm:w-auto justify-center">
            <Filter size={18} />
            Filters
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 font-medium text-sm">
            Loading diaries...
          </div>
        ) : fetchError ? (
          <div className="flex items-center justify-center py-16 text-red-500 font-medium text-sm">
            {fetchError}
          </div>
        ) : filteredList.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Diaries Found"
            description="No sections match your search criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[10%]">ID</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[25%]">Section Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[25%]">Class Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[20%]">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[20%] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredList.map((item: DiaryRow) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-500">#{item.id}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                          <Layers size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.sectionName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">{item.className}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg w-fit ${
                        item.todayApprove === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                        item.todayApprove === 'Pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {item.todayApprove === 'Approved' ? <CheckCircle size={14} /> : <Clock size={14} />}
                        {item.todayApprove}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedSection(item)}
                          className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:border-brand-500 hover:text-brand-600 hover:shadow-md transition-all shadow-sm flex items-center gap-2"
                        >
                          <BookOpen size={14} />
                          View Diary
                        </button>
                        <button
                          onClick={() => setEditTarget(item)}
                          className="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:border-brand-500 hover:text-brand-600 hover:shadow-md transition-all shadow-sm"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:border-red-400 hover:text-red-500 hover:shadow-md transition-all shadow-sm"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AnimatePresence>
        {isAddModalOpen && <AddDiaryModal onClose={() => setIsAddModalOpen(false)} onSuccess={loadDiaries} />}
      </AnimatePresence>
      <AnimatePresence>
        {editTarget && <EditDiaryModal diary={editTarget} onClose={() => setEditTarget(null)} onSuccess={loadDiaries} />}
      </AnimatePresence>
      <AnimatePresence>
        {deleteTarget && <DeleteConfirmModal diary={deleteTarget} onClose={() => setDeleteTarget(null)} onSuccess={loadDiaries} />}
      </AnimatePresence>
    </div>
  );
};
