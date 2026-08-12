/**
 * @fileoverview Service for Exam Schedule API calls.
 */

import { apiClient } from '../api-client';
import { ExamSchedule, BulkSaveExamScheduleInput } from '../../types/api/exam';

export const examScheduleService = {
  getSchedules: async (params: {
    branch_id?: number;
    exam_type?: string;
    class_id?: number;
    section_id?: number;
    exam_group_exam_id?: number;
  } = {}): Promise<ExamSchedule[]> => {
    const response = await apiClient.get<ExamSchedule[]>('/exam-schedules', { params });
    return response.data;
  },

  bulkSave: async (data: BulkSaveExamScheduleInput): Promise<ExamSchedule[]> => {
    const response = await apiClient.post<ExamSchedule[]>('/exam-schedules/bulk-save', data);
    return response.data;
  },

  deleteSchedule: async (id: number): Promise<void> => {
    await apiClient.delete(`/exam-schedules/${id}`);
  },
};
