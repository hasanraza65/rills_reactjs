import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Plus, 
  ChevronRight, 
  User,
  Shield,
  ArrowRight
} from 'lucide-react';
import { cn, PARENTS, STUDENTS, CLASSES } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { EmptyState } from './ui/EmptyState';

interface FamilyManagementProps {
  onAddStudent: (parentId: string) => void;
}

export const FamilyManagement: React.FC<FamilyManagementProps> = ({ onAddStudent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);

  const filteredFamilies = useMemo(() => {
    if (!searchQuery) return PARENTS;
    return PARENTS.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.cnic.includes(searchQuery)
    );
  }, [searchQuery]);

  const selectedFamily = useMemo(() => {
    return PARENTS.find(p => p.id === selectedFamilyId);
  }, [selectedFamilyId]);

  const familyChildren = useMemo(() => {
    if (!selectedFamilyId) return [];
    return STUDENTS.filter(s => s.parentId === selectedFamilyId);
  }, [selectedFamilyId]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Family Directory</h2>
          <p className="text-slate-500 font-bold mt-1">Search and manage families by CNIC or Name</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search CNIC (e.g. 42101...)"
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-slate-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Family List */}
        <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredFamilies.map(family => (
            <motion.button
              key={family.id}
              onClick={() => setSelectedFamilyId(family.id)}
              className={cn(
                "w-full p-6 rounded-[2.5rem] border-2 text-left transition-all group",
                selectedFamilyId === family.id 
                  ? "border-brand-500 bg-white shadow-xl shadow-brand-100" 
                  : "border-transparent bg-white hover:border-slate-100 shadow-sm"
              )}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                  selectedFamilyId === family.id ? "bg-brand-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500"
                )}>
                  <Users size={28} />
                </div>
                <div>
                  <p className="text-base font-black text-slate-800">{family.name}</p>
                  <p className="text-xs text-slate-400 font-bold tracking-wider">{family.cnic}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="bg-slate-50 px-2 py-1 rounded-lg">{family.childrenIds.length} Children</span>
                <ChevronRight size={16} className={cn(
                  "transition-all",
                  selectedFamilyId === family.id ? "translate-x-1 text-brand-500" : "text-slate-300"
                )} />
              </div>
            </motion.button>
          ))}
          {filteredFamilies.length === 0 && (
            <EmptyState 
              icon={Users}
              title="No families found"
              description="Try searching with a different name or CNIC."
            />
          )}
        </div>

        {/* Family Detail View */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedFamily ? (
              <motion.div
                key={selectedFamily.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden"
              >
                <div className="p-10 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-3xl bg-brand-500 flex items-center justify-center text-white shadow-2xl shadow-brand-100">
                        <Users size={48} />
                      </div>
                      <div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{selectedFamily.name}</h3>
                        <p className="text-slate-500 font-bold flex items-center gap-2 text-base">
                          <Shield size={20} className="text-brand-500" />
                          Family ID: FAM-{selectedFamily.id.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => onAddStudent(selectedFamily.id)}
                      icon={Plus}
                      size="lg"
                      className="shadow-xl shadow-brand-100"
                    >
                      Add Child
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-5 bg-white border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CNIC</p>
                      <p className="text-base font-black text-slate-800">{selectedFamily.cnic}</p>
                    </Card>
                    <Card className="p-5 bg-white border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone</p>
                      <p className="text-base font-black text-slate-800">{selectedFamily.phone}</p>
                    </Card>
                    <Card className="p-5 bg-white border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email</p>
                      <p className="text-base font-black text-slate-800 truncate">{selectedFamily.email}</p>
                    </Card>
                  </div>
                </div>

                <div className="p-10">
                  <h4 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    Registered Children
                    <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-500 text-sm font-black">{familyChildren.length}</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {familyChildren.map(child => (
                      <Card 
                        key={child.id} 
                        hover
                        className="p-8 border-slate-100 group cursor-pointer"
                      >
                        <div className="flex items-center gap-5 mb-6">
                          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-600 transition-all shadow-sm">
                            <User size={32} />
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-800">{child.name}</p>
                            <p className="text-sm text-slate-500 font-bold">Roll: {child.rollNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                            {CLASSES.find(c => c.id === child.classId)?.name}
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-sm">
                            <ArrowRight size={20} />
                          </div>
                        </div>
                      </Card>
                    ))}
                    {familyChildren.length === 0 && (
                      <div className="col-span-2">
                        <EmptyState 
                          icon={User}
                          title="No children registered"
                          description="Click the 'Add Child' button to register a student for this family."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-20 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm">
                <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-8 shadow-sm">
                  <Users size={48} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3">Select a Family</h3>
                <p className="text-slate-500 text-base font-bold max-w-xs mx-auto">Search and select a family from the directory to view detailed information and manage children.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
