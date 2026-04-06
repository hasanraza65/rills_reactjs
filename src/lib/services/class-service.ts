/**
 * @fileoverview Service for class-related API calls.
 */

import { apiClient } from '../api-client';
import { ClassData, CreateClassInput, UpdateClassInput } from '../../types/api/class';

export const classService = {
  /**
   * Fetches the list of classes for a given branch.
   */
  getClasses: async (branchId: number = 1): Promise<ClassData[]> => {
    const response = await apiClient.get<ClassData[]>('/classes', {
      params: { branch_id: branchId }
    });
    return response.data;
  },

  /**
   * Fetches a single class by ID.
   */
  getClass: async (id: number): Promise<ClassData> => {
    const response = await apiClient.get<ClassData>(`/classes/${id}`);
    return response.data;
  },

  /**
   * Creates a new class.
   */
  createClass: async (data: CreateClassInput): Promise<ClassData> => {
    const response = await apiClient.post<ClassData>('/classes', data);
    return response.data;
  },

  /**
   * Updates an existing class.
   */
  updateClass: async (id: number, data: UpdateClassInput): Promise<ClassData> => {
    const response = await apiClient.put<ClassData>(`/classes/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a class.
   */
  deleteClass: async (id: number): Promise<void> => {
    await apiClient.delete(`/classes/${id}`);
  },
};
