/**
 * @fileoverview Service for generated Timetable + slot-grid API calls.
 */

import { apiClient } from '../api-client';
import {
  TimetableData,
  TimetableSlotsResponse,
  TimetableSlotData,
  CreateTimetableInput,
  UpdateTimetableInput,
  RegenerateTimetableInput,
  UpdateTimetableSlotInput,
  DailyPrintResponse,
  TeacherPrintResponse,
} from '../../types/api/timetable';

export const timetableService = {
  getTimetables: async (branchId?: number): Promise<TimetableData[]> => {
    const response = await apiClient.get<TimetableData[]>('/timetables', {
      params: branchId ? { branch_id: branchId } : {},
    });
    return response.data;
  },

  getTimetable: async (id: number): Promise<TimetableData> => {
    const response = await apiClient.get<TimetableData>(`/timetables/${id}`);
    return response.data;
  },

  createTimetable: async (data: CreateTimetableInput): Promise<TimetableData> => {
    const response = await apiClient.post<TimetableData>('/timetables', data);
    return response.data;
  },

  updateTimetable: async (id: number, data: UpdateTimetableInput): Promise<TimetableData> => {
    const response = await apiClient.put<TimetableData>(`/timetables/${id}`, data);
    return response.data;
  },

  regenerateTimetable: async (id: number, data: RegenerateTimetableInput): Promise<TimetableData> => {
    const response = await apiClient.post<TimetableData>(`/timetables/${id}/regenerate`, data);
    return response.data;
  },

  deleteTimetable: async (id: number): Promise<void> => {
    await apiClient.delete(`/timetables/${id}`);
  },

  getSlots: async (timetableId: number): Promise<TimetableSlotsResponse> => {
    const response = await apiClient.get<TimetableSlotsResponse>(`/timetables/${timetableId}/slots`);
    return response.data;
  },

  updateSlot: async (
    timetableId: number,
    slotId: number,
    data: UpdateTimetableSlotInput
  ): Promise<TimetableSlotData> => {
    const response = await apiClient.put<TimetableSlotData>(`/timetables/${timetableId}/slots/${slotId}`, data);
    return response.data;
  },

  getDailyPrint: async (timetableId: number, dayOfWeek: number): Promise<DailyPrintResponse> => {
    const response = await apiClient.get<DailyPrintResponse>(`/timetables/${timetableId}/print/${dayOfWeek}`);
    return response.data;
  },

  getTeacherPrint: async (teacherId: number): Promise<TeacherPrintResponse> => {
    const response = await apiClient.get<TeacherPrintResponse>(`/teacher-timetable/${teacherId}`);
    return response.data;
  },
};
