/**
 * @fileoverview Service for Academic Session API calls (System Settings).
 */

import { apiClient } from '../api-client';
import { AcademicSession, CreateAcademicSessionInput, UpdateAcademicSessionInput } from '../../types/api/academic-session';

export const academicSessionService = {
  getSessions: async (branchId: number = 1): Promise<AcademicSession[]> => {
    const response = await apiClient.get<AcademicSession[]>('/academic-sessions', { params: { branch_id: branchId } });
    return response.data;
  },

  createSession: async (data: CreateAcademicSessionInput): Promise<AcademicSession> => {
    const response = await apiClient.post<AcademicSession>('/academic-sessions', data);
    return response.data;
  },

  updateSession: async (id: number, data: UpdateAcademicSessionInput): Promise<AcademicSession> => {
    const response = await apiClient.put<AcademicSession>(`/academic-sessions/${id}`, data);
    return response.data;
  },

  deleteSession: async (id: number): Promise<void> => {
    await apiClient.delete(`/academic-sessions/${id}`);
  },
};
