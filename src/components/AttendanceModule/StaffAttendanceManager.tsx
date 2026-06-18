import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Calendar as CalendarIcon,
  Search,
  Save,
  CheckSquare,
  MinusSquare,
  Loader2,
  AlertTriangle,
  BarChart2,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { useBranchStore } from '../../store/use-branch-store';
import {
  useStaffBranchView,
  useMarkStaffAttendance,
  useStaffAttendanceReport,
} from '../../hooks/use-attendance';
import { AttendanceStatusCode } from '../../types/api/attendance';

const STATUS_ICONS: Record<AttendanceStatusCode, React.ElementType> = {
  P: CheckCircle2, A: XCircle, L: FileText, H: Clock,
};

const STATUS_COLORS: Record<AttendanceStatusCode, { active: string; hover: string }> = {
  P: { active: 'bg-emerald-500 text-white shadow-lg shadow-emerald-100', hover: 'bg-white text-slate-300 hover:bg-emerald-50 hover:text-emerald-500' },
  A: { active: 'bg-rose-500 text-white shadow-lg shadow-rose-100',    hover: 'bg-white text-slate-300 hover:bg-rose-50 hover:text-rose-500' },
  L: { active: 'bg-slate-600 text-white shadow-lg shadow-slate-100',  hover: 'bg-white text-slate-300 hover:bg-slate-100 hover:text-slate-600' },
  H: { active: 'bg-blue-500 text-white shadow-lg shadow-blue-100',    hover: 'bg-white text-slate-300 hover:bg-blue-50 hover:text-blue-500' },
};

const STATUS_LABELS: Record<AttendanceStatusCode, string> = { P: 'Present', A: 'Absent', L: 'Leave', H: 'Half-day' };

const TOTAL_COLORS: Record<string, string> = {
  P: 'bg-emerald-50 text-emerald-600',
  A: 'bg-rose-50 text-rose-600',
  L: 'bg-slate-100 text-slate-600',
  H: 'bg-blue-50 text-blue-600',
};

const ROLE_MAP: Record<number, string> = {
  1: 'Super Admin', 2: 'School Admin', 3: 'Branch Admin', 4: 'Teacher', 6: 'Gate Keeper', 7: 'Librarian',
};

type ViewMode = 'mark' | 'report';

