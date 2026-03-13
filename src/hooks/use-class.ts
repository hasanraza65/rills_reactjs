/**
 * @fileoverview React Query hooks for class management.
 */

import { useQuery } from '@tanstack/react-query';
import { classService } from '../lib/services/class-service';

/**
 * Hook to fetch the list of classes for the current branch.
 */
export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getClasses(),
  });
};
