/**
 * @fileoverview Service for Time Table Activity API calls.
 */

import { apiClient } from '../api-client';
import {
  TimetableActivityData,
  CreateTimetableActivityInput,
  UpdateTimetableActivityInput,
} from '../../types/api/timetable-activity';

export const timetableActivityService = {
  getActivities: async (branchId?: number): Promise<TimetableActivityData[]> => {
    const response = await apiClient.get<TimetableActivityData[]>('/timetable-activities', {
      params: branchId ? { branch_id: branchId } : {},
    });
    return response.data;
  },

  createActivity: async (data: CreateTimetableActivityInput): Promise<TimetableActivityData> => {
    const response = await apiClient.post<TimetableActivityData>('/timetable-activities', data);
    return response.data;
  },

  updateActivity: async (id: number, data: UpdateTimetableActivityInput): Promise<TimetableActivityData> => {
    const response = await apiClient.put<TimetableActivityData>(`/timetable-activities/${id}`, data);
    return response.data;
  },

  deleteActivity: async (id: number): Promise<void> => {
    await apiClient.delete(`/timetable-activities/${id}`);
  },
};
