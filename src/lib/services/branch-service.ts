import { apiClient } from '../api-client';
import { Branch } from '../../types/models/branch';

export const branchService = {
  /**
   * Fetches the list of all branches.
   */
  getBranches: async (): Promise<Branch[]> => {
    const response = await apiClient.get<{ status: boolean; data: Branch[] }>('/branch');
    return response.data.data;
  },

  /**
   * Fetches a single branch by ID.
   */
  getBranch: async (id: number): Promise<Branch> => {
    const response = await apiClient.get<{ status: boolean; data: Branch }>(`/branch/${id}`);
    return response.data.data;
  },

  /**
   * Creates a new branch.
   */
  createBranch: async (data: any): Promise<Branch> => {
    const response = await apiClient.post<{ status: boolean; data: Branch }>('/branch', data);
    return response.data.data;
  },

  /**
   * Updates an existing branch.
   * Laravel pattern: POST to branch/{id} with _method: "PUT"
   */
  updateBranch: async (id: number, data: any): Promise<Branch> => {
    const response = await apiClient.post<{ status: boolean; data: Branch }>(`/branch/${id}`, {
      ...data,
      _method: "PUT"
    });
    return response.data.data;
  },

  /**
   * Deletes a branch.
   */
  deleteBranch: async (id: number): Promise<void> => {
    await apiClient.delete(`/branch/${id}`);
  }
};
