import React, { useMemo, useState } from 'react';
import {
  CreditCard,
  TrendingUp,
  AlertCircle,
  Search,
  ChevronRight,
  DollarSign,
  Settings,
  FileText,
} from 'lucide-react';
import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../types';
import { StatCard } from '../StatCard';
import { FeeConfiguration } from './FeeConfiguration';
import { StudentFeeDetail } from './StudentFeeDetail';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { useBranchStore } from '../../store/use-branch-store';
import { useDashboardOverview } from '../../hooks/use-dashboard';
import { useInvoices } from '../../hooks/use-invoice';
import { useStudents } from '../../hooks/use-student';
import type { FeeStat } from '../../lib/services/dashboard-service';
import type { StudentData } from '../../types/api/student';

const rupees = (n: number) => `Rs. ${Math.round(n).toLocaleString()}`;

interface FeeDashboardProps {
  view?: 'overview' | 'students' | 'config';
}

export const FeeDashboard: React.FC<FeeDashboardProps> = ({ view }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'students'>(view ?? 'overview');
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [studentSearch, setStudentSearch] = useState('');

  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId || 1;

  const { data: overview, isLoading: isLoadingOverview } = useDashboardOverview(branchId);
  const { data: invoices, isLoading: isLoadingInvoices } = useInvoices(branchId);
  const { data: students, isLoading: isLoadingStudents } = useStudents(branchId);

  const fees = (overview?.data as { fee_collection?: FeeStat } | undefined)?.fee_collection;

  /**
   * Invoice-level breakdown. Per-item paid amounts aren't returned by the list
   * endpoint, so everything here is counted per invoice rather than per student.
   */
  const invoiceStats = useMemo(() => {
    const list = invoices ?? [];
    if (list.length === 0) return null;

    let paid = 0;
    let overdue = 0;
    let pending = 0;

    list.forEach(inv => {
      if (inv.status === 'paid') paid++;
      else if (inv.is_overdue) overdue++;
      else pending++;
    });

    const pct = (n: number) => Math.round((n / list.length) * 100);

    return {
      total: list.length,
      overdue,
      breakdown: [
        { name: 'Paid', value: pct(paid), count: paid, color: '#10b981' },
        { name: 'Pending', value: pct(pending), count: pending, color: '#f59e0b' },
        { name: 'Overdue', value: pct(overdue), count: overdue, color: '#ef4444' },
      ],
    };
  }, [invoices]);

  const handleTabChange = (tab: 'overview' | 'config' | 'students') => setActiveTab(tab);

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Collection"
          value={isLoadingOverview ? '—' : rupees(fees?.total_collected ?? 0)}
          icon={DollarSign} color="emerald" delay={0.1}
        />
        <StatCard
          title="Outstanding"
          value={isLoadingOverview ? '—' : rupees(fees?.total_pending ?? 0)}
          icon={AlertCircle} color="amber" delay={0.2}
        />
        <StatCard
          title="Collection Rate"
          value={isLoadingOverview ? '—' : `${fees?.percentage ?? 0}%`}
          icon={TrendingUp} color="blue" delay={0.3}
        />
        <StatCard
          title="Overdue Invoices"
          value={isLoadingInvoices ? '—' : String(invoiceStats?.overdue ?? 0)}
          icon={FileText} color="rose" delay={0.4}
        />
      </div>

      <Card>
        <h3 className="text-xl font-bold text-slate-800 mb-6">Payment Status</h3>
        {isLoadingInvoices ? (
          <Skeleton className="h-[250px] rounded-3xl" />
        ) : !invoiceStats ? (
          <EmptyState
            icon={FileText}
            title="No Invoices Yet"
            description="Payment status will appear here once invoices have been generated."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={invoiceStats.breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {invoiceStats.breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n) => [`${v}%`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-slate-800">{fees?.percentage ?? 0}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collected</span>
              </div>
            </div>
            <div className="space-y-4">
              {invoiceStats.breakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-800">
                    {item.count} <span className="text-slate-400 font-bold">({item.value}%)</span>
                  </span>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600">Total Invoices</span>
                <span className="text-sm font-extrabold text-slate-800">{invoiceStats.total}</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  /**
   * Per-student totals, summed from invoice line items (the only place the list
   * endpoint exposes a per-student figure). Payments are recorded against the
   * invoice as a whole, so amounts paid can't be split per student here — those
   * live on the student's invoice list instead.
   */
  const feesByStudent = useMemo(() => {
    const totals = new Map<number, { invoiced: number; invoiceCount: number; overdue: boolean; unpaid: boolean }>();

    (invoices ?? []).forEach(inv => {
      const studentIds = new Set<number>();

      inv.items?.forEach(item => {
        const sid = item.student_id ?? inv.student_id;
        if (!sid) return;
        studentIds.add(sid);
        const cur = totals.get(sid) ?? { invoiced: 0, invoiceCount: 0, overdue: false, unpaid: false };
        cur.invoiced += Number(item.amount) || 0;
        totals.set(sid, cur);
      });

      studentIds.forEach(sid => {
        const cur = totals.get(sid)!;
        cur.invoiceCount += 1;
        if (inv.status !== 'paid') {
          cur.unpaid = true;
          if (inv.is_overdue) cur.overdue = true;
        }
      });
    });

    return totals;
  }, [invoices]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.toLowerCase().trim();
    const list = students ?? [];
    if (!q) return list;
    return list.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.admission_no || '').toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const renderStudentList = () => {
    const isLoading = isLoadingStudents || isLoadingInvoices;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                placeholder="Search by student name or admission no..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Invoiced</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoices</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center text-sm font-bold text-slate-400">
                      Loading student fees...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-16">
                      <EmptyState
                        icon={CreditCard}
                        title="No Students Found"
                        description={studentSearch ? `No records match "${studentSearch}"` : 'Students will appear here once admitted.'}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(s => {
                    const fee = feesByStudent.get(s.id);
                    const status = !fee
                      ? { label: 'Not Invoiced', color: 'text-slate-400', dot: 'bg-slate-300' }
                      : fee.overdue
                        ? { label: 'Overdue', color: 'text-rose-500', dot: 'bg-rose-500' }
                        : fee.unpaid
                          ? { label: 'Pending', color: 'text-amber-500', dot: 'bg-amber-500' }
                          : { label: 'Paid', color: 'text-emerald-500', dot: 'bg-emerald-500' };

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                              {s.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{s.name}</p>
                              <p className="text-xs text-slate-400">{s.admission_no}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                            {s.class?.name || 'No Class'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-sm font-extrabold text-slate-800">
                          {fee ? rupees(fee.invoiced) : '—'}
                        </td>
                        <td className="px-8 py-5 text-sm font-bold text-slate-500">
                          {fee?.invoiceCount ?? 0}
                        </td>
                        <td className="px-8 py-5">
                          <div className={cn("flex items-center gap-1.5 text-xs font-bold", status.color)}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                            {status.label}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="p-2 text-slate-300 hover:text-brand-500 transition-colors"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Tab bar hidden when view is controlled externally via sidebar */}
      {!view && (
        <div className="flex items-center gap-4 mb-8 bg-white p-2 rounded-3xl border border-slate-100 w-fit shadow-sm">
          <button
            onClick={() => handleTabChange('overview')}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
              activeTab === 'overview' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <TrendingUp size={18} />
            Overview
          </button>
          <button
            onClick={() => handleTabChange('students')}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
              activeTab === 'students' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <CreditCard size={18} />
            Student Fees
          </button>
          <button
            onClick={() => handleTabChange('config')}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
              activeTab === 'config' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <Settings size={18} />
            Fee Config
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {renderOverview()}
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {selectedStudent ? (
              <StudentFeeDetail
                student={selectedStudent}
                onBack={() => setSelectedStudent(null)}
              />
            ) : (
              renderStudentList()
            )}
          </motion.div>
        )}

        {activeTab === 'config' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <FeeConfiguration />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
