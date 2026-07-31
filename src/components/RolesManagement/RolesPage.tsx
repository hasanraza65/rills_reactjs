import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Users,
  Loader2,
  Lock,
  ChevronDown,
  ChevronUp,
  Copy,
  Save,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../types';
import { Select } from '../ui/Select';
import {
  useRoles,
  useRolePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useUpdateRolePermissions,
} from '../../hooks/use-roles';
import type { Role, ModulePermission, PermissionRow } from '../../types/api/roles';

// ── Colour presets ────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b',
  '#ec4899', '#64748b', '#8b5cf6', '#ef4444',
];

// ── Permission action labels ───────────────────────────────────────────────────
const ACTIONS: { key: keyof Omit<PermissionRow, 'module_slug'>; label: string; color: string }[] = [
  { key: 'can_view',   label: 'View',   color: 'text-sky-600' },
  { key: 'can_create', label: 'Create', color: 'text-emerald-600' },
  { key: 'can_edit',   label: 'Edit',   color: 'text-amber-600' },
  { key: 'can_delete', label: 'Delete', color: 'text-rose-600' },
];

// ── Add / Edit Role Modal ─────────────────────────────────────────────────────
interface RoleModalProps {
  roles: Role[];
  editing: Role | null;
  onClose: () => void;
}

