import { apiClient } from '../api-client';
import { AdmissionKeyData, CreateAdmissionKeyPayload } from '../../types/api/admission-key';

export const admissionKeyService = {
  /**
   * Fetches the list of admission keys.
   */
  getKeys: async (branchId: number = 1): Promise<AdmissionKeyData[]> => {
    const response = await apiClient.get<{ status: boolean; data: AdmissionKeyData[] }>('/temp-add-keys', {
      params: { branch_id: branchId }
    });
    return response.data.data;
  },

  /**
   * Creates a new admission key.
   */
  createKey: async (data: CreateAdmissionKeyPayload): Promise<AdmissionKeyData> => {
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
  updateKey: async (id: number, data: CreateAdmissionKeyPayload): Promise<AdmissionKeyData> => {
    const response = await apiClient.post<{ status: boolean; data: AdmissionKeyData }>(`/temp-add-keys/${id}`, {
      ...data,
      _method: "put"
    });
    return response.data.data;
  }
};
