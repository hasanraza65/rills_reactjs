import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classService } from '../lib/services/class-service';
import { CreateClassInput, UpdateClassInput } from '../types/api/class';

/**
 * Hook to fetch the list of classes for the current branch.
 */
export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getClasses(),
  });
};

/**
 * Hook to fetch a single class by id
 */
export const useClass = (id: number) => {
  return useQuery({
    queryKey: ['class', id],
    queryFn: () => classService.getClass(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a new class
 */
export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassInput) => classService.createClass(data),
    onSuccess: () => {
      // toast.success('Class created successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error: any) => {
      console.error(error?.response?.data?.message || 'Failed to create class');
      alert(error?.response?.data?.message || 'Failed to create class');
    },
  });
};

/**
 * Hook to update an existing class
 */
export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClassInput }) => classService.updateClass(id, data),
    onSuccess: (_, variables) => {
      // toast.success('Class updated successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class', variables.id] });
    },
    onError: (error: any) => {
      console.error(error?.response?.data?.message || 'Failed to update class');
      alert(error?.response?.data?.message || 'Failed to update class');
    },
  });
};

/**
 * Hook to delete a class
 */
export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => classService.deleteClass(id),
    onSuccess: () => {
      // toast.success('Class deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error: any) => {
      console.error(error?.response?.data?.message || 'Failed to delete class');
      alert(error?.response?.data?.message || 'Failed to delete class');
    },
  });
};
