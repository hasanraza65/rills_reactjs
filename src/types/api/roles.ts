export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  is_system: boolean;
  user_count: number;
  permissions_count: number;
  created_at: string;
}

export interface ModulePermission {
  module_slug: string;
  module_name: string;
  group: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface RolePermissionsData {
  role: Pick<Role, 'id' | 'name' | 'slug' | 'color' | 'is_system'>;
  permissions: ModulePermission[];
}

export interface AppModule {
  slug: string;
  name: string;
  group: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  color?: string;
  copy_from?: number;
}

export interface UpdateRoleInput {
  name: string;
  description?: string;
  color?: string;
}

export interface PermissionRow {
  module_slug: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface UpdatePermissionsInput {
  permissions: PermissionRow[];
}
