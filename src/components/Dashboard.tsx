import React from 'react';
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  Clock,
  ArrowUpRight,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  School,
  Plus,
  Settings,
  LayoutDashboard,
  Search,
  Filter,
  UserPlus,
  BookOpen,
  User,
  ShieldCheck,
  FileText,
  Library as LibraryIcon,
  Bell,
  Book as BookIcon
} from 'lucide-react';
import { StatCard } from './StatCard';
import { SchoolCard } from './SuperAdmin/SchoolCard';
import { PricingConfig } from './SuperAdmin/PricingConfig';
import { AddStudentForm } from './AddStudentForm';
import { FamilyManagement } from './FamilyManagement';
import { FeeDashboard } from './FeeManagement/FeeDashboard';
import { AttendanceDashboard } from './AttendanceModule/AttendanceDashboard';
import { SyllabusManager } from './Academic/SyllabusManager';
import { StudentDiary } from './Academic/StudentDiary';
import { StaffManagement } from './StaffManagement';
import { VisitorManagement } from './VisitorManagement';
import { LibraryManager } from './Library/LibraryManager';
import { NotificationPanel } from './NotificationPanel';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { EmptyState } from './ui/EmptyState';
import { Skeleton, SkeletonCard } from './ui/Skeleton';
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
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, cn, SCHOOLS, STUDENTS, CLASSES } from '../types';

const data = [
  { name: 'Mon', students: 400, revenue: 2400 },
  { name: 'Tue', students: 300, revenue: 1398 },
  { name: 'Wed', students: 200, revenue: 9800 },
  { name: 'Thu', students: 278, revenue: 3908 },
  { name: 'Fri', students: 189, revenue: 4800 },
  { name: 'Sat', students: 239, revenue: 3800 },
  { name: 'Sun', students: 349, revenue: 4300 },
];

const attendanceData = [
  { name: 'Grade 1', present: 95, absent: 5 },
  { name: 'Grade 2', present: 88, absent: 12 },
  { name: 'Grade 3', present: 92, absent: 8 },
  { name: 'Grade 4', present: 98, absent: 2 },
  { name: 'Grade 5', present: 85, absent: 15 },
];

