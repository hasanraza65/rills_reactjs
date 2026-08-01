import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  FileText,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Calendar,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn, UserRole } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';
import { useAuthStore } from '../../store/use-auth-store';
import { useBranchStore } from '../../store/use-branch-store';
import { useClasses } from '../../hooks/use-class';
import { useSectionsByClass } from '../../hooks/use-section';
import { useClassSubjects, useMySubjects } from '../../hooks/use-class-subject';
import {
  useSyllabuses, useCreateSyllabus, useUpdateSyllabus, useDeleteSyllabus,
} from '../../hooks/use-syllabus';
import { isUrl, normalizeUrl, URL_ERROR, URL_PLACEHOLDER } from '../../lib/validations/url';
import type { SyllabusData } from '../../types/api/syllabus';
import type { ClassSubjectData } from '../../types/api/class-subject';

interface ClassSyllabusManagerProps {
  role: UserRole;
}

type SyllabusFormState = {
  month: string;
  page: string;
  link: string;
  content: string;
};

const emptyForm = (): SyllabusFormState => ({ month: '', page: '', link: '', content: '' });

const inputCls =
  'w-full px-4 py-3 bg-slate-50 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm border';
const errorRing = 'border-rose-400 bg-rose-50/50';
const labelCls = 'text-xs font-bold text-slate-700 uppercase tracking-widest';

/** Describes a subject as "Maths — Grade 1 / A". */
const subjectLabel = (s: Pick<ClassSubjectData, 'subject_name' | 'class' | 'section'>) => {
  const where = [s.class?.name, s.section?.name].filter(Boolean).join(' / ');
  return where ? `${s.subject_name} — ${where}` : s.subject_name;
};

// ─── Form Modal (create + edit) ──────────────────────────────────────────────

