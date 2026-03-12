import { apiClient } from '../api-client';

export interface VisitorPayload {
  branch_id: number;
  name: string;
  phone: string;
  cnic: string;
  reason: string;
  type: string;
}

export const visitorService = {
  addVisitor: async (payload: VisitorPayload) => {
    try {
      // Reverting to JSON as the user example showed JSON and the endpoint changed
      const response = await apiClient.post('/visitors', payload);
      return response.data;
    } catch (error) {
      console.error('Error adding visitor:', error);
      throw error;
    }
  },
};
