/**
 * @fileoverview Service for Exam Marks API calls.
 */

import { apiClient } from '../api-client';
import { ExamMark, ExamMarkWithSchedule, BulkSaveMarksInput, BulkSaveMarksForStudentInput, Marksheet } from '../../types/api/exam';

export const examMarkService = {
  getMarksForSchedule: async (examScheduleId: number): Promise<ExamMark[]> => {
    const response = await apiClient.get<ExamMark[]>('/exam-marks', { params: { exam_schedule_id: examScheduleId } });
    return response.data;
  },

  getMarksheet: async (params: { class_id: number; section_id: number; exam_type: string }): Promise<Marksheet> => {
    const response = await apiClient.get<Marksheet>('/exam-marks/marksheet', { params });
    return response.data;
  },

  getMarksForStudent: async (studentId: number): Promise<ExamMarkWithSchedule[]> => {
    const response = await apiClient.get<ExamMarkWithSchedule[]>(`/exam-marks/student/${studentId}`);
    return response.data;
  },

  bulkSave: async (data: BulkSaveMarksInput): Promise<ExamMark[]> => {
    const response = await apiClient.post<ExamMark[]>('/exam-marks/bulk-save', data);
    return response.data;
  },

  bulkSaveForStudent: async (data: BulkSaveMarksForStudentInput): Promise<{ exam_schedule_id: number; obtained_marks: number }[]> => {
    const response = await apiClient.post('/exam-marks/bulk-save-for-student', data);
    return response.data;
  },
};
