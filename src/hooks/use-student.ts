import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../lib/services/student-service';
import { CreateStudentInput, UpdateStudentInput } from '../types/api/student';

/**
 * Hook to fetch the list of students.
 */
export const useStudents = (branchId: number = 1) => {
  return useQuery({
    queryKey: ['students', 'list', branchId],
    queryFn: () => studentService.getStudents(branchId),
  });
};

/**
 * Hook to fetch a single student.
 */
export const useStudent = (id: number | null) => {
  return useQuery({
    queryKey: ['students', 'detail', id],
    queryFn: () => studentService.getStudent(id!),
    enabled: !!id,
  });
};

/**
 * Hook to create a new student record.
 */
export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudentInput | FormData) => studentService.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'list'] });
    },
  });
};

/**
 * Hook to update an existing student record.
 */
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStudentInput | FormData }) => 
      studentService.updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

/**
 * Hook to delete a student record.
 */
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studentService.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};
