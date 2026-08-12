import React, { useMemo, useState } from 'react';
import { Award, Printer, GraduationCap, User, Users, Loader2 } from 'lucide-react';
import { cn } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { useBranchStore } from '../../store/use-branch-store';
import { useStudents } from '../../hooks/use-student';
import { useClasses } from '../../hooks/use-class';
import { useSectionsByClass } from '../../hooks/use-section';
import { useExamMarksForStudent, useMarksheet } from '../../hooks/use-exam-mark';
import { useExamSchedules } from '../../hooks/use-exam-schedule';
import { calculateGrade, ExamType } from '../../types/api/exam';

/** Toggle mirroring the "By Subject / By Student" switch used in Marks Entry & the
 * admin Marksheet — same visual language, so the two report modes read as one family. */
const ReportModeToggle: React.FC<{ mode: 'student' | 'class'; onChange: (m: 'student' | 'class') => void }> = ({ mode, onChange }) => (
  <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0 print:hidden">
    <button
      type="button"
      onClick={() => onChange('student')}
      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${mode === 'student' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
    >
      Report by Student
    </button>
    <button
      type="button"
      onClick={() => onChange('class')}
      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${mode === 'class' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
    >
      Report by Class
    </button>
  </div>
);

export const ReportCard: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId ?? 1;

  const [reportMode, setReportMode] = useState<'student' | 'class'>('student');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center sm:text-left">
            Report Card
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base text-center sm:text-left">
            {reportMode === 'student'
              ? "View a student's consolidated result across all subjects"
              : 'Generate every student in a class with their total marks'}
          </p>
        </div>
        <ReportModeToggle mode={reportMode} onChange={setReportMode} />
      </div>

      {reportMode === 'student' ? <StudentReport branchId={branchId} /> : <ClassReport branchId={branchId} />}
    </div>
  );
};

