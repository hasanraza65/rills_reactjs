/**
 * @fileoverview Service for class-subject-related API calls.
 */

import { apiClient } from '../api-client';
import { ClassSubjectsResponse, CreateClassSubjectInput, UpdateClassSubjectInput } from '../../types/api/class-subject';

export const classSubjectService = {
  /**
   * Fetches subjects for a given section.
   */
  getSubjectsBySection: async (sectionId: number, branchId: number = 1): Promise<ClassSubjectsResponse> => {
    const response = await apiClient.get<ClassSubjectsResponse>('/class-subjects', {
      params: { section_id: sectionId, branch_id: branchId }
    });
    return response.data;
  },

  /**
   * Fetches subjects for a given branch.
   */
  getSubjectsByBranch: async (branchId: number): Promise<ClassSubjectsResponse> => {
    const response = await apiClient.get<ClassSubjectsResponse>('/class-subjects', {
      params: { branch_id: branchId }
    });
    return response.data;
  },

  /**
   * Fetches the subjects the authenticated teacher is assigned to.
   *
   * Deliberately sends no branch_id: teacher accounts have no branch on their user
   * row, and the endpoint would filter on a null branch and return nothing.
   */
  getMySubjects: async (): Promise<ClassSubjectsResponse> => {
    const response = await apiClient.get<ClassSubjectsResponse>('/class-subjects', {
      params: { mine: 1 }
    });
    return response.data;
  },

  /**
   * Creates a new subject for a class section.
   */
  createSubject: async (data: CreateClassSubjectInput): Promise<any> => {
    const response = await apiClient.post('/class-subjects', data);
    return response.data;
  },

  /**
   * Updates an existing subject. Uses POST with _method: PUT (Laravel method spoofing).
   */
  updateSubject: async (id: number, data: UpdateClassSubjectInput): Promise<any> => {
    const response = await apiClient.post(`/class-subjects/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a subject by ID.
   */
  deleteSubject: async (id: number): Promise<void> => {
    await apiClient.delete(`/class-subjects/${id}`);
  },
};
