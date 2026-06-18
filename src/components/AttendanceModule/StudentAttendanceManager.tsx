import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Calendar, Search, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '../../types';
import { useBranchStore } from '../../store/use-branch-store';
import { useSections } from '../../hooks/use-section';
import { useClasses } from '../../hooks/use-class';
import { useStudentAttendanceReport } from '../../hooks/use-attendance';
import { AttendanceStatusCode } from '../../types/api/attendance';

const STATUS_COLORS: Record<string, string> = {
  P: 'bg-emerald-500 text-white shadow-emerald-200',
  A: 'bg-rose-500 text-white shadow-rose-200',
  L: 'bg-slate-400 text-white shadow-slate-200',
  H: 'bg-blue-500 text-white shadow-blue-200',
};

const TOTAL_COLORS: Record<string, string> = {
  P: 'bg-emerald-50 text-emerald-600',
  A: 'bg-rose-50 text-rose-600',
  L: 'bg-slate-100 text-slate-600',
  H: 'bg-blue-50 text-blue-600',
};

export const StudentAttendanceManager: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId ?? 1;

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitted, setSubmitted] = useState(false);

  const { data: classes } = useClasses(branchId);
  const { data: sections } = useSections(branchId);

  const filteredSections = sections?.filter((s) =>
    !selectedClassId || String(s.school_class_id) === selectedClassId
  ) ?? [];

  const queryParams = submitted && selectedSectionId
    ? {
        branch_id: branchId,
        section_id: Number(selectedSectionId),
        start_date: startDate,
        end_date: endDate,
      }
    : null;

  const { data: report, isLoading, error } = useStudentAttendanceReport(queryParams);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedClassId('');
    setSelectedSectionId('');
    const d = new Date();
    d.setDate(1);
    setStartDate(d.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setSubmitted(false);
  };

  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-6">Student Attendance Report</h2>

        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          {/* Class */}
          <div className="space-y-2 flex-1 min-w-[150px]">
            <label className="text-sm font-bold text-slate-600">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => { setSelectedClassId(e.target.value); setSelectedSectionId(''); setSubmitted(false); }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700 appearance-none"
            >
              <option value="">All Classes</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div className="space-y-2 flex-1 min-w-[150px]">
            <label className="text-sm font-bold text-slate-600">Section <span className="text-rose-500">*</span></label>
            <select
              value={selectedSectionId}
              onChange={(e) => { setSelectedSectionId(e.target.value); setSubmitted(false); }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700 appearance-none"
              required
            >
              <option value="">Choose…</option>
              {filteredSections.map((s) => (
                <option key={s.id} value={String(s.id)}>{s.school_class?.name} — {s.name}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-2 flex-1 min-w-[150px]">
            <label className="text-sm font-bold text-slate-600">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setSubmitted(false); }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700"
              />
              <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-2 flex-1 min-w-[150px]">
            <label className="text-sm font-bold text-slate-600">End Date</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setSubmitted(false); }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700"
              />
              <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" className="px-8 h-12" icon={Search}>Search</Button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 h-12 rounded-xl font-bold transition-all text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {submitted && (
        <div className="space-y-6">
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm gap-4">
            <div className="flex flex-wrap items-center gap-6">
              {(['P', 'A', 'L', 'H'] as AttendanceStatusCode[]).map((s) => (
                <div key={s} className="flex items-center gap-2 text-sm font-bold text-slate-500">
                  <span className={cn('w-6 h-6 rounded flex items-center justify-center text-xs', STATUS_COLORS[s])}>{s}</span>
                  <span>{s === 'P' ? 'Present' : s === 'A' ? 'Absent' : s === 'L' ? 'Leave' : 'Half-day'}</span>
                </div>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-sm font-bold uppercase tracking-widest">Loading Report…</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 px-5 py-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600">
              <AlertTriangle size={18} />
              <span className="text-sm font-bold">Failed to load report. Please try again.</span>
            </div>
          ) : !report || report.data.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No Records Found"
              description="No attendance records found for the selected filters."
            />
          ) : (
            <Card padding="none" className="overflow-hidden bg-white shadow-sm border border-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-separate border-spacing-x-2 border-spacing-y-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-white border-2 border-slate-800 rounded-xl text-center text-xs font-bold text-slate-800 w-10">#</th>
                      <th className="px-6 py-3 bg-white border-2 border-slate-800 rounded-xl text-center text-xs font-bold text-slate-800 min-w-[140px]">Student</th>
                      <th className="px-6 py-3 bg-white border-2 border-slate-800 rounded-xl text-center text-xs font-bold text-slate-800 min-w-[120px]">Father</th>
                      {report.dates.map((date) => (
                        <th key={date} className="px-3 py-3 bg-sky-400 rounded-xl text-center text-xs font-bold text-white min-w-[60px]">
                          {formatDateHeader(date)}
                        </th>
                      ))}
                      <th className="px-4 py-3 bg-slate-900 rounded-xl text-center text-xs font-bold text-white">P</th>
                      <th className="px-4 py-3 bg-slate-900 rounded-xl text-center text-xs font-bold text-white">A</th>
                      <th className="px-4 py-3 bg-slate-900 rounded-xl text-center text-xs font-bold text-white">L</th>
                      <th className="px-4 py-3 bg-slate-900 rounded-xl text-center text-xs font-bold text-white">H</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.data.map((row, idx) => (
                      <tr key={row.student_id}>
                        <td className="px-4 py-3 bg-slate-50 rounded-xl text-center text-sm font-bold text-slate-500">{idx + 1}</td>
                        <td className="px-6 py-3 bg-slate-50 rounded-xl text-center text-sm font-bold text-slate-800">{row.student_name}</td>
                        <td className="px-6 py-3 bg-slate-50 rounded-xl text-center text-sm font-medium text-slate-600">{row.father_name ?? '—'}</td>
                        {report.dates.map((date) => {
                          const rec = row.records[date];
                          return (
                            <td key={date} className="px-2 py-3 text-center">
                              <div className={cn(
                                'w-full py-2 rounded-lg text-xs font-bold shadow-sm',
                                rec ? STATUS_COLORS[rec.status] : 'bg-slate-100 text-slate-400'
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
