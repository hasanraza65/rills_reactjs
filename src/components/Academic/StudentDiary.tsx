import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  FileText,
  BookOpen,
  Link as LinkIcon,
  Edit2,
  Trash2,
  Loader2,
  X,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, UserRole } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';
import { useAuthStore } from '../../store/use-auth-store';
import { useBranchStore } from '../../store/use-branch-store';
import { useDiaries, useCreateDiary, useUpdateDiary, useDeleteDiary } from '../../hooks/use-diary';
import { useClasses } from '../../hooks/use-class';
import { useSectionsByClass } from '../../hooks/use-section';
import { useClassSubjects, useMySubjects } from '../../hooks/use-class-subject';
import { isUrl, normalizeUrl, URL_ERROR, URL_PLACEHOLDER } from '../../lib/validations/url';
import type { DiaryData } from '../../types/api/diary';
import type { ClassSubjectData } from '../../types/api/class-subject';

interface StudentDiaryProps {
  role: UserRole;
}

const today = () => new Date().toISOString().split('T')[0];

type DiaryFormState = {
  topic: string;
  page_number: string;
  resources: string;
  date: string;
  link: string;
  activity: string;
  home_work: string;
};

const emptyForm = (): DiaryFormState => ({
  topic: '', page_number: '', resources: '', date: today(), link: '', activity: '', home_work: '',
});

const inputCls =
  "w-full px-4 py-3 bg-slate-50 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm border";
const errorRing = "border-rose-400 bg-rose-50/50";
const labelCls = "text-xs font-bold text-slate-500 uppercase tracking-wider";

/** Describes a subject as "Maths — Grade 1 / A". */
const subjectLabel = (s: Pick<ClassSubjectData, 'subject_name' | 'class' | 'section'>) => {
  const where = [s.class?.name, s.section?.name].filter(Boolean).join(' / ');
  return where ? `${s.subject_name} — ${where}` : s.subject_name;
};

// ─── Form Modal (create + edit) ──────────────────────────────────────────────

