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

export default function App() {
  const { user, isAuthenticated, logout, setAuth } = useAuthStore();
  const branches = user?.branches || [];
  const { selectedBranchId, setSelectedBranchId } = useBranchStore();
  
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAddKeyModalOpen, setIsAddKeyModalOpen] = useState(false);
  const createKeyMutation = useCreateAdmissionKey();

  // Derived currentBranch object
  const currentBranch = React.useMemo(() => {
    if (!branches || branches.length === 0) return BRANCHES[0];
    const found = branches.find((b: Branch) => b.id === selectedBranchId);
    return found || branches[0] || BRANCHES[0];
  }, [branches, selectedBranchId]);

  React.useEffect(() => {
    if (isAuthenticated && user && activeTab === 'overview') {
      if (user.role === 'GATE_KEEPER') {
        setActiveTab('visitors');
      }
    }
  }, [isAuthenticated, user]);

  React.useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId, setSelectedBranchId]);

  const handleLogin = (userData: any) => {
    setActiveTab(userData.role === 'GATE_KEEPER' ? 'visitors' : 'overview');
  };

  const handleLogout = () => {
    logout();
  };

  const handleRoleChange = (newRole: UserRole) => {
    if (user) {
      setAuth({ ...user, role: newRole }, user.token || '');
      setActiveTab(newRole === 'GATE_KEEPER' ? 'visitors' : 'overview');
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

      
      <main className={cn("flex-1 pt-20 transition-all duration-300 overflow-x-hidden", role !== 'GATE_KEEPER' && "lg:ml-72")}>
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
