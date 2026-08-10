import React, { useMemo, useState } from 'react';
import { Award, Printer, GraduationCap, User } from 'lucide-react';
import { cn } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { useBranchStore } from '../../store/use-branch-store';
import { useStudents } from '../../hooks/use-student';
import { useExamMarksForStudent } from '../../hooks/use-exam-mark';
import { calculateGrade, ExamType } from '../../types/api/exam';

export const ReportCard: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId ?? 1;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center sm:text-left">
            Report Card
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base text-center sm:text-left">
            View a student's consolidated result across all subjects
          </p>
        </div>
        {student && selectedExamType && subjectRows.length > 0 && (
          <Button variant="outline" leftIcon={<Printer size={18} />} onClick={() => window.print()}>
            Print
          </Button>
        )}
      </div>

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
