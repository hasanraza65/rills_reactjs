import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableService } from '../lib/services/timetable-service';
import {
  CreateTimetableInput,
  UpdateTimetableInput,
  RegenerateTimetableInput,
  UpdateTimetableSlotInput,
} from '../types/api/timetable';

export const useTimetables = (branchId?: number) => {
  return useQuery({
    queryKey: ['timetables', branchId],
    queryFn: () => timetableService.getTimetables(branchId),
  });
};

export const useTimetable = (id: number | null) => {
  return useQuery({
    queryKey: ['timetables', 'detail', id],
    queryFn: () => timetableService.getTimetable(id!),
    enabled: !!id,
  });
};

export const useTimetableSlots = (timetableId: number | null) => {
  return useQuery({
    queryKey: ['timetables', 'slots', timetableId],
    queryFn: () => timetableService.getSlots(timetableId!),
    enabled: !!timetableId,
  });
};

export const useTeacherBusySlots = (branchId?: number) => {
  return useQuery({
    queryKey: ['timetables', 'teacher-busy-slots', branchId],
    queryFn: () => timetableService.getTeacherBusySlots(branchId),
  });
};

export const useCreateTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimetableInput) => timetableService.createTimetable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
    },
  });
};

export const useUpdateTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTimetableInput }) => timetableService.updateTimetable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
    },
  });
};

export const useRegenerateTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RegenerateTimetableInput }) =>
      timetableService.regenerateTimetable(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      queryClient.invalidateQueries({ queryKey: ['timetables', 'slots', variables.id] });
    },
  });
};

export const useDeleteTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => timetableService.deleteTimetable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
    },
  });
};

export const useDailyPrint = (timetableId: number | null, dayOfWeek: number | null) => {
  return useQuery({
    queryKey: ['timetables', 'print', 'daily', timetableId, dayOfWeek],
    queryFn: () => timetableService.getDailyPrint(timetableId!, dayOfWeek!),
    enabled: !!timetableId && !!dayOfWeek,
  });
};

export const useTeacherPrint = (teacherId: number | null) => {
  return useQuery({
    queryKey: ['timetables', 'print', 'teacher', teacherId],
    queryFn: () => timetableService.getTeacherPrint(teacherId!),
    enabled: !!teacherId,
  });
};

/**
 * Saves one Period Allocation cell. Conflict errors (422, teacher already
 * assigned) surface via the mutation's `error` — callers should read
 * `error?.response?.data?.message` and show it inline under the cell.
 */
export const useUpdateTimetableSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      timetableId,
      slotId,
      data,
    }: {
      timetableId: number;
      slotId: number;
      data: UpdateTimetableSlotInput;
    }) => timetableService.updateSlot(timetableId, slotId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timetables', 'slots', variables.timetableId] });
    },
  });
};
