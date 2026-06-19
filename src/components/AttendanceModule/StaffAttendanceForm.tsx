import React, { useState } from 'react';
import { Plus, Trash2, Save, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useBranchStore } from '../../store/use-branch-store';
import { useMarkStaffAttendance } from '../../hooks/use-attendance';
import { AttendanceStatusCode } from '../../types/api/attendance';

interface RecordRow {
  id: string;
  user_id: string;
  status: AttendanceStatusCode;
  remarks: string;
}

const STATUS_CONFIG: {
  code: AttendanceStatusCode;
  label: string;
  active: string;
  idle: string;
}[] = [
  { code: 'P', label: 'Present',  active: 'bg-emerald-500 text-white shadow-lg shadow-emerald-100', idle: 'bg-white text-emerald-500 border border-emerald-100 hover:bg-emerald-50' },
  { code: 'A', label: 'Absent',   active: 'bg-rose-500 text-white shadow-lg shadow-rose-100',    idle: 'bg-white text-rose-500 border border-rose-100 hover:bg-rose-50' },
  { code: 'L', label: 'Leave',    active: 'bg-slate-600 text-white shadow-lg shadow-slate-100',  idle: 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50' },
  { code: 'H', label: 'Half-day', active: 'bg-blue-500 text-white shadow-lg shadow-blue-100',    idle: 'bg-white text-blue-500 border border-blue-100 hover:bg-blue-50' },
];

const makeRow = (): RecordRow => ({
  id: crypto.randomUUID(),
  user_id: '',
  status: 'P',
  remarks: '',
});

interface StaffAttendanceFormProps {
  onSuccess?: () => void;
}

export const StaffAttendanceForm: React.FC<StaffAttendanceFormProps> = ({ onSuccess }) => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId ?? 1;

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState<RecordRow[]>([makeRow()]);
  const [error, setError] = useState<string | null>(null);

  const markMutation = useMarkStaffAttendance();

  const updateRow = (id: string, field: keyof Omit<RecordRow, 'id'>, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setError(null);
  };

  const addRow = () => setRows(prev => [...prev, makeRow()]);

  const removeRow = (id: string) => {
    if (rows.length === 1) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleSubmit = () => {
    setError(null);

    const invalid = rows.find(r => !r.user_id.trim() || isNaN(Number(r.user_id)) || Number(r.user_id) < 1);
    if (invalid) {
      setError('Please enter a valid User ID in all rows.');
      return;
    }

    const records = rows.map(r => ({
      user_id: Number(r.user_id),
      status: r.status,
      remarks: r.remarks.trim() || null,
    }));

    markMutation.mutate(
      { branch_id: branchId, date, records },
      {
        onSuccess: () => {
          setRows([makeRow()]);
          onSuccess?.();
        },
        onError: (err: any) => {
          setError(err?.response?.data?.message ?? 'Failed to save attendance. Please try again.');
        },
      }
    );
  };

  return (
    <Card className="p-8 space-y-7">
      {/* Header */}
      <div>
        <h4 className="text-lg font-extrabold text-slate-800">Manual Staff Attendance</h4>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Enter User IDs, select status and save attendance
        </p>
      </div>

      {/* Branch + Date */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch ID</label>
          <div className="px-5 py-3 bg-slate-50 rounded-2xl text-sm font-black text-slate-600 border border-slate-100 min-w-[80px] text-center">
            {branchId}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-5 py-3 bg-white rounded-2xl text-sm font-black text-slate-700 border border-slate-200 outline-none focus:border-brand-400 transition-colors"
          />
        </div>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-3 px-5 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium"
          >
            <AlertTriangle size={16} className="shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-600 font-bold text-base leading-none"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Column labels */}
      <div className="hidden sm:grid sm:grid-cols-[40px_140px_1fr_1fr_36px] gap-3 px-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#</span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID</span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</span>
        <span />
      </div>

      {/* Record rows */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {rows.map((row, idx) => (
            <motion.div
              key={row.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col sm:grid sm:grid-cols-[40px_140px_1fr_1fr_36px] items-start sm:items-center gap-3 p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent hover:border-slate-100 transition-all"
            >
              {/* Row number */}
              <span className="text-sm font-black text-slate-300 hidden sm:block">{idx + 1}</span>

              {/* User ID */}
              <div className="w-full sm:w-auto flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest sm:hidden">User ID</span>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 101"
                  value={row.user_id}
                  onChange={e => updateRow(row.id, 'user_id', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white rounded-xl text-sm font-black text-slate-700 border border-slate-200 outline-none focus:border-brand-400 transition-colors"
                />
              </div>

              {/* Status toggle */}
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest sm:hidden">Status</span>
                <div className="flex gap-1.5">
                  {STATUS_CONFIG.map(s => (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => updateRow(row.id, 'status', s.code)}
                      title={s.label}
                      className={cn(
                        'flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-black transition-all',
                        row.status === s.code ? s.active : s.idle
                      )}
                    >
                      {s.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              <div className="w-full flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest sm:hidden">Remarks</span>
                <input
                  type="text"
                  placeholder="Optional remarks..."
                  value={row.remarks}
                  onChange={e => updateRow(row.id, 'remarks', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white rounded-xl text-sm font-medium text-slate-700 border border-slate-200 outline-none focus:border-brand-400 transition-colors placeholder:text-slate-300"
                />
              </div>

              {/* Remove row */}
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={rows.length === 1}
                className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed self-center"
                title="Remove row"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-all"
        >
          <Plus size={18} />
          Add Staff Member
        </button>

        <Button
          onClick={handleSubmit}
          disabled={markMutation.isPending}
          isLoading={markMutation.isPending}
          leftIcon={!markMutation.isPending ? <Save size={16} /> : undefined}
          className="bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-100"
        >
          {markMutation.isSuccess ? 'Saved ✓' : 'Save Attendance'}
        </Button>
      </div>
    </Card>
  );
};
