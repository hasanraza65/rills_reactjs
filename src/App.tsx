import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Auth/Login';
import { cn } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from './store/use-auth-store';
import { UserRole } from './types/models/user';
import { useBranchStore } from './store/use-branch-store';
import { useBranches } from './hooks/use-branch';
import { Branch } from './types/models/branch';

export default function App() {
  const { user, isAuthenticated, logout, setAuth } = useAuthStore();
  const { selectedBranchId, setSelectedBranchId } = useBranchStore();
  const { data: branches = [] } = useBranches();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Derived currentBranch object
  const currentBranch = React.useMemo(() => {
    if (!branches || branches.length === 0) return null;
    const found = branches.find((b: Branch) => b.id === selectedBranchId);
    return found || branches[0];
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
          branches={branches}
          currentBranch={currentBranch}
          onBranchChange={handleBranchChange}
          onLogout={handleLogout}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
            />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
