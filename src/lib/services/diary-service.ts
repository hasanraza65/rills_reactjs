import { apiClient } from '../api-client';
import { DiariesResponse } from '../../types/api/diary';

export const diaryService = {
  getDiaries: async (branchId: number = 1): Promise<DiariesResponse> => {
    const response = await apiClient.get<DiariesResponse>('/diaries', {
      params: { branch_id: branchId }
    });
    return response.data;
  },
};
