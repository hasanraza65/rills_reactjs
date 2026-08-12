import { apiClient } from '../api-client';
import type { StaffMember, StaffFormInput } from '../../types/api/staff';

const data = <T>(res: { data: { data: T } }) => res.data.data;

export const staffService = {
  getStaff: (params?: { branch_id?: number | null; role_id?: number }) =>
    apiClient.get<{ data: StaffMember[] }>('/staff', { params }).then(data),

  getStaffMember: (id: number) =>
    apiClient.get<{ data: StaffMember }>(`/staff/${id}`).then(data),

  createStaff: (payload: StaffFormInput) =>
    apiClient.post<{ data: StaffMember }>('/staff', payload).then(data),

  updateStaff: (id: number, payload: StaffFormInput) =>
    apiClient.put<{ data: StaffMember }>(`/staff/${id}`, payload).then(data),

  deleteStaff: (id: number) =>
    apiClient.delete<{ message: string }>(`/staff/${id}`).then((r) => r.data),
};
