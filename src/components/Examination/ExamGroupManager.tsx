import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Award,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  CalendarClock,
  FileSpreadsheet,
  Printer,
  Save,
  Copy,
  ClipboardList,
  Users,
  Loader2,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';
import { useBranchStore } from '../../store/use-branch-store';
import { useClasses } from '../../hooks/use-class';
import { useSections } from '../../hooks/use-section';
import { useBranchSubjects } from '../../hooks/use-class-subject';
import { useStaffMembers } from '../../hooks/use-staff-members';
import {
  useExamGroups,
  useCreateExamGroup,
  useUpdateExamGroup,
  useExamGroupExams,
  useCreateExamGroupExam,
  useUpdateExamGroupExam,
  useDeleteExamGroupExam,
} from '../../hooks/use-exam-group';
import { useExamSchedules, useBulkSaveExamSchedule } from '../../hooks/use-exam-schedule';
import { useMarksheet, useBulkSaveExamMarks } from '../../hooks/use-exam-mark';
import { useAcademicSessions } from '../../hooks/use-academic-session';
import { ExamGroup, ExamGroupExam, ExamSchedule, ExamType, calculateGrade } from '../../types/api/exam';

const TEACHER_ROLE_ID = 4;

/* ---------------------------------------------------------------------- */
/* Shared bits                                                             */
/* ---------------------------------------------------------------------- */

