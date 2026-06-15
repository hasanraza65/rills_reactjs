import { apiClient } from '../api-client';
import { DiariesResponse, DiaryDetailResponse, CreateDiaryInput, UpdateDiaryInput } from '../../types/api/diary';

export const diaryService = {
  getDiaries: async (branchId: number = 1): Promise<DiariesResponse> => {
    const response = await apiClient.get<DiariesResponse>('/diaries', {
      params: { branch_id: branchId }
    });
    return response.data;
  },

  getDiaryById: async (id: number): Promise<DiaryDetailResponse> => {
    const response = await apiClient.get<DiaryDetailResponse>(`/diaries/${id}`);
    return response.data;
  },

  updateDiary: async (id: number, data: UpdateDiaryInput): Promise<void> => {
    await apiClient.post(`/diaries/${id}`, data);
  },

  deleteDiary: async (id: number): Promise<void> => {
    await apiClient.delete(`/diaries/${id}`);
  },

  createDiary: async (data: CreateDiaryInput): Promise<void> => {
    await apiClient.post('/diaries', data);
  },
};
