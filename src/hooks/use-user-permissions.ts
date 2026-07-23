import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userPermissionService } from '../lib/services/user-permission-service';
import type { UpdateUserPermissionsInput } from '../types/api/roles';

const permsKey = (userId: number) => ['users', userId, 'permissions'] as const;

export const useUserPermissions = (userId: number | null) =>
  useQuery({
    queryKey: permsKey(userId ?? 0),
    queryFn: () => userPermissionService.getUserPermissions(userId!),
    enabled: userId !== null,
  });

export const useUpdateUserPermissions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: UpdateUserPermissionsInput }) =>
      userPermissionService.updateUserPermissions(userId, payload),
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: permsKey(userId) });
    },
  });
};
