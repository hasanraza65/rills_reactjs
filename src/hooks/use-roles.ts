import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../lib/services/role-service';
import type { CreateRoleInput, UpdateRoleInput, UpdatePermissionsInput } from '../types/api/roles';

const ROLES_KEY = ['roles'] as const;
const MODULES_KEY = ['roles-modules'] as const;
const permsKey = (id: number) => ['roles', id, 'permissions'] as const;

export const useRoles = () =>
  useQuery({ queryKey: ROLES_KEY, queryFn: roleService.getRoles });

export const useRoleModules = () =>
  useQuery({ queryKey: MODULES_KEY, queryFn: roleService.getModules });

export const useRolePermissions = (id: number | null) =>
  useQuery({
    queryKey: permsKey(id ?? 0),
    queryFn: () => roleService.getRolePermissions(id!),
    enabled: id !== null,
  });

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoleInput) => roleService.createRole(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEY }),
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRoleInput }) =>
      roleService.updateRole(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEY }),
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roleService.deleteRole(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEY }),
  });
};

export const useUpdateRolePermissions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePermissionsInput }) =>
      roleService.updateRolePermissions(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: permsKey(id) });
      qc.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
};
