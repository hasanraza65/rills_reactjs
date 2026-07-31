import React, { useState } from 'react';
import { Calendar, Clock, Sparkles, Plus, Loader2, ArrowLeft, CalendarClock, Copy, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { useTimetableGroups } from '../../hooks/use-timetable-group';
import { useTimetablePeriodSets } from '../../hooks/use-timetable-period-set';
import { useCreateTimetable, useTimetables, useUpdateTimetable, useDeleteTimetable } from '../../hooks/use-timetable';
import { useClasses } from '../../hooks/use-class';
import { useSectionsByClass } from '../../hooks/use-section';
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
  const { data: classes } = useClasses(branchId);

  const [classId, setClassId] = useState<number | ''>('');
  const [sectionId, setSectionId] = useState<number | ''>('');
  const [groupId, setGroupId] = useState<number | ''>('');
  const [periodSetId, setPeriodSetId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [schoolTimeFrom, setSchoolTimeFrom] = useState('09:00');
  const [isActive, setIsActive] = useState(false);
  const [wantsCopy, setWantsCopy] = useState(false);
  const [copyFromId, setCopyFromId] = useState<number | ''>('');

  const { data: sections } = useSectionsByClass(classId || null);
  const filteredGroups = groups?.filter((g) => !classId || g.classes?.some((c) => c.id === classId));
  const { data: periodSets } = useTimetablePeriodSets(branchId, groupId ? Number(groupId) : undefined);
  const timetablesForGroup = timetables?.filter((tt) => tt.timetable_group_id === groupId);

  const applyCopyFrom = (sourceId: number | '') => {
    setCopyFromId(sourceId);
    const source = timetables?.find((tt) => tt.id === sourceId);
    if (!source) return;
    setPeriodSetId(source.period_set_id);
    setSchoolTimeFrom(source.school_time_from.slice(0, 5));
    setIsActive(source.is_active);
  };

  const createMutation = useCreateTimetable();
  const updateMutation = useUpdateTimetable();
  const deleteMutation = useDeleteTimetable();

  const toggleActive = (tt: TimetableData) => {
    updateMutation.mutate({ id: tt.id, data: { title: tt.title, is_active: !tt.is_active } });
  };

  // Three views: the list of existing Timetables (default), the create form, and
  // the Period Allocation grid for a selected/just-created Timetable.
  const [isCreating, setIsCreating] = useState(false);
  const [activeTimetable, setActiveTimetable] = useState<TimetableData | null>(null);
  const [timetableToDelete, setTimetableToDelete] = useState<TimetableData | null>(null);

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
        ...(wantsCopy && copyFromId ? { copy_from_timetable_id: Number(copyFromId) } : {}),
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
    setClassId('');
    setSectionId('');
    setGroupId('');
    setPeriodSetId('');
    setTitle('');
    setDateFrom('');
    setDateTo('');
    setSchoolTimeFrom('09:00');
    setIsActive(false);
    setWantsCopy(false);
    setCopyFromId('');
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
                <label className="text-sm font-bold text-slate-700">Class</label>
                <select
                  value={classId}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : '';
                    setClassId(value);
                    setSectionId('');
                    setGroupId('');
                    setPeriodSetId('');
                    setWantsCopy(false);
                    setCopyFromId('');
                  }}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
                >
                  <option value="">Select a class...</option>
                  {classes?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Section</label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value ? Number(e.target.value) : '')}
                  disabled={!classId}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none disabled:opacity-60"
                >
                  <option value="">Select a section...</option>
                  {sections?.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Group Time Table</label>
                <select
                  value={groupId}
                  onChange={(e) => {
                    setGroupId(e.target.value ? Number(e.target.value) : '');
                    setPeriodSetId('');
                    setWantsCopy(false);
                    setCopyFromId('');
                  }}
                  required
                  disabled={!classId}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none disabled:opacity-60"
                >
                  <option value="">Select a group...</option>
                  {filteredGroups?.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                {classId && filteredGroups?.length === 0 && (
                  <p className="text-xs text-rose-500">No Time Table Group covers this class yet.</p>
                )}
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
            </div>

            {!!groupId && (
              <div className="p-4 bg-brand-50/40 border border-brand-100 rounded-2xl space-y-3">
                {timetablesForGroup?.length ? (
                  <>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wantsCopy}
                        onChange={(e) => {
                          setWantsCopy(e.target.checked);
                          if (!e.target.checked) applyCopyFrom('');
                        }}
                        className="accent-brand-500"
                      />
                      <Copy size={15} className="text-brand-600" /> Copy settings from an existing Timetable of this group
                    </label>
                    {wantsCopy && (
                      <select
                        value={copyFromId}
                        onChange={(e) => applyCopyFrom(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
                      >
                        <option value="">Select a Timetable to copy from...</option>
                        {timetablesForGroup.map((tt) => (
                          <option key={tt.id} value={tt.id}>{tt.title} ({tt.date_from} to {tt.date_to})</option>
                        ))}
                      </select>
                    )}
                  </>
                ) : (
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <Copy size={15} className="text-slate-400" /> No existing Timetable for this group yet — nothing to copy from. Fill in the fields below manually.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {timetables.map((tt) => (
                  <tr
                    key={tt.id}
                    onClick={() => setActiveTimetable(tt)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
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
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTimetableToDelete(tt);
                        }}
                        title="Delete"
                        className="p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmationModal
        isOpen={!!timetableToDelete}
        onClose={() => setTimetableToDelete(null)}
        onConfirm={() =>
          timetableToDelete && deleteMutation.mutate(timetableToDelete.id, { onSuccess: () => setTimetableToDelete(null) })
        }
        title="Delete Timetable?"
        message={`Are you sure you want to delete "${timetableToDelete?.title}"? This will remove its entire period allocation grid too.`}
        confirmLabel="Yes, Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
