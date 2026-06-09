import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admissionKeyService } from '../lib/services/admission-key-service';
import { CreateAdmissionKeyPayload } from '../types/api/admission-key';
import { useBranchStore } from '../store/use-branch-store';

/**
 * Hook to fetch the list of admission keys.
 */
export const useAdmissionKeys = (branchId: number = 1) => {
  return useQuery({
    queryKey: ['admission-keys', 'list', branchId],
    queryFn: () => admissionKeyService.getKeys(branchId),
  });
};

/**
 * Hook to create a new admission key record.
 */
export const useCreateAdmissionKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdmissionKeyPayload) =>
      admissionKeyService.createKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-keys'] });
    },
  });
};

/**
 * Hook to delete an admission key record.
 */
export const useDeleteAdmissionKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => admissionKeyService.deleteKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-keys'] });
    },
  });
};

/**
 * Hook to update an admission key record.
 */
export const useUpdateAdmissionKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      admissionKeyService.updateKey(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-keys'] });
    },
  });
};
