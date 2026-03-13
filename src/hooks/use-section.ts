import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectionService } from '../lib/services/section-service';
import { CreateSectionInput, UpdateSectionInput } from '../types/api/section';

/**
 * Hook to fetch the list of sections.
 */
export const useSections = () => {
  return useQuery({
    queryKey: ['sections'],
    queryFn: () => sectionService.getSections(),
  });
};

/**
 * Hook to fetch a single section.
 */
export const useSection = (id: number | null) => {
  return useQuery({
    queryKey: ['sections', id],
    queryFn: () => sectionService.getSection(id!),
    enabled: !!id,
  });
};

/**
 * Hook to create a new section.
 */
export const useCreateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSectionInput) => sectionService.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
};

/**
 * Hook to update an existing section.
 */
export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSectionInput }) => 
      sectionService.updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
};

/**
 * Hook to delete a section.
 */
export const useDeleteSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sectionService.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
};
