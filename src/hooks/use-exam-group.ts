import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examGroupService } from '../lib/services/exam-group-service';
import { CreateExamGroupInput, CreateExamGroupExamInput } from '../types/api/exam';

export const useExamGroups = (branchId: number = 1) =>
  useQuery({
    queryKey: ['exam-groups', branchId],
    queryFn: () => examGroupService.getGroups(branchId),
  });

export const useCreateExamGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamGroupInput) => examGroupService.createGroup(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-groups'] }),
  });
};

export const useUpdateExamGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<CreateExamGroupInput, 'branch_id'> }) =>
      examGroupService.updateGroup(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-groups'] }),
  });
};

export const useDeleteExamGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examGroupService.deleteGroup(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-groups'] });
      // Deleting a group cascades its exams server-side.
      qc.invalidateQueries({ queryKey: ['exam-group-exams'] });
    },
  });
};

export const useExamGroupExams = (branchId: number = 1) =>
  useQuery({
    queryKey: ['exam-group-exams', branchId],
    queryFn: () => examGroupService.getGroupExams(branchId),
  });

export const useCreateExamGroupExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamGroupExamInput) => examGroupService.createGroupExam(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-group-exams'] }),
  });
};

export const useUpdateExamGroupExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<CreateExamGroupExamInput, 'exam_group_id'> }) =>
      examGroupService.updateGroupExam(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-group-exams'] }),
  });
};

export const useDeleteExamGroupExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examGroupService.deleteGroupExam(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-group-exams'] }),
  });
};
