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
  createStudent: async (data: CreateStudentInput | FormData): Promise<StudentData> => {
    const isFormData = data instanceof FormData;
    const response = await apiClient.post<StudentData>('/students', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
  },

  /**
   * Updates an existing student record.
   *
   * FormData updates (i.e. whenever a photo/attachment is involved) go out as POST
   * with `_method: PUT` (Laravel method spoofing) — PHP never populates $_POST for a
   * genuine PUT request with a multipart body, so a real PUT here silently drops every
   * field and the "update" becomes a no-op. Same pattern already used for class-subjects
   * (see class-subject-service.ts). Plain JSON updates have no multipart body, so a real
   * PUT works fine for those.
   */
  updateStudent: async (id: number, data: UpdateStudentInput | FormData): Promise<StudentData> => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      const response = await apiClient.post<StudentData>(`/students/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.put<StudentData>(`/students/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a student record.
   */
  deleteStudent: async (id: number): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  },

  /**
   * Fetches students by parent ID.
   */
  getStudentsByParent: async (parentId: number, branchId?: number): Promise<StudentData[]> => {
    const response = await apiClient.get<StudentData[]>(`/students_by_parent/${parentId}`, {
      params: branchId ? { branch_id: branchId } : {}
    });
    return response.data;
  }
};
