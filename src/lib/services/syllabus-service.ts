/**
 * @fileoverview Service for syllabus-related API calls.
 */

import { apiClient } from '../api-client';
import {
  SyllabusesResponse,
  SyllabusDetailResponse,
  SyllabusFilters,
  CreateSyllabusInput,
  UpdateSyllabusInput,
  SyllabusStatus,
} from '../../types/api/syllabus';

export const syllabusService = {
  /**
   * Fetches syllabus entries. The backend scopes the result to what the caller
   * may see (teachers get their own subjects, parents their children's);
   * filters narrow it.
   */
  getSyllabuses: async (filters: SyllabusFilters = {}): Promise<SyllabusesResponse> => {
    const response = await apiClient.get<SyllabusesResponse>('/syllabus', { params: filters });
    return response.data;
  },

  getSyllabusById: async (id: number): Promise<SyllabusDetailResponse> => {
    const response = await apiClient.get<SyllabusDetailResponse>(`/syllabus/${id}`);
    return response.data;
  },

  createSyllabus: async (data: CreateSyllabusInput): Promise<SyllabusDetailResponse> => {
    const response = await apiClient.post<SyllabusDetailResponse>('/syllabus', data);
    return response.data;
  },

  /** POST + _method: PUT (Laravel method spoofing), per the convention used across services. */
  updateSyllabus: async (id: number, data: UpdateSyllabusInput): Promise<SyllabusDetailResponse> => {
    const response = await apiClient.post<SyllabusDetailResponse>(`/syllabus/${id}`, data);
    return response.data;
  },

  updateSyllabusStatus: async (id: number, status: SyllabusStatus): Promise<void> => {
    await apiClient.patch(`/syllabus/${id}/status`, { status });
  },

  deleteSyllabus: async (id: number): Promise<void> => {
    await apiClient.delete(`/syllabus/${id}`);
  },
};