export const StaffAttendanceManager: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId ?? 1;

  const [viewMode, setViewMode] = useState<ViewMode>('mark');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [statusMap, setStatusMap] = useState<Record<number, AttendanceStatusCode>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: branchView, isLoading: branchLoading } = useStaffBranchView(branchId, selectedDate);
  const { data: report, isLoading: reportLoading } = useStaffAttendanceReport(
    viewMode === 'report' ? branchId : null,
    viewMode === 'report' ? reportMonth : null
  );
  const markMutation = useMarkStaffAttendance();

  // Seed status map from existing attendance or default P
  useEffect(() => {
    if (!branchView) return;
    const initial: Record<number, AttendanceStatusCode> = {};
    branchView.staff.forEach((m) => {
      initial[m.id] = (m.attendance?.status as AttendanceStatusCode) ?? 'P';
    });
    setStatusMap(initial);
  }, [branchView]);

  const filteredStaff = useMemo(() => {
    if (!branchView) return [];
    const q = searchQuery.toLowerCase();
    return branchView.staff.filter(
      (m) => !q || m.name.toLowerCase().includes(q) || (ROLE_MAP[m.role] ?? '').toLowerCase().includes(q)
    );
  }, [branchView, searchQuery]);

  const stats = useMemo(() => {
    const vals = Object.values(statusMap) as AttendanceStatusCode[];
    return {
      P: vals.filter((v) => v === 'P').length,
      A: vals.filter((v) => v === 'A').length,
      L: vals.filter((v) => v === 'L').length,
      H: vals.filter((v) => v === 'H').length,
    };
  }, [statusMap]);

  const handleStatusChange = (userId: number, status: AttendanceStatusCode) => {
    setStatusMap((prev) => ({ ...prev, [userId]: status }));
    setSaveError(null);
  };

  const bulkMark = (status: AttendanceStatusCode) => {
    const updated = { ...statusMap };
    filteredStaff.forEach((m) => { updated[m.id] = status; });
    setStatusMap(updated);
    setSaveError(null);
  };

  const handleSave = () => {
    if (!branchView) return;
    setSaveError(null);
    const records = branchView.staff.map((m) => ({
      user_id: m.id,
      status: statusMap[m.id] ?? 'P',
      remarks: null,
    }));
    markMutation.mutate(
      { branch_id: branchId, date: selectedDate, records },
      { onError: (err: any) => setSaveError(err?.response?.data?.message ?? 'Failed to save.') }
    );
  };

  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Staff Attendance</h3>
          <p className="text-slate-500 font-medium">Mark and review staff attendance</p>
        </div>

        {/* View mode toggle */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm gap-1">
          <button
            onClick={() => setViewMode('mark')}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
              viewMode === 'mark' ? 'bg-brand-500 text-white shadow-lg shadow-brand-100' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Users size={16} />
            Mark Attendance
          </button>
          <button
            onClick={() => setViewMode('report')}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
              viewMode === 'report' ? 'bg-brand-500 text-white shadow-lg shadow-brand-100' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <BarChart2 size={16} />
            Monthly Report
          </button>
        </div>
      </div>

      {/* ── Mark Attendance View ───────────────────────────────────── */}
      {viewMode === 'mark' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <CalendarIcon size={20} className="text-slate-400 ml-2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-sm font-black text-slate-700 outline-none pr-2"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={markMutation.isPending || !branchView}
              icon={markMutation.isPending ? Loader2 : Save}
              className="bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-100"
            >
              {markMutation.isPending ? 'Saving…' : markMutation.isSuccess ? 'Saved ✓' : 'Save Attendance'}
            </Button>
          </div>

          {saveError && (
            <div className="flex items-center gap-3 px-5 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium">
              <AlertTriangle size={16} className="shrink-0" />
              {saveError}
              <button onClick={() => setSaveError(null)} className="ml-auto text-rose-400 hover:text-rose-600 font-bold">✕</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Summary card */}
            <div className="lg:col-span-1">
              <Card className="p-8 space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Summary</h4>
                {[
                  { key: 'P', label: 'Present',  cls: 'bg-emerald-50 text-emerald-700' },
                  { key: 'A', label: 'Absent',   cls: 'bg-rose-50 text-rose-700' },
                  { key: 'L', label: 'On Leave', cls: 'bg-slate-50 text-slate-600' },
                  { key: 'H', label: 'Half-day', cls: 'bg-blue-50 text-blue-700' },
                ].map(({ key, label, cls }) => (
                  <div key={key} className={cn('flex items-center justify-between p-4 rounded-2xl shadow-sm', cls)}>
                    <span className="text-xs font-black uppercase tracking-wider">{label}</span>
                    <span className="text-2xl font-black">{stats[key as AttendanceStatusCode]}</span>
                  </div>
                ))}
              </Card>
            </div>

            {/* Staff list */}
            <div className="lg:col-span-3">
              <Card className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or role…"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => bulkMark('P')}
                      className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                      icon={CheckSquare}
                    >
                      All Present
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => bulkMark('A')}
                      className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                      icon={MinusSquare}
                    >
                      All Absent
                    </Button>
                  </div>
                </div>

                {branchLoading ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-sm font-bold uppercase tracking-widest">Loading Staff…</p>
                  </div>
                ) : filteredStaff.length === 0 ? (
                  <EmptyState icon={Users} title="No Staff Found" description="No staff members are registered for this branch." />
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {filteredStaff.map((member, index) => {
                        const current = statusMap[member.id] ?? 'P';
                        return (
                          <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.02 }}
                            key={member.id}
                            className="flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 border-2 border-transparent hover:border-slate-100 transition-all"
                          >
                            <div className="flex items-center gap-5">
                              {member.avatar ? (
                                <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-2xl object-cover" />
                              ) : (
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center font-black text-slate-400 shadow-sm text-lg">
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="text-base font-black text-slate-800">{member.name}</p>
                                <p className="text-xs text-slate-400 font-bold">{ROLE_MAP[member.role] ?? 'Staff'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {(['P', 'A', 'L', 'H'] as AttendanceStatusCode[]).map((status) => {
                                const Icon   = STATUS_ICONS[status];
                                const colors = STATUS_COLORS[status];
                                return (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusChange(member.id, status)}
                                    title={STATUS_LABELS[status]}
                                    className={cn(
                                      'w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm',
                                      current === status ? colors.active : colors.hover
                                    )}
                                  >
                                    <Icon size={24} />
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── Monthly Report View ────────────────────────────────────── */}
      {viewMode === 'report' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <CalendarIcon size={20} className="text-slate-400 ml-2" />
              <input
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="bg-transparent border-none text-sm font-black text-slate-700 outline-none pr-2"
              />
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            {(['P', 'A', 'L', 'H'] as AttendanceStatusCode[]).map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <span className={cn(
                  'w-6 h-6 rounded flex items-center justify-center text-xs text-white',
                  s === 'P' ? 'bg-emerald-500' : s === 'A' ? 'bg-rose-500' : s === 'L' ? 'bg-slate-400' : 'bg-blue-500'
                )}>{s}</span>
                {STATUS_LABELS[s]}
              </div>
            ))}
          </div>

          {reportLoading ? (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-sm font-bold uppercase tracking-widest">Loading Report…</p>
            </div>
          ) : !report || report.data.length === 0 ? (
            <EmptyState icon={Users} title="No Records" description="No staff attendance found for this month." />
          ) : (
            <Card padding="none" className="overflow-hidden bg-white shadow-sm border border-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-separate border-spacing-x-2 border-spacing-y-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-white border-2 border-slate-800 rounded-xl text-center text-xs font-bold text-slate-800 w-10">#</th>
                      <th className="px-6 py-3 bg-white border-2 border-slate-800 rounded-xl text-center text-xs font-bold text-slate-800 min-w-[140px]">Name</th>
                      <th className="px-6 py-3 bg-white border-2 border-slate-800 rounded-xl text-center text-xs font-bold text-slate-800">Role</th>
                      {report.dates.map((date) => (
                        <th key={date} className="px-3 py-3 bg-sky-400 rounded-xl text-center text-xs font-bold text-white min-w-[50px]">
                          {formatDateHeader(date)}
                        </th>
                      ))}
                      {(['P', 'A', 'L', 'H'] as AttendanceStatusCode[]).map((s) => (
                        <th key={s} className="px-4 py-3 bg-slate-900 rounded-xl text-center text-xs font-bold text-white">{s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.data.map((row, idx) => (
                      <tr key={row.user_id}>
                        <td className="px-4 py-3 bg-slate-50 rounded-xl text-center text-sm font-bold text-slate-500">{idx + 1}</td>
                        <td className="px-6 py-3 bg-slate-50 rounded-xl text-center text-sm font-bold text-slate-800">{row.name}</td>
                        <td className="px-6 py-3 bg-slate-50 rounded-xl text-center text-xs font-medium text-slate-500">{row.role}</td>
                        {report.dates.map((date) => {
                          const rec = row.records[date];
                          return (
                            <td key={date} className="px-2 py-3 text-center">
                              <div className={cn(
                                'w-full py-2 rounded-lg text-xs font-bold shadow-sm',
                                rec
                                  ? rec.status === 'P' ? 'bg-emerald-500 text-white'
                                  : rec.status === 'A' ? 'bg-rose-500 text-white'
                                  : rec.status === 'L' ? 'bg-slate-400 text-white'
                                  : 'bg-blue-500 text-white'
                                  : 'bg-slate-100 text-slate-400'
                              )}>
                                {rec ? rec.status : '—'}
                              </div>
                            </td>
                          );
                        })}
                        {(['P', 'A', 'L', 'H'] as AttendanceStatusCode[]).map((s) => (
                          <td key={s} className={cn('px-4 py-3 rounded-xl text-center text-sm font-bold', TOTAL_COLORS[s])}>
                            {row.totals[s]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
