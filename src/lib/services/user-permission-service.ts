import { apiClient } from '../api-client';
import type { UserPermissionsData, UpdateUserPermissionsInput } from '../../types/api/roles';

const data = <T>(res: { data: { data: T } }) => res.data.data;

export const userPermissionService = {
  getUserPermissions: (userId: number) =>
    apiClient.get<{ data: UserPermissionsData }>(`/users/${userId}/permissions`).then(data),

  updateUserPermissions: (userId: number, payload: UpdateUserPermissionsInput) =>
    apiClient.put<{ message: string }>(`/users/${userId}/permissions`, payload).then(r => r.data),
};