const PublishBadge: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
      active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
    }`}
  >
    {active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
    {label}
  </span>
);

/** Which classes an exam has actually been scheduled for, as live chips — replaces a
 * static "Schedule" flag with the real, growing list as each class gets done. */
const ScheduledClasses: React.FC<{ examId: number }> = ({ examId }) => {
  const { data: schedulesResp } = useExamSchedules({ exam_group_exam_id: examId });
  const schedules = schedulesResp ?? [];

  const classNames = useMemo(() => {
    const seen = new Map<number, string>();
    schedules.forEach((s) => {
      if (!seen.has(s.class_id)) seen.set(s.class_id, s.school_class?.name ?? `Class ${s.class_id}`);
    });
    return Array.from(seen.values());
  }, [schedules]);

  if (classNames.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-400">
        <XCircle size={12} /> Not scheduled yet
      </span>
    );
  }

  return (
    <>
      {classNames.map((name) => (
        <span key={name} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={12} /> {name}
        </span>
      ))}
    </>
  );
};

interface RowDraft {
  subjectName: string;
  existingId?: number;
  date: string;
  startTime: string;
  duration: string;
  teacherId: string;
  teacherName: string;
  marksMax: string;
  marksMin: string;
}

/* ---------------------------------------------------------------------- */
/* Add / Continue wizard — Exam Info → Schedule, one modal. There's no      */
/* separate "Exam Group" step for the user to fill in any more: each exam   */
/* still has one behind-the-scenes group record (existing schedules/        */
/* marksheet code is keyed off it), but it's created transparently from the */
/* same form instead of being its own step.                                */
/* ---------------------------------------------------------------------- */

interface WizardModalProps {
  branchId: number;
  /** Set only when re-opening an already-created exam to schedule another class/section. */
  initial?: { group: ExamGroup; exam: ExamGroupExam };
  onClose: () => void;
}

const WizardModal: React.FC<WizardModalProps> = ({ branchId, initial, onClose }) => {
  // Two unrelated purposes sharing one modal shell:
  //  - no `initial` → the create form below (Add Exam). Submitting it creates the exam
  //    and closes — scheduling is a separate, later action from the exam's own row.
  //  - `initial` set → jumps straight to ScheduleStep for an exam that already exists
  //    (the "Schedule" button on an exam row).
  const createGroup = useCreateExamGroup();
  const createExam = useCreateExamGroupExam();
  const isCreating = createGroup.isPending || createExam.isPending;

  const { data: sessionsResp } = useAcademicSessions(branchId);
  const sessions = sessionsResp ?? [];
  const activeSession = sessions.find((s) => s.is_active) ?? null;

  const [form, setForm] = useState({
    name: '',
    academicSessionId: '',
    publish_exam: false,
    publish_schedule: false,
    publish_result: false,
    description: '',
  });

  // Defaults to whichever session is currently marked Active, the moment sessions load —
  // still overridable via the dropdown below.
  useEffect(() => {
    if (activeSession && !form.academicSessionId) {
      setForm((f) => ({ ...f, academicSessionId: String(activeSession.id) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    // No separate "Exam Type" field — the Name doubles as the type (e.g. "Mid Term",
    // "Final Term"), which is how this was actually being filled in anyway.
    const newGroup = await createGroup.mutateAsync({
      branch_id: branchId,
      academic_session_id: form.academicSessionId ? Number(form.academicSessionId) : null,
      name: form.name,
      exam_type: form.name as ExamType,
      description: form.description,
    });
    await createExam.mutateAsync({
      exam_group_id: newGroup.id,
      name: form.name,
      publish_exam: form.publish_exam,
      publish_schedule: form.publish_schedule,
      publish_result: form.publish_result,
      description: form.description,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`bg-white w-full ${initial ? 'w-[96vw] max-w-[1500px]' : 'max-w-lg'} max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100 flex flex-col`}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <h3 className="text-lg font-bold text-slate-900">{initial ? 'Schedule Exam' : 'Add Exam'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
            <X size={20} />
          </button>
        </div>

        {!initial ? (
          <form onSubmit={handleCreate} className="flex flex-col overflow-hidden">
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoFocus
                  placeholder="e.g. Mid Term Examination 2026"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Academic Session</label>
                <Select
                  value={form.academicSessionId}
                  onChange={(v) => setForm({ ...form, academicSessionId: v })}
                  options={sessions.map((s) => ({ value: String(s.id), label: s.is_active ? `${s.name} (Active)` : s.name }))}
                  placeholder={sessions.length ? 'Select session' : 'No sessions yet — see System Settings'}
                  disabled={sessions.length === 0}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Publish Settings</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'publish_exam', label: 'Publish Exam' },
                      { key: 'publish_schedule', label: 'Publish Exam Schedule' },
                      { key: 'publish_result', label: 'Publish Result' },
                    ] as const
                  ).map((opt) => (
                    <label
                      key={opt.key}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                        form[opt.key] ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form[opt.key]}
                        onChange={(e) => setForm({ ...form, [opt.key]: e.target.checked })}
                        className="accent-brand-500"
                      />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="What this exam covers..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 resize-none"
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" isLoading={isCreating}>Create Exam</Button>
            </div>
          </form>
        ) : (
          <ScheduleStep branchId={branchId} group={initial.group} exam={initial.exam} onClose={onClose} />
        )}
      </motion.div>
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/* Wizard step 2 — the bulk row-editor, scoped to one exam and stamping     */
/* exam_group_exam_id onto everything it saves.                            */
/* ---------------------------------------------------------------------- */

const ScheduleStep: React.FC<{
  branchId: number;
  group: ExamGroup;
  exam: ExamGroupExam;
  onClose: () => void;
}> = ({ branchId, group, exam, onClose }) => {
  const { data: classes } = useClasses(branchId);
  const { data: sections } = useSections(branchId);
  const { data: staff } = useStaffMembers(branchId);
  const teachers = (staff ?? []).filter((t) => t.user_role === TEACHER_ROLE_ID);

  // Just a Class — the schedule you fill in below applies to every section of that
  // class in one Save. To do another class, reopen "Schedule" from that exam's row.
  const [classId, setClassId] = useState('');
  const [searched, setSearched] = useState(false);
  const [rows, setRows] = useState<RowDraft[]>([]);
  const [editingNames, setEditingNames] = useState<Set<string>>(new Set());
  const [copyFromClassId, setCopyFromClassId] = useState('');

  // Every schedule row this exam has anywhere, across every class already done —
  // lets a class that's already been scheduled be copied straight into a new one
  // instead of re-typing the same dates/times/marks again.
  const { data: allExamSchedulesResp } = useExamSchedules({ exam_group_exam_id: exam.id });
  const allExamSchedules = allExamSchedulesResp ?? [];
  const copyFromOptions = Array.from(new Set(allExamSchedules.map((e) => e.class_id)))
    .filter((id) => String(id) !== classId)
    .map((id) => ({ value: String(id), label: allExamSchedules.find((e) => e.class_id === id)?.school_class?.name ?? `Class ${id}` }));

  const classSections = (sections ?? []).filter((s) => classId && String(s.school_class_id) === classId);

  const { data: allSubjectsResp } = useBranchSubjects(branchId);
  // Every class_subjects row across every section of the picked class — a "subject
  // row" below represents one subject *name*; saving applies it to every section
  // that has a matching subject (matched by name, since each section has its own id).
  const classSubjects = (allSubjectsResp?.data ?? []).filter((s) => classId && s.class_id === Number(classId));
  const subjectNames = Array.from(new Set(classSubjects.map((s) => s.subject_name))).sort();

  const { data: examsResp } = useExamSchedules(
    searched && classId ? { branch_id: branchId, exam_type: group.exam_type, class_id: Number(classId) } : {}
  );
  const existingExams = searched ? examsResp ?? [] : [];
  const bulkSave = useBulkSaveExamSchedule();

  // Searches automatically the moment a Class is picked — no separate click needed.
  useEffect(() => {
    if (classId) setSearched(true);
  }, [classId]);

  useEffect(() => {
    if (!searched || subjectNames.length === 0) {
      setRows([]);
      return;
    }
    // One existing schedule row per subject name, as a representative default (picks
    // whichever section's entry comes first if they happen to differ across sections).
    const existingByName = new Map<string, ExamSchedule>();
    existingExams.forEach((e) => {
      if (!existingByName.has(e.subject?.subject_name ?? '')) existingByName.set(e.subject?.subject_name ?? '', e);
    });
    setRows(
      subjectNames.map((name) => {
        const existing = existingByName.get(name);
        const template = classSubjects.find((s) => s.subject_name === name);
        return {
          subjectName: name,
          existingId: existing?.id,
          date: existing?.date ?? '',
          startTime: existing?.start_time ?? '',
          duration: existing?.duration ?? '',
          teacherId: existing ? String(existing.teacher_id ?? '') : String(template?.teacher?.id ?? ''),
          teacherName: existing?.teacher?.name ?? template?.teacher?.name ?? '',
          marksMax: existing ? String(existing.total_marks) : '',
          marksMin: existing ? String(existing.min_marks) : '0',
        };
      })
    );
    setEditingNames(new Set(subjectNames.filter((name) => !existingByName.has(name))));
    setCopyFromClassId('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searched, classId, existingExams]);

  /** Fills every matching row (by subject name) from another class's already-saved
   * schedule for this same exam — still needs Save to actually persist for this class. */
  const handleCopyFromClass = () => {
    if (!copyFromClassId) return;
    const sourceByName = new Map<string, ExamSchedule>();
    allExamSchedules
      .filter((e) => e.class_id === Number(copyFromClassId))
      .forEach((e) => {
        const name = e.subject?.subject_name ?? '';
        if (name && !sourceByName.has(name)) sourceByName.set(name, e);
      });

    setRows((prev) =>
      prev.map((row) => {
        const source = sourceByName.get(row.subjectName);
        if (!source) return row;
        return {
          ...row,
          date: source.date,
          startTime: source.start_time,
          duration: source.duration ?? '',
          teacherId: String(source.teacher_id ?? ''),
          teacherName: source.teacher?.name ?? '',
          marksMax: String(source.total_marks),
          marksMin: String(source.min_marks),
        };
      })
    );
    setEditingNames((prev) => {
      const next = new Set(prev);
      sourceByName.forEach((_v, name) => next.add(name));
      return next;
    });
  };

  const updateRow = (subjectName: string, patch: Partial<RowDraft>) => {
    setRows((prev) => prev.map((r) => (r.subjectName === subjectName ? { ...r, ...patch } : r)));
  };

  const removeRow = (subjectName: string) => {
    setRows((prev) => prev.filter((r) => r.subjectName !== subjectName));
  };

  const editRow = (subjectName: string) => setEditingNames((prev) => new Set(prev).add(subjectName));

  const copyToNextRow = (subjectName: string) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.subjectName === subjectName);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const source = prev[idx];
      const next = [...prev];
      next[idx + 1] = {
        ...next[idx + 1],
        date: source.date,
        startTime: source.startTime,
        duration: source.duration,
        teacherId: source.teacherId,
        teacherName: source.teacherName,
        marksMax: source.marksMax,
        marksMin: source.marksMin,
      };
      return next;
    });
  };

  const handleSave = async () => {
    if (!classId || classSections.length === 0) return;
    const rowsWithData = rows.filter((row) => row.date && row.startTime && row.marksMax);
    if (rowsWithData.length === 0) return;

    // One bulk-save call per section — each section's own subject id (matched by name)
    // gets the same date/time/teacher/marks entered once above.
    await Promise.all(
      classSections.map((section) => {
        const sectionSubjects = classSubjects.filter((s) => s.section_id === section.id);
        const sectionRows = rowsWithData
          .map((row) => {
            const match = sectionSubjects.find((s) => s.subject_name === row.subjectName);
            if (!match) return null;
            return {
              subject_id: match.id,
              date: row.date,
              start_time: row.startTime,
              duration: row.duration,
              teacher_id: row.teacherId ? Number(row.teacherId) : null,
              total_marks: Number(row.marksMax),
              min_marks: Number(row.marksMin || 0),
            };
          })
          .filter((r): r is NonNullable<typeof r> => r !== null);

        if (sectionRows.length === 0) return Promise.resolve();
        return bulkSave.mutateAsync({
          branch_id: branchId,
          exam_type: group.exam_type,
          exam_group_exam_id: exam.id,
          class_id: Number(classId),
          section_id: section.id,
          rows: sectionRows,
        });
      })
    );
    onClose();
  };

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="p-6 overflow-y-auto space-y-6">
        <div className="px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold">
          {exam.name} &middot; {group.exam_type}
        </div>

        <div className="space-y-2 max-w-sm">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Class</label>
          <Select
            value={classId}
            onChange={(v) => { setClassId(v); setSearched(false); }}
            options={(classes ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
            placeholder="Select class"
          />
          {classId && (
            <p className="text-xs text-slate-500 font-medium">
              Applies to all {classSections.length} section{classSections.length === 1 ? '' : 's'} of this class: {classSections.map((s) => s.name).join(', ') || '—'}
            </p>
          )}
        </div>

        {searched && rows.length > 0 && copyFromOptions.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="space-y-2 flex-1 max-w-sm">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Copy Schedule From</label>
              <Select
                value={copyFromClassId}
                onChange={setCopyFromClassId}
                options={copyFromOptions}
                placeholder="Select a class already scheduled"
              />
            </div>
            <Button type="button" variant="outline" onClick={handleCopyFromClass} disabled={!copyFromClassId} leftIcon={<Copy size={16} />}>
              Copy
            </Button>
          </div>
        )}

        {!searched ? (
          <EmptyState
            icon={CalendarClock}
            title="Pick a Class"
            description="Every student in every section of the class you pick gets this exam — select a class above and every subject loads automatically."
          />
        ) : rows.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No Subjects Found" description="This class has no subjects set up yet." />
        ) : (
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[13%]">Subject</th>
                    <th className="px-2 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[12%]">Date</th>
                    <th className="px-2 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[11%]">Start Time</th>
                    <th className="px-2 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[12%]">Duration</th>
                    <th className="px-2 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[17%]">Teacher</th>
                    <th className="px-2 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[10%]">Marks (Max.)</th>
                    <th className="px-2 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[10%]">Marks (Min.)</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map((row, idx) => {
                    const isEditing = editingNames.has(row.subjectName);
                    if (!isEditing) {
                      return (
                        <tr key={row.subjectName} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3"><p className="text-sm font-bold text-slate-800">{row.subjectName}</p></td>
                          <td className="px-2 py-3"><p className="text-xs font-semibold text-slate-600">{row.date || '—'}</p></td>
                          <td className="px-2 py-3"><p className="text-xs font-semibold text-slate-600">{row.startTime || '—'}</p></td>
                          <td className="px-2 py-3"><p className="text-xs font-semibold text-slate-600">{row.duration || '—'}</p></td>
                          <td className="px-2 py-3"><p className="text-xs font-semibold text-slate-600 truncate">{row.teacherName || '—'}</p></td>
                          <td className="px-2 py-3"><p className="text-xs font-bold text-slate-700">{row.marksMax}</p></td>
                          <td className="px-2 py-3"><p className="text-xs font-bold text-slate-700">{row.marksMin}</p></td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => editRow(row.subjectName)} title="Edit this row" className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => removeRow(row.subjectName)} title="Remove this subject from the schedule" className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={row.subjectName} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3"><p className="text-sm font-bold text-slate-800">{row.subjectName}</p></td>
                        <td className="px-2 py-3">
                          <input type="date" value={row.date} onChange={(e) => updateRow(row.subjectName, { date: e.target.value })}
                            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20" />
                        </td>
                        <td className="px-2 py-3">
                          <input type="time" value={row.startTime} onChange={(e) => updateRow(row.subjectName, { startTime: e.target.value })}
                            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20" />
                        </td>
                        <td className="px-2 py-3">
                          <input type="text" value={row.duration} onChange={(e) => updateRow(row.subjectName, { duration: e.target.value })} placeholder="e.g. 1h 30m"
                            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20" />
                        </td>
                        <td className="px-2 py-3">
                          <Select
                            value={row.teacherId}
                            onChange={(v) => {
                              const t = teachers.find((tt) => String(tt.id) === v);
                              updateRow(row.subjectName, { teacherId: v, teacherName: t?.name ?? '' });
                            }}
                            options={teachers.map((t) => ({ value: String(t.id), label: t.name }))}
                            placeholder="Select"
                            size="sm"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input type="number" min={0} value={row.marksMax} onChange={(e) => updateRow(row.subjectName, { marksMax: e.target.value })}
                            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20" />
                        </td>
                        <td className="px-2 py-3">
                          <input type="number" min={0} value={row.marksMin} onChange={(e) => updateRow(row.subjectName, { marksMin: e.target.value })}
                            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => copyToNextRow(row.subjectName)} disabled={idx === rows.length - 1} title="Copy to next row"
                              className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent">
                              <Copy size={16} />
                            </button>
                            <button onClick={() => removeRow(row.subjectName)} title="Remove this subject from the schedule" className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} leftIcon={<Save size={18} />} isLoading={bulkSave.isPending} disabled={rows.length === 0}>
          Save
        </Button>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/* Edit — one form for the exam's name/type/publish settings/description,  */
/* updating both the exam and its behind-the-scenes group record together. */
/* ---------------------------------------------------------------------- */

const EditExamModal: React.FC<{ branchId: number; group: ExamGroup; exam: ExamGroupExam; onClose: () => void }> = ({ branchId, group, exam, onClose }) => {
  const updateGroup = useUpdateExamGroup();
  const updateExam = useUpdateExamGroupExam();
  const isSaving = updateGroup.isPending || updateExam.isPending;

  const { data: sessionsResp } = useAcademicSessions(branchId);
  const sessions = sessionsResp ?? [];

  const [form, setForm] = useState({
    name: exam.name,
    academicSessionId: group.academic_session_id ? String(group.academic_session_id) : '',
    publish_exam: exam.publish_exam,
    publish_schedule: exam.publish_schedule,
    publish_result: exam.publish_result,
    description: exam.description ?? '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // No separate "Exam Type" field — Name doubles as the type, kept in sync here too.
    await Promise.all([
      updateGroup.mutateAsync({
        id: group.id,
        data: {
          academic_session_id: form.academicSessionId ? Number(form.academicSessionId) : null,
          name: form.name,
          exam_type: form.name as ExamType,
          description: form.description,
        },
      }),
      updateExam.mutateAsync({
        id: exam.id,
        data: {
          name: form.name,
          publish_exam: form.publish_exam,
          publish_schedule: form.publish_schedule,
          publish_result: form.publish_result,
          description: form.description,
        },
      }),
    ]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Edit Exam</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Academic Session</label>
              <Select
                value={form.academicSessionId}
                onChange={(v) => setForm({ ...form, academicSessionId: v })}
                options={sessions.map((s) => ({ value: String(s.id), label: s.is_active ? `${s.name} (Active)` : s.name }))}
                placeholder={sessions.length ? 'Select session' : 'No sessions yet — see System Settings'}
                disabled={sessions.length === 0}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Publish Settings</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(
                  [
                    { key: 'publish_exam', label: 'Publish Exam' },
                    { key: 'publish_schedule', label: 'Publish Exam Schedule' },
                    { key: 'publish_result', label: 'Publish Result' },
                  ] as const
                ).map((opt) => (
                  <label key={opt.key} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                    form[opt.key] ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <input type="checkbox" checked={form[opt.key]} onChange={(e) => setForm({ ...form, [opt.key]: e.target.checked })} className="accent-brand-500" />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 resize-none" />
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isSaving}>Update Exam</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/* Marksheet — pick a class/section already scheduled for this exam, then  */
/* see every student's combined result across every subject.              */
/* ---------------------------------------------------------------------- */

const MarksheetModal: React.FC<{ branchId: number; group: ExamGroup; exam: ExamGroupExam; onClose: () => void }> = ({ group, exam, onClose }) => {
  const { data: schedulesResp } = useExamSchedules({ exam_group_exam_id: exam.id });
  const schedules = schedulesResp ?? [];

  const classSections = useMemo(() => {
    const seen = new Map<string, { classId: number; sectionId: number; label: string }>();
    schedules.forEach((s: ExamSchedule) => {
      const key = `${s.class_id}-${s.section_id}`;
      if (!seen.has(key)) {
        seen.set(key, { classId: s.class_id, sectionId: s.section_id, label: `Class ${s.school_class?.name ?? s.class_id} (${s.section?.name ?? s.section_id})` });
      }
    });
    return Array.from(seen.values());
  }, [schedules]);

  const [selectedKey, setSelectedKey] = useState('');
  const selected = classSections.find((cs) => `${cs.classId}-${cs.sectionId}` === selectedKey) ?? null;

  const { data: marksheet, isLoading: isMarksheetLoading } = useMarksheet(
    selected ? { class_id: selected.classId, section_id: selected.sectionId, exam_type: group.exam_type } : null
  );
  const bulkSaveMarks = useBulkSaveExamMarks();

  // "By Subject" = the class-wide matrix below (every student x every subject). "By Student"
  // narrows the same matrix down to one student's row, shown as a vertical list instead —
  // both modes share the same draft/save logic, only the layout differs.
  const [entryMode, setEntryMode] = useState<'subject' | 'student'>('subject');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const selectedStudent = marksheet?.students.find((s) => String(s.student_id) === selectedStudentId) ?? null;

  // Editable grid state — keyed "scheduleId-studentId" so every cell in the matrix has its
  // own draft value. Absent cells stay read-only here; use Marks Entry to change attendance.
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [savedFlash, setSavedFlash] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!marksheet) {
      setDraft({});
      return;
    }
    const next: Record<string, string> = {};
    marksheet.students.forEach((student) => {
      marksheet.subjects.forEach((sub) => {
        const cell = student.marks[sub.schedule_id];
        if (!cell?.is_absent) {
          next[`${sub.schedule_id}-${student.student_id}`] = cell?.obtained_marks != null ? String(cell.obtained_marks) : '';
        }
      });
    });
    setDraft(next);
    setSavedFlash(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marksheet]);

  const updateCell = (scheduleId: number, studentId: number, value: string) => {
    setSavedFlash(false);
    setDraft((prev) => ({ ...prev, [`${scheduleId}-${studentId}`]: value }));
  };

  const handleSaveGrid = async () => {
    if (!marksheet) return;
    setIsSaving(true);
    try {
      // One bulk-save call per subject column — the existing Marks Entry endpoint is
      // already scoped to "all students, one exam schedule", so this reuses it exactly.
      await Promise.all(
        marksheet.subjects.map((sub) => {
          const marks = marksheet.students
            .filter((student) => !student.marks[sub.schedule_id]?.is_absent)
            .map((student) => {
              const raw = draft[`${sub.schedule_id}-${student.student_id}`] ?? '';
              return raw === '' ? null : { student_id: student.student_id, obtained_marks: Number(raw) };
            })
            .filter((m): m is { student_id: number; obtained_marks: number } => m !== null);

          if (marks.length === 0) return Promise.resolve();
          return bulkSaveMarks.mutateAsync({ exam_schedule_id: sub.schedule_id, marks });
        })
      );
      setSavedFlash(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:relative print:inset-auto print:p-0 print:bg-transparent print:backdrop-blur-none print:block">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-[96vw] max-w-[1300px] max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100 flex flex-col print:w-full print:max-w-none print:max-h-none print:shadow-none print:rounded-none print:ring-0">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0 print:hidden">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Marksheet — {exam.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{group.exam_type}</p>
          </div>
          <div className="flex items-center gap-2">
            {savedFlash && (
              <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                <CheckCircle2 size={16} /> Saved
              </span>
            )}
            {selected && marksheet && marksheet.students.length > 0 && (
              <>
                <Button onClick={handleSaveGrid} leftIcon={<Save size={18} />} isLoading={isSaving}>Save Marks</Button>
                <Button variant="outline" leftIcon={<Printer size={18} />} onClick={() => window.print()}>Print</Button>
              </>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400"><X size={20} /></button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 print:overflow-visible">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 print:hidden">
            <div className="max-w-sm w-full space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Class & Section</label>
              <Select
                value={selectedKey}
                onChange={(v) => { setSelectedKey(v); setSelectedStudentId(''); }}
                options={classSections.map((cs) => ({ value: `${cs.classId}-${cs.sectionId}`, label: cs.label }))}
                placeholder={classSections.length ? 'Select class & section' : 'No schedule created for this exam yet'}
                disabled={classSections.length === 0}
              />
            </div>

            {selected && marksheet && marksheet.students.length > 0 && (
              <>
                <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setEntryMode('subject')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${entryMode === 'subject' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    By Subject
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryMode('student')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${entryMode === 'student' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    By Student
                  </button>
                </div>
                {entryMode === 'student' && (
                  <div className="max-w-sm w-full space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Student</label>
                    <Select
                      value={selectedStudentId}
                      onChange={setSelectedStudentId}
                      options={marksheet.students.map((s) => ({ value: String(s.student_id), label: `${s.student_name} (${s.admission_no})` }))}
                      placeholder="Select student"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {selected && marksheet && marksheet.students.length > 0 && (
            <div className="hidden print:block">
              <div className="flex items-center gap-4 pb-6 mb-2 border-b-2 border-slate-800">
                <img src="/logo.png" alt="School Logo" className="h-16 w-auto object-contain" />
                <div>
                  <h1 className="text-xl font-black text-slate-900">Nawaz Sharif School of Eminence</h1>
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Marksheet — {exam.name}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-600 mb-4">
                {group.exam_type} &middot; {selected.label}
              </p>
            </div>
          )}

          {!selected ? (
            <EmptyState icon={Users} title="Select a Class & Section" description="Choose a class & section above that already has a schedule under this exam." />
          ) : isMarksheetLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-slate-400 gap-3">
              <Loader2 className="animate-spin" size={28} />
              <p className="text-sm font-semibold">Loading marksheet...</p>
            </div>
          ) : !marksheet || marksheet.students.length === 0 ? (
            <EmptyState icon={FileSpreadsheet} title="No Students Found" description="No students are enrolled in this class & section for this branch." />
          ) : entryMode === 'student' ? (
            !selectedStudent ? (
              <EmptyState icon={Users} title="Select a Student" description="Choose a student above to enter their marks one subject at a time." />
            ) : (
              <div className="overflow-x-auto">
                <div className="mb-4 pb-4 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-800">{selectedStudent.student_name}</p>
                  <p className="text-xs text-slate-500 font-medium">{selectedStudent.admission_no}</p>
                </div>
                <table className="w-full text-left table-fixed min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</th>
                      <th className="py-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Marks</th>
                      <th className="py-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Obtained Marks</th>
                      <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {marksheet.subjects.map((sub) => {
                      const cell = selectedStudent.marks[sub.schedule_id];
                      const raw = draft[`${sub.schedule_id}-${selectedStudent.student_id}`] ?? '';
                      const obtained = raw === '' ? null : Number(raw);
                      const grade = cell?.is_absent ? 'AB' : obtained !== null ? calculateGrade(obtained, sub.total_marks).grade : '-';
                      return (
                        <tr key={sub.schedule_id}>
                          <td className="py-4 pr-3 text-sm font-bold text-slate-800">{sub.subject_name}</td>
                          <td className="py-4 pr-3 text-sm text-slate-500 font-medium">{sub.total_marks}</td>
                          <td className="py-4 pr-3">
                            {cell?.is_absent ? (
                              <span className="text-rose-500 font-bold text-sm">Absent</span>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                max={sub.total_marks}
                                value={raw}
                                onChange={(e) => updateCell(sub.schedule_id, selectedStudent.student_id, e.target.value)}
                                placeholder={`out of ${sub.total_marks}`}
                                className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                              />
                            )}
                          </td>
                          <td className="py-4">
                            <span className={`text-sm font-black ${cell?.is_absent ? 'text-rose-500' : 'text-brand-600'}`}>{grade}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="py-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admission No</th>
                    {marksheet.subjects.map((sub) => (
                      <th key={sub.schedule_id} className="py-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub.subject_name}</th>
                    ))}
                    <th className="py-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</th>
                    <th className="py-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">%</th>
                    <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {marksheet.students.map((student) => {
                    const totalMarks = marksheet.subjects.reduce((sum, sub) => sum + sub.total_marks, 0);
                    const totalObtained = marksheet.subjects.reduce((sum, sub) => {
                      const cell = student.marks[sub.schedule_id];
                      if (cell?.is_absent) return sum;
                      const raw = draft[`${sub.schedule_id}-${student.student_id}`] ?? '';
                      return sum + (raw === '' ? 0 : Number(raw));
                    }, 0);
                    const { grade, status } = calculateGrade(totalObtained, totalMarks);
                    const percentage = totalMarks ? (totalObtained / totalMarks) * 100 : 0;
                    return (
                      <tr key={student.student_id}>
                        <td className="py-3 pr-3 text-sm font-bold text-slate-800">{student.student_name}</td>
                        <td className="py-3 pr-3 text-sm text-slate-500 font-medium">{student.admission_no}</td>
                        {marksheet.subjects.map((sub) => {
                          const cell = student.marks[sub.schedule_id];
                          if (cell?.is_absent) {
                            return (
                              <td key={sub.schedule_id} className="py-3 pr-3 text-sm font-semibold">
                                <span className="text-rose-500 font-bold">Absent</span>
                              </td>
                            );
                          }
                          const raw = draft[`${sub.schedule_id}-${student.student_id}`] ?? '';
                          return (
                            <td key={sub.schedule_id} className="py-3 pr-3 text-sm font-semibold text-slate-700">
                              <input
                                type="number"
                                min={0}
                                max={sub.total_marks}
                                value={raw}
                                onChange={(e) => updateCell(sub.schedule_id, student.student_id, e.target.value)}
                                placeholder={`/${sub.total_marks}`}
                                className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20 print:hidden"
                              />
                              <span className="hidden print:inline">{raw === '' ? '—' : `${raw}/${sub.total_marks}`}</span>
                            </td>
                          );
                        })}
                        <td className="py-3 pr-3 text-sm font-black text-slate-800">{totalObtained}/{totalMarks}</td>
                        <td className="py-3 pr-3 text-sm font-bold text-slate-700">{percentage.toFixed(1)}%</td>
                        <td className="py-3">
                          <span className={`text-sm font-black ${status === 'Pass' ? 'text-emerald-600' : 'text-rose-600'}`}>{grade}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/* Main screen — a flat list of Exams. Each still has one behind-the-scenes*/
/* Exam Group record (created transparently, see WizardModal) so the       */
/* existing schedule/marksheet plumbing keyed off exam_type stays intact.  */
/* ---------------------------------------------------------------------- */

export const ExamGroupManager: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId ?? 1;

  const { data: examGroupsResp } = useExamGroups(branchId);
  const { data: groupExamsResp } = useExamGroupExams(branchId);
  const deleteExamMutation = useDeleteExamGroupExam();

  const groups = examGroupsResp ?? [];
  const exams = groupExamsResp ?? [];

  const [examToDelete, setExamToDelete] = useState<number | null>(null);
  const [editingExam, setEditingExam] = useState<{ group: ExamGroup; exam: ExamGroupExam } | null>(null);
  const [wizard, setWizard] = useState<{ open: boolean; initial?: { group: ExamGroup; exam: ExamGroupExam } }>({ open: false });
  const [marksheetFor, setMarksheetFor] = useState<{ group: ExamGroup; exam: ExamGroupExam } | null>(null);

  const confirmDeleteExam = () => {
    if (examToDelete) deleteExamMutation.mutate(examToDelete, { onSuccess: () => setExamToDelete(null) });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center sm:text-left">
            Exams
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base text-center sm:text-left">
            Create an exam, then schedule it for a class & section — every student there gets it automatically
          </p>
        </div>
        <Button onClick={() => setWizard({ open: true })} leftIcon={<Plus size={18} />}>
          Add Exam
        </Button>
      </div>

      {exams.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={Award}
            title="No Exams Yet"
            description="Add an exam (e.g. 'Mid Term Examination 2026') to start scheduling it for classes."
            actionLabel="Add Exam"
            onAction={() => setWizard({ open: true })}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => {
            const group = groups.find((g) => g.id === exam.exam_group_id);
            if (!group) return null;
            return (
              <Card key={exam.id} padding="none" className="overflow-hidden">
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-bold text-slate-900">{exam.name}</p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          group.academic_session ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {group.academic_session?.name ?? 'No Session'}
                      </span>
                    </div>
                    {exam.description && <p className="text-sm text-slate-500 font-medium mt-1 truncate">{exam.description}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <PublishBadge label="Exam" active={exam.publish_exam} />
                      <PublishBadge label="Schedule" active={exam.publish_schedule} />
                      <PublishBadge label="Result" active={exam.publish_result} />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <ScheduledClasses examId={exam.id} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button variant="outline" size="sm" leftIcon={<CalendarClock size={14} />} onClick={() => setWizard({ open: true, initial: { group, exam } })}>
                      Schedule
                    </Button>
                    <Button variant="outline" size="sm" leftIcon={<FileSpreadsheet size={14} />} onClick={() => setMarksheetFor({ group, exam })}>
                      Marksheet
                    </Button>
                    <button onClick={() => setEditingExam({ group, exam })} className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => setExamToDelete(exam.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {wizard.open && (
          <WizardModal branchId={branchId} initial={wizard.initial} onClose={() => setWizard({ open: false })} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingExam && <EditExamModal branchId={branchId} group={editingExam.group} exam={editingExam.exam} onClose={() => setEditingExam(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {marksheetFor && (
          <MarksheetModal branchId={branchId} group={marksheetFor.group} exam={marksheetFor.exam} onClose={() => setMarksheetFor(null)} />
        )}
      </AnimatePresence>

      <DeleteConfirmationModal
        isOpen={!!examToDelete}
        onClose={() => setExamToDelete(null)}
        onConfirm={confirmDeleteExam}
        title="Delete Exam?"
        message="Are you sure you want to delete this exam? Any schedule created under it will be unlinked, not deleted. This action cannot be undone."
        isLoading={deleteExamMutation.isPending}
      />
    </div>
  );
};
