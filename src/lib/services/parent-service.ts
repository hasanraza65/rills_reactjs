import { apiClient } from '../api-client';
import { ParentData, CreateParentInput, UpdateParentInput } from '../../types/api/parent';

export const parentService = {
  /**
   * Fetches the list of parents for a given branch.
   */
  getParents: async (branchId: number = 1): Promise<ParentData[]> => {
    const response = await apiClient.get<ParentData[]>('/parents', {
      params: { branch_id: branchId }
    });
    return response.data;
  },

  /**
   * Fetches a single parent by ID.
   */
  getParent: async (id: number): Promise<ParentData> => {
    const response = await apiClient.get<ParentData>(`/parents/${id}`);
    return response.data;
  },

  /**
   * Creates a new parent record.
   */
  createParent: async (data: CreateParentInput): Promise<ParentData> => {
    const response = await apiClient.post<ParentData>('/parents', data);
    return response.data;
  },

  /**
   * Updates an existing parent record.
   */
  updateParent: async (id: number, data: UpdateParentInput): Promise<ParentData> => {
    const response = await apiClient.put<ParentData>(`/parents/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a parent record.
   */
  deleteParent: async (id: number): Promise<void> => {
    await apiClient.delete(`/parents/${id}`);
  }
};
