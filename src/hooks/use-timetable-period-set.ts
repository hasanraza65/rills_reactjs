import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetablePeriodSetService } from '../lib/services/timetable-period-set-service';
import { CreateTimetablePeriodSetInput, UpdateTimetablePeriodSetInput } from '../types/api/timetable-period-set';

export const useTimetablePeriodSets = (branchId?: number, groupId?: number) => {
  return useQuery({
    queryKey: ['timetable-period-sets', branchId, groupId],
    queryFn: () => timetablePeriodSetService.getPeriodSets(branchId, groupId),
  });
};

export const useTimetablePeriodSet = (id: number | null) => {
  return useQuery({
    queryKey: ['timetable-period-sets', 'detail', id],
    queryFn: () => timetablePeriodSetService.getPeriodSet(id!),
    enabled: !!id,
  });
};

export const useCreateTimetablePeriodSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimetablePeriodSetInput) => timetablePeriodSetService.createPeriodSet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-period-sets'] });
    },
  });
};

export const useUpdateTimetablePeriodSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTimetablePeriodSetInput }) =>
      timetablePeriodSetService.updatePeriodSet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-period-sets'] });
    },
  });
};

export const useDeleteTimetablePeriodSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => timetablePeriodSetService.deletePeriodSet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-period-sets'] });
    },
  });
};
