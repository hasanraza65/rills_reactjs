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

import { apiClient } from '../../lib/api-client';

const FREQUENCIES: { value: FeeFrequency; label: string }[] = [
  { value: 'ONE_TIME', label: 'One-time' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUAL', label: 'Annual' },
];

// Helper to map backend frequency to frontend enum
const mapBackendToFrontendFreq = (freq: string): FeeFrequency => {
  const f = freq.toLowerCase();
  if (f.includes('one')) return 'ONE_TIME';
  if (f.includes('month')) return 'MONTHLY';
  if (f.includes('quarter')) return 'QUARTERLY';
  if (f.includes('annual')) return 'ANNUAL';
  return 'MONTHLY';
};

// Helper to map frontend enum to backend string
const mapFrontendToBackendFreq = (freq: FeeFrequency): string => {
  switch (freq) {
    case 'ONE_TIME': return 'One Time';
    case 'MONTHLY': return 'Monthly';
    case 'QUARTERLY': return 'Quarterly';
    case 'ANNUAL': return 'Annual';
    default: return 'Monthly';
  }
};

export const FeeConfiguration: React.FC = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manage fee heads per class
  const [classConfigs, setClassConfigs] = useState<Record<string, FeeHead[]>>({});
  const [hasData, setHasData] = useState<Record<string, boolean>>({});

  const currentFeeHeads = selectedClassId ? (classConfigs[selectedClassId] || []) : [];

  // Fetch sections on mount
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await apiClient.get('/sections?branch_id=1');
        if (response.data) {
          setSections(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch sections:', err);
      }
    };
    fetchSections();
  }, []);

  // Fetch fee heads when class changes
  useEffect(() => {
    if (selectedClassId) {
      fetchFeeHeads(selectedClassId);
    }
  }, [selectedClassId]);

  const fetchFeeHeads = async (sectionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/feeheads_by_section/${sectionId}`);
      if (response.data.status) {
        setHasData(prev => ({ ...prev, [sectionId]: response.data.data.length > 0 }));
        const mappedData: FeeHead[] = response.data.data.map((h: any) => ({
          id: h.id.toString(),
          name: h.head_name,
          amount: Number(h.head_amount),
          frequency: mapBackendToFrontendFreq(h.head_frequency),
          isEnabled: true,
        }));

        setClassConfigs(prev => ({
          ...prev,
          [sectionId]: mappedData
        }));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      // setError('Failed to load fee heads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedClassId) return;

    setIsSaving(true);
    setError(null);

    const payload = {
      section_id: Number(selectedClassId),
      heads: currentFeeHeads.map(h => ({
        head_name: h.name,
        head_amount: h.amount,
        head_frequency: mapFrontendToBackendFreq(h.frequency)
      }))
    };

    try {
      const response = await apiClient.post('/fee-head', payload);
      if (response.data.status) {
        setShowSuccess(true);
        setHasData(prev => ({ ...prev, [selectedClassId]: true }));
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error('Save error:', err);
      const backendError = err.response?.data?.message || 'Failed to save configuration';
      setError(backendError);
    } finally {
      setIsSaving(false);
    }
  };

  const addFeeHead = () => {
    const newHead: FeeHead = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      amount: 0,
      frequency: 'MONTHLY',
      isEnabled: true,
    };

    if (!selectedClassId) return;

    setClassConfigs(prev => ({
      ...prev,
      [selectedClassId]: [newHead, ...(prev[selectedClassId] || [])]
    }));
  };

  const removeFeeHead = (id: string) => {
    if (!selectedClassId) return;

    setClassConfigs(prev => ({
      ...prev,
      [selectedClassId]: (prev[selectedClassId] || []).filter(h => h.id !== id)
    }));
  };

  const updateFeeHead = (id: string, updates: Partial<FeeHead>) => {
    if (!selectedClassId) return;

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

    if (!selectedClassId) return;

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
            {error && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-wider shadow-sm border border-rose-100"
              >
                <AlertCircle size={14} />
                {error}
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
            {selectedClassId && hasData[selectedClassId] ? 'Update Configuration' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Select Class</h4>
          <div className="space-y-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedClassId(section.id.toString())}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-5 rounded-[2rem] text-left transition-all border-2",
                  selectedClassId === section.id.toString()
                    ? "bg-brand-500 border-brand-500 text-white shadow-xl shadow-brand-100"
                    : "bg-white border-transparent text-slate-600 hover:border-slate-100 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                  selectedClassId === section.id.toString() ? "bg-white/20 text-white" : "bg-brand-50 text-brand-500"
                )}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <h4 className="font-black text-lg">{section.school_class.name}</h4>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    selectedClassId === section.id.toString() ? "text-brand-100" : "text-slate-400"
                  )}>SECTION {section.name}</p>
                </div>
                {selectedClassId === section.id.toString() && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* <Card className="p-6 bg-slate-50/50 border-dashed border-2 border-slate-200">
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
          </Card> */}
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[600px] flex items-center justify-center p-12 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm"
              >
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Configuration...</p>
                </div>
              </motion.div>
            ) : selectedClassId ? (
              <motion.div
                key={selectedClassId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="p-10 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center shadow-sm">
                        <Settings size={28} />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">
                          Fee Heads for {sections.find(s => s.id.toString() === selectedClassId)?.school_class.name}
                        </h4>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Section {sections.find(s => s.id.toString() === selectedClassId)?.name}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={addFeeHead}
                      icon={Plus}
                      size="sm"
                      className="rounded-xl border-slate-100 text-slate-500 hover:bg-brand-50 hover:border-brand-100 hover:text-brand-500"
                    >
                      Add Fee Head
                    </Button>
                  </div>

                  {currentFeeHeads.length === 0 ? (
                    <EmptyState 
                      icon={DollarSign}
                      title="No Fee Heads Defined"
                      description={`No fees have been configured for ${sections.find(s => s.id.toString() === selectedClassId)?.school_class.name} yet.`}
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
                              onClick={handleSave}
                              className="w-12 h-12 rounded-2xl bg-white text-brand-500 flex items-center justify-center hover:bg-brand-50 transition-all shadow-sm"
                              title="Save Configuration"
                            >
                              <Plus size={20} />
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

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={addFeeHead}
                        className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/50 transition-all flex items-center justify-center gap-3 mt-4 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-600 flex items-center justify-center transition-colors">
                          <Plus size={20} />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest">Add Another Fee Head</span>
                      </motion.button>
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
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full min-h-[600px] flex items-center justify-center p-12 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm"
              >
                <div className="text-center space-y-8 max-w-2xl">
                  <div className="w-24 h-24 rounded-[2rem] bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-xl shadow-brand-100/20 group transition-all duration-700 hover:rotate-12">
                    <BookOpen size={48} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-4xl font-black text-slate-800 tracking-tight">Global Fee Editor</h4>
                    <p className="text-slate-500 font-bold text-lg">Please select a class from the left sidebar to start defining or modifying its fee structure.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
