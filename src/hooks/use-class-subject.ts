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
 * Hook to fetch every subject a specific teacher is assigned to — used when an
 * admin manages a teacher's subjects directly from Staff Management.
 */
export const useTeacherSubjects = (teacherId: number | null, branchId?: number | null) => {
  return useQuery({
    queryKey: ['class-subjects', 'teacher', teacherId, branchId ?? 'default'],
    queryFn: () => classSubjectService.getSubjectsByTeacher(teacherId!, branchId ?? 1),
    enabled: !!teacherId,
  });
};

/**
 * Hook to fetch every class-subject row in a branch — used to derive the full
 * catalogue of subject names already in use (e.g. "Math"), so a subject can be
 * assigned to another teacher without retyping/misspelling its name.
 */
export const useBranchSubjects = (branchId: number) => {
  return useQuery({
    queryKey: ['class-subjects', 'branch', branchId],
    queryFn: () => classSubjectService.getSubjectsByBranch(branchId),
  });
};

/**
 * Hook to create a new class subject.
 *
 * Invalidates every `class-subjects` query (not just the section it was created
 * for) since the same row is also visible from a per-teacher view (Staff
 * Management's subject assignment) which is keyed differently.
 */
export const useCreateClassSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassSubjectInput) => classSubjectService.createSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-subjects'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-subjects'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-subjects'] });
    },
    onError: (error: any) => {
      console.error(error?.response?.data?.message || 'Failed to delete subject');
      alert(error?.response?.data?.message || 'Failed to delete subject');
    },
  });
};
