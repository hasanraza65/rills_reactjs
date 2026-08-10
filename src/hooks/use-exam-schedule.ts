import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examScheduleService } from '../lib/services/exam-schedule-service';
import { BulkSaveExamScheduleInput } from '../types/api/exam';

export interface ExamScheduleFilters {
  branch_id?: number;
  exam_type?: string;
  class_id?: number;
  section_id?: number;
  exam_group_exam_id?: number;
}

export const useExamSchedules = (filters: ExamScheduleFilters = {}) =>
  useQuery({
    queryKey: ['exam-schedules', filters],
    queryFn: () => examScheduleService.getSchedules(filters),
  });

export const useBulkSaveExamSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkSaveExamScheduleInput) => examScheduleService.bulkSave(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-schedules'] }),
  });
};

export const useDeleteExamSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examScheduleService.deleteSchedule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-schedules'] }),
  });
};
