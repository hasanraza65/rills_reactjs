import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Download, 
  Calendar as CalendarIcon, 
  Users, 
  Search, 
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  School
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
  LineChart,
  Line
} from 'recharts';
import { motion } from 'motion/react';
import { cn, CLASSES, BRANCHES, ROLES } from '../../types';
import { StatCard } from '../StatCard';

const attendanceTrends = [
  { name: 'Mon', attendance: 92 },
  { name: 'Tue', attendance: 95 },
  { name: 'Wed', attendance: 88 },
  { name: 'Thu', attendance: 91 },
  { name: 'Fri', attendance: 94 },
  { name: 'Sat', attendance: 85 },
];

const classPerformance = [
  { name: 'Grade 1-A', attendance: 98 },
  { name: 'Grade 2-B', attendance: 92 },
  { name: 'Grade 3-A', attendance: 85 },
  { name: 'Grade 4-C', attendance: 94 },
  { name: 'Grade 5-B', attendance: 89 },
];

const statusDistribution = [
  { name: 'Present', value: 88, color: '#10b981' },
  { name: 'Absent', value: 5, color: '#ef4444' },
  { name: 'Late', value: 4, color: '#f59e0b' },
  { name: 'Leave', value: 3, color: '#64748b' },
];

export const AdminAttendanceReports: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0].id);
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('2024-03');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Attendance Analytics</h3>
          <p className="text-slate-500 font-medium">Monitor attendance patterns across the school</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-4 rounded-2xl bg-white border border-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
            <Download size={20} />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Avg. Attendance" value="92.4%" change="2.1%" isPositive icon={TrendingUp} color="emerald" delay={0.1} />
        <StatCard title="Today's Absentees" value="42" change="5%" isPositive={false} icon={Users} color="rose" delay={0.2} />
        <StatCard title="Late Arrivals" value="18" change="12%" isPositive icon={TrendingDown} color="amber" delay={0.3} />
        <StatCard title="Leave Requests" value="12" icon={FileText} color="blue" delay={0.4} />
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Filter size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-800">Filter Reports</h4>
              <p className="text-sm text-slate-500">Slice and dice attendance data</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none"
            >
              {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none"
            >
              <option value="ALL">All Classes</option>
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input 
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-50 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 size={18} className="text-brand-500" />
                  Weekly Attendance Trend
                </h5>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Percentage %</span>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="attendance" radius={[6, 6, 0, 0]}>
                      {attendanceTrends.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.attendance > 90 ? '#10b981' : entry.attendance > 80 ? '#0ea5e9' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl">
              <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-6">
                <TrendingUp size={18} className="text-emerald-500" />
                Class-wise Performance
              </h5>
              <div className="space-y-4">
                {classPerformance.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-600">{item.name}</span>
                      <span className="font-black text-slate-800">{item.attendance}%</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.attendance}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={cn(
                          "h-full rounded-full",
                          item.attendance > 95 ? "bg-emerald-500" : item.attendance > 90 ? "bg-brand-500" : "bg-amber-500"
                        )} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-50 p-6 rounded-3xl">
              <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-6">
                <PieChartIcon size={18} className="text-indigo-500" />
                Status Distribution
              </h5>
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-800">92%</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Avg. Present</span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {statusDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-bold text-slate-500">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-800">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl text-white">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Insights</h5>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ArrowUpRight size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Best Attendance</p>
                    <p className="text-[10px] text-slate-400">Grade 1-A has maintained 98% attendance this week.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <ArrowDownRight size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Attention Needed</p>
                    <p className="text-[10px] text-slate-400">Grade 3-A attendance dropped by 4% due to local flu.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { FileText } from 'lucide-react';
