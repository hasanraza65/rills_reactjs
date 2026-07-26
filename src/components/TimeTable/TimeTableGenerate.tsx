import React, { useState } from 'react';
import { Calendar, Clock, Sparkles, Plus, Loader2, ArrowLeft, RefreshCw, CalendarClock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { useTimetableGroups } from '../../hooks/use-timetable-group';
import { useTimetablePeriodSets } from '../../hooks/use-timetable-period-set';
import { useCreateTimetable, useTimetables, useUpdateTimetable, useRegenerateTimetable } from '../../hooks/use-timetable';
import { useBranchStore } from '../../store/use-branch-store';
import { PeriodAllocationGrid } from './PeriodAllocationGrid';
import { TimetableData } from '../../types/api/timetable';

interface TimeTableGenerateProps {
  onTabChange?: (tab: string) => void;
}

export const TimeTableGenerate: React.FC<TimeTableGenerateProps> = ({ onTabChange }) => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId || 1;

  const { data: groups } = useTimetableGroups(branchId);
  const { data: timetables, isLoading: isLoadingTimetables } = useTimetables(branchId);

  const [groupId, setGroupId] = useState<number | ''>('');
  const [periodSetId, setPeriodSetId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [schoolTimeFrom, setSchoolTimeFrom] = useState('09:00');
  const [isActive, setIsActive] = useState(false);

  const { data: periodSets } = useTimetablePeriodSets(branchId, groupId ? Number(groupId) : undefined);

  const createMutation = useCreateTimetable();
  const updateMutation = useUpdateTimetable();
  const regenerateMutation = useRegenerateTimetable();

  const toggleActive = (tt: TimetableData) => {
    updateMutation.mutate({ id: tt.id, data: { title: tt.title, is_active: !tt.is_active } });
  };

  // Three views: the list of existing Timetables (default), the create form, and
  // the Period Allocation grid for a selected/just-created Timetable.
  const [isCreating, setIsCreating] = useState(false);
  const [activeTimetable, setActiveTimetable] = useState<TimetableData | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !periodSetId || !title.trim() || !dateFrom || !dateTo) return;

    createMutation.mutate(
      {
        branch_id: branchId,
        timetable_group_id: Number(groupId),
        period_set_id: Number(periodSetId),
        title,
        date_from: dateFrom,
        date_to: dateTo,
        school_time_from: schoolTimeFrom,
        is_active: isActive,
      },
      {
        onSuccess: (timetable) => {
          setActiveTimetable(timetable);
          setIsCreating(false);
        },
      }
    );
  };

  const resetForm = () => {
    setGroupId('');
    setPeriodSetId('');
    setTitle('');
    setDateFrom('');
    setDateTo('');
    setSchoolTimeFrom('09:00');
    setIsActive(false);
  };

  const backToList = () => {
    setActiveTimetable(null);
    setIsCreating(false);
    resetForm();
  };

  // ─── Grid view: editing a selected or just-created Timetable ─────────────────
  if (activeTimetable) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{activeTimetable.title}</h3>
            <p className="text-sm text-slate-500">Fill in the Period Allocation grid below, then click Save on each cell.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => regenerateMutation.mutate({ id: activeTimetable.id, data: {} })}
              disabled={regenerateMutation.isPending}
              leftIcon={<RefreshCw size={16} className={regenerateMutation.isPending ? 'animate-spin' : ''} />}
              title="Re-run generation (e.g. after adding a Section) — keeps existing cell assignments"
            >
              {regenerateMutation.isPending ? 'Regenerating...' : 'Regenerate'}
            </Button>
            <Button variant="outline" onClick={backToList} leftIcon={<ArrowLeft size={16} />}>
              Back to List
            </Button>
          </div>
        </div>
        <PeriodAllocationGrid
          timetableId={activeTimetable.id}
          branchId={activeTimetable.branch_id}
          onGoToSections={onTabChange ? () => onTabChange('sections') : undefined}
        />
      </div>
    );
  }

  // ─── Create form ───────────────────────────────────────────────────────────
  if (isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Make New Time Table</h3>
            <p className="text-sm text-slate-500">Generate a Timetable from a Group + Periods template over a date range.</p>
          </div>
          <Button variant="outline" onClick={backToList} leftIcon={<ArrowLeft size={16} />}>
            Back to List
          </Button>
        </div>

        <Card padding="md">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Group Time Table</label>
                <select
                  value={groupId}
                  onChange={(e) => {
                    setGroupId(e.target.value ? Number(e.target.value) : '');
                    setPeriodSetId('');
                  }}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
                >
                  <option value="">Select a group...</option>
                  {groups?.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Periods</label>
                <select
                  value={periodSetId}
                  onChange={(e) => setPeriodSetId(e.target.value ? Number(e.target.value) : '')}
                  required
                  disabled={!groupId}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none disabled:opacity-60"
                >
                  <option value="">Select a periods template...</option>
                  {periodSets?.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                {groupId && !periodSets?.length && (
                  <p className="text-xs text-amber-600">No Periods template exists yet for this group — create one under Time Table Periods first.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Title</label>
                <input
                  type="text"
                  placeholder="e.g. TEST TIMETABLE"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Clock size={14} /> School Time From</label>
                <input
                  type="time"
                  value={schoolTimeFrom}
                  onChange={(e) => setSchoolTimeFrom(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Calendar size={14} /> Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Calendar size={14} /> Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom || undefined}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-brand-500" />
              Active
            </label>

            {createMutation.isError && (
              <p className="text-sm text-rose-500">
                {(createMutation.error as any)?.response?.data?.message || 'Failed to generate timetable.'}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={backToList}>
                Cancel
              </Button>
              <Button type="submit" leftIcon={<Sparkles size={18} />} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Generating...' : 'Generate Time Table'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // ─── List view (default): every existing Timetable for this campus ───────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Time Table</h3>
          <p className="text-sm text-slate-500">Every Timetable generated for this campus.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} leftIcon={<Plus size={18} />}>
          Make New Time Table
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        {isLoadingTimetables ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
            <p>Loading timetables...</p>
          </div>
        ) : !timetables || timetables.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No Timetables Yet"
            description="Generate your first Timetable from a Group and Periods template."
            actionLabel="Make New Time Table"
            onAction={() => setIsCreating(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Range</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {timetables.map((tt) => (
                  <tr
                    key={tt.id}
                    onClick={() => setActiveTimetable(tt)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{tt.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{tt.group?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{tt.date_from} to {tt.date_to}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleActive(tt);
                        }}
                        disabled={updateMutation.isPending}
                        title={tt.is_active ? 'Click to deactivate' : 'Click to activate'}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
                          tt.is_active
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {tt.is_active ? 'Active' : 'Inactive'}
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
