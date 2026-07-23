import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  X,
  Check,
  Minus,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
  RotateCcw,
  CheckCheck,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../types';
import { useUserPermissions, useUpdateUserPermissions } from '../../hooks/use-user-permissions';
import type { UserModulePermission, NullableActionFlags, UpdateUserPermissionRow } from '../../types/api/roles';
import type { PermissionMap } from '../../types/models/user';

interface UserPermissionsModalProps {
  userId: number;
  userName: string;
  roleName?: string | null;
  /** True for Super Admin/Admin (no granting limits). Branch Admins pass false. */
  viewerIsPrivileged: boolean;
  /** The signed-in manager's own effective permissions — a non-privileged manager (Branch Admin)
   *  can never grant a permission they don't hold themselves, only revoke or inherit. */
  viewerPermissions?: PermissionMap;
  onClose: () => void;
}

type Action = keyof NullableActionFlags;

const ACTIONS: { key: Action; label: string }[] = [
  { key: 'view',   label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit',   label: 'Edit' },
  { key: 'delete', label: 'Delete' },
];

/** Inherit -> Grant -> Revoke -> Inherit (Grant is skipped if the viewer isn't allowed to grant it). */
const nextState = (current: boolean | null, allowGrant: boolean): boolean | null => {
  if (current === null) return allowGrant ? true : false;
  if (current === true) return false;
  return null;
};

const overrideOf = (row: UserModulePermission): NullableActionFlags =>
  row.override ?? { view: null, create: null, edit: null, delete: null };

export const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({
  userId, userName, roleName, viewerIsPrivileged, viewerPermissions, onClose,
}) => {
  const { data, isLoading } = useUserPermissions(userId);
  const updatePerms = useUpdateUserPermissions();

  const canGrant = (slug: string, action: Action): boolean =>
    viewerIsPrivileged || Boolean(viewerPermissions?.[slug]?.[action]);

  const [local, setLocal] = useState<UserModulePermission[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (data?.permissions) {
      setLocal(data.permissions);
      setDirty(false);
    }
  }, [data]);

  const groups = useMemo(() => {
    const map: Record<string, UserModulePermission[]> = {};
    local.forEach(p => {
      if (!map[p.group]) map[p.group] = [];
      map[p.group].push(p);
    });
    return map;
  }, [local]);

  const cycle = (slug: string, action: Action) => {
    setLocal(prev => prev.map(row => {
      if (row.module_slug !== slug) return row;
      const override = overrideOf(row);
      const value = nextState(override[action], canGrant(slug, action));
      const nextOverride = { ...override, [action]: value };
      const allInherit = ACTIONS.every(a => nextOverride[a.key] === null);
      const effective = { ...row.role_default };
      ACTIONS.forEach(a => {
        if (nextOverride[a.key] !== null) effective[a.key] = nextOverride[a.key] as boolean;
      });
      return { ...row, override: allInherit ? null : nextOverride, effective };
    }));
    setDirty(true);
    setSaved(false);
  };

  const resetRow = (slug: string) => {
    setLocal(prev => prev.map(row =>
      row.module_slug === slug ? { ...row, override: null, effective: row.role_default } : row
    ));
    setDirty(true);
    setSaved(false);
  };

  /** Grants every action in the row the viewer is allowed to grant (skips any they don't hold themselves). */
  const grantAllRow = (slug: string) => {
    setLocal(prev => prev.map(row => {
      if (row.module_slug !== slug) return row;
      const override = overrideOf(row);
      const nextOverride = { ...override };
      ACTIONS.forEach(a => {
        if (canGrant(slug, a.key)) nextOverride[a.key] = true;
      });
      const allInherit = ACTIONS.every(a => nextOverride[a.key] === null);
      const effective = { ...row.role_default };
      ACTIONS.forEach(a => {
        if (nextOverride[a.key] !== null) effective[a.key] = nextOverride[a.key] as boolean;
      });
      return { ...row, override: allInherit ? null : nextOverride, effective };
    }));
    setDirty(true);
    setSaved(false);
  };

  const handleSave = async () => {
    const permissions: UpdateUserPermissionRow[] = local.map(row => {
      const o = overrideOf(row);
      return {
        module_slug: row.module_slug,
        can_view: row.override ? o.view : null,
        can_create: row.override ? o.create : null,
        can_edit: row.override ? o.edit : null,
        can_delete: row.override ? o.delete : null,
      };
    });

    await updatePerms.mutateAsync({ userId, payload: { permissions } });
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isPrivilegedTarget = data?.is_privileged ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl max-h-[85vh] bg-white rounded-[2rem] shadow-2xl p-8 overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">{userName}</h3>
              <p className="text-xs text-slate-400 font-medium">{roleName ?? 'Staff'} · Permission overrides</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50">
            <X size={20} />
          </button>
        </div>

        {isPrivilegedTarget ? (
          <div className="mt-6 flex items-center gap-3 p-5 rounded-2xl bg-amber-50 text-amber-700">
            <Lock size={20} />
            <p className="text-sm font-semibold">
              This user's role already has full access everywhere — per-user overrides don't apply to Super Admin / Admin.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Each cell cycles <span className="font-bold text-slate-500">Inherit</span> (role default) →{' '}
              <span className="font-bold text-emerald-600">Grant</span> →{' '}
              <span className="font-bold text-rose-600">Revoke</span>. Only cells you override differ from the{' '}
              <span className="font-bold text-slate-600">{roleName ?? 'role'}</span> default.
            </p>

            {(Object.entries(groups) as [string, UserModulePermission[]][]).map(([groupName, modules]) => {
              const isCollapsed = collapsed[groupName];
              return (
                <div key={groupName} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setCollapsed(p => ({ ...p, [groupName]: !p[groupName] }))}
                    className="w-full flex items-center gap-2 px-5 py-3 bg-slate-50/80 border-b border-slate-100 text-sm font-bold text-slate-700"
                  >
                    {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    {groupName}
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                      {modules.length} modules
                    </span>
                  </button>

                  {!isCollapsed && (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-50">
                          <th className="text-left px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-full">
                            Module
                          </th>
                          {ACTIONS.map(a => (
                            <th key={a.key} className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center min-w-[60px]">
                              {a.label}
                            </th>
                          ))}
                          <th className="px-3 py-2 w-14" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {modules.map(mod => {
                          const override = overrideOf(mod);
                          const hasOverride = mod.override !== null;
                          return (
                            <tr key={mod.module_slug} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-5 py-3">
                                <p className="text-sm font-semibold text-slate-700">{mod.module_name}</p>
                              </td>
                              {ACTIONS.map(a => {
                                const state = override[a.key];
                                const roleDefault = mod.role_default[a.key];
                                const allowGrant = canGrant(mod.module_slug, a.key);
                                return (
                                  <td key={a.key} className="px-3 py-3 text-center">
                                    <button
                                      onClick={() => cycle(mod.module_slug, a.key)}
                                      title={
                                        state === null
                                          ? (allowGrant
                                              ? `Inherited from role: ${roleDefault ? 'granted' : 'not granted'}`
                                              : `Inherited from role: ${roleDefault ? 'granted' : 'not granted'} — you can revoke this, but can't grant it (you don't have it yourself)`)
                                          : state
                                          ? 'Overridden: granted'
                                          : 'Overridden: revoked'
                                      }
                                      className={cn(
                                        'w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition-all',
                                        state === true && 'bg-emerald-500 border-emerald-500 text-white shadow-sm',
                                        state === false && 'bg-rose-500 border-rose-500 text-white shadow-sm',
                                        state === null && roleDefault && 'border-slate-300 bg-slate-50 text-slate-400',
                                        state === null && !roleDefault && 'border-slate-200 bg-white text-slate-200'
                                      )}
                                    >
                                      {state === true && <Check size={12} strokeWidth={3} />}
                                      {state === false && <X size={12} strokeWidth={3} />}
                                      {state === null && !allowGrant && <Lock size={10} />}
                                      {state === null && allowGrant && <Minus size={12} strokeWidth={3} />}
                                    </button>
                                  </td>
                                );
                              })}
                              <td className="px-3 py-3">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => grantAllRow(mod.module_slug)}
                                    title="Grant all (allowed) actions for this module"
                                    className="p-1 rounded-lg text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                                  >
                                    <CheckCheck size={13} />
                                  </button>
                                  {hasOverride && (
                                    <button
                                      onClick={() => resetRow(mod.module_slug)}
                                      title="Reset to role default"
                                      className="p-1 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all"
                                    >
                                      <RotateCcw size={13} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!isPrivilegedTarget && (
          <div className="flex justify-end gap-3 pt-6">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={!dirty || updatePerms.isPending}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg disabled:opacity-50',
                saved
                  ? 'bg-emerald-500 text-white shadow-emerald-100'
                  : 'bg-brand-500 text-white shadow-brand-100 hover:bg-brand-600'
              )}
            >
              {updatePerms.isPending ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
