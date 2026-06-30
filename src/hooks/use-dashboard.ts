import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../lib/services/dashboard-service';

export const useDashboardOverview = (branchId?: number | null) => {
  return useQuery({
    queryKey: ['dashboard', 'overview', branchId ?? null],
    queryFn: () => dashboardService.getOverview(branchId),
    staleTime: 60_000,
  });
};
