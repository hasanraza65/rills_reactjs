/**
 * @fileoverview Service for Time Table Group API calls.
 */

import { apiClient } from '../api-client';
import {
  TimetableGroupData,
  CreateTimetableGroupInput,
  UpdateTimetableGroupInput,
} from '../../types/api/timetable-group';

export const timetableGroupService = {
  getGroups: async (branchId?: number): Promise<TimetableGroupData[]> => {
    const response = await apiClient.get<TimetableGroupData[]>('/timetable-groups', {
      params: branchId ? { branch_id: branchId } : {},
    });
    return response.data;
  },

  getGroup: async (id: number): Promise<TimetableGroupData> => {
    const response = await apiClient.get<TimetableGroupData>(`/timetable-groups/${id}`);
    return response.data;
  },

  createGroup: async (data: CreateTimetableGroupInput): Promise<TimetableGroupData> => {
    const response = await apiClient.post<TimetableGroupData>('/timetable-groups', data);
    return response.data;
  },

  updateGroup: async (id: number, data: UpdateTimetableGroupInput): Promise<TimetableGroupData> => {
    const response = await apiClient.put<TimetableGroupData>(`/timetable-groups/${id}`, data);
    return response.data;
  },

  deleteGroup: async (id: number): Promise<void> => {
    await apiClient.delete(`/timetable-groups/${id}`);
  },
};
