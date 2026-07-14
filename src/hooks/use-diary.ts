/**
 * @fileoverview Hooks for fetching, creating, updating, and deleting diaries.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { diaryService } from '../lib/services/diary-service';
import {
  CreateDiaryInput,
  UpdateDiaryInput,
  DiaryFilters,
  DiaryStatus,
} from '../types/api/diary';

/**
 * Hook to fetch the diaries visible to the current user, optionally filtered.
 */
export const useDiaries = (filters: DiaryFilters = {}) => {
  return useQuery({
    queryKey: ['diaries', 'list', filters],
    queryFn: () => diaryService.getDiaries(filters),
  });
};

/**
 * Hook to fetch a single diary.
 */
export const useDiary = (id: number | null) => {
  return useQuery({
    queryKey: ['diaries', 'detail', id],
    queryFn: () => diaryService.getDiaryById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to create a diary entry.
 */
export const useCreateDiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiaryInput) => diaryService.createDiary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diaries'] });
    },
  });
};

/**
 * Hook to update a diary entry. Callers must send every editable field.
 */
export const useUpdateDiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDiaryInput }) =>
      diaryService.updateDiary(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diaries'] });
    },
  });
};

/**
 * Hook to flip a diary's approval status.
 */
export const useUpdateDiaryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: DiaryStatus }) =>
      diaryService.updateDiaryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diaries'] });
    },
  });
};

/**
 * Hook to delete a diary entry.
 */
export const useDeleteDiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => diaryService.deleteDiary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diaries'] });
    },
  });
};
