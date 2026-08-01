import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Loader2, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../types';
import { Select } from '../ui/Select';
import { useRoles } from '../../hooks/use-roles';
import { useCreateStaff, useUpdateStaff } from '../../hooks/use-staff-members';
import { useAuthStore } from '../../store/use-auth-store';
import { useBranchStore } from '../../store/use-branch-store';
import { getAssignableRoleIds } from '../../lib/role-hierarchy';
import type { StaffMember, StaffFormInput } from '../../types/api/staff';
import { isPkMobile, normalizePkMobile, PK_MOBILE_ERROR, PK_MOBILE_PLACEHOLDER } from '../../lib/validations/phone';
import { isCnic, normalizeCnic, CNIC_ERROR, CNIC_PLACEHOLDER } from '../../lib/validations/cnic';

interface StaffFormModalProps {
  editing: StaffMember | null;
  onClose: () => void;
}

const emptyForm: StaffFormInput = {
  name: '',
  father_husband_name: '',
  cnic: '',
  gender: '',
  dob: '',
  date_of_joining: '',
  marital_status: '',
  contact_no: '',
  whatsapp_no: '',
  emergency_contact_no: '',
  current_address: '',
  permanent_address: '',
  user_role: 0,
  branch_id: null,
  email: '',
  password: '',
  is_active: true,
};

const inputCls =
  'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-300 transition-all';
const labelCls = 'text-xs font-bold text-slate-500 uppercase tracking-wider';

