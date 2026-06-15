import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  Loader2,
  BookOpen,
  ArrowLeft,
  Layers,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { useBranchStore } from '../../store/use-branch-store';
import { ClassSection, ClassData } from '../../types/api/class';
import { classSubjectService } from '../../lib/services/class-subject-service';
import { ClassSubjectData } from '../../types/api/class-subject';
import { classService } from '../../lib/services/class-service';
import { sectionService } from '../../lib/services/section-service';
import { SectionData } from '../../types/api/section';
import { X, ChevronDown } from 'lucide-react';

const SectionSubjectsView: React.FC<{ section: ClassSection, className: string, onBack: () => void }> = ({ section, className, onBack }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [subjects, setSubjects] = useState<ClassSubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    classSubjectService.getSubjectsBySection(section.id)
      .then(res => setSubjects(res.data ?? []))
      .catch(() => setFetchError('Failed to load subjects.'))
      .finally(() => setLoading(false));
  }, [section.id]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddModalOpen(false);
    setSubjectName('');
    setTeacherName('');
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
              {className} - Section {section.name} Subjects
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">Manage subjects and syllabus for this section</p>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus size={18} />}>
          Add Subject
        </Button>
      </div>
      
      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
            <p className="font-bold uppercase tracking-widest text-sm">Loading subjects...</p>
          </div>
        ) : fetchError ? (
          <div className="p-12 flex items-center justify-center text-rose-500">
            <p className="font-bold">{fetchError}</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <BookOpen size={48} className="mb-4 opacity-50" />
            <p className="text-xl font-bold text-slate-800 mb-2">No Subjects Yet</p>
            <p className="text-sm text-center max-w-md text-slate-500">
              No subjects found for Class <strong className="text-slate-700">{className}</strong>, Section <strong className="text-slate-700">{section.name}</strong>.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[35%]">Subject Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[35%]">Teacher</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[30%]">Added On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subjects.map((sub: ClassSubjectData) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{sub.subject_name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {sub.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">{sub.teacher?.name ?? '-'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-slate-500 font-medium">
                        {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : '-'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">
                  Add New Subject
                </h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600 shadow-sm"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Subject Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mathematics, English..." 
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      required
                      autoFocus
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Teacher Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe..." 
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" 
                    />
                  </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="w-full sm:w-auto shadow-lg shadow-brand-200"
                  >
                    Save Subject
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Add Subject Modal ────────────────────────────────────────────────────────
const AddSubjectModal: React.FC<{ branchId: number; teachers: { id: number; name: string }[]; onClose: () => void; onSuccess: () => void }> = ({ branchId, teachers, onClose, onSuccess }) => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({ subject_name: '', class_id: '', section_id: '', teacher_id: '' });

  useEffect(() => {
    classService.getClasses(branchId)
      .then(data => setClasses(data ?? []))
      .catch(() => setClasses([]))
      .finally(() => setLoadingClasses(false));
  }, [branchId]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    setForm(prev => ({ ...prev, class_id: classId, section_id: '' }));
    if (!classId) { setSections([]); return; }
    setLoadingSections(true);
    sectionService.getSectionsByClass(Number(classId))
      .then(data => setSections(data ?? []))
      .catch(() => setSections([]))
      .finally(() => setLoadingSections(false));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: { subject_name: string; class_id: string; section_id: string; teacher_id: string }) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await classSubjectService.createSubject({
        subject_name: form.subject_name,
        class_id: Number(form.class_id),
        section_id: Number(form.section_id),
        teacher_id: Number(form.teacher_id),
        branch_id: branchId,
      });
      onSuccess();
      onClose();
    } catch {
      setSubmitError('Failed to add subject. Please try again.');
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
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-0.5">Subjects</p>
            <h3 className="text-lg font-bold text-slate-900">Add New Subject</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Subject Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Subject Name</label>
              <input
                type="text" name="subject_name" value={form.subject_name} onChange={handleChange}
                placeholder="e.g. Mathematics" required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm"
              />
            </div>
            {/* Class */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Class</label>
              <div className="relative">
                <select
                  name="class_id" value={form.class_id} onChange={handleClassChange} required
                  className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm pr-10"
                >
                  <option value="" disabled>{loadingClasses ? 'Loading...' : 'Select Class'}</option>
                  {classes.map((c: ClassData) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            {/* Section */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Section</label>
              <div className="relative">
                <select
                  name="section_id" value={form.section_id} onChange={handleChange} required
                  disabled={!form.class_id || loadingSections}
                  className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm pr-10 disabled:opacity-50"
                >
                  <option value="" disabled>
                    {!form.class_id ? 'Select a class first' : loadingSections ? 'Loading...' : 'Select Section'}
                  </option>
                  {sections.map((s: SectionData) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            {/* Teacher */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Teacher</label>
              <div className="relative">
                <select
                  name="teacher_id" value={form.teacher_id} onChange={handleChange} required
                  className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm pr-10"
                >
                  <option value="" disabled>Select Teacher</option>
                  {teachers.map((t: { id: number; name: string }) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Subject'}</Button>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            {submitError && <p className="text-sm text-red-500 font-medium">{submitError}</p>}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Edit Subject Modal ───────────────────────────────────────────────────────
const EditSubjectModal: React.FC<{
  sub: ClassSubjectData;
  teachers: { id: number; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ sub, teachers, onClose, onSuccess }) => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    subject_name: sub.subject_name ?? '',
    class_id: String(sub.class_id ?? ''),
    section_id: String(sub.section_id ?? ''),
    teacher_id: String(sub.teacher_id ?? ''),
  });

  useEffect(() => {
    classService.getClasses(sub.branch_id || 1)
      .then(data => setClasses(data ?? []))
      .catch(() => setClasses([]))
      .finally(() => setLoadingClasses(false));
    if (sub.class_id) {
      setLoadingSections(true);
      sectionService.getSectionsByClass(sub.class_id)
        .then(data => setSections(data ?? []))
        .catch(() => setSections([]))
        .finally(() => setLoadingSections(false));
    }
  }, []);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    setForm(prev => ({ ...prev, class_id: classId, section_id: '' }));
    if (!classId) { setSections([]); return; }
    setLoadingSections(true);
    sectionService.getSectionsByClass(Number(classId))
      .then(data => setSections(data ?? []))
      .catch(() => setSections([]))
      .finally(() => setLoadingSections(false));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await classSubjectService.updateSubject(sub.id, {
        subject_name: form.subject_name,
        class_id: Number(form.class_id),
        section_id: Number(form.section_id),
        teacher_id: Number(form.teacher_id),
        _method: 'PUT',
      });
      onSuccess();
      onClose();
    } catch {
      setSubmitError('Failed to update subject. Please try again.');
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
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-0.5">Subjects</p>
            <h3 className="text-lg font-bold text-slate-900">Edit Subject</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Subject Name</label>
              <input type="text" name="subject_name" value={form.subject_name} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Class</label>
              <div className="relative">
                <select name="class_id" value={form.class_id} onChange={handleClassChange} required
                  className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm pr-10">
                  <option value="" disabled>{loadingClasses ? 'Loading...' : 'Select Class'}</option>
                  {classes.map((c: ClassData) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Section</label>
              <div className="relative">
                <select name="section_id" value={form.section_id} onChange={handleChange} required
                  disabled={!form.class_id || loadingSections}
                  className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm pr-10 disabled:opacity-50">
                  <option value="" disabled>{!form.class_id ? 'Select a class first' : loadingSections ? 'Loading...' : 'Select Section'}</option>
                  {sections.map((s: SectionData) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Teacher</label>
              <div className="relative">
                <select name="teacher_id" value={form.teacher_id} onChange={handleChange} required
                  className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm pr-10">
                  <option value="" disabled>Select Teacher</option>
                  {teachers.map((t: { id: number; name: string }) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
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
const DeleteSubjectConfirmModal: React.FC<{ sub: ClassSubjectData; onClose: () => void; onSuccess: () => void }> = ({ sub, onClose, onSuccess }) => {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await classSubjectService.deleteSubject(sub.id);
      onSuccess();
      onClose();
    } catch {
      setDeleteError('Failed to delete subject. Please try again.');
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
            <h3 className="text-lg font-bold text-slate-900">Delete Subject?</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Are you sure you want to delete <span className="text-slate-700 font-bold">"{sub.subject_name}"</span>? This action cannot be undone.
            </p>
          </div>
          {deleteError && <p className="text-sm text-red-500 font-medium">{deleteError}</p>}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={deleting}>Cancel</Button>
          <button onClick={handleDelete} disabled={deleting}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const SubjectsManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjects, setSubjects] = useState<ClassSubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<{ section: ClassSection; className: string } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ClassSubjectData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClassSubjectData | null>(null);
  const [allSections, setAllSections] = useState<SectionData[]>([]);
  const [sectionFilter, setSectionFilter] = useState('');

  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId || 1;

  const loadSubjects = (sectionId?: number) => {
    setLoading(true);
    setFetchError(null);
    const call = sectionId
      ? classSubjectService.getSubjectsBySection(sectionId)
      : classSubjectService.getSubjectsByBranch(branchId);
    call
      .then(res => setSubjects(res.data ?? []))
      .catch(() => setFetchError('Failed to load subjects.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubjects();
    sectionService.getSections(branchId)
      .then(data => setAllSections(data ?? []))
      .catch(() => setAllSections([]));
  }, [branchId]);

  const handleSectionFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSectionFilter(val);
    loadSubjects(val ? Number(val) : undefined);
  };

  if (selectedSection) {
    return <SectionSubjectsView section={selectedSection.section} className={selectedSection.className} onBack={() => setSelectedSection(null)} />;
  }

  const filteredSubjects = subjects.filter((s: ClassSubjectData) =>
    s.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.class?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.section?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.teacher?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center sm:text-left">Subjects Management</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base text-center sm:text-left">All subjects assigned across classes and sections</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setIsAddModalOpen(true)}>
          Add Subject
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="Search subjects, classes, sections..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <select
              value={sectionFilter}
              onChange={handleSectionFilter}
              className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-600 text-sm pr-10"
            >
              <option value="">All Sections</option>
              {allSections.map((s: SectionData) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
            <p className="font-bold uppercase tracking-widest text-sm">Loading subjects...</p>
          </div>
        ) : fetchError ? (
          <div className="p-12 flex items-center justify-center text-rose-500">
            <p className="font-bold">{fetchError}</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Subjects Found"
            description="No subjects match your search or none have been added yet."
            actionLabel="Clear Search"
            onAction={() => setSearchQuery('')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[25%]">Subject Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[18%]">Class</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[18%]">Section</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[22%]">Teacher</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[17%] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSubjects.map((sub: ClassSubjectData) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{sub.subject_name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {sub.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">{sub.class?.name ?? '-'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg w-fit bg-brand-50 text-brand-600">
                        <Layers size={12} />
                        {sub.section?.name ?? '-'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">{sub.teacher?.name ?? '-'}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditTarget(sub)}
                          className="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:border-brand-500 hover:text-brand-600 hover:shadow-md transition-all shadow-sm" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(sub)}
                          className="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:border-red-400 hover:text-red-500 hover:shadow-md transition-all shadow-sm" title="Delete">
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
        {isAddModalOpen && (
          <AddSubjectModal
            branchId={selectedBranchId || 1}
            teachers={Array.from(
              new Map(
                subjects
                  .filter((s: ClassSubjectData) => s.teacher?.id && s.teacher?.name)
                  .map((s: ClassSubjectData) => [s.teacher!.id, { id: s.teacher!.id, name: s.teacher!.name }])
              ).values()
            )}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={() => {
              classSubjectService.getSubjectsByBranch(selectedBranchId || 1)
                .then(res => setSubjects(res.data ?? []))
                .catch(() => {});
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editTarget && (
          <EditSubjectModal
            sub={editTarget}
            teachers={Array.from(
              new Map(
                subjects
                  .filter((s: ClassSubjectData) => s.teacher?.id && s.teacher?.name)
                  .map((s: ClassSubjectData) => [s.teacher!.id, { id: s.teacher!.id, name: s.teacher!.name }])
              ).values()
            )}
            onClose={() => setEditTarget(null)}
            onSuccess={() => {
              classSubjectService.getSubjectsByBranch(selectedBranchId || 1)
                .then(res => setSubjects(res.data ?? []))
                .catch(() => {});
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteTarget && (
          <DeleteSubjectConfirmModal
            sub={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onSuccess={() => {
              classSubjectService.getSubjectsByBranch(selectedBranchId || 1)
                .then(res => setSubjects(res.data ?? []))
                .catch(() => {});
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
