import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  Loader2,
  UserCheck,
  GraduationCap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../../types';
import { StatCard } from '../StatCard';
import { useBranchStore } from '../../store/use-branch-store';
import {
  useStudentAttendanceSummary,
  useStaffAttendanceSummary,
} from '../../hooks/use-attendance';
import { StudentAttendanceManager } from './StudentAttendanceManager';
import { StaffAttendanceManager } from './StaffAttendanceManager';

type Tab = 'overview' | 'students' | 'staff';

const TAB_CONFIG: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview',         icon: BarChart3 },
  { key: 'students', label: 'Student Report',   icon: GraduationCap },
  { key: 'staff',    label: 'Staff Attendance', icon: UserCheck },
];

interface AdminAttendanceReportsProps {
  view?: Tab;
}

export const AdminAttendanceReports: React.FC<AdminAttendanceReportsProps> = ({ view }) => {
  const [activeTab, setActiveTab] = useState<Tab>(view ?? 'overview');
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId ?? 1;
  const today = new Date().toISOString().split('T')[0];

  const { data: studentSummary, isLoading: studentLoading } = useStudentAttendanceSummary(branchId, today);
  const { data: staffSummary, isLoading: staffLoading } = useStaffAttendanceSummary(branchId, today);

  const sCounts = studentSummary?.counts ?? { P: 0, A: 0, L: 0, H: 0 };
  const stCounts = staffSummary?.counts ?? { P: 0, A: 0, L: 0, H: 0 };

  const pieData = [
    { name: 'Present',  value: sCounts.P, color: '#10b981' },
    { name: 'Absent',   value: sCounts.A, color: '#ef4444' },
    { name: 'Half-day', value: sCounts.H, color: '#3b82f6' },
    { name: 'Leave',    value: sCounts.L, color: '#64748b' },
  ].filter((d) => d.value > 0);

  const trendData = (studentSummary?.trends ?? []).map((t) => ({
    name: t.label,
    attendance: t.present_pct,
  }));

  const sectionData = (studentSummary?.by_section ?? []).slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Header — only shown when component manages its own tabs (not controlled via sidebar) */}
      {!view && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Attendance</h3>
            <p className="text-slate-500 font-medium">Monitor and manage daily attendance</p>
          </div>
          {activeTab === 'overview' && (
            <button className="px-6 py-4 rounded-2xl bg-white border border-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
              <Download size={20} />
              Export Report
            </button>
          )}
        </div>
      )}

      {/* Tabs — hidden when view is controlled externally via sidebar */}
      {!view && (
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit gap-1">
          {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
                activeTab === key
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-100'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Overview ──────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {studentLoading || staffLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Student Present %"
                value={`${studentSummary?.present_percentage ?? 0}%`}
                icon={TrendingUp}
                color="emerald"
                delay={0.1}
              />
              <StatCard
                title="Students Absent"
                value={String(sCounts.A)}
                icon={Users}
                color="rose"
                delay={0.2}
              />
              <StatCard
                title="Staff Present %"
                value={`${staffSummary?.present_percentage ?? 0}%`}
                icon={TrendingDown}
                color="amber"
                delay={0.3}
              />
              <StatCard
                title="Staff Absent"
                value={String(stCounts.A)}
                icon={Users}
                color="blue"
                delay={0.4}
              />
            </div>
          )}

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: charts */}
              <div className="lg:col-span-2 space-y-8">
                {/* 7-day trend */}
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-6">
                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <BarChart3 size={18} className="text-brand-500" />
                      7-Day Student Attendance Trend
                    </h5>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">% Present</span>
                    </div>
                  </div>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="attendance" radius={[6, 6, 0, 0]}>
                          {trendData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.attendance > 90 ? '#10b981' : entry.attendance > 80 ? '#0ea5e9' : '#f59e0b'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Section-wise */}
                {sectionData.length > 0 && (
                  <div className="bg-slate-50 p-6 rounded-3xl">
                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-6">
                      <TrendingUp size={18} className="text-emerald-500" />
                      Section-wise Attendance Today
                    </h5>
                    <div className="space-y-4">
                      {sectionData.map((item) => (
                        <div key={item.section_id} className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-600">{item.section_name}</span>
                            <span className="font-black text-slate-800">{item.present_pct}%</span>
                          </div>
                          <div className="h-2 bg-white rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.present_pct}%` }}
                              transition={{ duration: 1, delay: 0.3 }}
                              className={cn(
                                'h-full rounded-full',
                                item.present_pct > 95 ? 'bg-emerald-500' :
                                item.present_pct > 90 ? 'bg-brand-500' :
                                'bg-amber-500'
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: pie + staff */}
              <div className="space-y-8">
                {pieData.length > 0 && (
                  <div className="bg-slate-50 p-6 rounded-3xl">
                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-6">
                      <PieChartIcon size={18} className="text-indigo-500" />
                      Student Status Today
                    </h5>
                    <div className="h-[180px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={6}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-slate-800">
                          {studentSummary?.present_percentage ?? 0}%
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Present</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {pieData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs font-bold text-slate-500">{item.name}</span>
                          </div>
                          <span className="text-xs font-black text-slate-800">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-900 p-6 rounded-3xl text-white">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Staff Today</h5>
                  <div className="space-y-3">
                    {[
                      { label: 'Present',  val: stCounts.P, color: 'bg-emerald-400', text: 'text-emerald-400' },
                      { label: 'Absent',   val: stCounts.A, color: 'bg-rose-400',    text: 'text-rose-400' },
                      { label: 'On Leave', val: stCounts.L, color: 'bg-slate-400',   text: 'text-slate-300' },
                    ].map(({ label, val, color, text }) => (
                      <div key={label} className="flex items-center justify-between p-3 rounded-2xl bg-white/10">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full', color)} />
                          <span className="text-xs font-bold">{label}</span>
                        </div>
                        <span className={cn('text-lg font-black', text)}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Student Report ────────────────────────────────────────── */}
      {activeTab === 'students' && <StudentAttendanceManager />}

      {/* ── Staff Attendance ──────────────────────────────────────── */}
      {activeTab === 'staff' && <StaffAttendanceManager />}
    </div>
  );
};
