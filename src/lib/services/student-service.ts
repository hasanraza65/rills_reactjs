import { apiClient } from '../api-client';
import { StudentData, CreateStudentInput, UpdateStudentInput } from '../../types/api/student';

export const studentService = {
  /**
   * Fetches the list of students for a given branch.
   */
  getStudents: async (branchId: number = 1): Promise<StudentData[]> => {
    const response = await apiClient.get<StudentData[]>('/students', {
      params: { branch_id: branchId }
    });
    return response.data;
  },

  /**
   * Fetches a single student by ID.
   */
  getStudent: async (id: number): Promise<StudentData> => {
    const response = await apiClient.get<StudentData>(`/students/${id}`);
    return response.data;
  },

  /**
   * Creates a new student record.
   */
  createStudent: async (data: CreateStudentInput): Promise<StudentData> => {
    const response = await apiClient.post<StudentData>('/students', data);
    return response.data;
  },

  /**
   * Updates an existing student record.
   */
  updateStudent: async (id: number, data: UpdateStudentInput): Promise<StudentData> => {
    const response = await apiClient.put<StudentData>(`/students/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a student record.
   */
  deleteStudent: async (id: number): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  }
};
