import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '../lib/services/staff-service';
import type { StaffFormInput } from '../types/api/staff';

const STAFF_KEY = ['staff'] as const;

export const useStaffMembers = (branchId?: number | null) =>
  useQuery({
    queryKey: [...STAFF_KEY, branchId ?? 'all'],
    queryFn: () => staffService.getStaff({ branch_id: branchId ?? undefined }),
  });

/** Fetches the full detail record for one staff member by id (GET /staff/:id). */
export const useStaffMember = (id: number | null) =>
  useQuery({
    queryKey: [...STAFF_KEY, 'detail', id],
    queryFn: () => staffService.getStaffMember(id!),
    enabled: id != null,
  });

export const useCreateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StaffFormInput) => staffService.createStaff(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: STAFF_KEY }),
  });
};

export const useUpdateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: StaffFormInput }) =>
      staffService.updateStaff(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: STAFF_KEY }),
  });
};

export const useDeleteStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffService.deleteStaff(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: STAFF_KEY }),
  });
};
