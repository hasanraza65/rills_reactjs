import React, { useEffect, useMemo, useState } from 'react';
import { PencilLine, Save, User, CheckCircle2, Users, GraduationCap } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../../types';
import { useBranchStore } from '../../store/use-branch-store';
import { useClasses } from '../../hooks/use-class';
import { useSections } from '../../hooks/use-section';
import { useStudents } from '../../hooks/use-student';
import { useExamSchedules } from '../../hooks/use-exam-schedule';
import {
  useExamMarksForSchedule,
  useBulkSaveExamMarks,
  useExamMarksForStudent,
  useBulkSaveExamMarksForStudent,
} from '../../hooks/use-exam-mark';
import { calculateGrade, ExamType } from '../../types/api/exam';

/* ---------------------------------------------------------------------- */
/* By Subject — one exam (= one subject, one class/section), every student */
/* at once. What a subject teacher uses to mark their whole class.         */
/* ---------------------------------------------------------------------- */

interface DraftMarkRow {
  marks: string;
  isAbsent: boolean;
  note: string;
}

const emptyDraftRow = (): DraftMarkRow => ({ marks: '', isAbsent: false, note: '' });

const BySubjectView: React.FC<{ branchId: number }> = ({ branchId }) => {
  const { data: examsResp } = useExamSchedules({ branch_id: branchId });
  const exams = examsResp ?? [];
  const { data: students } = useStudents(branchId);

  const [selectedExamId, setSelectedExamId] = useState('');
  const [draft, setDraft] = useState<Record<number, DraftMarkRow>>({});
  const [justSaved, setJustSaved] = useState(false);

  const sortedExams = useMemo(() => [...exams].sort((a, b) => (a.date < b.date ? 1 : -1)), [exams]);
  const selectedExam = exams.find((e) => String(e.id) === selectedExamId) ?? null;

  const { data: marksResp } = useExamMarksForSchedule(selectedExam?.id ?? null);
  const bulkSaveMarks = useBulkSaveExamMarks();

  const classStudents = useMemo(() => {
    if (!selectedExam || !students) return [];
    return students.filter(
      (s) => s.class_id === selectedExam.class_id && s.section_id === selectedExam.section_id
    );
  }, [selectedExam, students]);

  // Loads whatever marks already exist for this exam (or blank) whenever the exam changes.
  useEffect(() => {
    if (!selectedExam) {
      setDraft({});
      return;
    }
    const existing = new Map((marksResp ?? []).map((m) => [m.student_id, m]));
    const next: Record<number, DraftMarkRow> = {};
    classStudents.forEach((s) => {
      const m = existing.get(s.id);
      next[s.id] = m
        ? { marks: String(m.obtained_marks), isAbsent: m.is_absent, note: m.note ?? '' }
        : emptyDraftRow();
    });
    setDraft(next);
    setJustSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExamId, students, marksResp]);

  const updateDraft = (studentId: number, patch: Partial<DraftMarkRow>) => {
    setJustSaved(false);
    setDraft((prev) => ({ ...prev, [studentId]: { ...(prev[studentId] ?? emptyDraftRow()), ...patch } }));
  };

  const handleSave = () => {
    if (!selectedExam) return;
    const marks = (Object.entries(draft) as [string, DraftMarkRow][])
      .filter(([, row]) => row.marks !== '' || row.isAbsent)
      .map(([studentId, row]) => ({
        student_id: Number(studentId),
        obtained_marks: row.marks === '' ? 0 : Number(row.marks),
        is_absent: row.isAbsent,
        note: row.note || undefined,
      }));

    bulkSaveMarks.mutate(
      { exam_schedule_id: selectedExam.id, marks },
      { onSuccess: () => setJustSaved(true) }
    );
  };

  return (
    <div className="space-y-6">
      <Card padding="md">
        <div className="grid sm:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Select Exam</label>
            <Select
              value={selectedExamId}
              onChange={setSelectedExamId}
              options={sortedExams.map((e) => ({
                value: String(e.id),
                label: `${e.exam_type} — ${e.subject?.subject_name ?? 'Subject'} — Class ${e.school_class?.name ?? e.class_id} (${e.section?.name ?? e.section_id}) — ${e.date}`,
              }))}
              placeholder={sortedExams.length ? 'Choose an exam...' : 'No exams scheduled yet'}
              disabled={sortedExams.length === 0}
            />
          </div>
          {selectedExam && (
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold">
                Total Marks: {selectedExam.total_marks}
              </span>
            </div>
          )}
        </div>
      </Card>

      {!selectedExam ? (
        <Card padding="none">
          <EmptyState
            icon={PencilLine}
            title="No Exam Selected"
            description={
              sortedExams.length
                ? 'Choose an exam above to start entering marks for its class.'
                : 'No exams have been scheduled yet — create one in Exam Group first.'
            }
          />
        </Card>
      ) : classStudents.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={User}
            title="No Students Found"
            description={`No students are enrolled in Class ${selectedExam.school_class?.name ?? selectedExam.class_id} (${selectedExam.section?.name ?? selectedExam.section_id}) for this branch.`}
          />
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[4%]">Sr.</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[16%]">Student</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[11%]">Admission No</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Father Name</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[8%]">Gender</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[8%]">Absent</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[13%]">Obtained Marks</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[7%]">Grade</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[18%]">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {classStudents.map((s, idx) => {
                  const row = draft[s.id] ?? emptyDraftRow();
                  const obtained = row.marks === '' ? null : Number(row.marks);
                  const grade = row.isAbsent
                    ? 'AB'
                    : obtained !== null
                    ? calculateGrade(obtained, selectedExam.total_marks).grade
                    : '-';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-500 font-medium">{idx + 1}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">
                            <User size={16} />
                          </div>
                          <p className="text-sm font-bold text-slate-800">{s.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-500 font-medium">{s.admission_no}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-500 font-medium">{s.parent?.father_name ?? '-'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-500 font-medium capitalize">{s.gender}</p>
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={row.isAbsent}
                          onChange={(e) => updateDraft(s.id, { isAbsent: e.target.checked })}
                          className="accent-rose-500 w-4 h-4"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="number"
                          value={row.marks}
                          onChange={(e) => updateDraft(s.id, { marks: e.target.value })}
                          min={0}
                          max={selectedExam.total_marks}
                          disabled={row.isAbsent}
                          placeholder={`/${selectedExam.total_marks}`}
                          className="w-full max-w-[110px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-semibold text-slate-700 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn('text-sm font-black', row.isAbsent ? 'text-rose-500' : 'text-brand-600')}>{grade}</span>
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="text"
                          value={row.note}
                          onChange={(e) => updateDraft(s.id, { note: e.target.value })}
                          placeholder="Optional note..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm text-slate-700"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            {justSaved && (
              <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                <CheckCircle2 size={16} /> Saved
              </span>
            )}
            <Button onClick={handleSave} leftIcon={<Save size={18} />} isLoading={bulkSaveMarks.isPending}>
              Save Marks
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/* By Student — one student, every subject of a chosen exam at once. Faster*/
/* for filling marks off a single student's answer sheets/report.         */
/* ---------------------------------------------------------------------- */

const ByStudentView: React.FC<{ branchId: number }> = ({ branchId }) => {
  const { data: classes } = useClasses(branchId);
  const { data: sections } = useSections(branchId);
  const { data: students } = useStudents(branchId);

  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [draft, setDraft] = useState<Record<number, DraftMarkRow>>({});
  const [justSaved, setJustSaved] = useState(false);

  const filteredSections = (sections ?? []).filter((s) => !classId || String(s.school_class_id) === classId);
  const sectionStudents = (students ?? []).filter(
    (s) => !classId || !sectionId || (s.class_id === Number(classId) && s.section_id === Number(sectionId))
  );

  const student = students?.find((s) => String(s.id) === selectedStudentId) ?? null;

  // Every subject scheduled for this student's class & section, across all exam types.
  const { data: schedulesResp } = useExamSchedules(
    student ? { branch_id: branchId, class_id: student.class_id, section_id: student.section_id } : {}
  );
  const allSchedules = student ? schedulesResp ?? [] : [];

  const availableExamTypes = useMemo(
    () => Array.from(new Set(allSchedules.map((s) => s.exam_type))) as ExamType[],
    [allSchedules]
  );

  const rows = useMemo(
    () => allSchedules.filter((s) => s.exam_type === selectedExamType),
    [allSchedules, selectedExamType]
  );

  const { data: marksResp } = useExamMarksForStudent(student?.id ?? null);
  const bulkSaveForStudent = useBulkSaveExamMarksForStudent();

  useEffect(() => {
    if (!student || !selectedExamType || rows.length === 0) {
      setDraft({});
      return;
    }
    const existing = new Map((marksResp ?? []).map((m) => [m.exam_schedule_id, m]));
    const next: Record<number, DraftMarkRow> = {};
    rows.forEach((r) => {
      const m = existing.get(r.id);
      next[r.id] = m
        ? { marks: String(m.obtained_marks), isAbsent: m.is_absent, note: m.note ?? '' }
        : emptyDraftRow();
    });
    setDraft(next);
    setJustSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId, selectedExamType, marksResp]);

  const updateDraft = (scheduleId: number, patch: Partial<DraftMarkRow>) => {
    setJustSaved(false);
    setDraft((prev) => ({ ...prev, [scheduleId]: { ...(prev[scheduleId] ?? emptyDraftRow()), ...patch } }));
  };

  const handleSave = () => {
    if (!student) return;
    const marks = (Object.entries(draft) as [string, DraftMarkRow][])
      .filter(([, row]) => row.marks !== '' || row.isAbsent)
      .map(([scheduleId, row]) => ({
        exam_schedule_id: Number(scheduleId),
        obtained_marks: row.marks === '' ? 0 : Number(row.marks),
        is_absent: row.isAbsent,
        note: row.note || undefined,
      }));

    bulkSaveForStudent.mutate(
      { student_id: student.id, marks },
      { onSuccess: () => setJustSaved(true) }
    );
  };

  return (
    <div className="space-y-6">
      <Card padding="md">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Class</label>
            <Select
              value={classId}
              onChange={(v) => { setClassId(v); setSectionId(''); setSelectedStudentId(''); setSelectedExamType(''); }}
              options={(classes ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
              placeholder="Select class"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Section</label>
            <Select
              value={sectionId}
              onChange={(v) => { setSectionId(v); setSelectedStudentId(''); setSelectedExamType(''); }}
              options={filteredSections.map((s) => ({ value: String(s.id), label: s.name }))}
              placeholder={classId ? 'Select section' : 'Select class first'}
              disabled={!classId}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Student</label>
            <Select
              value={selectedStudentId}
              onChange={(v) => { setSelectedStudentId(v); setSelectedExamType(''); }}
              options={sectionStudents.map((s) => ({ value: String(s.id), label: `${s.name} (${s.admission_no})` }))}
              placeholder={sectionId ? 'Select student' : 'Select section first'}
              disabled={!sectionId}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Exam</label>
            <Select
              value={selectedExamType}
              onChange={setSelectedExamType}
              options={availableExamTypes.map((t) => ({ value: t, label: t }))}
              placeholder={student ? (availableExamTypes.length ? 'Select exam' : 'Nothing scheduled') : 'Select a student first'}
              disabled={!student || availableExamTypes.length === 0}
            />
          </div>
        </div>
      </Card>

      {!student ? (
        <Card padding="none">
          <EmptyState icon={GraduationCap} title="No Student Selected" description="Select a student above to see every subject they're scheduled for." />
        </Card>
      ) : !selectedExamType || rows.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={PencilLine}
            title="No Exam Selected"
            description={availableExamTypes.length ? 'Choose an exam above to enter marks for every subject at once.' : `No exams have been scheduled yet for ${student.name}'s class.`}
          />
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">
              <User size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{student.name}</p>
              <p className="text-xs text-slate-500 font-medium">
                {student.admission_no} &middot; Class {student.class?.name ?? student.class_id} ({student.section?.name ?? student.section_id})
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[25%]">Subject</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[13%]">Total Marks</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[9%]">Absent</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Obtained Marks</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[9%]">Grade</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[29%]">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((row) => {
                  const draftRow = draft[row.id] ?? emptyDraftRow();
                  const obtained = draftRow.marks === '' ? null : Number(draftRow.marks);
                  const grade = draftRow.isAbsent
                    ? 'AB'
                    : obtained !== null
                    ? calculateGrade(obtained, row.total_marks).grade
                    : '-';
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{row.subject?.subject_name ?? 'Subject'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-500 font-medium">{row.total_marks}</p>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={draftRow.isAbsent}
                          onChange={(e) => updateDraft(row.id, { isAbsent: e.target.checked })}
                          className="accent-rose-500 w-4 h-4"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={draftRow.marks}
                          onChange={(e) => updateDraft(row.id, { marks: e.target.value })}
                          min={0}
                          max={row.total_marks}
                          disabled={draftRow.isAbsent}
                          placeholder={`out of ${row.total_marks}`}
                          className="w-full max-w-[130px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-semibold text-slate-700 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('text-sm font-black', draftRow.isAbsent ? 'text-rose-500' : 'text-brand-600')}>{grade}</span>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={draftRow.note}
                          onChange={(e) => updateDraft(row.id, { note: e.target.value })}
                          placeholder="Optional note..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm text-slate-700"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            {justSaved && (
              <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                <CheckCircle2 size={16} /> Saved
              </span>
            )}
            <Button onClick={handleSave} leftIcon={<Save size={18} />} isLoading={bulkSaveForStudent.isPending}>
              Save Marks
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/* Main screen — toggle between the two modes.                            */
/* ---------------------------------------------------------------------- */

export const MarksEntryManager: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId ?? 1;
  const [mode, setMode] = useState<'subject' | 'student'>('subject');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center sm:text-left">
            Marks Entry
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base text-center sm:text-left">
            {mode === 'subject'
              ? 'Enter obtained marks for a whole class, one subject at a time'
              : "Enter obtained marks for one student, every subject at once"}
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMode('subject')}
            className={cn(
              'flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2',
              mode === 'subject' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            )}
          >
            <Users size={14} /> By Subject
          </button>
          <button
            type="button"
            onClick={() => setMode('student')}
            className={cn(
              'flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2',
              mode === 'student' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            )}
          >
            <User size={14} /> By Student
          </button>
        </div>
      </div>

      {mode === 'subject' ? <BySubjectView branchId={branchId} /> : <ByStudentView branchId={branchId} />}
    </div>
  );
};
