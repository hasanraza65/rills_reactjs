import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parentService } from '../lib/services/parent-service';
import { CreateParentInput, UpdateParentInput } from '../types/api/parent';

/**
 * Hook to fetch the list of parents.
 */
export const useParents = (branchId: number = 1) => {
  return useQuery({
    queryKey: ['parents', 'list', branchId],
    queryFn: () => parentService.getParents(branchId),
  });
};

/**
 * Hook to fetch a single parent.
 */
export const useParent = (id: number | null) => {
  return useQuery({
    queryKey: ['parents', 'detail', id],
    queryFn: () => parentService.getParent(id!),
    enabled: !!id,
  });
};

/**
 * Hook to create a new parent record.
 */
export const useCreateParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateParentInput) => parentService.createParent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents', 'list'] });
    },
  });
};

/**
 * Hook to update an existing parent record.
 */
export const useUpdateParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateParentInput }) => 
      parentService.updateParent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
    },
  });
};

/**
 * Hook to delete a parent record.
 */
export const useDeleteParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => parentService.deleteParent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
    },
  });
};
