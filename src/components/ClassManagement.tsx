import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  BookOpen,
  Calendar,
  Layers,
  Building2,
  Clock,
  Loader2
} from 'lucide-react';
import { cn } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { EmptyState } from './ui/EmptyState';
import { useClasses } from '../hooks/use-class';

export const ClassManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: classes, isLoading, error } = useClasses();

  const filteredClasses = classes?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Classes</h2>
          <p className="text-slate-500 font-medium mt-1">Manage academic classes and sections</p>
        </div>
        <div className="flex items-center gap-3">
          <Button leftIcon={<Plus size={18} />}>
            Add Class
          </Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>
          <Button variant="outline" leftIcon={<Filter size={18} />}>
            Filters
          </Button>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
            <p>Loading classes...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-rose-500">
            <p>Error loading classes. Please try again later.</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <EmptyState 
            icon={BookOpen}
            title="No Classes Found"
            description="Get started by creating your first academic class."
            actionLabel="Add Class"
            onAction={() => {}}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sections</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Added By</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created At</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredClasses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{c.name}</p>
                          <p className="text-xs text-slate-500 font-medium">ID: {c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-2">
                        {c.sections && c.sections.length > 0 ? (
                          c.sections.map(section => (
                            <span 
                              key={section.id} 
                              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider"
                            >
                              {section.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No sections</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-600">
                      User {c.added_by}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
