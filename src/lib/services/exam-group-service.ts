/**
 * @fileoverview Service for Exam Group + Group Exam API calls.
 */

import { apiClient } from '../api-client';
import {
  ExamGroup,
  CreateExamGroupInput,
  ExamGroupExam,
  CreateExamGroupExamInput,
} from '../../types/api/exam';

export const examGroupService = {
  getGroups: async (branchId: number = 1): Promise<ExamGroup[]> => {
    const response = await apiClient.get<ExamGroup[]>('/exam-groups', { params: { branch_id: branchId } });
    return response.data;
  },

  createGroup: async (data: CreateExamGroupInput): Promise<ExamGroup> => {
    const response = await apiClient.post<ExamGroup>('/exam-groups', data);
    return response.data;
  },

  updateGroup: async (id: number, data: Omit<CreateExamGroupInput, 'branch_id'>): Promise<ExamGroup> => {
    const response = await apiClient.put<ExamGroup>(`/exam-groups/${id}`, data);
    return response.data;
  },

  deleteGroup: async (id: number): Promise<void> => {
    await apiClient.delete(`/exam-groups/${id}`);
  },

  getGroupExams: async (branchId: number = 1): Promise<ExamGroupExam[]> => {
    const response = await apiClient.get<ExamGroupExam[]>('/exam-group-exams', { params: { branch_id: branchId } });
    return response.data;
  },

  createGroupExam: async (data: CreateExamGroupExamInput): Promise<ExamGroupExam> => {
    const response = await apiClient.post<ExamGroupExam>('/exam-group-exams', data);
    return response.data;
  },

  updateGroupExam: async (id: number, data: Omit<CreateExamGroupExamInput, 'exam_group_id'>): Promise<ExamGroupExam> => {
    const response = await apiClient.put<ExamGroupExam>(`/exam-group-exams/${id}`, data);
    return response.data;
  },

  deleteGroupExam: async (id: number): Promise<void> => {
    await apiClient.delete(`/exam-group-exams/${id}`);
  },
};
