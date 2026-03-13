import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  School, 
  Users, 
  BookOpen, 
  Calendar, 
  Settings, 
  LogOut, 
  ChevronRight,
  GraduationCap,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Bell,
  Building2,
  UserCircle,
  FileText,
  Layers,
  Library as LibraryIcon
} from 'lucide-react';
import { cn, UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRoleChange: (role: UserRole) => void;
  availableRoles?: UserRole[];
  onLogout: () => void;
}

const menuItems: Record<UserRole, any[]> = {
  SUPER_ADMIN: [
    { icon: LayoutDashboard, label: 'Overview', id: 'overview' },
    { icon: School, label: 'Schools', id: 'schools' },
    { icon: Building2, label: 'Branches', id: 'branches' },
    { icon: Calendar, label: 'Attendance', id: 'attendance' },
    { icon: BookOpen, label: 'Syllabus', id: 'syllabus' },
    { icon: CreditCard, label: 'Subscriptions', id: 'subs' },
    { icon: Settings, label: 'System Settings', id: 'settings' },
  ],
  SCHOOL_ADMIN: [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'overview' },
    { icon: Building2, label: 'My Branches', id: 'branches' },
    { icon: Users, label: 'Staff Management', id: 'staff' },
    { icon: Calendar, label: 'Attendance', id: 'attendance' },
    { icon: BookOpen, label: 'Syllabus', id: 'syllabus' },
    { icon: LibraryIcon, label: 'Library', id: 'library' },
    { icon: GraduationCap, label: 'Academic Years', id: 'academics' },
    { icon: CreditCard, label: 'Finance', id: 'finance' },
  ],
  BRANCH_ADMIN: [
    { icon: LayoutDashboard, label: 'Branch Overview', id: 'overview' },
    { icon: GraduationCap, label: 'Students', id: 'students' },
    { icon: Users, label: 'Families', id: 'families' },
    { icon: Users, label: 'Staff Management', id: 'staff' },
    { icon: CreditCard, label: 'Fees', id: 'fees' },
    { 
      icon: BookOpen, 
      label: 'Classes', 
      id: 'classes',
      subItems: [
        { label: 'Management', id: 'classes' },
        { label: 'Sections', id: 'sections' },
      ]
    },
    { icon: Calendar, label: 'Attendance', id: 'attendance' },
    { icon: BookOpen, label: 'Syllabus', id: 'syllabus' },
    { icon: LibraryIcon, label: 'Library', id: 'library' },
    { icon: FileText, label: 'Diary', id: 'diary' },
  ],
  TEACHER: [
    { icon: LayoutDashboard, label: 'My Classes', id: 'overview' },
    { icon: BookOpen, label: 'Curriculum', id: 'curriculum' },
    { icon: Calendar, label: 'Attendance', id: 'attendance' },
    { icon: FileText, label: 'Daily Diary', id: 'diary' },
    { icon: MessageSquare, label: 'Messages', id: 'messages' },
  ],
  PARENT: [
    { icon: LayoutDashboard, label: 'Child Progress', id: 'overview' },
    { icon: Calendar, label: 'Attendance', id: 'attendance' },
    { icon: FileText, label: 'Daily Diary', id: 'diary' },
    { icon: Bell, label: 'Notices', id: 'notices' },
    { icon: CreditCard, label: 'Fees', id: 'fees' },
    { icon: MessageSquare, label: 'Teacher Chat', id: 'chat' },
  ],
  GATE_KEEPER: [
    { icon: ShieldCheck, label: 'Visitor Pass', id: 'visitors' },
    { icon: LayoutDashboard, label: 'Entry Log', id: 'overview' },
    { icon: Users, label: 'Staff Check-in', id: 'staff' },
  ],
  LIBRARIAN: [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'overview' },
    { icon: LibraryIcon, label: 'Books', id: 'library' },
    { icon: BookOpen, label: 'Issue History', id: 'library' },
    { icon: Users, label: 'Students', id: 'students' },
  ],
};

export const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, onTabChange, onRoleChange, availableRoles, onLogout }) => {
  return (
    <aside className="w-72 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 flex flex-col z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg shadow-brand-200">
          <School size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800">EduFlow</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="mb-4 px-4 py-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</p>
        </div>
        {menuItems[role].map((item, idx) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isSubItemActive = hasSubItems && item.subItems.some((sub: any) => activeTab === sub.id);
          const isMainActive = activeTab === item.id || isSubItemActive;

          return (
            <div key={item.id} className="space-y-1">
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                  isMainActive && !isSubItemActive
                    ? "bg-brand-50 text-brand-600 font-semibold shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} className={cn(isMainActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600")} />
                <span className="flex-1 text-left text-sm">{item.label}</span>
                {hasSubItems && (
                  <ChevronRight size={14} className={cn("transition-transform", isMainActive ? "rotate-90 text-brand-600" : "text-slate-300")} />
                )}
                {isMainActive && !hasSubItems && <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
              </motion.button>

              {hasSubItems && (isMainActive || activeTab === item.id) && (
                <div className="ml-10 space-y-1 relative before:absolute before:left-[-1.5rem] before:top-0 before:bottom-2 before:w-[1px] before:bg-slate-100">
                  {item.subItems.map((sub: any) => (
                    <button
                      key={sub.id}
                      onClick={() => onTabChange(sub.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                        activeTab === sub.id
                          ? "text-brand-600 bg-brand-50/50"
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <span>{sub.label}</span>
                      {activeTab === sub.id && <div className="w-1 h-1 rounded-full bg-brand-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        {role !== 'GATE_KEEPER' && (
          <>
            {availableRoles && availableRoles.length > 1 && (
              <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Switch View</p>
                <div className="flex p-1 bg-white rounded-xl border border-slate-100 relative">
                  {availableRoles.map((r) => (
                    <button
                      key={r}
                      onClick={() => onRoleChange(r)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all relative z-10",
                        role === r ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                  <motion.div 
                    className="absolute top-1 bottom-1 bg-brand-50 rounded-lg border border-brand-100"
                    initial={false}
                    animate={{
                      left: availableRoles.indexOf(role) === 0 ? '4px' : '50%',
                      right: availableRoles.indexOf(role) === 0 ? '50%' : '4px',
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </div>
              </div>
            )}

            {(!availableRoles || availableRoles.length <= 1) && (
              <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Current Role</p>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-100">
                  <ShieldCheck size={14} className="text-brand-500" />
                  <span className="text-xs font-bold text-slate-700">{role.replace('_', ' ')}</span>
                </div>
              </div>
            )}
          </>
        )}

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all group"
        >
          <LogOut size={20} />
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
};
