import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, 
  Users, 
  Truck, 
  HelpCircle, 
  Clock, 
  LogOut, 
  User, 
  CreditCard, 
  MessageSquare,
  CheckCircle2,
  XCircle,
  Search,
  X
} from 'lucide-react';
import { Visitor, VisitorType, cn } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { EmptyState } from './ui/EmptyState';

const VISITOR_TYPES: { type: VisitorType; label: string; icon: any; color: string }[] = [
  { type: 'NEW_ADMISSION', label: 'New Admission', icon: UserPlus, color: 'bg-blue-500' },
  { type: 'MEETING', label: 'Meeting', icon: Users, color: 'bg-emerald-500' },
  { type: 'DELIVERY', label: 'Delivery', icon: Truck, color: 'bg-amber-500' },
  { type: 'OTHER', label: 'Other', icon: HelpCircle, color: 'bg-slate-500' },
];

export const VisitorManagement: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([
    {
      id: 'v1',
      name: 'Ahmed Khan',
      type: 'MEETING',
      purpose: 'Meeting with Principal',
      entryTime: '09:15 AM',
      date: new Date().toISOString().split('T')[0],
    },
    {
      id: 'v2',
      name: 'Zia Logistics',
      type: 'DELIVERY',
      purpose: 'Courier Delivery',
      entryTime: '10:30 AM',
      exitTime: '10:45 AM',
      date: new Date().toISOString().split('T')[0],
    }
  ]);

  const [selectedType, setSelectedType] = useState<VisitorType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    purpose: ''
  });

  const handleEntry = () => {
    if (!formData.name || !selectedType) return;

    const newVisitor: Visitor = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      cnic: formData.cnic,
      type: selectedType,
      purpose: formData.purpose || selectedType.replace('_', ' '),
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
    };

    setVisitors([newVisitor, ...visitors]);
    setSelectedType(null);
    setFormData({ name: '', cnic: '', purpose: '' });
  };

  const handleExit = (id: string) => {
    setVisitors(visitors.map(v => 
      v.id === id 
        ? { ...v, exitTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
        : v
    ));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Header */}
      <Card className="p-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-white border-slate-100 shadow-premium">
        <div>
          <h1 className="text-5xl font-black text-slate-800 tracking-tighter">Gate Entry</h1>
          <p className="text-slate-500 font-black mt-2 uppercase tracking-[0.3em] text-xs">Visitor Management System</p>
        </div>
        <div className="text-center md:text-right">
          <p className="text-5xl font-black text-brand-600 tracking-tighter">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-slate-400 font-black text-sm uppercase tracking-widest mt-1">{new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-10">
        {/* New Entry Form */}
        <section className="space-y-6">
          <Card className="p-10">
            <h2 className="text-3xl font-black text-slate-800 mb-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center shadow-sm">
                <UserPlus size={28} />
              </div>
              New Visitor
            </h2>

            {!selectedType ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {VISITOR_TYPES.map((item) => (
                  <motion.button
                    key={item.type}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(item.type)}
                    className="flex flex-col items-center justify-center gap-6 p-10 rounded-[2.5rem] bg-slate-50 border-2 border-transparent hover:border-brand-500 hover:bg-white transition-all group shadow-sm hover:shadow-premium"
                  >
                    <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-xl", item.color)}>
                      <item.icon size={40} />
                    </div>
                    <span className="text-xl font-black text-slate-700">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-5 p-6 bg-brand-50 rounded-[2rem] border-2 border-brand-100 shadow-sm">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg", VISITOR_TYPES.find(t => t.type === selectedType)?.color)}>
                    {React.createElement(VISITOR_TYPES.find(t => t.type === selectedType)?.icon, { size: 32 })}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em]">Selected Type</p>
                    <p className="text-2xl font-black text-slate-800">{VISITOR_TYPES.find(t => t.type === selectedType)?.label}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedType(null)}
                    className="p-3 bg-white rounded-2xl text-slate-400 hover:text-rose-500 transition-all shadow-sm"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={28} />
                    <input 
                      type="text"
                      placeholder="Visitor Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-16 pr-8 py-7 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-brand-500 focus:bg-white text-2xl font-black transition-all outline-none shadow-sm"
                    />
                  </div>

                  <div className="relative">
                    <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={28} />
                    <input 
                      type="text"
                      placeholder="CNIC (Optional)"
                      value={formData.cnic}
                      onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                      className="w-full pl-16 pr-8 py-7 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-brand-500 focus:bg-white text-2xl font-black transition-all outline-none shadow-sm"
                    />
                  </div>

                  <div className="relative">
                    <MessageSquare className="absolute left-6 top-8 text-slate-400" size={28} />
                    <textarea 
                      placeholder="Purpose of Visit"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full pl-16 pr-8 py-7 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-brand-500 focus:bg-white text-2xl font-black transition-all outline-none min-h-[160px] shadow-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleEntry}
                  disabled={!formData.name}
                  size="lg"
                  className="w-full py-10 text-3xl font-black shadow-2xl shadow-brand-100 rounded-[2rem]"
                >
                  Record Entry
                </Button>
              </motion.div>
            )}
          </Card>
        </section>

        {/* Today's List - Commented Out
        <section className="space-y-6">
          <Card className="p-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-sm">
                  <Clock size={28} />
                </div>
                Today's Visitors
              </h2>
              <span className="px-5 py-2 bg-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] shadow-sm">
                {visitors.length} Total
              </span>
            </div>

            <div className="space-y-6 overflow-y-auto max-h-[700px] pr-4 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {visitors.map((visitor) => (
                  <motion.div
                    key={visitor.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "p-8 rounded-[2.5rem] border-2 transition-all group",
                      visitor.exitTime 
                        ? "bg-slate-50 border-transparent opacity-60" 
                        : "bg-white border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-premium"
                    )}
                  >
                    <div className="flex items-start gap-6">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg",
                        VISITOR_TYPES.find(t => t.type === visitor.type)?.color
                      )}>
                        {React.createElement(VISITOR_TYPES.find(t => t.type === visitor.type)?.icon, { size: 32 })}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-2xl font-black text-slate-800 truncate tracking-tight">{visitor.name}</h3>
                          <span className="text-sm font-black text-brand-600 bg-brand-50 px-4 py-1.5 rounded-xl shadow-sm">
                            {visitor.entryTime}
                          </span>
                        </div>
                        <p className="text-slate-500 font-bold text-base mb-6 leading-relaxed">{visitor.purpose}</p>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            {visitor.exitTime ? (
                              <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-[0.2em]">
                                <LogOut size={16} />
                                Left at {visitor.exitTime}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-[0.2em]">
                                <CheckCircle2 size={16} />
                                Inside Campus
                              </div>
                            )}
                          </div>

                          {!visitor.exitTime && (
                            <Button
                              variant="danger"
                              onClick={() => handleExit(visitor.id)}
                              className="px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-rose-100"
                            >
                              EXIT
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {visitors.length === 0 && (
                <div className="py-20">
                  <EmptyState 
                    icon={Search}
                    title="No visitors recorded today"
                    description="All visitor entries will appear here."
                  />
                </div>
              )}
            </div>
          </Card>
        </section>
        */}
      </div>
    </div>
  );
};