interface DashboardProps {
  role: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ role, activeTab, onTabChange }) => {
  const [isAddStudentOpen, setIsAddStudentOpen] = React.useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [activeTab, role]);

  if (isLoading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex justify-between items-center mb-10">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <Skeleton className="h-12 w-32 rounded-2xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const renderSuperAdmin = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8 bg-white p-2 rounded-3xl border border-slate-100 w-fit shadow-sm">
        <button 
          onClick={() => onTabChange('overview')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'overview' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <LayoutDashboard size={18} />
          Overview
        </button>
        <button 
          onClick={() => onTabChange('schools')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'schools' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <School size={18} />
          Manage Schools
        </button>
        <button 
          onClick={() => onTabChange('pricing')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'pricing' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <Settings size={18} />
          Pricing Config
        </button>
        <button 
          onClick={() => onTabChange('syllabus')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'syllabus' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <BookOpen size={18} />
          Syllabus
        </button>
        <button 
          onClick={() => onTabChange('library')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'library' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <LibraryIcon size={18} />
          Library
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Schools" value="124" change="12%" isPositive icon={GraduationCap} color="blue" delay={0.1} />
              <StatCard title="Active Students" value="45,230" change="8%" isPositive icon={Users} color="emerald" delay={0.2} />
              <StatCard title="Total Revenue" value="$1.2M" change="24%" isPositive icon={CreditCard} color="purple" delay={0.3} />
              <StatCard title="System Health" value="99.9%" icon={TrendingUp} color="indigo" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Platform Growth</h3>
                    <p className="text-slate-500 text-sm">Revenue and user acquisition over time</p>
                  </div>
                  <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-semibold outline-none">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
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
                      <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Schools</h3>
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                        <School className="text-slate-400 group-hover:text-brand-500" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">Horizon Academy {i}</p>
                        <p className="text-xs text-slate-500">Premium Plan • 1,200 Students</p>
                      </div>
                      <ArrowUpRight size={16} className="text-slate-300 group-hover:text-brand-500" />
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-3 rounded-2xl bg-slate-50 text-slate-600 text-sm font-bold hover:bg-slate-100 transition-all">
                  View All Schools
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'schools' && (
          <motion.div
            key="schools"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">School Directory</h3>
                <p className="text-slate-500 font-medium">Manage all registered schools and their branches</p>
              </div>
              <button className="px-6 py-4 rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 flex items-center gap-2">
                <Plus size={20} />
                Register New School
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {SCHOOLS.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'pricing' && (
          <motion.div
            key="pricing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <PricingConfig />
          </motion.div>
        )}

        {activeTab === 'attendance' && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AttendanceDashboard role={role} />
          </motion.div>
        )}

        {activeTab === 'syllabus' && (
          <motion.div
            key="syllabus"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SyllabusManager role={role} />
          </motion.div>
        )}

        {activeTab === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <LibraryManager />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderBranchAdmin = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8 bg-white p-2 rounded-3xl border border-slate-100 w-fit shadow-sm">
        <button 
          onClick={() => onTabChange('overview')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'overview' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <LayoutDashboard size={18} />
          Overview
        </button>
        <button 
          onClick={() => onTabChange('students')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'students' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <GraduationCap size={18} />
          Students
        </button>
        <button 
          onClick={() => onTabChange('families')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'families' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <Users size={18} />
          Families
        </button>
        <button 
          onClick={() => onTabChange('fees')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'fees' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <CreditCard size={18} />
          Fees
        </button>
        <button 
          onClick={() => onTabChange('attendance')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'attendance' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <Calendar size={18} />
          Attendance
        </button>
        <button 
          onClick={() => onTabChange('syllabus')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'syllabus' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <BookOpen size={18} />
          Syllabus
        </button>
        <button 
          onClick={() => onTabChange('diary')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'diary' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <FileText size={18} />
          Diary
        </button>
        <button 
          onClick={() => onTabChange('staff')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'staff' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <Users size={18} />
          Staff
        </button>
        <button 
          onClick={() => onTabChange('library')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'library' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <LibraryIcon size={18} />
          Library
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-3 gap-6">
              <StatCard title="Total Students" value="1,240" change="5%" isPositive icon={Users} color="blue" delay={0.1} />
              <StatCard title="Attendance Today" value="94%" change="2%" isPositive icon={Calendar} color="emerald" delay={0.2} />
              <StatCard title="Fee Collection" value="82%" icon={CreditCard} color="purple" delay={0.3} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Attendance Trends</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                      <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Admissions</h3>
                <div className="space-y-4">
                  {STUDENTS.slice(0, 4).map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-500">{CLASSES.find(c => c.id === s.classId)?.name}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-400">2h ago</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Student Listing</h3>
                <p className="text-slate-500 font-medium">Manage student records and admissions</p>
              </div>
              <button 
                onClick={() => setIsAddStudentOpen(true)}
                className="px-6 py-4 rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 flex items-center gap-2"
              >
                <UserPlus size={20} />
                New Admission
              </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    placeholder="Search students by name, roll number..."
                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl">
                    <BookOpen size={16} className="text-slate-400" />
                    <select className="bg-transparent border-none text-sm font-bold text-slate-600 outline-none">
                      <option>All Classes</option>
                      {CLASSES.map(c => <option key={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <button className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all">
                    <Filter size={20} />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roll No</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class</th>
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
                              <p className="text-xs text-slate-400">{s.gender}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-medium text-slate-600">#{s.rollNumber}</td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                            {CLASSES.find(c => c.id === s.classId)?.name}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="p-2 text-slate-300 hover:text-brand-500 transition-colors">
                            <MoreHorizontal size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'families' && (
          <motion.div
            key="families"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <FamilyManagement onAddStudent={(parentId) => {
              // Pre-select parent in form (logic can be expanded)
              setIsAddStudentOpen(true);
            }} />
          </motion.div>
        )}

        {activeTab === 'fees' && (
          <motion.div
            key="fees"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <FeeDashboard />
          </motion.div>
        )}

        {activeTab === 'attendance' && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AttendanceDashboard role={role} />
          </motion.div>
        )}

        {activeTab === 'syllabus' && (
          <motion.div
            key="syllabus"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SyllabusManager role={role} />
          </motion.div>
        )}

        {activeTab === 'diary' && (
          <motion.div
            key="diary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <StudentDiary role={role} />
          </motion.div>
        )}

        {activeTab === 'staff' && (
          <motion.div
            key="staff"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <StaffManagement role={role} />
          </motion.div>
        )}

        {activeTab === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <LibraryManager />
          </motion.div>
        )}
      </AnimatePresence>

      {isAddStudentOpen && (
        <AddStudentForm 
          onClose={() => setIsAddStudentOpen(false)}
          onSave={(data) => {
            console.log('New Student Data:', data);
            setIsAddStudentOpen(false);
          }}
        />
      )}
    </div>
  );

  const renderTeacher = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8 bg-white p-2 rounded-3xl border border-slate-100 w-fit shadow-sm">
        <button 
          onClick={() => onTabChange('overview')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'overview' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <LayoutDashboard size={18} />
          Overview
        </button>
        <button 
          onClick={() => onTabChange('attendance')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'attendance' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <Calendar size={18} />
          Attendance
        </button>
        <button 
          onClick={() => onTabChange('diary')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'diary' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <FileText size={18} />
          Diary
        </button>
        <button 
          onClick={() => onTabChange('syllabus')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'syllabus' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <BookOpen size={18} />
          Syllabus
        </button>
        <button 
          onClick={() => onTabChange('library')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'library' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <LibraryIcon size={18} />
          Library
        </button>
      </div>
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Today's Classes" value="4" icon={Calendar} color="blue" delay={0.1} />
              <StatCard title="Total Students" value="142" icon={Users} color="emerald" delay={0.2} />
              <StatCard title="Pending Assignments" value="12" icon={Clock} color="amber" delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Today's Schedule</h3>
                <div className="space-y-4">
                  {[
                    { time: '08:00 AM', subject: 'Mathematics', class: 'Grade 10-A', status: 'completed' },
                    { time: '10:30 AM', subject: 'Physics', class: 'Grade 11-B', status: 'ongoing' },
                    { time: '01:00 PM', subject: 'Calculus', class: 'Grade 12-C', status: 'upcoming' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-all">
                      <div className="text-sm font-bold text-slate-400 w-20">{item.time}</div>
                      <div className="w-1 h-10 rounded-full bg-brand-500" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{item.subject}</p>
                        <p className="text-xs text-slate-500">{item.class}</p>
                      </div>
                      {item.status === 'completed' ? (
                        <CheckCircle2 className="text-emerald-500" size={20} />
                      ) : item.status === 'ongoing' ? (
                        <div className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-[10px] font-bold uppercase tracking-wider animate-pulse">Live</div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Class Attendance</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                      <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'attendance' && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AttendanceDashboard role={role} />
          </motion.div>
        )}

        {activeTab === 'diary' && (
          <motion.div
            key="diary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <StudentDiary role={role} />
          </motion.div>
        )}

        {activeTab === 'syllabus' && (
          <motion.div
            key="syllabus"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SyllabusManager role={role} />
          </motion.div>
        )}

        {activeTab === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <LibraryManager />
          </motion.div>
        )}

        {activeTab !== 'overview' && activeTab !== 'attendance' && activeTab !== 'diary' && activeTab !== 'syllabus' && activeTab !== 'library' && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
              <LayoutDashboard size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
            <p className="text-slate-500">This module is currently being optimized for your role.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderParent = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8 bg-white p-2 rounded-3xl border border-slate-100 w-fit shadow-sm">
        <button 
          onClick={() => onTabChange('overview')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'overview' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <LayoutDashboard size={18} />
          Overview
        </button>
        <button 
          onClick={() => onTabChange('fees')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'fees' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <CreditCard size={18} />
          Fees
        </button>
        <button 
          onClick={() => onTabChange('attendance')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'attendance' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <Calendar size={18} />
          Attendance
        </button>
        <button 
          onClick={() => onTabChange('diary')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'diary' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <FileText size={18} />
          Diary
        </button>
        <button 
          onClick={() => onTabChange('syllabus')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'syllabus' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <BookOpen size={18} />
          Syllabus
        </button>
        <button 
          onClick={() => onTabChange('library')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'library' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <LibraryIcon size={18} />
          Library
        </button>
      </div>
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-r from-brand-600 to-indigo-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-brand-200">
              <div className="relative z-10">
                <h2 className="text-3xl font-extrabold mb-2">Welcome back, Sarah!</h2>
                <p className="text-brand-100 mb-6 max-w-md">Alex is doing great this week. He achieved 95% in his latest Math quiz!</p>
                <div className="flex gap-4">
                  <button className="bg-white text-brand-600 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-brand-50 transition-all">View Report Card</button>
                  <button 
                    onClick={() => onTabChange('fees')}
                    className="bg-brand-500/30 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold text-sm border border-white/20 hover:bg-brand-500/40 transition-all"
                  >
                    Pay Fees
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="absolute bottom-0 right-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Recent Notices</h3>
                  <button 
                    onClick={() => onTabChange('notices')}
                    className="text-brand-600 text-sm font-bold"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { title: 'Annual Sports Day', date: 'March 15, 2024', type: 'Event' },
                    { title: 'Parent-Teacher Meeting', date: 'March 10, 2024', type: 'Meeting' },
                    { title: 'Spring Break Holidays', date: 'April 01, 2024', type: 'Holiday' },
                  ].map((notice, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-50 hover:border-brand-100 hover:bg-brand-50/30 transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{notice.type}</span>
                        <span className="text-xs text-slate-400">{notice.date}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{notice.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Homework Status</h3>
                <div className="space-y-6">
                  {[
                    { subject: 'English Literature', task: 'Chapter 4 Summary', status: 'pending', deadline: 'Tomorrow' },
                    { subject: 'Science', task: 'Plant Growth Observation', status: 'completed', deadline: 'Done' },
                    { subject: 'History', task: 'Ancient Civilizations Essay', status: 'pending', deadline: 'In 2 days' },
                  ].map((hw, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        hw.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {hw.status === 'completed' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{hw.subject}</p>
                        <p className="text-xs text-slate-500">{hw.task}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-xs font-bold", hw.status === 'completed' ? "text-emerald-600" : "text-amber-600")}>
                          {hw.deadline}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'fees' && (
          <motion.div
            key="fees"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Fee Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Paid Amount</p>
                  <p className="text-2xl font-extrabold text-emerald-700">$85,000</p>
                </div>
                <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100">
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">Outstanding</p>
                  <p className="text-2xl font-extrabold text-rose-700">$35,000</p>
                </div>
                <div className="p-6 rounded-3xl bg-brand-50 border border-brand-100">
                  <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">Next Due Date</p>
                  <p className="text-2xl font-extrabold text-brand-700">Oct 10, 2024</p>
                </div>
              </div>
              <button className="w-full py-4 rounded-2xl bg-brand-500 text-white font-bold text-lg hover:bg-brand-600 transition-all shadow-xl shadow-brand-100">
                Pay Outstanding Balance
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'attendance' && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AttendanceDashboard role={role} />
          </motion.div>
        )}

        {activeTab === 'diary' && (
          <motion.div
            key="diary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <StudentDiary role={role} />
          </motion.div>
        )}

        {activeTab === 'syllabus' && (
          <motion.div
            key="syllabus"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SyllabusManager role={role} />
          </motion.div>
        )}

        {activeTab === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Issued Books</h3>
              <div className="space-y-4">
                {[
                  { title: 'The Great Gatsby', dueDate: '2024-03-01', status: 'OVERDUE', fine: 150 },
                  { title: 'To Kill a Mockingbird', dueDate: '2024-03-14', status: 'ISSUED', fine: 0 },
                ].map((book, i) => (
                  <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <BookIcon size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{book.title}</p>
                        <p className="text-sm text-slate-500">Due: {book.dueDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        book.status === 'ISSUED' ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {book.status}
                      </span>
                      {book.fine > 0 && (
                        <p className="text-xs font-bold text-rose-600 mt-1">Fine: Rs. {book.fine}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {(activeTab === 'notices' || activeTab === 'chat') && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
              <LayoutDashboard size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
            <p className="text-slate-500">This module is currently being optimized for your role.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderGateKeeper = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8 bg-white p-2 rounded-3xl border border-slate-100 w-fit shadow-sm">
        <button 
          onClick={() => onTabChange('overview')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'overview' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <LayoutDashboard size={18} />
          Overview
        </button>
        <button 
          onClick={() => onTabChange('visitors')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'visitors' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <ShieldCheck size={18} />
          Visitor Pass
        </button>
      </div>
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Today's Entries" value="45" icon={Users} color="blue" delay={0.1} />
              <StatCard title="Active Visitors" value="8" icon={ShieldCheck} color="emerald" delay={0.2} />
              <StatCard title="Staff Present" value="32" icon={Clock} color="purple" delay={0.3} />
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Recent Activity Log</h3>
                <button 
                  onClick={() => onTabChange('visitors')}
                  className="px-4 py-2 bg-brand-50 text-brand-600 rounded-xl text-xs font-bold hover:bg-brand-100 transition-all"
                >
                  Manage Visitors
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'John Doe', type: 'Visitor', time: '10:15 AM', status: 'In' },
                  { name: 'Sarah Smith', type: 'Staff', time: '08:00 AM', status: 'In' },
                  { name: 'Mike Johnson', type: 'Parent', time: '09:30 AM', status: 'Out' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{log.name}</p>
                        <p className="text-xs text-slate-500">{log.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">{log.time}</p>
                      <span className={cn(
                        "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                        log.status === 'In' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      )}>{log.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'visitors' && (
          <motion.div
            key="visitors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <VisitorManagement />
          </motion.div>
        )}

        {activeTab !== 'overview' && activeTab !== 'visitors' && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
              <LayoutDashboard size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
            <p className="text-slate-500">This module is currently being optimized for your role.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderLibrarian = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8 bg-white p-2 rounded-3xl border border-slate-100 w-fit shadow-sm">
        <button 
          onClick={() => onTabChange('overview')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'overview' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <LayoutDashboard size={18} />
          Overview
        </button>
        <button 
          onClick={() => onTabChange('library')}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'library' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <LibraryIcon size={18} />
          Library
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Books" value="1,420" icon={LibraryIcon} color="blue" delay={0.1} />
              <StatCard title="Issued Today" value="24" icon={BookOpen} color="emerald" delay={0.2} />
              <StatCard title="Overdue Books" value="12" icon={AlertCircle} color="rose" delay={0.3} />
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Recent Library Activity</h3>
                <button 
                  onClick={() => onTabChange('library')}
                  className="px-4 py-2 bg-brand-50 text-brand-600 rounded-xl text-xs font-bold hover:bg-brand-100 transition-all"
                >
                  Manage Library
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Ali Zubair', book: 'The Great Gatsby', action: 'Issued', time: '10:15 AM' },
                  { name: 'Sarah Smith', book: 'To Kill a Mockingbird', action: 'Returned', time: '08:00 AM' },
                  { name: 'Mike Johnson', book: 'Physics Vol 1', action: 'Overdue', time: 'Yesterday' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{log.name}</p>
                        <p className="text-xs text-slate-500">{log.book}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">{log.time}</p>
                      <span className={cn(
                        "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                        log.action === 'Issued' ? "bg-blue-100 text-blue-700" : 
                        log.action === 'Returned' ? "bg-emerald-100 text-emerald-700" : 
                        "bg-rose-100 text-rose-700"
                      )}>{log.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <LibraryManager />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderContent = () => {
    switch (role) {
      case 'SUPER_ADMIN': return renderSuperAdmin();
      case 'SCHOOL_ADMIN': 
      case 'BRANCH_ADMIN': return renderBranchAdmin();
      case 'TEACHER': return renderTeacher();
      case 'PARENT': return renderParent();
      case 'GATE_KEEPER': return renderGateKeeper();
      case 'LIBRARIAN': return renderLibrarian();
      default: return renderSuperAdmin();
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {activeTab === 'overview' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <p className="text-slate-500 font-medium mt-1">Welcome back to your EduFlow control center.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsNotificationOpen(true)}
            className="relative"
          >
            <Bell size={20} />
            <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </Button>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">Hasan Raza</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{role.replace('_', ' ')}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shadow-inner border border-brand-100">
              HR
            </div>
          </div>
        </div>
      </div>

      {renderContent()}

      <NotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </div>
  );
};
