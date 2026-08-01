/**
 * @fileoverview Service for Time Table Periods template API calls.
 */

import { apiClient } from '../api-client';
import {
  TimetablePeriodSetData,
  CreateTimetablePeriodSetInput,
  UpdateTimetablePeriodSetInput,
} from '../../types/api/timetable-period-set';

export const timetablePeriodSetService = {
  getPeriodSets: async (branchId?: number, groupId?: number): Promise<TimetablePeriodSetData[]> => {
    const response = await apiClient.get<TimetablePeriodSetData[]>('/timetable-period-sets', {
      params: {
        ...(branchId ? { branch_id: branchId } : {}),
        ...(groupId ? { timetable_group_id: groupId } : {}),
      },
    });
    return response.data;
  },

  getPeriodSet: async (id: number): Promise<TimetablePeriodSetData> => {
    const response = await apiClient.get<TimetablePeriodSetData>(`/timetable-period-sets/${id}`);
    return response.data;
  },

  createPeriodSet: async (data: CreateTimetablePeriodSetInput): Promise<TimetablePeriodSetData> => {
    const response = await apiClient.post<TimetablePeriodSetData>('/timetable-period-sets', data);
    return response.data;
  },

  updatePeriodSet: async (id: number, data: UpdateTimetablePeriodSetInput): Promise<TimetablePeriodSetData> => {
    const response = await apiClient.put<TimetablePeriodSetData>(`/timetable-period-sets/${id}`, data);
    return response.data;
  },

  deletePeriodSet: async (id: number): Promise<void> => {
    await apiClient.delete(`/timetable-period-sets/${id}`);
  },
};
