import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examSubjectService } from '../lib/services/exam-subject-service';
import { CreateExamSubjectGroupInput } from '../types/api/exam';

export const useExamSubjectGroups = (sectionId: number | null) =>
  useQuery({
    queryKey: ['exam-subject-groups', sectionId],
    queryFn: () => examSubjectService.getSubjectGroups(sectionId!),
    enabled: !!sectionId,
  });

export const useCreateExamSubjectGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamSubjectGroupInput) => examSubjectService.createSubjectGroup(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-subject-groups'] }),
  });
};

/** { student_id: [class_subject_id, ...] } for the given students — refetches whenever the id list changes. */
export const useStudentSubjectsMap = (studentIds: number[]) =>
  useQuery({
    queryKey: ['exam-student-subjects', studentIds],
    queryFn: () => examSubjectService.getStudentSubjects(studentIds),
    enabled: studentIds.length > 0,
  });

export const useBulkAssignExamSubjects = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studentIds, classSubjectIds }: { studentIds: number[]; classSubjectIds: number[] }) =>
      examSubjectService.bulkAssign(studentIds, classSubjectIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-student-subjects'] }),
  });
};

export const useSetStudentExamSubjects = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, classSubjectIds }: { studentId: number; classSubjectIds: number[] }) =>
      examSubjectService.setForStudent(studentId, classSubjectIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-student-subjects'] }),
  });
};
