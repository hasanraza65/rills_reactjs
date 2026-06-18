import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  Info,
  Loader2,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../types';
import { useMyChildren, useStudentParentView } from '../../hooks/use-attendance';
import { AttendanceStatusCode } from '../../types/api/attendance';

const STATUS_STYLE: Record<AttendanceStatusCode, string> = {
  P: 'bg-emerald-50 text-emerald-600',
  A: 'bg-rose-50 text-rose-600',
  L: 'bg-slate-100 text-slate-500',
  H: 'bg-blue-50 text-blue-600',
};

const STATUS_DOT: Record<AttendanceStatusCode, string> = {
  P: 'bg-emerald-500',
  A: 'bg-rose-500',
  L: 'bg-slate-400',
  H: 'bg-blue-500',
};

const STATUS_LABEL: Record<AttendanceStatusCode, string> = {
  P: 'Present', A: 'Absent', L: 'Leave', H: 'Half-day',
};

const STATUS_ICON: Record<AttendanceStatusCode, React.ElementType> = {
  P: CheckCircle2, A: XCircle, L: FileText, H: Clock,
};

export const ParentAttendanceView: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const { data: children, isLoading: childrenLoading } = useMyChildren();

  // Auto-select first child
  React.useEffect(() => {
    if (children && children.length > 0 && !selectedStudentId) {
      setSelectedStudentId(children[0].id);
    }
  }, [children]);

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;

  const { data: attendanceData, isLoading: attendanceLoading } = useStudentParentView({
    student_id: selectedStudentId,
    year,
    month,
  });

  const daysInMonth    = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  const recordMap: Record<string, AttendanceStatusCode> = {};
  (attendanceData?.records ?? []).forEach((r) => {
    recordMap[r.date] = r.status;
  });

  const totals = attendanceData?.totals ?? { P: 0, A: 0, L: 0, H: 0 };
  const totalMarked = Object.values(totals).reduce((a, b) => a + b, 0);
  const pct = totalMarked > 0 ? Math.round((totals.P / totalMarked) * 100) : 0;

  const prevMonth = () => setCurrentMonth(new Date(year, month - 2, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month, 1));

  const getDateStr = (day: number) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  if (childrenLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
        <Loader2 className="animate-spin" size={32} />
        <p className="text-sm font-bold uppercase tracking-widest">Loading…</p>
      </div>
    );
  }

  if (!children || children.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center text-slate-400">
        <Users size={48} strokeWidth={1.5} />
        <p className="font-bold text-lg text-slate-600">No children found</p>
        <p className="text-sm">No students are linked to your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Child Attendance</h3>
          <p className="text-slate-500 font-medium">Track your child's daily presence</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Student selector (if multiple children) */}
          {children.length > 1 && (
            <select
              value={selectedStudentId ?? ''}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none shadow-sm"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {/* Calendar / List toggle */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            {(['calendar', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize',
                  view === v ? 'bg-brand-500 text-white shadow-lg shadow-brand-100' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {v === 'calendar' ? 'Calendar' : 'List View'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            {attendanceData && (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                {attendanceData.student.class_name} — {attendanceData.student.section_name}
              </p>
            )}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <TrendingUp size={32} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attendance Rate</p>
                <p className="text-3xl font-black text-slate-800">{pct}%</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'P' as AttendanceStatusCode, label: 'Present Days',  Icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700' },
                { key: 'A' as AttendanceStatusCode, label: 'Absent Days',   Icon: XCircle,      cls: 'bg-rose-50 text-rose-700' },
                { key: 'L' as AttendanceStatusCode, label: 'Leave Days',    Icon: FileText,     cls: 'bg-slate-50 text-slate-600' },
                { key: 'H' as AttendanceStatusCode, label: 'Half-days',     Icon: Clock,        cls: 'bg-blue-50 text-blue-700' },
              ].map(({ key, label, Icon, cls }) => (
                <div key={key} className={cn('flex items-center justify-between p-4 rounded-2xl', cls)}>
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span className="text-sm font-bold">{label}</span>
                  </div>
                  <span className="text-lg font-black">{totals[key]}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400 mb-4">
                <Info size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Note</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Attendance is updated daily by 10:00 AM. Contact the school office for any discrepancies.
              </p>
            </div>
          </div>
        </div>

        {/* Calendar / List */}
        <div className="lg:col-span-2">
          {attendanceLoading ? (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center gap-3 py-16 text-slate-400">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-sm font-bold uppercase tracking-widest">Loading…</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {view === 'calendar' ? (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
                >
                  {/* Month nav */}
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-xl font-extrabold text-slate-800">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                    <div className="flex items-center gap-2">
                      <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                        <ChevronLeft size={24} />
                      </button>
                      <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">{d}</div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day    = i + 1;
                      const dateStr = getDateStr(day);
                      const status  = recordMap[dateStr] as AttendanceStatusCode | undefined;
                      const Icon    = status ? STATUS_ICON[status] : null;
                      return (
                        <div
                          key={day}
                          className={cn(
                            'aspect-square rounded-2xl flex flex-col items-center justify-center transition-all',
                            status ? STATUS_STYLE[status] : 'bg-slate-50 text-slate-400'
                          )}
                        >
                          <span className="text-sm font-bold">{day}</span>
                          {Icon && <Icon size={12} className="mt-0.5" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-8 flex flex-wrap items-center gap-5 pt-8 border-t border-slate-50">
                    {(['P', 'A', 'L', 'H'] as AttendanceStatusCode[]).map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded-full', STATUS_DOT[s])} />
                        <span className="text-xs font-bold text-slate-500">{STATUS_LABEL[s]}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-300" />
                      <span className="text-xs font-bold text-slate-500">No Record</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
                >
                  {/* Month nav for list view */}
                  <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
                    <h4 className="text-lg font-extrabold text-slate-800">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                    <div className="flex items-center gap-2">
                      <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                        <ChevronLeft size={20} />
                      </button>
                      <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Day</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {attendanceData && attendanceData.records.length > 0 ? (
                        attendanceData.records.map((record) => (
                          <tr key={record.date} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5">
                              <p className="text-sm font-bold text-slate-800">
                                {new Date(record.date).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="px-8 py-5">
                              <p className="text-sm font-medium text-slate-600">
                                {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                              </p>
                            </td>
                            <td className="px-8 py-5">
                              <div className={cn(
                                'flex items-center gap-1.5 text-xs font-bold',
                                record.status === 'P' ? 'text-emerald-600' :
                                record.status === 'A' ? 'text-rose-600' :
                                record.status === 'H' ? 'text-blue-600' :
                                'text-slate-500'
                              )}>
                                <div className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  STATUS_DOT[record.status]
                                )} />
                                {STATUS_LABEL[record.status]}
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <p className="text-xs text-slate-500 italic">{record.remarks || 'No remarks'}</p>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-8 py-12 text-center text-slate-400 text-sm font-bold">
                            No attendance records for this month.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