export const StaffFormModal: React.FC<StaffFormModalProps> = ({ editing, onClose }) => {
  const { data: roles } = useRoles();
  const currentUser = useAuthStore((s) => s.user);
  const branches = useAuthStore((s) => s.user?.branches) ?? [];
  const { selectedBranchId } = useBranchStore();
  const assignableRoleIds = getAssignableRoleIds(currentUser?.role);
  const assignableRoles = roles?.filter(
    (r) => assignableRoleIds.includes(r.id) || r.id === editing?.user_role
  );
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();

  const [form, setForm] = useState<StaffFormInput>(emptyForm);
  const [error, setError] = useState('');
  const [showCreds, setShowCreds] = useState(false);

  // Seed the form for edit, or defaults for create.
  useEffect(() => {
    if (editing) {
      const p = editing.staff_profile;
      setForm({
        name: editing.name ?? '',
        father_husband_name: p?.father_husband_name ?? '',
        cnic: editing.cnic ?? '',
        gender: p?.gender ?? '',
        dob: p?.dob ? p.dob.substring(0, 10) : '',
        date_of_joining: p?.date_of_joining ? p.date_of_joining.substring(0, 10) : '',
        marital_status: p?.marital_status ?? '',
        contact_no: editing.phone ?? '',
        whatsapp_no: p?.whatsapp_no ?? '',
        emergency_contact_no: p?.emergency_contact_no ?? '',
        current_address: p?.current_address ?? '',
        permanent_address: p?.permanent_address ?? '',
        user_role: editing.user_role,
        branch_id: editing.branch_id,
        email: editing.email ?? '',
        password: '',
        is_active: editing.is_active,
      });
    } else {
      setForm({ ...emptyForm, branch_id: selectedBranchId ?? null });
    }
  }, [editing, selectedBranchId]);

  const set = <K extends keyof StaffFormInput>(key: K, value: StaffFormInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isPending = createStaff.isPending || updateStaff.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Full name is required');
    if (!form.father_husband_name?.trim()) return setError('Father / Husband name is required');
    if (!form.cnic?.trim()) return setError('CNIC No is required');
    if (!isCnic(form.cnic)) return setError(CNIC_ERROR);
    if (!form.gender) return setError('Gender is required');
    if (!form.dob) return setError('Date of Birth is required');
    if (!form.date_of_joining) return setError('Date of Joining is required');
    if (!form.marital_status) return setError('Marital Status is required');
    if (!form.contact_no?.trim()) return setError('Contact Number is required');
    if (!isPkMobile(form.contact_no)) return setError(PK_MOBILE_ERROR);
    if (!form.whatsapp_no?.trim()) return setError('WhatsApp No is required');
    if (!isPkMobile(form.whatsapp_no)) return setError(PK_MOBILE_ERROR);
    if (!form.emergency_contact_no?.trim()) return setError('Emergency Contact Number is required');
    if (!isPkMobile(form.emergency_contact_no)) return setError(PK_MOBILE_ERROR);
    if (!form.current_address?.trim()) return setError('Current Address is required');
    if (!form.permanent_address?.trim()) return setError('Permanent Address is required');
    if (!form.user_role) return setError('Please select a role');

    // Strip empty strings so the backend sees them as null / omitted.
    const payload: StaffFormInput = {
      ...form,
      cnic: normalizeCnic(form.cnic)!,
      contact_no: normalizePkMobile(form.contact_no)!,
      whatsapp_no: normalizePkMobile(form.whatsapp_no)!,
      emergency_contact_no: normalizePkMobile(form.emergency_contact_no)!,
    };
    (Object.keys(payload) as (keyof StaffFormInput)[]).forEach((k) => {
      if (payload[k] === '') delete payload[k];
    });

    try {
      if (editing) {
        await updateStaff.mutateAsync({ id: editing.id, payload });
      } else {
        await createStaff.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      const firstErr = err?.response?.data?.errors
        ? (Object.values(err.response.data.errors)[0] as string[])[0]
        : null;
      setError(firstErr || msg || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white w-full max-w-3xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">
              {editing ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {editing ? 'Update the staff profile and role' : 'Create a staff profile and login account'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-5 overflow-y-auto">
            <div className="space-y-2">
              <label className={labelCls}>Full Name <span className="text-rose-500">*</span></label>
              <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Ali Ahmed" />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Father / Husband Name <span className="text-rose-500">*</span></label>
              <input className={inputCls} value={form.father_husband_name} onChange={(e) => set('father_husband_name', e.target.value)} placeholder="e.g. Ahmed Khan" />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>CNIC No <span className="text-rose-500">*</span></label>
              <input className={inputCls} value={form.cnic} onChange={(e) => set('cnic', e.target.value)} placeholder={CNIC_PLACEHOLDER} />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Gender <span className="text-rose-500">*</span></label>
              <Select
                value={form.gender}
                onChange={(v) => set('gender', v as StaffFormInput['gender'])}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
                placeholder="Select gender"
              />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Date of Birth <span className="text-rose-500">*</span></label>
              <input type="date" className={inputCls} value={form.dob} onChange={(e) => set('dob', e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Date of Joining <span className="text-rose-500">*</span></label>
              <input type="date" className={inputCls} value={form.date_of_joining} onChange={(e) => set('date_of_joining', e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Marital Status <span className="text-rose-500">*</span></label>
              <Select
                value={form.marital_status}
                onChange={(v) => set('marital_status', v as StaffFormInput['marital_status'])}
                options={[
                  { value: 'single', label: 'Single' },
                  { value: 'married', label: 'Married' },
                  { value: 'divorced', label: 'Divorced' },
                  { value: 'widowed', label: 'Widowed' },
                ]}
                placeholder="Select status"
              />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Contact Number <span className="text-rose-500">*</span></label>
              <input className={inputCls} value={form.contact_no} onChange={(e) => set('contact_no', e.target.value)} placeholder={PK_MOBILE_PLACEHOLDER} />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>WhatsApp No <span className="text-rose-500">*</span></label>
              <input className={inputCls} value={form.whatsapp_no} onChange={(e) => set('whatsapp_no', e.target.value)} placeholder={PK_MOBILE_PLACEHOLDER} />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Emergency Contact Number <span className="text-rose-500">*</span></label>
              <input className={inputCls} value={form.emergency_contact_no} onChange={(e) => set('emergency_contact_no', e.target.value)} placeholder={PK_MOBILE_PLACEHOLDER} />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Role <span className="text-rose-500">*</span></label>
              <Select
                value={form.user_role ? String(form.user_role) : ''}
                onChange={(v) => set('user_role', Number(v))}
                options={(assignableRoles || []).map((r) => ({ value: String(r.id), label: r.name }))}
                placeholder="Select a role"
              />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Branch</label>
              <Select
                value={form.branch_id ? String(form.branch_id) : ''}
                onChange={(v) => set('branch_id', v === '' ? null : Number(v))}
                options={branches.map((b) => ({ value: String(b.id), label: b.branch_name }))}
                placeholder="No specific branch"
              />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Status</label>
              <label className="flex items-center gap-2.5 h-[46px] px-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active !== false}
                  onChange={(e) => set('is_active', e.target.checked)}
                  className="w-4 h-4 accent-brand-500 shrink-0"
                />
                <span className="text-sm font-medium text-slate-700">
                  {form.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className={labelCls}>Current Address <span className="text-rose-500">*</span></label>
              <textarea className={cn(inputCls, 'resize-none')} rows={2} value={form.current_address} onChange={(e) => set('current_address', e.target.value)} placeholder="House #, street, area, city" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className={labelCls}>Permanent Address <span className="text-rose-500">*</span></label>
              <textarea className={cn(inputCls, 'resize-none')} rows={2} value={form.permanent_address} onChange={(e) => set('permanent_address', e.target.value)} placeholder="House #, street, area, city" />
            </div>

            {/* Optional login credentials */}
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={() => setShowCreds((v) => !v)}
                className="flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                {showCreds ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                Login Credentials (optional)
              </button>
              {showCreds && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                  <div className="space-y-2">
                    <label className={labelCls}>Email</label>
                    <input type="email" className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="auto-generated if empty" />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>Password</label>
                    <input type="text" className={inputCls} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder={editing ? 'leave blank to keep current' : 'defaults to CNIC if empty'} />
                  </div>
                </div>
              )}
              {!showCreds && !editing && (
                <p className="text-[11px] text-slate-400 mt-2">
                  Login email &amp; password are auto-generated from the contact number and CNIC if left unset.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 shrink-0">
            {error && (
              <p className="flex items-center gap-2 text-sm text-rose-600 font-medium mb-3">
                <AlertCircle size={16} /> {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-white transition-all">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-3 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 disabled:opacity-60 flex items-center gap-2"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {editing ? 'Save Changes' : 'Register Staff'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
