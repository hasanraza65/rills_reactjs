import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Auth/Login';
import { AddAdmissionKeyModal } from './components/AddAdmissionKeyModal';
import { Branch, BRANCHES, cn } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from './store/use-auth-store';
import { UserRole } from './types/models/user';
import { useBranchStore } from './store/use-branch-store';
import { useCreateAdmissionKey } from './hooks/use-admission-keys';
import { useSyncCurrentUser } from './hooks/use-auth';

/**
 * The tab a role lands on after login. Only SUPER_ADMIN has an overview page,
 * so every other role needs an explicit entry here.
 */
const DEFAULT_TAB: Partial<Record<UserRole, string>> = {
  GATE_KEEPER: 'visitors',
  BRANCH_ADMIN: 'students',
  SCHOOL_ADMIN: 'staff',
};

const getDefaultTab = (role?: UserRole) => (role && DEFAULT_TAB[role]) || 'overview';

export default function App() {
  const { user, isAuthenticated, logout, setAuth } = useAuthStore();
  // Refresh the current user (incl. permissions) on load so admin changes apply.
  useSyncCurrentUser();
  const branches = user?.branches || [];
  const { selectedBranchId, setSelectedBranchId } = useBranchStore();

  const [activeTab, setActiveTab] = useState<string>(() => getDefaultTab(user?.role));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAddKeyModalOpen, setIsAddKeyModalOpen] = useState(false);
  const createKeyMutation = useCreateAdmissionKey();

  // Lives here, above the `key={role-activeTab}` remount boundary below — Dashboard's
  // Edit-student handlers call setEditingStudent(s) and onTabChange('add-student') in the
  // same click, and the tab change remounts <Dashboard> before that state would ever be
  // read. Keeping it in App means it survives the remount instead of resetting to null,
  // which was silently emptying the edit form (see Dashboard.tsx's AddStudentForm usage).
  const [editingStudent, setEditingStudent] = useState<any | null>(null);

  // Derived currentBranch object
  const currentBranch = React.useMemo(() => {
    if (!branches || branches.length === 0) return BRANCHES[0];
    const found = branches.find((b: Branch) => b.id === selectedBranchId);
    return found || branches[0] || BRANCHES[0];
  }, [branches, selectedBranchId]);

  // A reload resets activeTab to its initial value, and logging in as a
  // different role can otherwise leave activeTab holding whatever tab the
  // previous session was on (e.g. a Super Admin's 'branches' tab leaking into
  // a freshly-logged-in Branch Admin session) — activeTab lives only in this
  // component's memory and isn't cleared on logout. Track the role we last
  // rendered for and send the user to their own landing tab whenever it changes.
  const lastRoleRef = React.useRef<UserRole | undefined>(undefined);
  React.useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (activeTab === 'overview' || lastRoleRef.current !== user.role) {
      setActiveTab(getDefaultTab(user.role));
    }
    lastRoleRef.current = user.role;
  }, [isAuthenticated, user]);

  // Every time a different user logs in, reset to their first branch.
  // This prevents the previous user's selected branch from leaking into the new session.
  React.useEffect(() => {
    if (branches && branches.length > 0) {
      setSelectedBranchId(branches[0].id);
    }
  }, [user?.id]);

  const handleLogin = (userData: any) => {
    setActiveTab(getDefaultTab(userData.role));
  };

  const handleLogout = () => {
    logout();
  };

  const handleRoleChange = (newRole: UserRole) => {
    if (user) {
      setAuth({ ...user, role: newRole }, user.token || '');
      setActiveTab(getDefaultTab(newRole));
    }
  };

  const handleBranchChange = (newBranch: Branch) => {
    setSelectedBranchId(newBranch.id);
  };

  if (!isAuthenticated || !user) {
    return <Login onLogin={handleLogin} />;
  }

  const role: any = user.role;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {role !== 'GATE_KEEPER' && (
        <Sidebar 
          role={role} 
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          onRoleChange={handleRoleChange} 
          availableRoles={user.roles as any}
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      
      <main className={cn("flex-1 pt-20 transition-all duration-300 overflow-x-hidden print:pt-0 print:ml-0 print:overflow-visible", role !== 'GATE_KEEPER' && "lg:ml-72")}>
        <Header
          user={user as any}
          currentBranch={currentBranch}
          activeTab={activeTab}
          onBranchChange={handleBranchChange}
          onLogout={handleLogout}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onNotificationClick={() => setIsNotificationOpen(true)}
          onAdmissionKeyClick={role === 'BRANCH_ADMIN' ? () => setIsAddKeyModalOpen(true) : undefined}
          availableRoles={user.roles as any}
          onRoleChange={handleRoleChange}
        />

        
        <AnimatePresence mode="wait">
          <motion.div
            key={`${role}-${activeTab}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard
              role={role}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isNotificationOpen={isNotificationOpen}
              onNotificationClose={() => setIsNotificationOpen(false)}
              editingStudent={editingStudent}
              setEditingStudent={setEditingStudent}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      <AddAdmissionKeyModal
        isOpen={isAddKeyModalOpen}
        onClose={() => setIsAddKeyModalOpen(false)}
        branchId={selectedBranchId || 1}
        isLoading={createKeyMutation.isPending}
        onConfirm={async (payload) => {
          try {
            await createKeyMutation.mutateAsync(payload);
            setIsAddKeyModalOpen(false);
          } catch (err) {
            console.error('Failed to create key:', err);
          }
        }}
      />
    </div>
  );
}