const RoleModal: React.FC<RoleModalProps> = ({ roles, editing, onClose }) => {
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const [name, setName]         = useState(editing?.name ?? '');
  const [desc, setDesc]         = useState(editing?.description ?? '');
  const [color, setColor]       = useState(editing?.color ?? COLOR_PRESETS[0]);
  const [copyFrom, setCopyFrom] = useState<number | ''>('');
  const [error, setError]       = useState('');

  const isPending = createRole.isPending || updateRole.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Role name is required'); return; }

    try {
      if (editing) {
        await updateRole.mutateAsync({ id: editing.id, payload: { name: name.trim(), description: desc, color } });
      } else {
        await createRole.mutateAsync({
          name: name.trim(),
          description: desc || undefined,
          color,
          copy_from: copyFrom !== '' ? Number(copyFrom) : undefined,
        });
      }
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-extrabold text-slate-800">
            {editing ? 'Edit Role' : 'Add New Role'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Role Name *
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Coordinator"
              className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-100 border border-transparent focus:border-brand-300 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Description
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={2}
              placeholder="Brief description of this role"
              className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-100 border border-transparent focus:border-brand-300 transition-all resize-none"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Badge Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={cn(
                    'w-8 h-8 rounded-xl transition-all',
                    color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Copy from (only on create) */}
          {!editing && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Copy Permissions From
              </label>
              <Select
                value={copyFrom === '' ? '' : String(copyFrom)}
                onChange={v => setCopyFrom(v === '' ? '' : Number(v))}
                options={roles.map(r => ({ value: String(r.id), label: r.name }))}
                placeholder="— Start blank —"
              />
            </div>
          )}

          {error && (
            <p className="flex items-center gap-2 text-sm text-rose-600 font-medium">
              <AlertCircle size={16} /> {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {editing ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Permission Matrix ─────────────────────────────────────────────────────────
interface PermMatrixProps {
  role: Role;
}

const PermMatrix: React.FC<PermMatrixProps> = ({ role }) => {
  const { data, isLoading } = useRolePermissions(role.id);
  const updatePerms = useUpdateRolePermissions();

  const [local, setLocal] = useState<ModulePermission[]>([]);
  const [dirty, setDirty] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    if (data?.permissions) {
      setLocal(data.permissions);
      setDirty(false);
    }
  }, [data]);

  const groups = useMemo(() => {
    const map: Record<string, ModulePermission[]> = {};
    local.forEach(p => {
      if (!map[p.group]) map[p.group] = [];
      map[p.group].push(p);
    });
    return map;
  }, [local]);

  const toggle = (slug: string, action: keyof Omit<PermissionRow, 'module_slug'>) => {
    setLocal(prev => prev.map(p => p.module_slug === slug ? { ...p, [action]: !p[action] } : p));
    setDirty(true);
    setSaved(false);
  };

  const toggleAllInGroup = (groupName: string, value: boolean) => {
    setLocal(prev => prev.map(p =>
      p.group === groupName
        ? { ...p, can_view: value, can_create: value, can_edit: value, can_delete: value }
        : p
    ));
    setDirty(true);
    setSaved(false);
  };

  const toggleColumn = (action: keyof Omit<PermissionRow, 'module_slug'>, value: boolean) => {
    setLocal(prev => prev.map(p => ({ ...p, [action]: value })));
    setDirty(true);
    setSaved(false);
  };

  const handleSave = async () => {
    await updatePerms.mutateAsync({
      id: role.id,
      payload: {
        permissions: local.map(p => ({
          module_slug: p.module_slug,
          can_view:    p.can_view,
          can_create:  p.can_create,
          can_edit:    p.can_edit,
          can_delete:  p.can_delete,
        })),
      },
    });
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {ACTIONS.map(a => (
            <div key={a.key} className="flex items-center gap-1">
              <button
                onClick={() => toggleColumn(a.key, true)}
                className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 transition-all"
              >
                All {a.label}
              </button>
            </div>
          ))}
          <button
            onClick={() => setLocal(prev => prev.map(p => ({ ...p, can_view: false, can_create: false, can_edit: false, can_delete: false })))}
            className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-500 transition-all"
          >
            Revoke All
          </button>
        </div>

        <AnimatePresence>
          {(dirty || saved) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleSave}
              disabled={updatePerms.isPending || !dirty}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg',
                saved
                  ? 'bg-emerald-500 text-white shadow-emerald-100'
                  : 'bg-brand-500 text-white shadow-brand-100 hover:bg-brand-600 disabled:opacity-60'
              )}
            >
              {updatePerms.isPending
                ? <Loader2 size={14} className="animate-spin" />
                : saved
                ? <Check size={14} />
                : <Save size={14} />}
              {saved ? 'Saved!' : 'Save Changes'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Groups */}
      {(Object.entries(groups) as [string, ModulePermission[]][]).map(([groupName, modules]) => {
        const isCollapsed = collapsed[groupName];
        const allOn  = modules.every(m => m.can_view && m.can_create && m.can_edit && m.can_delete);
        const allOff = modules.every(m => !m.can_view && !m.can_create && !m.can_edit && !m.can_delete);

        return (
          <div key={groupName} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Group header */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50/80 border-b border-slate-100">
              <button
                onClick={() => setCollapsed(p => ({ ...p, [groupName]: !p[groupName] }))}
                className="flex items-center gap-2 text-sm font-bold text-slate-700"
              >
                {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                {groupName}
                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                  {modules.length} modules
                </span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAllInGroup(groupName, true)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all',
                    allOn
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-white border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                  )}
                >
                  Grant All
                </button>
                <button
                  onClick={() => toggleAllInGroup(groupName, false)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all',
                    allOff
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-white border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                  )}
                >
                  Revoke All
                </button>
              </div>
            </div>

            {/* Module rows */}
            {!isCollapsed && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="text-left px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-full">
                      Module
                    </th>
                    {ACTIONS.map(a => (
                      <th key={a.key} className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center min-w-[70px]">
                        {a.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {modules.map(mod => (
                    <tr key={mod.module_slug} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-slate-700">{mod.module_name}</p>
                      </td>
                      {ACTIONS.map(a => (
                        <td key={a.key} className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggle(mod.module_slug, a.key)}
                            className={cn(
                              'w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition-all',
                              mod[a.key]
                                ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            )}
                          >
                            {mod[a.key] && <Check size={12} strokeWidth={3} />}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export const RolesPage: React.FC = () => {
  const { data: roles, isLoading } = useRoles();
  const deleteRole = useDeleteRole();

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Auto-select first role
  useEffect(() => {
    if (roles && roles.length > 0 && selectedRoleId === null) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles]);

  const selectedRole = roles?.find(r => r.id === selectedRoleId) ?? null;

  const handleDelete = async (role: Role) => {
    if (role.is_system) return;
    try {
      await deleteRole.mutateAsync(role.id);
      if (selectedRoleId === role.id) setSelectedRoleId(roles?.[0]?.id ?? null);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Failed to delete role.');
    }
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Roles & Permissions</h3>
          <p className="text-slate-500 font-medium">Define what each role can access and do</p>
        </div>
        <button
          onClick={() => { setEditingRole(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-3 bg-brand-500 text-white text-sm font-bold rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
        >
          <Plus size={18} />
          Add New Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Left: Role list ───────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-2">
          {roles?.map(role => (
            <motion.div
              key={role.id}
              layout
              role="button"
              tabIndex={0}
              onClick={() => setSelectedRoleId(role.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedRoleId(role.id); } }}
              className={cn(
                'w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-200',
                selectedRoleId === role.id
                  ? 'bg-white border-brand-200 shadow-md shadow-brand-50'
                  : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
              )}
            >
              {/* Color accent */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                style={{ backgroundColor: role.color }}
              />

              <div className="pl-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{role.name}</p>
                    {role.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{role.description}</p>
                    )}
                  </div>
                  {role.is_system && (
                    <Lock size={12} className="text-slate-300 mt-0.5 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Users size={10} /> {role.user_count}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <ShieldCheck size={10} /> {role.permissions_count}
                  </span>
                  {role.is_system && (
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      System
                    </span>
                  )}
                </div>

                {/* Actions (shown on hover / selected) */}
                <div className={cn(
                  'flex items-center gap-1 mt-2 transition-all',
                  selectedRoleId === role.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                )}>
                  <button
                    onClick={e => { e.stopPropagation(); setEditingRole(role); setShowModal(true); }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 transition-all"
                    title="Edit role"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setDeletingId(role.id); }}
                    disabled={role.is_system}
                    className={cn(
                      'p-1.5 rounded-lg transition-all',
                      role.is_system
                        ? 'text-slate-200 cursor-not-allowed'
                        : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                    )}
                    title={role.is_system ? 'System roles cannot be deleted' : 'Delete role'}
                  >
                    <Trash2 size={13} />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setEditingRole(null);
                      setShowModal(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all"
                    title="Clone this role"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Right: Permission matrix ──────────────────────────────── */}
        <div className="lg:col-span-3">
          {selectedRole ? (
            <div className="space-y-4">
              {/* Role header */}
              <div
                className="flex items-center gap-4 p-5 rounded-2xl text-white"
                style={{ backgroundColor: selectedRole.color }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold">{selectedRole.name}</h4>
                  <p className="text-white/70 text-sm">
                    {selectedRole.description || 'No description'}
                    {' · '}
                    {selectedRole.user_count} user{selectedRole.user_count !== 1 ? 's' : ''}
                  </p>
                </div>
                {selectedRole.is_system && (
                  <div className="ml-auto flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
                    <Lock size={12} />
                    <span className="text-xs font-bold uppercase tracking-wider">System Role</span>
                  </div>
                )}
              </div>

              <PermMatrix role={selectedRole} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-20 text-center text-slate-400">
              <ShieldCheck size={48} strokeWidth={1.5} className="mx-auto mb-4" />
              <p className="font-bold text-slate-600">Select a role to manage permissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <RoleModal
            roles={roles ?? []}
            editing={editingRole}
            onClose={() => { setShowModal(false); setEditingRole(null); }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deletingId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} />
              </div>
              <h4 className="text-lg font-extrabold text-slate-800 mb-2">Delete Role</h4>
              <p className="text-slate-500 text-sm mb-6">
                This will permanently delete the role and all its permissions. Users assigned to this role will need to be reassigned.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const r = roles?.find(x => x.id === deletingId);
                    if (r) handleDelete(r);
                  }}
                  disabled={deleteRole.isPending}
                  className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleteRole.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
