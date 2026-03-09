import React, { useState } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  Download,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  User,
  History
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn, CLASSES, STUDENTS, Student, FeeHead, FeeFrequency } from '../../types';
import { StatCard } from '../StatCard';
import { FeeConfiguration } from './FeeConfiguration';
import { StudentFeeDetail } from './StudentFeeDetail';
import { PaymentModal } from './PaymentModal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

const collectionData = [
  { name: 'Jan', collected: 45000, target: 50000 },
  { name: 'Feb', collected: 52000, target: 50000 },
  { name: 'Mar', collected: 48000, target: 55000 },
  { name: 'Apr', collected: 61000, target: 55000 },
  { name: 'May', collected: 55000, target: 60000 },
  { name: 'Jun', collected: 67000, target: 60000 },
];

const statusData = [
  { name: 'Paid', value: 75, color: '#10b981' },
  { name: 'Pending', value: 20, color: '#f59e0b' },
  { name: 'Overdue', value: 5, color: '#ef4444' },
];

export const FeeDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'students'>('overview');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStudent, setPaymentStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tab: 'overview' | 'config' | 'students') => {
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => setIsLoading(false), 500);
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Collection" value="$245,000" change="12%" isPositive icon={DollarSign} color="emerald" delay={0.1} />
        <StatCard title="Outstanding" value="$42,300" change="5%" isPositive={false} icon={AlertCircle} color="amber" delay={0.2} />
        <StatCard title="Collection Rate" value="84%" change="3%" isPositive icon={TrendingUp} color="blue" delay={0.3} />
        <StatCard title="Defaulters" value="12" icon={User} color="rose" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Collection Trends</h3>
              <p className="text-slate-500 text-sm font-medium">Monthly fee collection vs target</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-500" />
                <span className="text-xs font-bold text-slate-500">Collected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="text-xs font-bold text-slate-500">Target</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={collectionData}>
                <defs>
                  <linearGradient id="colorColl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="collected" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorColl)" />
                <Area type="monotone" dataKey="target" stroke="#e2e8f0" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-slate-800 mb-6">Payment Status</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-extrabold text-slate-800">84%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collected</span>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-extrabold text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-800">Recent Transactions</h3>
          <Button variant="ghost" size="sm" leftIcon={<History size={16} />}>
            View History
          </Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                  <ArrowDownRight size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Payment from Parent of Ali Ahmed</p>
                  <p className="text-xs text-slate-500 font-medium">March 2024 Fee • Cash Payment</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-slate-800">$12,500</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Today, 10:45 AM</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderStudentList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Student Fee Records</h3>
          <p className="text-slate-500 font-medium">Monitor and manage individual student fee statuses</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-4 rounded-2xl bg-white border border-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
            <Download size={20} />
            Export Defaulters
          </button>
          <button className="px-6 py-4 rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 flex items-center gap-2">
            <Plus size={20} />
            Bulk Generate Vouchers
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              placeholder="Search by student name or roll number..."
              className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <select className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none">
              <option>All Classes</option>
              {CLASSES.map(c => <option key={c.id}>{c.name}</option>)}
            </select>
            <select className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none">
              <option>All Statuses</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Overdue</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Annual Fee</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {STUDENTS.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400">Roll: {s.rollNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                      {CLASSES.find(c => c.id === s.classId)?.name}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-extrabold text-slate-800">${s.annualFee.toLocaleString()}</td>
                  <td className="px-8 py-5 text-sm font-bold text-emerald-600">$85,000</td>
                  <td className="px-8 py-5 text-sm font-bold text-rose-500">$35,000</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Pending
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setPaymentStudent(s);
                          setIsPaymentModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-brand-50 text-brand-600 text-xs font-bold hover:bg-brand-100 transition-all"
                      >
                        Collect
                      </button>
                      <button 
                        onClick={() => setSelectedStudent(s)}
                        className="p-2 text-slate-300 hover:text-brand-500 transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
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

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Skeleton className="lg:col-span-2 h-[400px] rounded-[2.5rem]" />
              <Skeleton className="h-[400px] rounded-[2.5rem]" />
            </div>
          </motion.div>
        ) : (
          <>
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
                    onCollect={() => {
                      setPaymentStudent(selectedStudent);
                      setIsPaymentModalOpen(true);
                    }}
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
          </>
        )}
      </AnimatePresence>

      {isPaymentModalOpen && paymentStudent && (
        <PaymentModal 
          student={paymentStudent}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPaymentStudent(null);
          }}
          onSave={(data) => {
            console.log('Payment recorded:', data);
            setIsPaymentModalOpen(false);
            setPaymentStudent(null);
          }}
        />
      )}
    </div>
  );
};
