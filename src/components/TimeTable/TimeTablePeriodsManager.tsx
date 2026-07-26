import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Loader2, Trash2, Edit2, Eye, X, Clock, Settings2, Copy } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { TimeTableGroupManagement } from './TimeTableGroupManagement';
import {
  useTimetablePeriodSets,
  useCreateTimetablePeriodSet,
  useUpdateTimetablePeriodSet,
  useDeleteTimetablePeriodSet,
} from '../../hooks/use-timetable-period-set';
import { useTimetableGroups } from '../../hooks/use-timetable-group';
import { TimetablePeriodSetData } from '../../types/api/timetable-period-set';
import { useBranchStore } from '../../store/use-branch-store';
import { TIMETABLE_DAYS as DAYS } from '../../lib/timetable-days';

// duration matrix: periodNumber -> dayOfWeek -> minutes (string for controlled input; '' = no period that day)
type DurationMatrix = Record<number, Record<number, string>>;

const emptyMatrixRow = (): Record<number, string> =>
  DAYS.reduce((acc, d) => ({ ...acc, [d.value]: '' }), {} as Record<number, string>);

const matrixFromSlots = (slots: TimetablePeriodSetData['slots']): { periods: number[]; matrix: DurationMatrix } => {
  const matrix: DurationMatrix = {};
  const periodSet = new Set<number>();

  (slots || []).forEach((slot) => {
    periodSet.add(slot.period_number);
    matrix[slot.period_number] = matrix[slot.period_number] || emptyMatrixRow();
    matrix[slot.period_number][slot.day_of_week] = String(slot.duration_minutes);
  });

  const periods = Array.from(periodSet).sort((a, b) => a - b);
  return { periods: periods.length ? periods : [1], matrix: periods.length ? matrix : { 1: emptyMatrixRow() } };
};

