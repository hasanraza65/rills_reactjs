import { apiClient } from '../api-client';
import type {
  Role,
  AppModule,
  RolePermissionsData,
  CreateRoleInput,
  UpdateRoleInput,
  UpdatePermissionsInput,
} from '../../types/api/roles';

const data = <T>(res: { data: { data: T } }) => res.data.data;

export const roleService = {
  getRoles: () =>
    apiClient.get<{ data: Role[] }>('/roles').then(data),

  createRole: (payload: CreateRoleInput) =>
    apiClient.post<{ data: Role }>('/roles', payload).then(data),

  updateRole: (id: number, payload: UpdateRoleInput) =>
    apiClient.put<{ data: Role }>(`/roles/${id}`, payload).then(data),

  deleteRole: (id: number) =>
    apiClient.delete<{ message: string }>(`/roles/${id}`).then(r => r.data),

  getModules: () =>
    apiClient.get<{ data: AppModule[] }>('/roles/modules').then(data),

  getRolePermissions: (id: number) =>
    apiClient.get<{ data: RolePermissionsData }>(`/roles/${id}/permissions`).then(data),

  updateRolePermissions: (id: number, payload: UpdatePermissionsInput) =>
    apiClient.put<{ message: string }>(`/roles/${id}/permissions`, payload).then(r => r.data),
};
