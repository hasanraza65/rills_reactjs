/**
 * @fileoverview Hook for fetching, creating, updating, and deleting class subjects by section.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classSubjectService } from '../lib/services/class-subject-service';
import { CreateClassSubjectInput, UpdateClassSubjectInput } from '../types/api/class-subject';

/**
 * Hook to fetch subjects for a specific section.
 *
 * branchId defaults to 1 in the service layer if omitted — always pass the
 * real selected branch, otherwise this silently queries branch 1 regardless
 * of which branch the section actually belongs to.
 */
export const useClassSubjects = (sectionId: number | null, branchId?: number | null) => {
  return useQuery({
    queryKey: ['class-subjects', sectionId, branchId ?? 'default'],
    queryFn: () => classSubjectService.getSubjectsBySection(sectionId!, branchId ?? undefined),
    enabled: !!sectionId,
  });
};

/**
 * Hook to fetch the subjects the signed-in teacher is assigned to.
 */
export const useMySubjects = (enabled = true) => {
  return useQuery({
    queryKey: ['class-subjects', 'mine'],
    queryFn: () => classSubjectService.getMySubjects(),
    enabled,
  });
};

/**
 * Hook to create a new class subject.
 */
export const useCreateClassSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassSubjectInput) => classSubjectService.createSubject(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class-subjects', variables.section_id] });
    },
    onError: (error: any) => {
      console.error(error?.response?.data?.message || 'Failed to create subject');
      alert(error?.response?.data?.message || 'Failed to create subject');
    },
  });
};

/**
 * Hook to update an existing class subject.
 */
export const useUpdateClassSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClassSubjectInput }) =>
      classSubjectService.updateSubject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class-subjects', variables.data.section_id] });
    },
    onError: (error: any) => {
      console.error(error?.response?.data?.message || 'Failed to update subject');
      alert(error?.response?.data?.message || 'Failed to update subject');
    },
  });
};

/**
 * Hook to delete a class subject.
 */
export const useDeleteClassSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; sectionId: number }) =>
      classSubjectService.deleteSubject(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class-subjects', variables.sectionId] });
    },
    onError: (error: any) => {
      console.error(error?.response?.data?.message || 'Failed to delete subject');
      alert(error?.response?.data?.message || 'Failed to delete subject');
    },
  });
};
