import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  UserPlus,
  Users,
  Eye,
  Edit2,
  Trash2,
  Phone,
  CreditCard,
  Building2,
  CalendarDays,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { cn } from '../types';
import { StatCard } from './StatCard';
import { EmptyState } from './ui/EmptyState';
import { StaffFormModal } from './Staff/StaffFormModal';
import { useStaffMembers, useDeleteStaff } from '../hooks/use-staff-members';
import { useRoles } from '../hooks/use-roles';
import { usePermissions } from '../hooks/use-permissions';
import { useAuthStore } from '../store/use-auth-store';
import { useBranchStore } from '../store/use-branch-store';
import type { StaffMember } from '../types/api/staff';

interface StaffManagementProps {
  role?: string;
}

const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const StaffManagement: React.FC<StaffManagementProps> = () => {
  const { selectedBranchId } = useBranchStore();
  const branches = useAuthStore((s) => s.user?.branches) ?? [];
  const { can } = usePermissions();

  const { data: staff, isLoading, error } = useStaffMembers(selectedBranchId);
  const { data: roles } = useRoles();
  const deleteStaff = useDeleteStaff();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [viewing, setViewing] = useState<StaffMember | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const branchName = (id: number | null) =>
    branches.find((b) => b.id === id)?.branch_name ?? '—';

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return (staff ?? []).filter((s) => {
      if (roleFilter !== '' && s.user_role !== roleFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.cnic ?? '').toLowerCase().includes(q) ||
        (s.phone ?? '').toLowerCase().includes(q) ||
        (s.role?.name ?? '').toLowerCase().includes(q)
      );
    });
  }, [staff, searchQuery, roleFilter]);

  const openAdd = () => { setEditing(null); setShowForm(true); };
  const openEdit = (s: StaffMember) => { setEditing(s); setShowForm(true); };

  const handleDelete = async () => {
    if (deletingId == null) return;
    await deleteStaff.mutateAsync(deletingId);
    setDeletingId(null);
  };

  const roleBadge = (s: StaffMember) => (
    <span
      className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white"
      style={{ backgroundColor: s.role?.color ?? '#64748b' }}
    >
      {s.role?.name ?? 'Staff'}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Staff Management</h2>
          <p className="text-slate-500 font-medium">Manage your team and their profiles</p>
        </div>
        {can('staff', 'create') && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-3 bg-brand-500 text-white text-sm font-bold rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
          >
            <UserPlus size={18} />
            Add Staff
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Staff" value={String(staff?.length ?? 0)} icon={Users} color="indigo" delay={0.1} />
        <StatCard title="Roles" value={String(roles?.length ?? 0)} icon={ShieldCheck} color="emerald" delay={0.2} />
        <StatCard title="Showing" value={String(filtered.length)} icon={Eye} color="amber" delay={0.3} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            placeholder="Search by name, CNIC, phone or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-xl py-3 pl-12 pr-4 text-sm outline-none font-medium shadow-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value === '' ? '' : Number(e.target.value))}
          className="bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 outline-none shadow-sm"
        >
          <option value="">All Roles</option>
          {roles?.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Directory */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left hidden lg:table">
            <thead>
              <tr className="bg-slate-50/50">
                {['Staff', 'Role', 'CNIC', 'Contact', 'Branch', 'Joined', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={cn(
                      'px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest',
                      i === 6 && 'text-right'
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-rose-500 font-bold">
                    Failed to load staff. Please try again.
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <EmptyState
                      icon={Users}
                      title="No Staff Found"
                      description={searchQuery || roleFilter !== '' ? 'No staff match your filters.' : 'Add your first staff member to get started.'}
                      actionLabel={can('staff', 'create') && !searchQuery ? 'Add Staff' : undefined}
                      onAction={can('staff', 'create') && !searchQuery ? openAdd : undefined}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                          {s.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{roleBadge(s)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{s.cnic || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{s.phone || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{branchName(s.branch_id)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{fmtDate(s.staff_profile?.date_of_joining)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewing(s)} className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all" title="View">
                          <Eye size={16} />
                        </button>
                        {can('staff', 'edit') && (
                          <button onClick={() => openEdit(s)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all" title="Edit">
                            <Edit2 size={16} />
                          </button>
                        )}
                        {can('staff', 'delete') && (
                          <button onClick={() => setDeletingId(s.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <div className="p-8">
                <EmptyState icon={Users} title="No Staff Found" description="Add your first staff member." />
              </div>
            ) : (
              filtered.map((s) => (
                <div key={s.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                        {s.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.email}</p>
                      </div>
                    </div>
                    {roleBadge(s)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><CreditCard size={12} /> {s.cnic || '—'}</span>
                    <span className="flex items-center gap-1"><Phone size={12} /> {s.phone || '—'}</span>
                    <span className="flex items-center gap-1"><Building2 size={12} /> {branchName(s.branch_id)}</span>
                    <span className="flex items-center gap-1"><CalendarDays size={12} /> {fmtDate(s.staff_profile?.date_of_joining)}</span>
                  </div>
                  <div className="flex items-center gap-1 pt-2 border-t border-slate-50">
                    <button onClick={() => setViewing(s)} className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl"><Eye size={16} /></button>
                    {can('staff', 'edit') && <button onClick={() => openEdit(s)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl"><Edit2 size={16} /></button>}
                    {can('staff', 'delete') && <button onClick={() => setDeletingId(s.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={16} /></button>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit modal */}
      <AnimatePresence>
        {showForm && (
          <StaffFormModal editing={editing} onClose={() => { setShowForm(false); setEditing(null); }} />
        )}
      </AnimatePresence>

      {/* View modal */}
      <AnimatePresence>
        {viewing && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-800">Staff Details</h3>
                <button onClick={() => setViewing(null)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50"><X size={20} /></button>
              </div>
              <div className="p-8 overflow-y-auto space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-2xl">
                    {viewing.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-slate-800">{viewing.name}</p>
                    {roleBadge(viewing)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  {([
                    ['Father / Husband', viewing.staff_profile?.father_husband_name],
                    ['CNIC', viewing.cnic],
                    ['Gender', viewing.staff_profile?.gender],
                    ['Marital Status', viewing.staff_profile?.marital_status],
                    ['Date of Birth', fmtDate(viewing.staff_profile?.dob)],
                    ['Date of Joining', fmtDate(viewing.staff_profile?.date_of_joining)],
                    ['Contact', viewing.phone],
                    ['WhatsApp', viewing.staff_profile?.whatsapp_no],
                    ['Emergency', viewing.staff_profile?.emergency_contact_no],
                    ['Branch', branchName(viewing.branch_id)],
                    ['Email', viewing.email],
                  ] as [string, string | null | undefined][]).map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className="text-slate-700 font-medium capitalize">{value || '—'}</p>
                    </div>
                  ))}
                </div>
                {(viewing.staff_profile?.current_address || viewing.staff_profile?.permanent_address) && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Address</p>
                      <p className="text-slate-700 font-medium">{viewing.staff_profile?.current_address || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Permanent Address</p>
                      <p className="text-slate-700 font-medium">{viewing.staff_profile?.permanent_address || '—'}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deletingId != null && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} />
              </div>
              <h4 className="text-lg font-extrabold text-slate-800 mb-2">Delete Staff Member</h4>
              <p className="text-slate-500 text-sm mb-6">
                This permanently removes the staff member and their login account. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeletingId(null)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteStaff.isPending}
                  className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleteStaff.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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
