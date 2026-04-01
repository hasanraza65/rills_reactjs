import { apiClient } from '../api-client';
import { AdmissionKeyData } from '../../types/api/admission-key';

export const admissionKeyService = {
  /**
   * Fetches the list of admission keys.
   */
  getKeys: async (): Promise<AdmissionKeyData[]> => {
    const response = await apiClient.get<{ status: boolean; data: AdmissionKeyData[] }>('/temp-add-keys');
    return response.data.data;
  },

  /**
   * Creates a new admission key.
   */
  createKey: async (data: { branch_id: number; key: string }): Promise<AdmissionKeyData> => {
    const response = await apiClient.post<{ status: boolean; data: AdmissionKeyData }>('/temp-add-keys', data);
    return response.data.data;
  },

  /**
   * Deletes an admission key.
   */
  deleteKey: async (id: number): Promise<void> => {
    await apiClient.delete(`/temp-add-keys/${id}`);
  },

  /**
   * Updates an admission key.
   * Laravel pattern: POST to ID with _method: "put"
   */
  updateKey: async (id: number, data: { branch_id: number; key: string }): Promise<AdmissionKeyData> => {
    const response = await apiClient.post<{ status: boolean; data: AdmissionKeyData }>(`/temp-add-keys/${id}`, {
      ...data,
      _method: "put"
    });
    return response.data.data;
  }
};
