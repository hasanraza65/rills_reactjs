/**
 * @fileoverview API types for the Examination & Test module (exam groups, schedule,
 * subject assignment, marks). Mirrors the Laravel `exam_*` tables.
 */

export type ExamType = 'Mid Term' | 'Final Term' | 'Monthly Test' | 'Quiz' | 'Class Test';

export const EXAM_TYPES: ExamType[] = ['Mid Term', 'Final Term', 'Monthly Test', 'Quiz', 'Class Test'];

export interface ExamGroup {
  id: number;
  branch_id: number;
  name: string;
  exam_type: ExamType;
  description: string | null;
  added_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExamGroupInput {
  branch_id: number;
  name: string;
  exam_type: ExamType;
  description?: string;
}

export interface ExamGroupExam {
  id: number;
  exam_group_id: number;
  name: string;
  publish_exam: boolean;
  publish_schedule: boolean;
  publish_result: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExamGroupExamInput {
  exam_group_id: number;
  name: string;
  publish_exam: boolean;
  publish_schedule: boolean;
  publish_result: boolean;
  description?: string;
}

export interface ExamSchedule {
  id: number;
  branch_id: number;
  exam_type: ExamType;
  /** Which Exam Group Exam this schedule was created under, if any — schedules made
   * before this linkage existed (or outside the wizard) leave this null. */
  exam_group_exam_id: number | null;
  class_id: number;
  section_id: number;
  subject_id: number;
  date: string; // yyyy-mm-dd
  start_time: string; // HH:mm
  duration: string | null;
  teacher_id: number | null;
  total_marks: number;
  min_marks: number;
  created_at: string;
  updated_at: string;
  subject?: { id: number; subject_name: string };
  school_class?: { id: number; name: string };
  section?: { id: number; name: string };
  teacher?: { id: number; name: string } | null;
}

export interface ExamScheduleRowInput {
  subject_id: number;
  date: string;
  start_time: string;
  duration?: string;
  teacher_id?: number | null;
  total_marks: number;
  min_marks?: number;
}

export interface BulkSaveExamScheduleInput {
  branch_id: number;
  exam_type: ExamType;
  exam_group_exam_id?: number | null;
  class_id: number;
  section_id: number;
  rows: ExamScheduleRowInput[];
}

export interface ExamSubjectGroup {
  id: number;
  branch_id: number;
  section_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  subjects?: { id: number; subject_name: string }[];
}

export interface CreateExamSubjectGroupInput {
  branch_id: number;
  section_id: number;
  name: string;
  subject_ids: number[];
}

/** { student_id: [class_subject_id, ...] } */
export type StudentSubjectsMap = Record<number, number[]>;

export interface ExamMark {
  id: number;
  exam_schedule_id: number;
  student_id: number;
  obtained_marks: number;
  is_absent: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
}

/** A single mark row joined with its schedule + subject, as returned by /exam-marks/student/{id} — everything the Report Card needs. */
export interface ExamMarkWithSchedule {
  id: number;
  exam_schedule_id: number;
  student_id: number;
  obtained_marks: number;
  is_absent: boolean;
  note: string | null;
  schedule: {
    id: number;
    exam_type: ExamType;
    subject_id: number;
    total_marks: number;
    min_marks: number;
    subject?: { id: number; subject_name: string };
  } | null;
}

export interface BulkSaveMarksInput {
  exam_schedule_id: number;
  marks: { student_id: number; obtained_marks: number; is_absent?: boolean; note?: string }[];
}

/** "By Student" Marks Entry mode — one student, every subject at once. */
export interface BulkSaveMarksForStudentInput {
  student_id: number;
  marks: { exam_schedule_id: number; obtained_marks: number; is_absent?: boolean; note?: string }[];
}

/** Class-wide result sheet — every student in a class/section, every subject scheduled
 * for one exam type, whatever marks exist so far. Returned by GET /exam-marks/marksheet. */
export interface Marksheet {
  subjects: { schedule_id: number; subject_name: string; total_marks: number }[];
  students: {
    student_id: number;
    student_name: string;
    admission_no: string;
    /** { schedule_id: { obtained_marks, is_absent } } */
    marks: Record<number, { obtained_marks: number | null; is_absent: boolean }>;
  }[];
}

export interface GradeResult {
  grade: string;
  status: 'Pass' | 'Fail';
}

/** Percentage → letter grade. Shared by Marks Entry, Exam Schedule and Report Card so
 * they all compute the exact same grade for the same score. */
export const calculateGrade = (obtained: number, total: number): GradeResult => {
  if (!total) return { grade: '-', status: 'Fail' };
  const percentage = (obtained / total) * 100;
  if (percentage >= 90) return { grade: 'A+', status: 'Pass' };
  if (percentage >= 80) return { grade: 'A', status: 'Pass' };
  if (percentage >= 70) return { grade: 'B', status: 'Pass' };
  if (percentage >= 60) return { grade: 'C', status: 'Pass' };
  if (percentage >= 50) return { grade: 'D', status: 'Pass' };
  return { grade: 'F', status: 'Fail' };
};
