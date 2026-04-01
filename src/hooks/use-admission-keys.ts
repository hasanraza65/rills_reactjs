import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admissionKeyService } from '../lib/services/admission-key-service';

/**
 * Hook to fetch the list of admission keys.
 */
export const useAdmissionKeys = () => {
  return useQuery({
    queryKey: ['admission-keys', 'list'],
    queryFn: () => admissionKeyService.getKeys(),
  });
};

/**
 * Hook to create a new admission key record.
 */
export const useCreateAdmissionKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { branch_id: number; key: string }) => 
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
