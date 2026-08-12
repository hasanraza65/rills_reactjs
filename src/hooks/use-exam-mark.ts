import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examMarkService } from '../lib/services/exam-mark-service';
import { BulkSaveMarksInput, BulkSaveMarksForStudentInput } from '../types/api/exam';

export const useExamMarksForSchedule = (examScheduleId: number | null) =>
  useQuery({
    queryKey: ['exam-marks', 'schedule', examScheduleId],
    queryFn: () => examMarkService.getMarksForSchedule(examScheduleId!),
    enabled: !!examScheduleId,
  });

/** Every mark a student has ever received, joined with exam type + subject — what Report Card needs. */
export const useExamMarksForStudent = (studentId: number | null) =>
  useQuery({
    queryKey: ['exam-marks', 'student', studentId],
    queryFn: () => examMarkService.getMarksForStudent(studentId!),
    enabled: !!studentId,
  });

/** Class-wide result sheet for one class/section/exam-type — every student, every scheduled subject. */
export const useMarksheet = (params: { class_id: number; section_id: number; exam_type: string } | null) =>
  useQuery({
    queryKey: ['exam-marksheet', params],
    queryFn: () => examMarkService.getMarksheet(params!),
    enabled: !!params,
  });

export const useBulkSaveExamMarks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkSaveMarksInput) => examMarkService.bulkSave(data),
    onSuccess: (_, variables) =>
      qc.invalidateQueries({ queryKey: ['exam-marks', 'schedule', variables.exam_schedule_id] }),
  });
};

/** "By Student" Marks Entry mode — saves every subject's mark for one student at once. */
export const useBulkSaveExamMarksForStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkSaveMarksForStudentInput) => examMarkService.bulkSaveForStudent(data),
    onSuccess: (_, variables) =>
      qc.invalidateQueries({ queryKey: ['exam-marks', 'student', variables.student_id] }),
  });
};
