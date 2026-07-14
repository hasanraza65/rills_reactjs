/**
 * @fileoverview Hooks for fetching, creating, updating, and deleting syllabus entries.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { syllabusService } from '../lib/services/syllabus-service';
import {
  CreateSyllabusInput,
  UpdateSyllabusInput,
  SyllabusFilters,
  SyllabusStatus,
} from '../types/api/syllabus';

/**
 * Hook to fetch the syllabus entries visible to the current user, optionally filtered.
 */
export const useSyllabuses = (filters: SyllabusFilters = {}) => {
  return useQuery({
    queryKey: ['syllabus', 'list', filters],
    queryFn: () => syllabusService.getSyllabuses(filters),
  });
};

/**
 * Hook to fetch a single syllabus entry.
 */
export const useSyllabus = (id: number | null) => {
  return useQuery({
    queryKey: ['syllabus', 'detail', id],
    queryFn: () => syllabusService.getSyllabusById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to create a syllabus entry.
 */
export const useCreateSyllabus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSyllabusInput) => syllabusService.createSyllabus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syllabus'] });
    },
  });
};

/**
 * Hook to update a syllabus entry. Callers must send every editable field.
 */
export const useUpdateSyllabus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSyllabusInput }) =>
      syllabusService.updateSyllabus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syllabus'] });
    },
  });
};

/**
 * Hook to flip a syllabus entry's approval status.
 */
export const useUpdateSyllabusStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: SyllabusStatus }) =>
      syllabusService.updateSyllabusStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syllabus'] });
    },
  });
};

/**
 * Hook to delete a syllabus entry.
 */
export const useDeleteSyllabus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => syllabusService.deleteSyllabus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syllabus'] });
    },
  });
};