export const TimeTablePeriodsManager: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId || 1;

  const { data: periodSets, isLoading } = useTimetablePeriodSets(branchId);
  const { data: groups } = useTimetableGroups(branchId);

  const createMutation = useCreateTimetablePeriodSet();
  const updateMutation = useUpdateTimetablePeriodSet();
  const deleteMutation = useDeleteTimetablePeriodSet();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGroupManagerOpen, setIsGroupManagerOpen] = useState(false);
  const [viewingSet, setViewingSet] = useState<TimetablePeriodSetData | null>(null);
  const [editingSet, setEditingSet] = useState<TimetablePeriodSetData | null>(null);
  const [groupId, setGroupId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [periods, setPeriods] = useState<number[]>([1]);
  const [matrix, setMatrix] = useState<DurationMatrix>({ 1: emptyMatrixRow() });
  const [setToDelete, setSetToDelete] = useState<TimetablePeriodSetData | null>(null);

  const openAddForm = () => {
    setEditingSet(null);
    setGroupId('');
    setTitle('');
    setPeriods([1]);
    setMatrix({ 1: emptyMatrixRow() });
    setIsFormOpen(true);
  };

  const openEditForm = (set: TimetablePeriodSetData) => {
    const { periods: p, matrix: m } = matrixFromSlots(set.slots);
    setEditingSet(set);
    setGroupId(set.timetable_group_id);
    setTitle(set.title);
    setPeriods(p);
    setMatrix(m);
    setIsFormOpen(true);
  };

  const addPeriodRow = () => {
    const nextNumber = periods.length ? Math.max(...periods) + 1 : 1;
    setPeriods([...periods, nextNumber]);
    setMatrix({ ...matrix, [nextNumber]: emptyMatrixRow() });
  };

  const removePeriodRow = (periodNumber: number) => {
    setPeriods(periods.filter((p) => p !== periodNumber));
    const next = { ...matrix };
    delete next[periodNumber];
    setMatrix(next);
  };

  // Copies this period row's minutes-per-day into the next row, so adding a run of
  // same-length periods doesn't mean retyping every day's value each time.
  const copyRowDown = (periodNumber: number) => {
    const index = periods.indexOf(periodNumber);
    const nextPeriodNumber = periods[index + 1];
    if (nextPeriodNumber === undefined) return;

    setMatrix({ ...matrix, [nextPeriodNumber]: { ...matrix[periodNumber] } });
  };

  const setDuration = (periodNumber: number, day: number, value: string) => {
    setMatrix({
      ...matrix,
      [periodNumber]: { ...matrix[periodNumber], [day]: value },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !title.trim()) return;

    const slots = periods.flatMap((periodNumber) =>
      DAYS.filter((d) => matrix[periodNumber]?.[d.value]).map((d) => ({
        day_of_week: d.value,
        period_number: periodNumber,
        duration_minutes: parseInt(matrix[periodNumber][d.value], 10),
      }))
    );

    if (slots.length === 0) return;

    if (editingSet) {
      updateMutation.mutate({ id: editingSet.id, data: { title, slots } }, { onSuccess: () => setIsFormOpen(false) });
    } else {
      createMutation.mutate(
        { branch_id: branchId, timetable_group_id: Number(groupId), title, slots },
        { onSuccess: () => setIsFormOpen(false) }
      );
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Time Table Periods</h3>
          <p className="text-sm text-slate-500">Define how many minutes each period lasts, per day, for a Time Table Group.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsGroupManagerOpen(true)} leftIcon={<Settings2 size={18} />}>
            Manage Groups
          </Button>
          <Button onClick={openAddForm} leftIcon={<Plus size={18} />}>
            Add Periods
          </Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
            <p>Loading periods templates...</p>
          </div>
        ) : !periodSets || periodSets.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No Periods Templates"
            description="Create a Periods template to define period durations for a Time Table Group."
            actionLabel="Add Periods"
            onAction={openAddForm}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periods Title</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Table Group</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Period Cells</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {periodSets.map((set) => (
                  <tr key={set.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{set.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{set.group?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                        {set.slots?.length || 0} cells
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewingSet(set)} className="p-2 text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all" title="View">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => openEditForm(set)} className="p-2 text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setSetToDelete(set)} className="p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-900">{editingSet ? 'Edit Periods Template' : 'Add Periods'}</h3>
                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Time Table Group</label>
                      <select
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value ? Number(e.target.value) : '')}
                        disabled={!!editingSet}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none disabled:opacity-60"
                      >
                        <option value="">Select a group...</option>
                        {groups?.map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Periods Title</label>
                      <input
                        type="text"
                        placeholder="e.g. test time periods"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-bold text-slate-700">Add Periods</label>
                      <span className="text-xs text-slate-400">Leave a cell blank if that period doesn't run on that day.</span>
                    </div>
                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-slate-800 text-white">
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Period No.</th>
                            {DAYS.map((d) => (
                              <th key={d.value} className="px-3 py-3 text-xs font-bold uppercase tracking-wider">{d.label}</th>
                            ))}
                            <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {periods.map((periodNumber, index) => (
                            <tr key={periodNumber} className="hover:bg-slate-50/50">
                              <td className="px-4 py-2.5 font-bold text-slate-700">{periodNumber}</td>
                              {DAYS.map((d) => (
                                <td key={d.value} className="px-2 py-2">
                                  <input
                                    type="number"
                                    min={1}
                                    placeholder="min"
                                    value={matrix[periodNumber]?.[d.value] || ''}
                                    onChange={(e) => setDuration(periodNumber, d.value, e.target.value)}
                                    className="w-16 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-center text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                                  />
                                </td>
                              ))}
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => copyRowDown(periodNumber)}
                                    disabled={index === periods.length - 1}
                                    title="Copy this row's minutes down to the next period"
                                    className="p-1.5 text-slate-300 hover:bg-brand-50 hover:text-brand-600 rounded-lg transition-all disabled:opacity-30"
                                  >
                                    <Copy size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removePeriodRow(periodNumber)}
                                    disabled={periods.length === 1}
                                    title="Remove this period row"
                                    className="p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-all disabled:opacity-30"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      type="button"
                      onClick={addPeriodRow}
                      className="mt-3 text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <Plus size={16} /> Add another period row
                    </button>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 shrink-0">
                  <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Periods'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingSet && (() => {
          const { periods: viewPeriods, matrix: viewMatrix } = matrixFromSlots(viewingSet.slots);
          // Always show Mon-Sat; Sunday is never a school day here.
          const viewDays = DAYS.filter((d) => d.value !== 7);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="font-bold text-slate-900">{viewingSet.title}</h3>
                    <p className="text-xs text-slate-500">{viewingSet.group?.name}</p>
                  </div>
                  <button onClick={() => setViewingSet(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto">
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-800 text-white">
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Period No.</th>
                          {viewDays.map((d) => (
                            <th key={d.value} className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-center">{d.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {viewPeriods.map((periodNumber) => (
                          <tr key={periodNumber} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 font-bold text-slate-700">{periodNumber}</td>
                            {viewDays.map((d) => {
                              const minutes = viewMatrix[periodNumber]?.[d.value];
                              return (
                                <td key={d.value} className="px-3 py-2.5 text-center">
                                  {minutes ? (
                                    <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold">{minutes} min</span>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => {
                      openEditForm(viewingSet);
                      setViewingSet(null);
                    }}
                    leftIcon={<Edit2 size={16} />}
                  >
                    Edit
                  </Button>
                  <Button onClick={() => setViewingSet(null)}>Close</Button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {isGroupManagerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-900">Manage Time Table Groups</h3>
                <button onClick={() => setIsGroupManagerOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <TimeTableGroupManagement />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={!!setToDelete}
        onClose={() => setSetToDelete(null)}
        onConfirm={() => setToDelete && deleteMutation.mutate(setToDelete.id, { onSuccess: () => setSetToDelete(null) })}
        title="Delete Periods Template?"
        message={`Are you sure you want to delete "${setToDelete?.title}"? This won't be possible if a Timetable already uses it.`}
        confirmLabel="Yes, Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
