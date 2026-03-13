/**
 * @fileoverview Service for class-related API calls.
 */

import { apiClient } from '../api-client';
import { ClassData } from '../../types/api/class';

export const classService = {
  /**
   * Fetches the list of classes for a given branch.
   * Currently hardcoded to branch_id=1 as per user request.
   */
  getClasses: async (): Promise<ClassData[]> => {
    // Setting branch_id=1 static for now as requested
    const response = await apiClient.get<ClassData[]>('/classes?branch_id=1');
    return response.data;
  },
};