const SyllabusFormModal: React.FC<{
  syllabus?: SyllabusData;
  branchId: number;
  isTeacher: boolean;
  onClose: () => void;
}> = ({ syllabus, branchId, isTeacher, onClose }) => {
  const isEdit = !!syllabus;
  const { user } = useAuthStore();

  const [classId, setClassId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(syllabus?.subject_id ?? null);

  const [form, setForm] = useState<SyllabusFormState>(
    syllabus
      ? {
          month: syllabus.month ?? '',
          page: syllabus.page ?? '',
          link: syllabus.link ?? '',
          content: syllabus.content ?? '',
        }
      : emptyForm()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createSyllabus = useCreateSyllabus();
  const updateSyllabus = useUpdateSyllabus();
  const isSaving = createSyllabus.isPending || updateSyllabus.isPending;

  // A teacher picks from their own assignments — their user row has no branch, so the
  // branch-scoped class/section lists would come back empty for them.
  const { data: mySubjectsResp, isLoading: loadingMine } = useMySubjects(isTeacher);
  const mySubjects = mySubjectsResp?.data ?? [];

  const { data: classes } = useClasses(branchId);
  const { data: sections } = useSectionsByClass(classId);
  const { data: sectionSubjectsResp } = useClassSubjects(isTeacher ? null : sectionId, branchId);
  const sectionSubjects = sectionSubjectsResp?.data ?? [];

  const clearError = (field: string) =>
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const set = (field: keyof SyllabusFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const validate = () => {
    const found: Record<string, string> = {};
    if (!subjectId) found.subject_id = 'Select a subject.';
    if (!form.month) found.month = 'Date is required.';
    if (!form.content.trim()) found.content = 'Content is required.';
    if (form.link.trim() && !isUrl(form.link)) found.link = URL_ERROR;
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    const payload = {
      month: form.month,
      content: form.content.trim(),
      page: form.page.trim() || undefined,
      link: form.link.trim() ? normalizeUrl(form.link)! : undefined,
    };

    try {
      if (isEdit) {
        await updateSyllabus.mutateAsync({
          id: syllabus!.id,
          data: { ...payload, subject_id: subjectId!, _method: 'PUT' },
        });
      } else {
        await createSyllabus.mutateAsync({ ...payload, subject_id: subjectId! });
      }
      onClose();
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? 'Failed to save the syllabus entry. Please try again.');
    }
  };

  // Editing hides the Class/Section cascade, so sectionSubjects/mySubjects never
  // load the currently-assigned subject — without this, the <select> has no
  // <option> matching subjectId and silently falls back to the blank placeholder.
  const subjectOptions = isEdit && syllabus?.subject ? [syllabus.subject] : isTeacher ? mySubjects : sectionSubjects;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100 my-8 max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">{isEdit ? 'Update Syllabus' : 'Add Syllabus'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600 shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto">
          <div className="p-6 sm:p-8 space-y-6">
            {/* Subject — teachers pick from their own assignments; admins cascade Class → Section → Subject. */}
            {!isTeacher && !isEdit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelCls}>Class</label>
                  <Select
                    value={classId ? String(classId) : ''}
                    onChange={v => {
                      setClassId(v ? Number(v) : null);
                      setSectionId(null);
                      setSubjectId(null);
                    }}
                    options={(classes ?? []).map(c => ({ value: String(c.id), label: c.name }))}
                    placeholder="Choose Class"
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>Section</label>
                  <Select
                    value={sectionId ? String(sectionId) : ''}
                    disabled={!classId}
                    onChange={v => {
                      setSectionId(v ? Number(v) : null);
                      setSubjectId(null);
                    }}
                    options={(sections ?? []).map(s => ({ value: String(s.id), label: s.name }))}
                    placeholder="Choose Section"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subject Field */}
              <div className="space-y-2">
                <label className={labelCls}>
                  Subject <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={subjectId ? String(subjectId) : ''}
                  disabled={isEdit || (!isTeacher && !sectionId) || (isTeacher && loadingMine)}
                  onChange={v => {
                    setSubjectId(v ? Number(v) : null);
                    clearError('subject_id');
                  }}
                  options={subjectOptions.map(s => ({ value: String(s.id), label: subjectLabel(s) }))}
                  placeholder={isTeacher && loadingMine ? 'Loading your subjects...' : 'Choose Subject'}
                  error={!!errors.subject_id}
                />
                {errors.subject_id && <p className="text-xs font-bold text-rose-500">{errors.subject_id}</p>}
                {isTeacher && !loadingMine && subjectOptions.length === 0 && (
                  <p className="text-xs font-medium text-amber-600">
                    You have no subjects assigned yet. An admin must assign you one before you can add a syllabus.
                  </p>
                )}
              </div>

              {/* Date Field */}
              <div className="space-y-2">
                <label className={labelCls}>
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.month}
                  onChange={e => set('month', e.target.value)}
                  className={cn(inputCls, errors.month ? errorRing : 'border-transparent')}
                />
                {errors.month && <p className="text-xs font-bold text-rose-500">{errors.month}</p>}
              </div>

              {/* Page Field */}
              <div className="space-y-2">
                <label className={labelCls}>Page</label>
                <input
                  type="text"
                  placeholder="e.g. Page 12 - 45"
                  value={form.page}
                  onChange={e => set('page', e.target.value)}
                  className={cn(inputCls, 'border-transparent')}
                />
              </div>

              {/* Link Field */}
              <div className="space-y-2">
                <label className={labelCls}>Link</label>
                <input
                  type="text"
                  placeholder={URL_PLACEHOLDER}
                  value={form.link}
                  onChange={e => set('link', e.target.value)}
                  className={cn(inputCls, errors.link ? errorRing : 'border-transparent')}
                />
                {errors.link && <p className="text-xs font-bold text-rose-500">{errors.link}</p>}
              </div>
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <label className={labelCls}>
                Content <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={form.content}
                onChange={e => set('content', e.target.value)}
                rows={6}
                placeholder="What does this syllabus entry cover?"
                className={cn(inputCls, 'resize-none', errors.content ? errorRing : 'border-transparent')}
              />
              {errors.content && <p className="text-xs font-bold text-rose-500">{errors.content}</p>}
            </div>

            {submitError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200">
                <AlertCircle className="text-rose-500 shrink-0" size={16} />
                <p className="text-xs font-bold text-rose-600">{submitError}</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl shrink-0">
            <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto shadow-lg shadow-brand-200">
              {isSaving && <Loader2 className="animate-spin mr-2" size={16} />}
              {isEdit ? 'Update' : 'Submit'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────

export const ClassSyllabusManager: React.FC<ClassSyllabusManagerProps> = ({ role }) => {
  const { user } = useAuthStore();
  const { selectedBranchId } = useBranchStore();
  // Teachers and parents get no `branches` list from the API, so fall back to the
  // branch on their own user record.
  const branchId = selectedBranchId ?? user?.branchId ?? 1;

  const isTeacher = role === 'TEACHER';
  const isAdmin = role === 'BRANCH_ADMIN' || role === 'SCHOOL_ADMIN' || role === 'SUPER_ADMIN';
  // Admins write for any subject in their branch; teachers only for their own.
  // The backend enforces the same rule, so a mis-scoped write comes back as a 403.
  const canWrite = isTeacher || isAdmin;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassId, setFilterClassId] = useState<number | null>(null);
  const [filterSectionId, setFilterSectionId] = useState<number | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SyllabusData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SyllabusData | null>(null);

  const { data: classes } = useClasses(branchId);
  const { data: sections } = useSectionsByClass(filterClassId);
  const deleteSyllabus = useDeleteSyllabus();

  // The backend scopes by role, so one query serves teacher, parent and admin.
  const { data, isLoading, error } = useSyllabuses({
    ...(isTeacher ? {} : { branch_id: branchId }),
    ...(filterSectionId ? { section_id: filterSectionId } : {}),
  });

  const entries = data?.data ?? [];

  const filteredList = entries.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (s.subject?.subject_name ?? '').toLowerCase().includes(q) || s.content.toLowerCase().includes(q);
  });

  /**
   * Admins may manage any entry in their branch — the list is already branch-scoped.
   * A teacher may only manage entries for subjects they actually teach, so we never
   * show them a button the API would reject.
   */
  const canManage = (s: SyllabusData) => {
    if (isAdmin) return true;
    return isTeacher && Number(s.subject?.teacher_id) === Number(user?.id);
  };

  const heading = isTeacher
    ? 'Add syllabus content for the subjects you teach'
    : role === 'PARENT'
      ? "Your children's class syllabus"
      : 'Manage syllabus content, pages, and links';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center sm:text-left">Class Syllabus</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base text-center sm:text-left">{heading}</p>
        </div>
        {canWrite && (
          <div className="flex justify-center sm:justify-end">
            <Button onClick={() => { setEditTarget(null); setIsFormOpen(true); }} leftIcon={<Plus size={18} />}>
              Add Syllabus
            </Button>
          </div>
        )}
      </div>

      {/* Admins can narrow to a class/section. Teachers and parents are already scoped. */}
      {isAdmin && (
        <Card className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            <label className={labelCls}>Class</label>
            <Select
              value={filterClassId ? String(filterClassId) : ''}
              onChange={v => {
                setFilterClassId(v ? Number(v) : null);
                setFilterSectionId(null);
              }}
              options={(classes ?? []).map(c => ({ value: String(c.id), label: c.name }))}
              placeholder="All Classes"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className={labelCls}>Section</label>
            <Select
              value={filterSectionId ? String(filterSectionId) : ''}
              disabled={!filterClassId}
              onChange={v => setFilterSectionId(v ? Number(v) : null)}
              options={(sections ?? []).map(s => ({ value: String(s.id), label: s.name }))}
              placeholder="All Sections"
            />
          </div>
        </Card>
      )}

      <Card padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="Search syllabus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}
          </div>
        ) : error ? (
          <div className="p-16 text-center">
            <AlertCircle className="mx-auto text-rose-400 mb-3" size={32} />
            <p className="text-sm font-bold text-rose-500">Failed to load the syllabus. Please try again.</p>
          </div>
        ) : filteredList.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Syllabus Found"
            description={
              searchQuery
                ? 'No syllabus matches your search.'
                : canWrite
                  ? 'None has been added yet. Add your first entry.'
                  : 'None has been added yet.'
            }
            actionLabel={searchQuery ? 'Clear Search' : canWrite ? 'Add Syllabus' : undefined}
            onAction={searchQuery ? () => setSearchQuery('') : canWrite ? () => { setEditTarget(null); setIsFormOpen(true); } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[25%]">Subject & Date</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Page</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[40%]">Content</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right w-[20%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.subject?.subject_name ?? 'Subject'}</p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {[item.subject?.class?.name, item.subject?.section?.name].filter(Boolean).join(' / ')}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5 text-xs font-medium text-slate-500">
                            <Calendar size={12} />
                            {item.month}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">{item.page || '-'}</p>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noreferrer noopener" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-500 hover:text-brand-600 mt-1 transition-colors">
                          <ExternalLink size={10} /> Link
                        </a>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-slate-500 font-medium line-clamp-2 whitespace-pre-wrap">
                        {item.content || <span className="italic text-slate-400">No content provided</span>}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {canManage(item) ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditTarget(item); setIsFormOpen(true); }}
                            className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider',
                            item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          )}
                        >
                          {item.status ?? 'Pending'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AnimatePresence>
        {isFormOpen && (
          <SyllabusFormModal
            syllabus={editTarget ?? undefined}
            branchId={branchId}
            isTeacher={isTeacher}
            onClose={() => { setIsFormOpen(false); setEditTarget(null); }}
          />
        )}
      </AnimatePresence>

      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteSyllabus.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Delete Syllabus"
        message="Are you sure you want to delete this syllabus item? This action cannot be undone."
        isLoading={deleteSyllabus.isPending}
      />
    </div>
  );
};
