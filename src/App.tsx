import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Auth/Login';
import { User, Branch, BRANCHES, UserRole } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentBranch, setCurrentBranch] = useState<Branch>(BRANCHES[0]);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const handleLogin = (userData: User) => {
    setUser(userData);
    setActiveTab('overview');
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleRoleChange = (newRole: UserRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
      setActiveTab('overview');
    }
  };

  const handleBranchChange = (newBranch: Branch) => {
    setCurrentBranch(newBranch);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const role = user.role;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        role={role} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRoleChange={handleRoleChange} 
        availableRoles={user.roles}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 ml-72 pt-20">
        <Header 
          user={user} 
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
