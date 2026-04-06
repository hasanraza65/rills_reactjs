import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService } from '../lib/services/branch-service';

/**
 * Hook to fetch all branches.
 */
export const useBranches = () => {
  return useQuery({
    queryKey: ['branches', 'list'],
    queryFn: () => branchService.getBranches(),
  });
};

/**
 * Hook to fetch a single branch by ID.
 */
export const useBranch = (id: number | null) => {
  return useQuery({
    queryKey: ['branches', 'detail', id],
    queryFn: () => branchService.getBranch(id!),
    enabled: !!id,
  });
};

/**
 * Hook to create a new branch.
 */
export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => branchService.createBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches', 'list'] });
    },
  });
};

/**
 * Hook to update an existing branch.
 */
export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      branchService.updateBranch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
};

/**
 * Hook to delete a branch.
 */
export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => branchService.deleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
};
