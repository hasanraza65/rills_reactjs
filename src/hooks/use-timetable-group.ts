import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableGroupService } from '../lib/services/timetable-group-service';
import { CreateTimetableGroupInput, UpdateTimetableGroupInput } from '../types/api/timetable-group';

export const useTimetableGroups = (branchId?: number) => {
  return useQuery({
    queryKey: ['timetable-groups', branchId],
    queryFn: () => timetableGroupService.getGroups(branchId),
  });
};

export const useTimetableGroup = (id: number | null) => {
  return useQuery({
    queryKey: ['timetable-groups', 'detail', id],
    queryFn: () => timetableGroupService.getGroup(id!),
    enabled: !!id,
  });
};

export const useCreateTimetableGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimetableGroupInput) => timetableGroupService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-groups'] });
    },
  });
};

export const useUpdateTimetableGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTimetableGroupInput }) =>
      timetableGroupService.updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-groups'] });
    },
  });
};

export const useDeleteTimetableGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => timetableGroupService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-groups'] });
    },
  });
};
