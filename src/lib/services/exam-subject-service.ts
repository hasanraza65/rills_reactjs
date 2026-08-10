/**
 * @fileoverview Service for Exam Subject Group + per-student exam subject assignment API calls.
 */

import { apiClient } from '../api-client';
import { ExamSubjectGroup, CreateExamSubjectGroupInput, StudentSubjectsMap } from '../../types/api/exam';

export const examSubjectService = {
  getSubjectGroups: async (sectionId: number): Promise<ExamSubjectGroup[]> => {
    const response = await apiClient.get<ExamSubjectGroup[]>('/exam-subject-groups', { params: { section_id: sectionId } });
    return response.data;
  },

  createSubjectGroup: async (data: CreateExamSubjectGroupInput): Promise<ExamSubjectGroup> => {
    const response = await apiClient.post<ExamSubjectGroup>('/exam-subject-groups', data);
    return response.data;
  },

  getStudentSubjects: async (studentIds: number[]): Promise<StudentSubjectsMap> => {
    if (studentIds.length === 0) return {};
    const response = await apiClient.post<StudentSubjectsMap>('/exam-student-subjects/lookup', {
      student_ids: studentIds,
    });
    return response.data;
  },

  bulkAssign: async (studentIds: number[], classSubjectIds: number[]): Promise<void> => {
    await apiClient.post('/exam-student-subjects/bulk-assign', {
      student_ids: studentIds,
      class_subject_ids: classSubjectIds,
    });
  },

  setForStudent: async (studentId: number, classSubjectIds: number[]): Promise<void> => {
    await apiClient.put(`/exam-student-subjects/${studentId}`, { class_subject_ids: classSubjectIds });
  },
};
