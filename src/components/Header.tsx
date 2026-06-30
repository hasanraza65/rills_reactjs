import React from 'react';
import {
  Bell,
  Search,
  ChevronDown,
  Globe,
  LayoutGrid,
  LogOut,
  Menu,
  Key,
} from 'lucide-react';

import { Branch, User, ROLES, UserRole } from '../types';
import { cn } from '../types';

const TAB_LABELS: Record<string, string> = {
  overview: 'Dashboard',
  branches: 'Branch Management',
  pricing: 'Pricing',
  students: 'Students',
  families: 'Families',
  staff: 'Staff Management',
  'admission-keys': 'Admission Keys',
  fees: 'Fee Collection',
  'fees-students': 'Student Fees',
  'fees-config': 'Fee Configuration',
  invoices: 'Invoices',
  attendance: 'Attendance',
  'student-attendance': 'Student Attendance',
  'staff-attendance': 'Staff Attendance',
  'lesson-plan': 'My Lesson Plan',
  'lesson-plan-teachers': 'Lesson Plan Teachers',
  'add-lesson-plan': 'Add Lesson Plan',
  'lesson-plan-list': 'Lesson Plans',
  syllabus: 'Syllabus',
  diary: 'Class Diary',
  library: 'Library',
  classes: 'Classes',
  sections: 'Sections',
  'class-subjects': 'Class Subjects',
  'what-i-learnt': 'What I Learned',
  subjects: 'Subjects',
  results: 'Results',
  visitors: 'Visitor Log',
  academics: 'Academics',
  finance: 'Finance',
};

interface HeaderProps {
  user: User;
  currentBranch: Branch;
  activeTab: string;
  onBranchChange: (branch: Branch) => void;
  onLogout: () => void;
  onMenuClick: () => void;
  onNotificationClick: () => void;
  onAdmissionKeyClick?: () => void;
  availableRoles?: UserRole[];
  onRoleChange?: (role: UserRole) => void;
}


export const Header: React.FC<HeaderProps> = ({
  user,
  currentBranch,
  activeTab,
  onBranchChange,
  onLogout,
  onMenuClick,
  onNotificationClick,
  onAdmissionKeyClick,
  availableRoles,
  onRoleChange,
}) => {
  const branches = user?.branches || [];
  const pageTitle = TAB_LABELS[activeTab] ?? activeTab.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={cn(
      "h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 transition-all duration-300",
      user.role !== 'GATE_KEEPER' ? "lg:left-72 left-0" : "left-0"
    )}>

      <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
        {user.role !== 'GATE_KEEPER' && (
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl lg:hidden shrink-0"
          >
            <Menu size={24} />
          </button>
        )}

        {/* Page title */}
        <div className="shrink-0">
          <h1 className="text-lg font-extrabold text-slate-900 leading-tight tracking-tight">{pageTitle}</h1>
          <p className="text-[11px] text-slate-400 font-medium leading-tight hidden sm:block">Nawaz Sharif School of Eminence</p>
        </div>

        <div className="h-8 w-px bg-slate-200 shrink-0" />

        <div className="relative w-full max-w-72 group hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search students, staff..."
            className="w-full bg-slate-50 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
          />
        </div>

        <div className="h-8 w-px bg-slate-200 shrink-0 hidden md:block" />

        <div className="flex items-center gap-2">
          <Globe size={16} className="text-slate-400 shrink-0" />
          <select
            value={currentBranch?.id || ''}
            onChange={(e) => {
              const b = branches.find(br => br.id === Number(e.target.value));
              if (b) onBranchChange(b);
            }}
            className="bg-transparent border-none text-sm font-semibold text-slate-700 focus:ring-0 cursor-pointer outline-none max-w-[140px] truncate"
          >
            {branches.length > 0 ? (
              branches.map(b => (
                <option key={b.id} value={b.id}>{b.branch_name}</option>
              ))
            ) : currentBranch ? (
              <option value={currentBranch.id}>{currentBranch.branch_name}</option>
            ) : null}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {user.role !== 'GATE_KEEPER' ? (
          <>
            {onAdmissionKeyClick && (
              <button
                onClick={onAdmissionKeyClick}
                title="Generate Admission Key"
                className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-all"
              >
                <Key size={20} />
              </button>
            )}

            <button
              onClick={onNotificationClick}
              className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 relative transition-all"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>

            <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-all">
              <LayoutGrid size={20} />
            </button>

            <div className="h-8 w-px bg-slate-200" />

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(prev => !prev)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl hover:bg-slate-50 transition-all group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-800 leading-none mb-1">{user.name}</p>
                  <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold text-white inline-block uppercase tracking-wider", ROLES[user.role].color)}>
                    {ROLES[user.role].label}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <ChevronDown
                  size={16}
                  className={cn("text-slate-400 transition-transform duration-200", isProfileOpen && "rotate-180")}
                />
              </button>

              {/* Dropdown panel */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-3 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  {/* Email only — name & role already visible in navbar */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs text-slate-400 truncate">{user.email || user.name}</p>
                  </div>

                  {/* Role switcher — only shown when user has multiple roles */}
                  {availableRoles && availableRoles.length > 1 && onRoleChange && (
                    <div className="px-3 py-3 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Switch Role</p>
                      <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100">
                        {availableRoles.map((r) => (
                          <button
                            key={r}
                            onClick={() => { onRoleChange(r); setIsProfileOpen(false); }}
                            className={cn(
                              "flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                              user.role === r ? "text-brand-600 bg-white shadow-sm border border-brand-100" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            {r.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Logout */}
                  <div className="px-2 py-2">
                    <button
                      onClick={() => { setIsProfileOpen(false); onLogout(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all text-sm font-semibold"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