const StudentReport: React.FC<{ branchId: number }> = ({ branchId }) => {
  const { data: students } = useStudents(branchId);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');

  const student = students?.find((s) => String(s.id) === selectedStudentId) ?? null;
  const { data: marksResp } = useExamMarksForStudent(student?.id ?? null);
  const marks = marksResp ?? [];

  // Exam types this student actually has recorded marks for.
  const availableExamTypes = useMemo(() => {
    const types = new Set<ExamType>();
    marks.forEach((m) => {
      if (m.schedule) types.add(m.schedule.exam_type);
    });
    return Array.from(types);
  }, [marks]);

  const subjectRows = useMemo(() => {
    if (!selectedExamType) return [];
    return marks
      .filter((m) => m.schedule?.exam_type === selectedExamType)
      .map((m) => {
        const total = m.schedule!.total_marks;
        const grade = m.is_absent ? 'AB' : calculateGrade(m.obtained_marks, total).grade;
        return {
          subjectName: m.schedule!.subject?.subject_name ?? 'Subject',
          obtained: m.obtained_marks,
          total,
          grade,
          isAbsent: m.is_absent,
        };
      });
  }, [marks, selectedExamType]);

  const totals = useMemo(() => {
    const totalObtained = subjectRows.reduce((sum, r) => sum + r.obtained, 0);
    const totalMarks = subjectRows.reduce((sum, r) => sum + r.total, 0);
    const overall = calculateGrade(totalObtained, totalMarks);
    const percentage = totalMarks ? (totalObtained / totalMarks) * 100 : 0;
    return { totalObtained, totalMarks, percentage, ...overall };
  }, [subjectRows]);

  return (
    <div className="space-y-6">
      {student && selectedExamType && subjectRows.length > 0 && (
        <div className="flex justify-end print:hidden">
          <Button variant="outline" leftIcon={<Printer size={18} />} onClick={() => window.print()}>
            Print
          </Button>
        </div>
      )}

      <Card padding="md" className="print:hidden">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Student</label>
            <Select
              value={selectedStudentId}
              onChange={(v) => {
                setSelectedStudentId(v);
                setSelectedExamType('');
              }}
              options={(students ?? []).map((s) => ({ value: String(s.id), label: `${s.name} (${s.admission_no})` }))}
              placeholder="Search and select a student..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Exam</label>
            <Select
              value={selectedExamType}
              onChange={setSelectedExamType}
              options={availableExamTypes.map((t) => ({ value: t, label: t }))}
              placeholder={student ? (availableExamTypes.length ? 'Select exam' : 'No results yet') : 'Select a student first'}
              disabled={!student || availableExamTypes.length === 0}
            />
          </div>
        </div>
      </Card>

      {!student ? (
        <Card padding="none">
          <EmptyState icon={GraduationCap} title="No Student Selected" description="Select a student above to view their report card." />
        </Card>
      ) : !selectedExamType || subjectRows.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={Award}
            title="No Results Yet"
            description={`No marks have been recorded for ${student.name} yet. Enter marks in Marks Entry first.`}
          />
        </Card>
      ) : (
        <Card padding="lg" className="print:shadow-none print:border-none">
          {/* Letterhead — screen never sees this, only the printed page does. */}
          <div className="hidden print:flex items-center gap-4 pb-6 mb-6 border-b-2 border-slate-800">
            <img src="/logo.png" alt="School Logo" className="h-16 w-auto object-contain" />
            <div>
              <h1 className="text-xl font-black text-slate-900">Nawaz Sharif School of Eminence</h1>
              <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Report Card</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center print:hidden">
                <User size={24} />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900">{student.name}</p>
                <p className="text-sm text-slate-500 font-medium">
                  Admission No: {student.admission_no} &middot; Class {student.class?.name ?? student.class_id} ({student.section?.name ?? student.section_id})
                  {student.parent?.father_name && <> &middot; Father: {student.parent.father_name}</>}
                </p>
              </div>
            </div>
            <span className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-xl w-fit">
              {selectedExamType}
            </span>
          </div>

          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Marks</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Obtained</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subjectRows.map((row) => (
                  <tr key={row.subjectName}>
                    <td className="py-4 text-sm font-bold text-slate-800">{row.subjectName}</td>
                    <td className="py-4 text-sm text-slate-500 font-medium">{row.total}</td>
                    <td className="py-4 text-sm font-black text-slate-800">
                      {row.isAbsent ? <span className="text-rose-500">Absent</span> : row.obtained}
                    </td>
                    <td className={cn('py-4 text-sm font-black', row.isAbsent ? 'text-rose-500' : 'text-brand-600')}>{row.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Obtained</p>
              <p className="text-xl font-black text-slate-900 mt-1">{totals.totalObtained} / {totals.totalMarks}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Percentage</p>
              <p className="text-xl font-black text-slate-900 mt-1">{totals.percentage.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall Grade</p>
              <p className="text-xl font-black text-brand-600 mt-1">{totals.grade}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
              <p className={`text-xl font-black mt-1 ${totals.status === 'Pass' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {totals.status}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const ClassReport: React.FC<{ branchId: number }> = ({ branchId }) => {
  const { data: classes } = useClasses(branchId);

  const [classId, setClassId] = useState('');
  const { data: sections } = useSectionsByClass(classId ? Number(classId) : null);

  const [sectionId, setSectionId] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');

  // Every exam that actually has a schedule for this class & section — that's the only
  // set a marksheet (and therefore a class report) can be generated for.
  const { data: schedulesResp } = useExamSchedules(
    classId && sectionId ? { branch_id: branchId, class_id: Number(classId), section_id: Number(sectionId) } : {}
  );
  const schedules = classId && sectionId ? schedulesResp ?? [] : [];
  const availableExamTypes = useMemo(
    () => Array.from(new Set(schedules.map((s) => s.exam_type))) as ExamType[],
    [schedules]
  );

  const { data: marksheet, isLoading: isMarksheetLoading } = useMarksheet(
    classId && sectionId && selectedExamType
      ? { class_id: Number(classId), section_id: Number(sectionId), exam_type: selectedExamType }
      : null
  );

  const selectedClass = classes?.find((c) => String(c.id) === classId) ?? null;
  const selectedSection = sections?.find((s) => String(s.id) === sectionId) ?? null;

  // Only show students who actually have a result — a blank/unmarked student shouldn't
  // clutter the class report. "Absent" counts as a recorded result; a totally empty cell doesn't.
  const resultStudents = useMemo(() => {
    if (!marksheet) return [];
    return marksheet.students.filter((student) =>
      marksheet.subjects.some((sub) => {
        const cell = student.marks[sub.schedule_id];
        return cell?.is_absent || cell?.obtained_marks != null;
      })
    );
  }, [marksheet]);

  return (
    <div className="space-y-6">
      {resultStudents.length > 0 && (
        <div className="flex justify-end print:hidden">
          <Button variant="outline" leftIcon={<Printer size={18} />} onClick={() => window.print()}>
            Print
          </Button>
        </div>
      )}

      <Card padding="md" className="print:hidden">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Class</label>
            <Select
              value={classId}
              onChange={(v) => {
                setClassId(v);
                setSectionId('');
                setSelectedExamType('');
              }}
              options={(classes ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
              placeholder="Select class..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Section</label>
            <Select
              value={sectionId}
              onChange={(v) => {
                setSectionId(v);
                setSelectedExamType('');
              }}
              options={(sections ?? []).map((s) => ({ value: String(s.id), label: s.name }))}
              placeholder={classId ? 'Select section...' : 'Select a class first'}
              disabled={!classId}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Exam</label>
            <Select
              value={selectedExamType}
              onChange={setSelectedExamType}
              options={availableExamTypes.map((t) => ({ value: t, label: t }))}
              placeholder={sectionId ? (availableExamTypes.length ? 'Select exam' : 'No schedule yet') : 'Select a section first'}
              disabled={!sectionId || availableExamTypes.length === 0}
            />
          </div>
        </div>
      </Card>

      {!classId || !sectionId ? (
        <Card padding="none">
          <EmptyState icon={Users} title="No Class Selected" description="Select a class & section above to generate a class-wide result sheet." />
        </Card>
      ) : !selectedExamType ? (
        <Card padding="none">
          <EmptyState
            icon={Award}
            title="No Exam Selected"
            description={
              availableExamTypes.length
                ? "Select an exam above to view every student's total marks."
                : 'No exam has been scheduled for this class & section yet.'
            }
          />
        </Card>
      ) : isMarksheetLoading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 gap-3">
          <Loader2 className="animate-spin" size={28} />
          <p className="text-sm font-semibold">Loading report...</p>
        </div>
      ) : !marksheet || marksheet.students.length === 0 ? (
        <Card padding="none">
          <EmptyState icon={GraduationCap} title="No Students Found" description="No students are enrolled in this class & section." />
        </Card>
      ) : resultStudents.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={Award}
            title="No Results Yet"
            description={`No marks have been recorded for ${selectedExamType} yet. Enter marks in the Marksheet first.`}
          />
        </Card>
      ) : (
        <Card padding="lg" className="print:shadow-none print:border-none">
          {/* Letterhead — screen never sees this, only the printed page does. */}
          <div className="hidden print:flex items-center gap-4 pb-6 mb-6 border-b-2 border-slate-800">
            <img src="/logo.png" alt="School Logo" className="h-16 w-auto object-contain" />
            <div>
              <h1 className="text-xl font-black text-slate-900">Nawaz Sharif School of Eminence</h1>
              <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Class Report Card</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <p className="text-lg font-black text-slate-900">
                Class {selectedClass?.name ?? classId} ({selectedSection?.name ?? sectionId})
              </p>
              <p className="text-sm text-slate-500 font-medium">{resultStudents.length} students</p>
            </div>
            <span className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-xl w-fit">
              {selectedExamType}
            </span>
          </div>

          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left table-fixed min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">#</th>
                  <th className="py-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="py-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admission No</th>
                  {marksheet.subjects.map((sub) => (
                    <th key={sub.schedule_id} className="py-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {sub.subject_name}
                    </th>
                  ))}
                  <th className="py-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="py-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">%</th>
                  <th className="py-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {resultStudents.map((student, index) => {
                  const totalMarks = marksheet.subjects.reduce((sum, sub) => sum + sub.total_marks, 0);
                  const totalObtained = marksheet.subjects.reduce((sum, sub) => {
                    const cell = student.marks[sub.schedule_id];
                    if (!cell || cell.is_absent) return sum;
                    return sum + (cell.obtained_marks ?? 0);
                  }, 0);
                  const { grade, status } = calculateGrade(totalObtained, totalMarks);
                  const percentage = totalMarks ? (totalObtained / totalMarks) * 100 : 0;
                  return (
                    <tr key={student.student_id}>
                      <td className="py-3 pr-3 text-sm text-slate-500 font-medium">{index + 1}</td>
                      <td className="py-3 pr-3 text-sm font-bold text-slate-800">{student.student_name}</td>
                      <td className="py-3 pr-3 text-sm text-slate-500 font-medium">{student.admission_no}</td>
                      {marksheet.subjects.map((sub) => {
                        const cell = student.marks[sub.schedule_id];
                        return (
                          <td key={sub.schedule_id} className="py-3 pr-3 text-sm font-semibold text-slate-700">
                            {cell?.is_absent ? (
                              <span className="text-rose-500 font-bold">Absent</span>
                            ) : cell?.obtained_marks != null ? (
                              `${cell.obtained_marks}/${sub.total_marks}`
                            ) : (
                              <span className="text-slate-300">&mdash;</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 pr-3 text-sm font-black text-slate-800">{totalObtained}/{totalMarks}</td>
                      <td className="py-3 pr-3 text-sm font-bold text-slate-700">{percentage.toFixed(1)}%</td>
                      <td className="py-3 pr-3">
                        <span className={cn('text-sm font-black', status === 'Pass' ? 'text-brand-600' : 'text-rose-500')}>{grade}</span>
                      </td>
                      <td className="py-3">
                        <span className={`text-sm font-black ${status === 'Pass' ? 'text-emerald-600' : 'text-rose-600'}`}>{status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
