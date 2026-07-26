import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableActivityService } from '../lib/services/timetable-activity-service';
import { CreateTimetableActivityInput, UpdateTimetableActivityInput } from '../types/api/timetable-activity';

export const useTimetableActivities = (branchId?: number) => {
  return useQuery({
    queryKey: ['timetable-activities', branchId],
    queryFn: () => timetableActivityService.getActivities(branchId),
  });
};

export const useCreateTimetableActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimetableActivityInput) => timetableActivityService.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-activities'] });
    },
  });
};

export const useUpdateTimetableActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTimetableActivityInput }) =>
      timetableActivityService.updateActivity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-activities'] });
    },
  });
};

export const useDeleteTimetableActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => timetableActivityService.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-activities'] });
    },
  });
};
