import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Settings, 
  BookOpen, 
  DollarSign, 
  Clock,
  AlertCircle,
  CheckCircle2,
  Copy,
  ChevronRight
} from 'lucide-react';
import { cn, CLASSES, FeeHead, FeeFrequency } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';

const FREQUENCIES: { value: FeeFrequency; label: string }[] = [
  { value: 'ONE_TIME', label: 'One-time' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUAL', label: 'Annual' },
];

export const FeeConfiguration: React.FC = () => {
  const [selectedClassId, setSelectedClassId] = useState(CLASSES[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Manage fee heads per class
  const [classConfigs, setClassConfigs] = useState<Record<string, FeeHead[]>>({
    'c1': [
      { id: '1', name: 'Tuition Fee', amount: 8000, frequency: 'MONTHLY', isEnabled: true },
      { id: '2', name: 'Admission Fee', amount: 15000, frequency: 'ONE_TIME', isEnabled: true },
      { id: '3', name: 'Exam Fee', amount: 2500, frequency: 'QUARTERLY', isEnabled: true },
      { id: '4', name: 'Annual Fund', amount: 5000, frequency: 'ANNUAL', isEnabled: true },
    ],
    'c2': [
      { id: '5', name: 'Tuition Fee', amount: 9000, frequency: 'MONTHLY', isEnabled: true },
      { id: '6', name: 'Admission Fee', amount: 15000, frequency: 'ONE_TIME', isEnabled: true },
    ],
    'c3': [
      { id: '7', name: 'Tuition Fee', amount: 10000, frequency: 'MONTHLY', isEnabled: true },
    ]
  });

  const currentFeeHeads = classConfigs[selectedClassId] || [];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const addFeeHead = () => {
    const newHead: FeeHead = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      amount: 0,
      frequency: 'MONTHLY',
      isEnabled: true,
    };
    
    setClassConfigs(prev => ({
      ...prev,
      [selectedClassId]: [...(prev[selectedClassId] || []), newHead]
    }));
  };

  const removeFeeHead = (id: string) => {
    setClassConfigs(prev => ({
      ...prev,
      [selectedClassId]: (prev[selectedClassId] || []).filter(h => h.id !== id)
    }));
  };

  const updateFeeHead = (id: string, updates: Partial<FeeHead>) => {
    setClassConfigs(prev => ({
      ...prev,
      [selectedClassId]: (prev[selectedClassId] || []).map(h => h.id === id ? { ...h, ...updates } : h)
    }));
  };

  const calculateAnnualTotal = () => {
    return currentFeeHeads.reduce((total, head) => {
      if (!head.isEnabled) return total;
      switch (head.frequency) {
        case 'MONTHLY': return total + (head.amount * 12);
        case 'QUARTERLY': return total + (head.amount * 4);
        case 'ANNUAL': return total + head.amount;
        case 'ONE_TIME': return total + head.amount;
        default: return total;
      }
    }, 0);
  };

  const copyFromClass = (fromClassId: string) => {
    if (fromClassId === selectedClassId) return;
    const sourceHeads = classConfigs[fromClassId] || [];
    const newHeads = sourceHeads.map(h => ({
      ...h,
      id: Math.random().toString(36).substr(2, 9)
    }));
    
    setClassConfigs(prev => ({
      ...prev,
      [selectedClassId]: newHeads
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Global Fee Configuration</h3>
          <p className="text-slate-500 font-bold mt-1">Define standard fee structures for each class</p>
        </div>
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-wider shadow-sm border border-emerald-100"
              >
                <CheckCircle2 size={14} />
                Configuration Saved!
              </motion.div>
            )}
          </AnimatePresence>
          <Button 
            onClick={handleSave}
            isLoading={isSaving}
            icon={Save}
            size="lg"
            className="shadow-xl shadow-brand-100"
          >
            Save Configuration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Select Class</h4>
          <div className="space-y-3">
            {CLASSES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClassId(c.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-5 rounded-[2rem] text-left transition-all border-2",
                  selectedClassId === c.id 
                    ? "bg-brand-500 border-brand-500 text-white shadow-xl shadow-brand-100" 
                    : "bg-white border-transparent text-slate-600 hover:border-slate-100 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                  selectedClassId === c.id ? "bg-white/20" : "bg-slate-50 text-slate-400"
                )}>
                  <BookOpen size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-base font-black">{c.name}</p>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    selectedClassId === c.id ? "text-brand-100" : "text-slate-400"
                  )}>Section {c.section}</p>
                </div>
                {selectedClassId === c.id && <ChevronRight size={20} className="text-white/50" />}
              </button>
            ))}
          </div>

          <Card className="p-6 bg-slate-50/50 border-dashed border-2 border-slate-200">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h5>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-500 mb-2">Copy configuration from:</p>
              <div className="grid grid-cols-1 gap-2">
                {CLASSES.filter(c => c.id !== selectedClassId).map(c => (
                  <button
                    key={c.id}
                    onClick={() => copyFromClass(c.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-100 text-[10px] font-black text-slate-600 hover:border-brand-200 hover:text-brand-600 transition-all shadow-sm"
                  >
                    <Copy size={12} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card className="p-10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-sm">
                  <Settings size={28} />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">Fee Heads for {CLASSES.find(c => c.id === selectedClassId)?.name}</h4>
                  <p className="text-sm text-slate-500 font-bold mt-1">Add or modify fee components for this class</p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={addFeeHead}
                icon={Plus}
                className="bg-slate-50 border-transparent"
              >
                Add Fee Head
              </Button>
            </div>

            {currentFeeHeads.length === 0 ? (
              <EmptyState 
                icon={DollarSign}
                title="No Fee Heads Defined"
                description={`No fees have been configured for ${CLASSES.find(c => c.id === selectedClassId)?.name} yet.`}
                actionLabel="Add First Fee Head"
                onAction={addFeeHead}
              />
            ) : (
              <div className="space-y-4">
                {currentFeeHeads.map((head, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={head.id} 
                    className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border-2 border-transparent hover:border-slate-100 transition-all group"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="saas-label mb-2 ml-1">Fee Name</label>
                        <input 
                          value={head.name}
                          onChange={(e) => updateFeeHead(head.id, { name: e.target.value })}
                          placeholder="e.g. Tuition Fee"
                          className="saas-input bg-white"
                        />
                      </div>
                      <div>
                        <label className="saas-label mb-2 ml-1">Amount ($)</label>
                        <input 
                          type="number"
                          value={head.amount}
                          onChange={(e) => updateFeeHead(head.id, { amount: Number(e.target.value) })}
                          className="saas-input bg-white"
                        />
                      </div>
                      <div>
                        <label className="saas-label mb-2 ml-1">Frequency / Period</label>
                        <select 
                          value={head.frequency}
                          onChange={(e) => updateFeeHead(head.id, { frequency: e.target.value as FeeFrequency })}
                          className="saas-input bg-white cursor-pointer"
                        >
                          {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <button 
                        onClick={() => updateFeeHead(head.id, { isEnabled: !head.isEnabled })}
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                          head.isEnabled 
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" 
                            : "bg-white text-slate-300 hover:bg-emerald-50 hover:text-emerald-500"
                        )}
                        title={head.isEnabled ? "Enabled" : "Disabled"}
                      >
                        <DollarSign size={20} />
                      </button>
                      <button 
                        onClick={() => removeFeeHead(head.id)}
                        className="w-12 h-12 rounded-2xl bg-white text-slate-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 hover:text-rose-500 shadow-sm"
                        title="Remove"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mt-10 p-8 rounded-[2.5rem] bg-brand-500 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-brand-100">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <Clock size={32} />
                </div>
                <div>
                  <p className="text-xs font-black text-brand-100 uppercase tracking-widest">Estimated Annual Total</p>
                  <p className="text-4xl font-black tracking-tighter mt-1">${calculateAnnualTotal().toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                <AlertCircle size={18} className="text-brand-100" />
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-50">Default for all new students in this class.</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
