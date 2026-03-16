import React from 'react';
import { 
  Bell, 
  Search, 
  ChevronDown, 
  Globe,
  LayoutGrid,
  LogOut,
  Menu
} from 'lucide-react';

import { BRANCHES, Branch, User, ROLES } from '../types';
import { cn } from '../types';

interface HeaderProps {
  user: User;
  currentBranch: Branch;
  onBranchChange: (branch: Branch) => void;
  onLogout: () => void;
  onMenuClick: () => void;
}


export const Header: React.FC<HeaderProps> = ({ user, currentBranch, onBranchChange, onLogout, onMenuClick }) => {

  return (
    <header className={cn(
      "h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 transition-all duration-300",
      user.role !== 'GATE_KEEPER' ? "lg:left-72 left-0" : "left-0"
    )}>

      <div className="flex items-center gap-3 sm:gap-6 flex-1">
        {user.role !== 'GATE_KEEPER' && (
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl lg:hidden"
          >
            <Menu size={24} />
          </button>
        )}

        <div className="relative w-full max-w-96 group hidden sm:block">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search for students, staff, or reports..."
            className="w-full bg-slate-50 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
          />
        </div>

        <div className="h-8 w-px bg-slate-200 mx-2" />

        <div className="flex items-center gap-2">
          <Globe size={18} className="text-slate-400" />
          <select 
            value={currentBranch.id}
            onChange={(e) => {
              const b = BRANCHES.find(br => br.id === e.target.value);
              if (b) onBranchChange(b);
            }}
            className="bg-transparent border-none text-sm font-semibold text-slate-700 focus:ring-0 cursor-pointer outline-none"
          >
            {BRANCHES.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user.role !== 'GATE_KEEPER' ? (
          <>
            <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 relative transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            
            <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-all">
              <LayoutGrid size={20} />
            </button>

            <div className="h-8 w-px bg-slate-200 mx-2" />

            <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl hover:bg-slate-50 transition-all group">
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
              <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600 transition-all" />
            </button>
          </>
        ) : (
          /* Gate Keeper Header - Compact with Logout */
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
