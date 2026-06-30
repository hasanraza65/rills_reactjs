import React from 'react';
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
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
  Book as BookIcon,
  Loader2,
  Trash2,
  Eye,
  Edit2,
  MoreHorizontal,
  Layers,
  Building2
} from 'lucide-react';
import { StatCard } from './StatCard';
import { PricingConfig } from './SuperAdmin/PricingConfig';
import { BranchManagement } from './SuperAdmin/BranchManagement';
import { AddStudentForm } from './AddStudentForm';
import { FamilyManagement } from './FamilyManagement';
import { FeeDashboard } from './FeeManagement/FeeDashboard';
import { AttendanceDashboard } from './AttendanceModule/AttendanceDashboard';
import { StudentAttendanceManager } from './AttendanceModule/StudentAttendanceManager';
import { AdminAttendanceReports } from './AttendanceModule/AdminAttendanceReports';
import { StaffAttendanceManager } from './AttendanceModule/StaffAttendanceManager';
import { LessonPlanTeachers } from './LessonPlan/LessonPlanTeachers';
import { AddLessonPlan } from './LessonPlan/AddLessonPlan';
import { LessonPlanList } from './LessonPlan/LessonPlanList';
import { SyllabusManager } from './Academic/SyllabusManager';
import { StudentDiary } from './Academic/StudentDiary';
import { SubjectsManager } from './Academic/SubjectsManager';
import { ClassSyllabusManager } from './Academic/ClassSyllabusManager';
import { DiariesManager } from './Academic/DiariesManager';
import { ResultsManager } from './Academic/ResultsManager';

