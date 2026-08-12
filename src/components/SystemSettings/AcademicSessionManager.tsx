import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, CalendarRange, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';
import { useBranchStore } from '../../store/use-branch-store';
import {
  useAcademicSessions,
  useCreateAcademicSession,
  useUpdateAcademicSession,
  useDeleteAcademicSession,
} from '../../hooks/use-academic-session';
import { AcademicSession } from '../../types/api/academic-session';

const formatDate = (value: string) => {
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ---------------------------------------------------------------------- */
/* Add / Edit modal                                                        */
/* ---------------------------------------------------------------------- */

const SessionModal: React.FC<{ branchId: number; session: AcademicSession | null; onClose: () => void }> = ({
  branchId,
  session,
  onClose,
}) => {
  const createSession = useCreateAcademicSession();
  const updateSession = useUpdateAcademicSession();
  const isSaving = createSession.isPending || updateSession.isPending;

  const [form, setForm] = useState({
    name: session?.name ?? '',
    start_date: session?.start_date ?? '',
    end_date: session?.end_date ?? '',
    is_active: session?.is_active ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (session) {
      await updateSession.mutateAsync({ id: session.id, data: form });
    } else {
      await createSession.mutateAsync({ branch_id: branchId, ...form });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-lg max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100 flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <h3 className="text-lg font-bold text-slate-900">{session ? 'Edit Session' : 'Add Session'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Session Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
                placeholder="e.g. 2026 - 2027"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Start Date</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">End Date</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  required
                  min={form.start_date || undefined}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700"
                />
              </div>
            </div>
            <label
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                form.is_active ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="accent-emerald-500"
              />
              <div>
                <span className="text-sm font-bold block">Set as Active Session</span>
                <span className="text-xs font-medium opacity-80">
                  Only one session can be active at a time — marking this active will deactivate any other session.
                </span>
              </div>
            </label>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isSaving}>{session ? 'Save Changes' : 'Create Session'}</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/* Main screen                                                             */
/* ---------------------------------------------------------------------- */

export const AcademicSessionManager: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId ?? 1;

  const { data: sessionsResp, isLoading } = useAcademicSessions(branchId);
  const sessions = sessionsResp ?? [];
  const updateSession = useUpdateAcademicSession();
  const deleteSession = useDeleteAcademicSession();

  const [modalFor, setModalFor] = useState<{ open: boolean; session: AcademicSession | null }>({ open: false, session: null });
  const [sessionToDelete, setSessionToDelete] = useState<AcademicSession | null>(null);

  const toggleActive = (session: AcademicSession) => {
    updateSession.mutate({
      id: session.id,
      data: { name: session.name, start_date: session.start_date, end_date: session.end_date, is_active: !session.is_active },
    });
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    await deleteSession.mutateAsync(sessionToDelete.id);
    setSessionToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center sm:text-left">
            Academic Sessions
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base text-center sm:text-left">
            Define your school's academic years — Examination uses the active session
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setModalFor({ open: true, session: null })}>
          Add Session
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 gap-3">
          <p className="text-sm font-semibold">Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={CalendarRange}
            title="No Sessions Yet"
            description="Add your first academic session — e.g. 2026 - 2027 — to get started."
            actionLabel="Add Session"
            onAction={() => setModalFor({ open: true, session: null })}
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">End Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{session.name}</span>
                        {session.is_active && <CheckCircle2 size={14} className="text-emerald-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{formatDate(session.start_date)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{formatDate(session.end_date)}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleActive(session)}
                        disabled={updateSession.isPending}
                        title={session.is_active ? 'Click to deactivate' : 'Click to activate'}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
                          session.is_active
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {session.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModalFor({ open: true, session })}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-brand-600"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setSessionToDelete(session)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AnimatePresence>
        {modalFor.open && (
          <SessionModal branchId={branchId} session={modalFor.session} onClose={() => setModalFor({ open: false, session: null })} />
        )}
      </AnimatePresence>

      <DeleteConfirmationModal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Session"
        message={`Are you sure you want to delete "${sessionToDelete?.name}"? This cannot be undone.`}
        isLoading={deleteSession.isPending}
      />
    </div>
  );
};
