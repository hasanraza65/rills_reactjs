import { apiClient } from '../api-client';
import { SectionData, CreateSectionInput, UpdateSectionInput } from '../../types/api/section';

export const sectionService = {
  /**
   * Fetches the list of sections for a given branch.
   */
  getSections: async (): Promise<SectionData[]> => {
    const response = await apiClient.get<SectionData[]>('/sections', {
      params: { branch_id: 1 }
    });
    return response.data;
  },

  /**
   * Fetches a single section by ID.
   */
  getSection: async (id: number): Promise<SectionData> => {
    const response = await apiClient.get<SectionData>(`/sections/${id}`);
    return response.data;
  },

  /**
   * Creates a new section.
   */
  createSection: async (data: CreateSectionInput): Promise<SectionData> => {
    const response = await apiClient.post<SectionData>('/sections', data);
    return response.data;
  },

  /**
   * Updates an existing section.
   */
  updateSection: async (id: number, data: UpdateSectionInput): Promise<SectionData> => {
    const response = await apiClient.put<SectionData>(`/sections/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a section.
   */
  deleteSection: async (id: number): Promise<void> => {
    await apiClient.delete(`/sections/${id}`);
  }
};