import { StaffManagement } from './StaffManagement';
import { VisitorManagement } from './VisitorManagement';
import { LibraryManager } from './Library/LibraryManager';
import { ClassManagement } from './ClassManagement';
import { SectionManagement } from './SectionManagement';
import { SubjectModule } from './SubjectModule';
import { AdmissionKeys } from './AdmissionKeys';
import { InvoiceManagement } from './FeeManagement/InvoiceManagement';
import { useStudents, useDeleteStudent } from '../hooks/use-student';
import { StudentDetailsModal } from './StudentDetailsModal';
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
import { UserRole, cn, CLASSES } from '../types';
import { DeleteConfirmationModal } from './ui/DeleteConfirmationModal';
import { useAuthStore } from '../store/use-auth-store';
import { useBranchStore } from '../store/use-branch-store';
import { useDashboardOverview } from '../hooks/use-dashboard';
import type { BranchAdminOverview, SuperAdminOverview, TeacherOverview, ParentOverview } from '../lib/services/dashboard-service';

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
  isNotificationOpen?: boolean;
  onNotificationClose?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  role,
  activeTab,
  onTabChange,
  isNotificationOpen = false,
  onNotificationClose,
}) => {
  const { user } = useAuthStore();
  const { selectedBranchId } = useBranchStore();
  const { data: overviewResp, isLoading: isLoadingOverview } = useDashboardOverview(selectedBranchId);

  const [isLoading, setIsLoading] = React.useState(true);
  const [studentSearchQuery, setStudentSearchQuery] = React.useState('');
  
  // Student CRUD State
  const [viewingStudent, setViewingStudent] = React.useState<any | null>(null);
  const [editingStudent, setEditingStudent] = React.useState<any | null>(null);
  const [deletingStudentId, setDeletingStudentId] = React.useState<number | null>(null);

  const { data: students, isLoading: isLoadingStudents, error: studentsError } = useStudents(selectedBranchId || 1);
  const deleteStudentMutation = useDeleteStudent();

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [activeTab, role]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8">

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

  const renderSuperAdmin = () => {
    const d = overviewResp?.data as SuperAdminOverview | undefined;
    return (
    <div className="space-y-4 sm:space-y-8 overflow-x-hidden">
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
              <StatCard
                title="Active Students"
                value={isLoadingOverview ? '...' : (d?.total_students ?? 0).toLocaleString()}
                icon={Users} color="emerald" delay={0.1}
              />
              <StatCard
                title="Fee Collection"
                value={isLoadingOverview ? '...' : `${d?.fee_collection.percentage ?? 0}%`}
                icon={CreditCard} color="purple" delay={0.2}
              />
              <StatCard
                title="Attendance Today"
                value={isLoadingOverview ? '...' : `${d?.attendance_today.percentage ?? 0}%`}
                icon={TrendingUp} color="indigo" delay={0.3}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-8">
              <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">

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
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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

            </div>
          </motion.div>
        )}

        {activeTab === 'branches' && (
          <motion.div
            key="branches"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <BranchManagement />
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
            <AdminAttendanceReports view="overview" />
          </motion.div>
        )}

        {activeTab === 'student-attendance' && (
          <motion.div
            key="student-attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AdminAttendanceReports view="students" />
          </motion.div>
        )}

        {activeTab === 'staff-attendance' && (
          <motion.div
            key="staff-attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AdminAttendanceReports view="staff" />
          </motion.div>
        )}

        {activeTab === 'lesson-plan-teachers' && (
          <motion.div
            key="lesson-plan-teachers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <LessonPlanTeachers />
          </motion.div>
        )}

        {activeTab === 'add-lesson-plan' && (
          <motion.div
            key="add-lesson-plan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AddLessonPlan />
          </motion.div>
        )}

        {activeTab === 'lesson-plan-list' && (
          <motion.div
            key="lesson-plan-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <LessonPlanList />
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

        {activeTab === 'classes' && (
          <motion.div
            key="classes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ClassManagement />
          </motion.div>
        )}

        {activeTab === 'sections' && (
          <motion.div
            key="sections"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SectionManagement />
          </motion.div>
        )}

        {activeTab === 'class-subjects' && (
          <motion.div
            key="class-subjects"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SubjectModule />
          </motion.div>
        )}

        {activeTab === 'what-i-learnt' && (
          <motion.div
            key="what-i-learnt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <DiariesManager />
          </motion.div>
        )}

        {activeTab === 'subjects' && (
          <motion.div
            key="subjects"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SubjectsManager />
          </motion.div>
        )}

        {activeTab === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ResultsManager />
          </motion.div>
        )}

        {activeTab === 'class-syllabus' && (
          <motion.div
            key="class-syllabus"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ClassSyllabusManager />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  };

  const renderBranchAdmin = () => {
    const bd = overviewResp?.data as BranchAdminOverview | undefined;
    const filteredStudents = students?.filter(s => {
      const query = studentSearchQuery.toLowerCase().trim();
      if (!query) return true;
      
      const strippedQuery = query.replace(/[- ]/g, '');
      
      // Student basic info
      const name = (s.name || '').toLowerCase();
      const adm_no = (s.admission_no || '').toLowerCase();
      
      // Parent Information
      const father_name = (s.parent?.father_name || '').toLowerCase();
      const mother_name = (s.parent?.mother_name || '').toLowerCase();
      const f_cnic = (s.parent?.father_cnic || '').replace(/[- ]/g, '');
      const m_cnic = (s.parent?.mother_cnic || '').replace(/[- ]/g, '');
      const f_phone = (s.parent?.father_contact_no || '').replace(/[- ]/g, '');
      const m_phone = (s.parent?.mother_contact_no || '').replace(/[- ]/g, '');

      return name.includes(query) || 
             adm_no.includes(query) ||
             father_name.includes(query) ||
             mother_name.includes(query) ||
             f_cnic.includes(strippedQuery) ||
             m_cnic.includes(strippedQuery) ||
             f_phone.includes(strippedQuery) ||
             m_phone.includes(strippedQuery);
    }) || [];

    return (
    <div className="space-y-4 sm:space-y-8 overflow-x-hidden">
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
              <StatCard
                title="Total Students"
                value={isLoadingOverview ? '...' : (bd?.total_students ?? 0).toLocaleString()}
                icon={Users} color="blue" delay={0.1}
              />
              <StatCard
                title="Attendance Today"
                value={isLoadingOverview ? '...' : `${bd?.attendance_today.percentage ?? 0}%`}
                icon={Calendar} color="emerald" delay={0.2}
              />
              <StatCard
                title="Fee Collection"
                value={isLoadingOverview ? '...' : `${bd?.fee_collection.percentage ?? 0}%`}
                icon={CreditCard} color="purple" delay={0.3}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Attendance Trends</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
              <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Admissions</h3>
                <div className="space-y-4">
                  {isLoadingOverview ? (
                    [1, 2, 3, 4].map(i => (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-slate-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-200 rounded w-1/2" />
                          <div className="h-2 bg-slate-100 rounded w-1/3" />
                        </div>
                      </div>
                    ))
                  ) : bd?.recent_admissions?.length ? (
                    bd.recent_admissions.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{s.name}</p>
                            <p className="text-xs text-slate-500">{s.admission_no}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                          {s.admission_date ?? '—'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-6">No recent admissions</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'branches' && (
          <motion.div
            key="branches"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <BranchManagement />
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Student Listing</h3>
                <p className="text-slate-500 text-sm font-medium">Manage student records and admissions</p>
              </div>
              <button 
                onClick={() => {
                  setEditingStudent(null);
                  onTabChange('add-student');
                }}
                className="w-full sm:w-auto px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
              >
                <UserPlus size={18} className="sm:w-5 sm:h-5" />
                New Admission
              </button>
            </div>


            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    placeholder="Search students..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none font-medium"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex-1 lg:flex-none flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-transparent focus-within:border-brand-100 transition-all">
                    <BookOpen size={16} className="text-slate-400" />
                    <select className="bg-transparent border-none text-sm font-bold text-slate-600 outline-none w-full lg:w-32">
                      <option>All Classes</option>
                    </select>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all border border-transparent font-bold text-sm">
                    <Filter size={18} />
                    <span className="lg:hidden">Filter</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto lg:block">
                <table className="w-full text-left hidden lg:table">

                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admission No</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class / Section</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoadingStudents ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-10 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                             <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                             <p className="text-sm font-bold uppercase tracking-widest">Loading Students...</p>
                          </div>
                        </td>
                      </tr>
                    ) : studentsError ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-10 text-center text-rose-500 font-bold">
                          Failed to load students. Please try again.
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <EmptyState 
                            icon={GraduationCap}
                            title="No Students Found"
                            description={studentSearchQuery ? `No records match "${studentSearchQuery}"` : "Begin by registering your first student."}
                            actionLabel={studentSearchQuery ? "Clear Search" : "New Admission"}
                            onAction={studentSearchQuery ? () => setStudentSearchQuery('') : () => {
                              setEditingStudent(null);
                              onTabChange('add-student');
                            }}
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                                {s.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{s.name}</p>
                                <p className="text-xs text-slate-400 capitalize">{s.gender}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-sm font-bold text-slate-600 truncate max-w-[150px] leading-tight">{s.admission_no}</p>
                            <p className="text-[10px] text-brand-600 font-bold mt-1">
                              {s.parent?.father_contact_no || s.parent?.mother_contact_no || 'N/A'}
                            </p>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col gap-1">
                              <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase w-fit">
                                {s.class?.name || 'No Class'}
                              </span>
                              {s.section && (
                                <span className="text-[10px] text-slate-400 font-bold px-1 uppercase tracking-tighter">
                                  Section {s.section.name}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setViewingStudent(s)}
                                className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingStudent(s);
                                  onTabChange('add-student');
                                }}
                                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                                title="Edit Student"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => setDeletingStudentId(s.id)}
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                title="Delete Student"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Mobile Card List */}
                <div className="lg:hidden divide-y divide-slate-100">
                  {isLoadingStudents ? (
                    <div className="p-8 text-center">
                       <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-2" />
                       <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Students...</p>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-8">
                      <EmptyState 
                        icon={GraduationCap}
                        title="No Students"
                        description="Try a different search term."
                        onAction={() => setStudentSearchQuery('')}
                      />
                    </div>
                  ) : (
                    filteredStudents.map(s => (
                      <div key={s.id} className="p-5 sm:p-6 space-y-5 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
                              {s.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 leading-none mb-1">{s.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{s.admission_no}</p>
                                <span className="text-slate-200 text-[10px]">•</span>
                                <p className="text-[10px] text-brand-600 font-black tracking-tight">{s.parent?.father_contact_no || s.parent?.mother_contact_no || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded-full uppercase">
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            Active
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase">
                            {s.class?.name || 'No Class'}
                          </span>
                          {s.section && (
                            <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                              Section {s.section.name}
                            </span>
                          )}
                          <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-400 text-[10px] font-bold uppercase">
                            {s.gender}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => setViewingStudent(s)}
                              className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingStudent(s);
                                onTabChange('add-student');
                              }}
                              className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => setDeletingStudentId(s.id)}
                              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <button 
                            onClick={() => setViewingStudent(s)}
                            className="text-[10px] font-bold text-brand-500 uppercase tracking-widest px-3 py-1 hover:bg-brand-50 rounded-lg transition-all"
                          >
                            Full Profile
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

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
              setEditingStudent(null);
              onTabChange('add-student');
            }} />
          </motion.div>
        )}

        {activeTab === 'classes' && (
          <motion.div
            key="classes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ClassManagement />
          </motion.div>
        )}

        {activeTab === 'sections' && (
          <motion.div
            key="sections"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SectionManagement />
          </motion.div>
        )}

        {activeTab === 'fees' && (
          <motion.div
            key="fees"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <FeeDashboard view="overview" />
          </motion.div>
        )}

        {activeTab === 'fees-students' && (
          <motion.div
            key="fees-students"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <FeeDashboard view="students" />
          </motion.div>
        )}

        {activeTab === 'fees-config' && (
          <motion.div
            key="fees-config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <FeeDashboard view="config" />
          </motion.div>
        )}

        {activeTab === 'invoices' && (
          <motion.div
            key="invoices"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <InvoiceManagement />
          </motion.div>
        )}

        {activeTab === 'add-student' && (
          <motion.div
            key="add-student"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AddStudentForm 
              isPage
              onClose={() => {
                setEditingStudent(null);
                onTabChange('students');
              }}
              onSave={() => {
                setEditingStudent(null);
                onTabChange('students');
              }}
              editingStudent={editingStudent}
            />
          </motion.div>
        )}

        {activeTab === 'attendance' && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AdminAttendanceReports view="overview" />
          </motion.div>
        )}

        {activeTab === 'student-attendance' && (
          <motion.div
            key="student-attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AdminAttendanceReports view="students" />
          </motion.div>
        )}

        {activeTab === 'staff-attendance' && (
          <motion.div
            key="staff-attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AdminAttendanceReports view="staff" />
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

        {activeTab === 'admission-keys' && (
          <motion.div
            key="admission-keys"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AdmissionKeys />
          </motion.div>
        )}
      </AnimatePresence>



      {/* Student Details Modal */}
      <StudentDetailsModal
        isOpen={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        student={viewingStudent}
      />

      {/* Student Delete Confirmation */}
      <DeleteConfirmationModal
        isOpen={!!deletingStudentId}
        onClose={() => setDeletingStudentId(null)}
        onConfirm={async () => {
          if (deletingStudentId) {
            await deleteStudentMutation.mutateAsync(deletingStudentId);
            setDeletingStudentId(null);
          }
        }}
        title="Delete Student Record"
        message="Are you sure you want to delete this student? This action cannot be undone and will remove all associated academic records."
        isLoading={deleteStudentMutation.isPending}
      />
    </div>
    );
  };

  const renderTeacher = () => {
    const td = overviewResp?.data as TeacherOverview | undefined;
    return (
    <div className="space-y-4 sm:space-y-8 overflow-x-hidden">
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
              <StatCard
                title="My Subjects"
                value={isLoadingOverview ? '...' : String(td?.total_subjects ?? 0)}
                icon={BookOpen} color="blue" delay={0.1}
              />
              <StatCard
                title="Attendance Today"
                value={isLoadingOverview ? '...' : `${td?.attendance_today.percentage ?? 0}%`}
                icon={Calendar} color="emerald" delay={0.2}
              />
              <StatCard
                title="Students Present"
                value={isLoadingOverview ? '...' : String(td?.attendance_today.present ?? 0)}
                icon={Users} color="amber" delay={0.3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
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

              <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Class Attendance</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
  };

  const renderParent = () => {
    const pd = overviewResp?.data as ParentOverview | undefined;
    return (
    <div className="space-y-4 sm:space-y-8 overflow-x-hidden">
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
                <h2 className="text-3xl font-extrabold mb-2">Welcome back, {user?.name}!</h2>
                <p className="text-brand-100 mb-6 max-w-md">
                  {pd?.total_children
                    ? `You have ${pd.total_children} child${pd.total_children > 1 ? 'ren' : ''} enrolled.`
                    : 'Track your children\'s progress, attendance and fees here.'}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => onTabChange('fees')}
                    className="bg-white text-brand-600 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-brand-50 transition-all"
                  >
                    Pay Fees
                  </button>
                  <button
                    onClick={() => onTabChange('attendance')}
                    className="bg-brand-500/30 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold text-sm border border-white/20 hover:bg-brand-500/40 transition-all"
                  >
                    View Attendance
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="absolute bottom-0 right-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl" />
            </div>

            {/* Children overview cards */}
            {(isLoadingOverview || (pd?.children?.length ?? 0) > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isLoadingOverview
                  ? [1, 2].map(i => (
                      <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse space-y-4">
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                        <div className="h-8 bg-slate-100 rounded-xl" />
                      </div>
                    ))
                  : pd?.children?.map(child => {
                      const statusMap: Record<string, { label: string; color: string }> = {
                        P: { label: 'Present', color: 'text-emerald-600 bg-emerald-50' },
                        A: { label: 'Absent', color: 'text-rose-600 bg-rose-50' },
                        L: { label: 'Late', color: 'text-amber-600 bg-amber-50' },
                        H: { label: 'Holiday', color: 'text-slate-600 bg-slate-100' },
                      };
                      const att = child.attendance_today ? statusMap[child.attendance_today] : null;
                      return (
                        <div key={child.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-extrabold text-slate-800">{child.name}</p>
                              <p className="text-xs text-slate-400 font-medium">{child.admission_no}</p>
                            </div>
                            {att ? (
                              <span className={cn('text-[10px] font-bold uppercase px-3 py-1 rounded-full', att.color)}>
                                {att.label}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full text-slate-400 bg-slate-50">
                                Not Marked
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-2xl bg-emerald-50">
                              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Paid</p>
                              <p className="text-base font-extrabold text-emerald-700">
                                Rs. {child.fee_summary.total_paid.toLocaleString()}
                              </p>
                            </div>
                            <div className="p-3 rounded-2xl bg-rose-50">
                              <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-0.5">Pending</p>
                              <p className="text-base font-extrabold text-rose-700">
                                Rs. {child.fee_summary.pending.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
              </div>
            )}

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
  };

  const renderGateKeeper = () => (
    <div className="space-y-4 sm:space-y-8 overflow-x-hidden">

      {/* 
      <div className="flex items-center gap-4 mb-8 bg-white p-2 rounded-3xl border border-slate-100 w-fit shadow-sm">
        <button 
          onClick={() => onTabChange('visitors')}
          className={cn(
            "px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0",

            activeTab === 'visitors' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <ShieldCheck size={18} />
          Visitor Pass
        </button>
        <button 
          onClick={() => onTabChange('overview')}
          className={cn(
            "px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0",

            activeTab === 'overview' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <LayoutDashboard size={18} />
          Overview
        </button>
        <button 
          onClick={() => onTabChange('staff')}
          className={cn(
            "px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0",

            activeTab === 'staff' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <Users size={18} />
          Staff Check-in
        </button>
      </div>
      */}
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

        {activeTab !== 'overview' && activeTab !== 'visitors' && activeTab !== 'staff' && (
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
            "px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0",

            activeTab === 'overview' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <LayoutDashboard size={18} />
          Overview
        </button>
        <button 
          onClick={() => onTabChange('library')}
          className={cn(
            "px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0",

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
    <div className={cn(
      "p-4 sm:p-8 mx-auto overflow-x-hidden",
      role !== 'GATE_KEEPER' ? "max-w-[1600px]" : "max-w-none"
    )}>

      {renderContent()}

      <NotificationPanel isOpen={isNotificationOpen} onClose={() => onNotificationClose?.()} />
    </div>
  );
};
