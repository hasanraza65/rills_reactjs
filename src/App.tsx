import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Auth/Login';
import { Branch, BRANCHES } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from './store/use-auth-store';
import { UserRole } from './types/models/user';

export default function App() {
  const { user, isAuthenticated, logout, setAuth } = useAuthStore();
  const [currentBranch, setCurrentBranch] = useState<Branch>(BRANCHES[0]);
  const [activeTab, setActiveTab] = useState<string>('overview');

  React.useEffect(() => {
    if (isAuthenticated && user && activeTab === 'overview') {
      if (user.role === 'GATE_KEEPER') {
        setActiveTab('visitors');
      }
    }
  }, [isAuthenticated, user]);

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
    setCurrentBranch(newBranch);
  };

  if (!isAuthenticated || !user) {
    return <Login onLogin={handleLogin} />;
  }

  const role: any = user.role;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        role={role} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRoleChange={handleRoleChange} 
        availableRoles={user.roles as any}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 ml-72 pt-20">
        <Header 
          user={user as any} 
          currentBranch={currentBranch} 
          onBranchChange={handleBranchChange} 
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