const DiaryFormModal: React.FC<{
  diary?: DiaryData;
  branchId: number;
  isTeacher: boolean;
  onClose: () => void;
}> = ({ diary, branchId, isTeacher, onClose }) => {
  const isEdit = !!diary;
  const { user } = useAuthStore();

  const [classId, setClassId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(diary?.class_subject_id ?? null);

  const [form, setForm] = useState<DiaryFormState>(
    diary
      ? {
          topic: diary.topic ?? '',
          page_number: diary.page_number ?? '',
          resources: diary.resources ?? '',
          date: diary.date ?? today(),
          link: diary.link ?? '',
          activity: diary.activity ?? '',
          home_work: diary.home_work ?? '',
        }
      : emptyForm()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createDiary = useCreateDiary();
  const updateDiary = useUpdateDiary();
  const isSaving = createDiary.isPending || updateDiary.isPending;

  // A teacher picks from their own assignments — their user row has no branch, so the
  // branch-scoped class/section lists would come back empty for them.
  const { data: mySubjectsResp, isLoading: loadingMine } = useMySubjects(isTeacher);
  const mySubjects = mySubjectsResp?.data ?? [];

  const { data: classes } = useClasses(branchId);
  const { data: sections } = useSectionsByClass(classId);
  const { data: sectionSubjectsResp } = useClassSubjects(isTeacher ? null : sectionId);
  const sectionSubjects = sectionSubjectsResp?.data ?? [];

  const clearError = (field: string) =>
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const set = (field: keyof DiaryFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const validate = () => {
    const found: Record<string, string> = {};
    if (!subjectId) found.class_subject_id = 'Select a subject.';
    if (!form.topic.trim()) found.topic = 'Topic is required.';
    if (!form.date) found.date = 'Date is required.';
    if (form.link.trim() && !isUrl(form.link)) found.link = URL_ERROR;
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    const payload = {
      topic: form.topic.trim(),
      date: form.date,
      page_number: form.page_number.trim() || undefined,
      resources: form.resources.trim() || undefined,
      link: form.link.trim() ? normalizeUrl(form.link)! : undefined,
      activity: form.activity.trim() || undefined,
      home_work: form.home_work.trim() || undefined,
    };

    try {
      if (isEdit) {
        await updateDiary.mutateAsync({
          id: diary!.id,
          data: { ...payload, class_subject_id: subjectId!, _method: 'PUT' },
        });
      } else {
        await createDiary.mutateAsync({ ...payload, class_subject_id: subjectId! });
      }
      onClose();
    } catch (err: any) {
      // The backend returns 422 with a message for a duplicate (subject, date).
      setSubmitError(err?.response?.data?.message ?? 'Failed to save the diary. Please try again.');
    }
  };

  const subjectOptions = isTeacher ? mySubjects : sectionSubjects;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100 max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-0.5">Daily Diary</p>
            <h3 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit Entry' : 'New Entry'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Subject — teachers pick from their own assignments; admins cascade Class → Section → Subject. */}
            {!isTeacher && !isEdit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>Class</label>
                  <select
                    value={classId ?? ''}
                    onChange={e => {
                      setClassId(e.target.value ? Number(e.target.value) : null);
                      setSectionId(null);
                      setSubjectId(null);
                    }}
                    className={cn(inputCls, "border-transparent appearance-none")}
                  >
                    <option value="">Choose Class</option>
                    {(classes ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Section</label>
                  <select
                    value={sectionId ?? ''}
                    disabled={!classId}
                    onChange={e => {
                      setSectionId(e.target.value ? Number(e.target.value) : null);
                      setSubjectId(null);
                    }}
                    className={cn(inputCls, "border-transparent appearance-none disabled:opacity-50")}
                  >
                    <option value="">Choose Section</option>
                    {(sections ?? []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className={labelCls}>
                Subject <span className="text-rose-500">*</span>
              </label>
              <select
                value={subjectId ?? ''}
                disabled={isEdit || (!isTeacher && !sectionId) || (isTeacher && loadingMine)}
                onChange={e => {
                  setSubjectId(e.target.value ? Number(e.target.value) : null);
                  clearError('class_subject_id');
                }}
                className={cn(
                  inputCls,
                  "appearance-none disabled:opacity-50",
                  errors.class_subject_id ? errorRing : "border-transparent"
                )}
              >
                <option value="">
                  {isTeacher && loadingMine ? 'Loading your subjects...' : 'Choose Subject'}
                </option>
                {subjectOptions.map(s => (
                  <option key={s.id} value={s.id}>{subjectLabel(s)}</option>
                ))}
              </select>
              {errors.class_subject_id && (
                <p className="text-xs font-bold text-rose-500">{errors.class_subject_id}</p>
              )}
              {isTeacher && !loadingMine && subjectOptions.length === 0 && (
                <p className="text-xs font-medium text-amber-600">
                  You have no subjects assigned yet. An admin must assign you one before you can write a diary.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-1">
                <label className={labelCls}>
                  Topic <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.topic}
                  onChange={e => set('topic', e.target.value)}
                  placeholder="Topic"
                  className={cn(inputCls, errors.topic ? errorRing : "border-transparent")}
                />
                {errors.topic && <p className="text-xs font-bold text-rose-500">{errors.topic}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Page Number</label>
                <input
                  value={form.page_number}
                  onChange={e => set('page_number', e.target.value)}
                  placeholder="e.g 1-3"
                  className={cn(inputCls, "border-transparent")}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Resources</label>
                <input
                  value={form.resources}
                  onChange={e => set('resources', e.target.value)}
                  placeholder="e.g Book"
                  className={cn(inputCls, "border-transparent")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                  className={cn(inputCls, errors.date ? errorRing : "border-transparent")}
                />
                {errors.date && <p className="text-xs font-bold text-rose-500">{errors.date}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Link</label>
                <input
                  value={form.link}
                  onChange={e => set('link', e.target.value)}
                  placeholder={URL_PLACEHOLDER}
                  className={cn(inputCls, errors.link ? errorRing : "border-transparent")}
                />
                {errors.link && <p className="text-xs font-bold text-rose-500">{errors.link}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Activity</label>
                <textarea
                  value={form.activity}
                  onChange={e => set('activity', e.target.value)}
                  rows={4}
                  className={cn(inputCls, "border-transparent resize-none")}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Home Work</label>
                <textarea
                  value={form.home_work}
                  onChange={e => set('home_work', e.target.value)}
                  rows={4}
                  className={cn(inputCls, "border-transparent resize-none")}
                />
              </div>
            </div>

            {submitError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200">
                <AlertCircle className="text-rose-500 shrink-0" size={16} />
                <p className="text-xs font-bold text-rose-600">{submitError}</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="animate-spin" size={16} />}
              {isEdit ? 'Save Changes' : 'Submit'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Diary Card ──────────────────────────────────────────────────────────────

const DiaryCard: React.FC<{
  diary: DiaryData;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}> = ({ diary, canManage, onEdit, onDelete, index }) => {
  const cs = diary.class_subject;
  const where = [cs?.class?.name, cs?.section?.name].filter(Boolean).join(' / ');

  const details = [
    { label: 'Home Work', value: diary.home_work },
    { label: 'Page Number', value: diary.page_number },
    { label: 'Resources', value: diary.resources },
  ].filter(d => d.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">
              {cs?.subject_name?.charAt(0) ?? <BookOpen size={18} />}
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-800">{cs?.subject_name ?? 'Subject'}</p>
              <p className="text-xs text-slate-400 font-medium">
                {where || '—'} • {diary.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                diary.status === 'Approved'
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              )}
            >
              {diary.status ?? 'Pending'}
            </span>
            {canManage && (
              <>
                <button
                  onClick={onEdit}
                  title="Edit entry"
                  className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={onDelete}
                  title="Delete entry"
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-800">{diary.topic}</h4>
          {diary.activity && (
            <p className="mt-2 text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-2xl p-4 whitespace-pre-wrap">
              {diary.activity}
            </p>
          )}
        </div>

        {(details.length > 0 || diary.link) && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            {details.map(d => (
              <div key={d.label} className="flex gap-3 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider w-28 shrink-0">{d.label}</span>
                <span className="font-medium text-slate-700 whitespace-pre-wrap">{d.value}</span>
              </div>
            ))}
            {diary.link && (
              <div className="flex gap-3 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider w-28 shrink-0">Link</span>
                <a
                  href={diary.link}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-bold text-brand-600 hover:underline break-all flex items-center gap-1"
                >
                  <LinkIcon size={12} className="shrink-0" />
                  {diary.link}
                </a>
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────

export const StudentDiary: React.FC<StudentDiaryProps> = ({ role }) => {
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

  const [date, setDate] = useState<string>(today());
  const [filterClassId, setFilterClassId] = useState<number | null>(null);
  const [filterSectionId, setFilterSectionId] = useState<number | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DiaryData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DiaryData | null>(null);

  const { data: classes } = useClasses(branchId);
  const { data: sections } = useSectionsByClass(filterClassId);
  const deleteDiary = useDeleteDiary();

  // The backend scopes by role, so one query serves teacher, parent and admin.
  const { data, isLoading, error } = useDiaries({
    ...(isTeacher ? {} : { branch_id: branchId }),
    date,
    ...(filterSectionId ? { section_id: filterSectionId } : {}),
  });

  const diaries = data?.data ?? [];

  /**
   * Admins may manage any entry in their branch — the list is already branch-scoped.
   * A teacher may only manage entries for subjects they actually teach, so we never
   * show them a button the API would reject.
   */
  const canManage = (d: DiaryData) => {
    if (isAdmin) return true;
    return isTeacher && Number(d.class_subject?.teacher_id) === Number(user?.id);
  };

  const heading = useMemo(() => {
    if (isTeacher) return 'Write today\'s diary for your classes';
    if (role === 'PARENT') return "Your children's daily diary";
    return 'Create and review the daily diary for your branch';
  }, [isTeacher, role]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Daily Diary</h2>
          <p className="text-slate-500 text-sm font-medium">{heading}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          {canWrite && (
            <Button leftIcon={<Plus size={18} />} onClick={() => { setEditTarget(null); setIsFormOpen(true); }}>
              Add Entry
            </Button>
          )}
        </div>
      </div>

      {/* Admins can narrow to a class/section. Teachers and parents are already scoped. */}
      {isAdmin && (
        <Card className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            <label className={labelCls}>Class</label>
            <select
              value={filterClassId ?? ''}
              onChange={e => {
                setFilterClassId(e.target.value ? Number(e.target.value) : null);
                setFilterSectionId(null);
              }}
              className={cn(inputCls, "border-transparent appearance-none")}
            >
              <option value="">All Classes</option>
              {(classes ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className={labelCls}>Section</label>
            <select
              value={filterSectionId ?? ''}
              disabled={!filterClassId}
              onChange={e => setFilterSectionId(e.target.value ? Number(e.target.value) : null)}
              className={cn(inputCls, "border-transparent appearance-none disabled:opacity-50")}
            >
              <option value="">All Sections</option>
              {(sections ?? []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
        </div>
      ) : error ? (
        <Card className="text-center py-12">
          <AlertCircle className="mx-auto text-rose-400 mb-3" size={32} />
          <p className="text-sm font-bold text-rose-500">Failed to load the diary. Please try again.</p>
        </Card>
      ) : diaries.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Diary Entries"
          description={
            !canWrite
              ? `No entries have been recorded for ${date}.`
              : isTeacher
                ? `Nothing recorded for ${date}. Add an entry for your class.`
                : `Nothing recorded for ${date}. Add an entry for any class in this branch.`
          }
          actionLabel={canWrite ? 'Add Entry' : undefined}
          onAction={canWrite ? () => { setEditTarget(null); setIsFormOpen(true); } : undefined}
        />
      ) : (
        <div className="space-y-4">
          {diaries.map((d, i) => (
            <DiaryCard
              key={d.id}
              diary={d}
              index={i}
              canManage={canManage(d)}
              onEdit={() => { setEditTarget(d); setIsFormOpen(true); }}
              onDelete={() => setDeleteTarget(d)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {isFormOpen && (
          <DiaryFormModal
            diary={editTarget ?? undefined}
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
          await deleteDiary.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Delete Diary Entry"
        message={`Delete the entry for "${deleteTarget?.topic ?? ''}"? This cannot be undone.`}
        isLoading={deleteDiary.isPending}
      />
    </div>
  );
};
