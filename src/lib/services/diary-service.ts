/**
 * @fileoverview Service for diary-related API calls.
 */

import { apiClient } from '../api-client';
import {
  DiariesResponse,
  DiaryDetailResponse,
  DiaryFilters,
  CreateDiaryInput,
  UpdateDiaryInput,
  DiaryStatus,
} from '../../types/api/diary';

export const diaryService = {
  /**
   * Fetches diaries. The backend scopes the result to what the caller may see
   * (teachers get their own subjects, parents their children's); filters narrow it.
   */
  getDiaries: async (filters: DiaryFilters = {}): Promise<DiariesResponse> => {
    const response = await apiClient.get<DiariesResponse>('/diaries', { params: filters });
    return response.data;
  },

  getDiaryById: async (id: number): Promise<DiaryDetailResponse> => {
    const response = await apiClient.get<DiaryDetailResponse>(`/diaries/${id}`);
    return response.data;
  },

  createDiary: async (data: CreateDiaryInput): Promise<DiaryDetailResponse> => {
    const response = await apiClient.post<DiaryDetailResponse>('/diaries', data);
    return response.data;
  },

  /** POST + _method: PUT (Laravel method spoofing), per the convention used across services. */
  updateDiary: async (id: number, data: UpdateDiaryInput): Promise<DiaryDetailResponse> => {
    const response = await apiClient.post<DiaryDetailResponse>(`/diaries/${id}`, data);
    return response.data;
  },

  updateDiaryStatus: async (id: number, status: DiaryStatus): Promise<void> => {
    await apiClient.patch(`/diaries/${id}/status`, { status });
  },

  deleteDiary: async (id: number): Promise<void> => {
    await apiClient.delete(`/diaries/${id}`);
  },
};
