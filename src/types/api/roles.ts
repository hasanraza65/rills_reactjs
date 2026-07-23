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

// ── Per-user permission overrides ───────────────────────────────────────────

/** The four boolean flags for one module, as returned for a role default / effective value. */
export interface ActionFlags {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

/** Same shape as ActionFlags but each flag may be `null` (not overridden). */
export interface NullableActionFlags {
  view: boolean | null;
  create: boolean | null;
  edit: boolean | null;
  delete: boolean | null;
}

export interface UserModulePermission {
  module_slug: string;
  module_name: string;
  group: string;
  /** What this user's role grants by default. */
  role_default: ActionFlags;
  /** This user's explicit overrides, or null if none set for this module. */
  override: NullableActionFlags | null;
  /** role_default with override applied — what actually takes effect. */
  effective: ActionFlags;
}

export interface UserPermissionsData {
  user: { id: number; name: string; role: string | null };
  is_privileged: boolean;
  permissions: UserModulePermission[];
}

export interface UpdateUserPermissionRow {
  module_slug: string;
  can_view: boolean | null;
  can_create: boolean | null;
  can_edit: boolean | null;
  can_delete: boolean | null;
}

export interface UpdateUserPermissionsInput {
  permissions: UpdateUserPermissionRow[];
}
