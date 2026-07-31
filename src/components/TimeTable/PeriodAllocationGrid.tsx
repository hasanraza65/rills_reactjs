import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Copy, Pencil, Trash2, AlertTriangle, Plus, Save } from 'lucide-react';
import { Card } from '../ui/Card';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { useTimetableSlots, useUpdateTimetableSlot, useRegenerateTimetable, useTeacherBusySlots } from '../../hooks/use-timetable';
import { timetableService } from '../../lib/services/timetable-service';
import { Button } from '../ui/Button';
import { useClassSubjects } from '../../hooks/use-class-subject';
import { useTimetableActivities } from '../../hooks/use-timetable-activity';
import { useStaffMembers } from '../../hooks/use-staff-members';
import { TimetableSlotData, TeacherBusySlot } from '../../types/api/timetable';
import { dayLabel } from '../../lib/timetable-days';

// Anyone can be assigned to a period (Branch Admin, Admin, Teacher, etc.) except
// Super Admin, who manages the system rather than teaching/supervising periods.
const SUPER_ADMIN_ROLE_ID = 1;

const formatTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

interface CellValue {
  subjectKey: string; // '' | `cs-{id}` | `act-{id}`
  teacherId: number | null;
}

const cellValueFromSlot = (slot: TimetableSlotData): CellValue => ({
  subjectKey: slot.class_subject_id
    ? `cs-${slot.class_subject_id}`
    : slot.timetable_activity_id
    ? `act-${slot.timetable_activity_id}`
    : '',
  teacherId: slot.teacher_id ?? null,
});

interface SubjectOption {
  id: number;
  subjectName: string;
}
interface ActivityOption {
  id: number;
  name: string;
}
interface TeacherOption {
  id: number;
  name: string;
}

// The period's teacher is always a free, manual pick (any staff member except Super
// Admin) — independent of whichever teacher a subject is officially assigned to
// elsewhere in Class/Subject management.
const displayForValue = (
  value: CellValue,
  subjectOptions: SubjectOption[],
  activityOptions: ActivityOption[],
  teacherOptions: TeacherOption[]
): { title: string; subtitle: string | null } | null => {
  const teacherName = value.teacherId ? teacherOptions.find((t) => t.id === value.teacherId)?.name ?? null : null;

  if (value.subjectKey.startsWith('cs-')) {
    const subject = subjectOptions.find((s) => `cs-${s.id}` === value.subjectKey);
    return subject ? { title: subject.subjectName, subtitle: teacherName } : null;
  }
  if (value.subjectKey.startsWith('act-')) {
    const activity = activityOptions.find((a) => `act-${a.id}` === value.subjectKey);
    return activity ? { title: activity.name, subtitle: teacherName } : null;
  }
  return null;
};

// ─── Cell editor (subject/teacher pickers) — local only, no network call here.
// Everything is confirmed into the section's draft and actually persisted by the
// single Save button above the table. ───────────────────────────────────────────

interface CellEditorProps {
  slot: TimetableSlotData;
  initialValue: CellValue;
  subjectOptions: SubjectOption[];
  teacherOptions: TeacherOption[];
  busySlots: TeacherBusySlot[];
  onConfirm: (value: CellValue) => void;
}

const CellEditor: React.FC<CellEditorProps> = ({
  slot,
  initialValue,
  subjectOptions,
  teacherOptions,
  busySlots,
  onConfirm,
}) => {
  const [draft, setDraft] = useState<CellValue>(initialValue);

  // A teacher is "busy" if some OTHER slot (any section/group/timetable, as long as
  // it's active) on the same day overlaps this cell's time — same rule the backend
  // enforces on Save, surfaced here up front so a conflicting pick can't even be made.
  const conflictFor = (teacherId: number): TeacherBusySlot | undefined =>
    busySlots.find(
      (b) =>
        b.teacher_id === teacherId &&
        b.day_of_week === slot.day_of_week &&
        b.id !== slot.id &&
        b.start_time < slot.end_time &&
        b.end_time > slot.start_time
    );

  // No Done/Cancel step — a cell auto-confirms the moment it's either fully cleared
  // or has a complete pair (Subject/Activity + Teacher), whichever order they're picked in.
  const commit = (next: CellValue) => {
    setDraft(next);
    const isComplete = !!next.subjectKey && !!next.teacherId;
    const isCleared = !next.subjectKey && !next.teacherId;
    if (isComplete || isCleared) {
      onConfirm(next);
    }
  };

  const handleSubjectChange = (subjectKey: string) => {
    commit(subjectKey ? { ...draft, subjectKey } : { subjectKey: '', teacherId: null });
  };

  return (
    <div className="p-2 space-y-1.5 min-w-[170px] bg-brand-50/40">
      <select
        value={draft.subjectKey}
        onChange={(e) => handleSubjectChange(e.target.value)}
        autoFocus
        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500/20 outline-none"
      >
        <option value="">Select Subject</option>
        {subjectOptions.map((s) => (
          <option key={`cs-${s.id}`} value={`cs-${s.id}`}>{s.subjectName}</option>
        ))}
      </select>

      <select
        value={draft.teacherId ?? ''}
        onChange={(e) => commit({ ...draft, teacherId: e.target.value ? Number(e.target.value) : null })}
        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] focus:ring-2 focus:ring-brand-500/20 outline-none"
      >
        <option value="">Select Teacher</option>
        {teacherOptions.map((t) => {
          const conflict = conflictFor(t.id);
          return (
            <option
              key={t.id}
              value={t.id}
              disabled={!!conflict}
              title={
                conflict
                  ? `Already assigned to ${conflict.group_name ?? 'another group'}${conflict.section_name ? ` (${conflict.section_name})` : ''}, ${conflict.start_time.slice(0, 5)}-${conflict.end_time.slice(0, 5)}`
                  : undefined
              }
            >
              {t.name}{conflict ? ' (Already assigned)' : ''}
            </option>
          );
        })}
      </select>
    </div>
  );
};

// ─── Read-mode cell (display + edit/delete affordances on hover) ───────────────

interface TimetableCellProps {
  slot: TimetableSlotData;
  value: CellValue;
  isEditing: boolean;
  isDirty: boolean;
  error?: string;
  subjectOptions: SubjectOption[];
  activityOptions: ActivityOption[];
  teacherOptions: TeacherOption[];
  busySlots: TeacherBusySlot[];
  onStartEdit: () => void;
  onConfirm: (value: CellValue) => void;
  onDeleteRequest: () => void;
}

const TimetableCell: React.FC<TimetableCellProps> = ({
  slot,
  value,
  isEditing,
  isDirty,
  error,
  subjectOptions,
  activityOptions,
  teacherOptions,
  busySlots,
  onStartEdit,
  onConfirm,
  onDeleteRequest,
}) => {
  if (isEditing) {
    return (
      <CellEditor
        slot={slot}
        initialValue={value}
        subjectOptions={subjectOptions}
        teacherOptions={teacherOptions}
        busySlots={busySlots}
        onConfirm={onConfirm}
      />
    );
  }

  const display = displayForValue(value, subjectOptions, activityOptions, teacherOptions);

  return (
    <div
      onClick={onStartEdit}
      className={`group/cell relative min-h-[64px] min-w-[130px] px-3 py-2 flex flex-col justify-center cursor-pointer transition-colors ${
        error
          ? 'bg-rose-50 hover:bg-rose-100 ring-1 ring-inset ring-rose-300'
          : isDirty
          ? 'bg-amber-50 hover:bg-amber-100 ring-1 ring-inset ring-amber-300'
          : 'hover:bg-slate-50'
      }`}
    >
      <p className="text-[9px] text-slate-400 font-semibold mb-0.5">{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</p>
      {display ? (
        <>
          <p className="text-xs font-bold text-slate-800 leading-tight">{display.title}</p>
          {display.subtitle && <p className="text-[10px] text-slate-400 leading-tight">{display.subtitle}</p>}
          {error ? (
            <p className="text-[9px] font-bold text-rose-600 mt-0.5">{error}</p>
          ) : (
            isDirty && <p className="text-[9px] font-bold text-amber-600 mt-0.5">Not saved yet</p>
          )}
        </>
      ) : (
        <p className="text-[11px] text-slate-300 font-semibold">+ Add</p>
      )}

      {display && (
        <div className="absolute top-1 right-1 hidden group-hover/cell:flex gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
            title="Edit"
            className="p-1 bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-brand-500 rounded-md"
          >
            <Pencil size={11} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest();
            }}
            title="Delete"
            className="p-1 bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-rose-500 rounded-md"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── One table per Section: rows = day, columns = period ───────────────────────

interface SectionScheduleBlockProps {
  sectionLabel: string;
  sectionSlots: TimetableSlotData[];
  timetableId: number;
  branchId: number;
  busySlots: TeacherBusySlot[];
}

const SectionScheduleBlock: React.FC<SectionScheduleBlockProps> = ({ sectionLabel, sectionSlots, timetableId, branchId, busySlots }) => {
  const sectionId = sectionSlots[0]?.section_id ?? null;

  const { data: classSubjectsResponse } = useClassSubjects(sectionId, branchId);
  const { data: activities } = useTimetableActivities(branchId);
  const { data: staff } = useStaffMembers(branchId);

  // One entry per distinct subject name — a subject can have several ClassSubject
  // rows (one per teacher officially tied to it), but the period's teacher is now a
  // separate, manual pick, so only the subject identity itself is shown/needed here.
  const subjectOptions = useMemo(() => {
    const seen = new Map<string, SubjectOption>();
    (classSubjectsResponse?.data || []).forEach((cs) => {
      if (!seen.has(cs.subject_name)) {
        seen.set(cs.subject_name, { id: cs.id, subjectName: cs.subject_name });
      }
    });
    return Array.from(seen.values());
  }, [classSubjectsResponse]);

  const activityOptions = useMemo(() => (activities || []).map((a) => ({ id: a.id, name: a.name })), [activities]);

  const teacherOptions = useMemo(
    () => (staff || []).filter((s) => s.user_role !== SUPER_ADMIN_ROLE_ID).map((s) => ({ id: s.id, name: s.name })),
    [staff]
  );

  // Authoritative display values, keyed by slot id — seeded once from the initial
  // fetch so a later refetch (triggered by Save) never stomps on other cells'
  // in-progress, unsaved edits. Updated only by: initial load, Save, Copy Row, Delete.
  const [cellValues, setCellValues] = useState<Record<number, CellValue>>(() => {
    const initial: Record<number, CellValue> = {};
    sectionSlots.forEach((slot) => {
      initial[slot.id] = cellValueFromSlot(slot);
    });
    return initial;
  });

  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<TimetableSlotData | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<{ day: number; count: number } | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [cellErrors, setCellErrors] = useState<Record<number, string>>({});
  const [saveAllFeedback, setSaveAllFeedback] = useState<{ saved: number; failed: number } | null>(null);
  const deleteMutation = useUpdateTimetableSlot();
  const queryClient = useQueryClient();

  // A cell is "dirty" once its local selection differs from what the server last
  // returned for that slot — i.e. picked (or Copy Row'd) but not yet Saved.
  const isCellDirty = (slot: TimetableSlotData) => {
    const current = cellValues[slot.id];
    if (!current) return false;
    const original = cellValueFromSlot(slot);
    return current.subjectKey !== original.subjectKey || current.teacherId !== original.teacherId;
  };

  const dirtySlots = sectionSlots.filter(isCellDirty);

  const slotsByDay = useMemo(() => {
    const grouped: Record<number, TimetableSlotData[]> = {};
    sectionSlots.forEach((slot) => {
      grouped[slot.day_of_week] = grouped[slot.day_of_week] || [];
      grouped[slot.day_of_week].push(slot);
    });
    Object.values(grouped).forEach((daySlots) => daySlots.sort((a, b) => a.period_number - b.period_number));
    return grouped;
  }, [sectionSlots]);

  const days = Object.keys(slotsByDay).map(Number).sort((a, b) => a - b);
  const periodNumbers = useMemo(
    () => Array.from(new Set<number>(sectionSlots.map((s) => s.period_number))).sort((a, b) => a - b),
    [sectionSlots]
  );

  // A day only has something worth copying once at least one of its cells has a
  // subject/activity picked (even if not Saved yet) — an all-"+ Add" row copies nothing.
  const dayHasAssignments = (day: number) =>
    (slotsByDay[day] || []).some((slot) => !!cellValues[slot.id]?.subjectKey);

  // Copies this day's selections into the next day present in this section (matched by
  // period number) — an unsaved convenience only. Everything copied still gets picked
  // up by the single Save button above the table.
  const copyRowToNextDay = (day: number) => {
    const dayIndex = days.indexOf(day);
    const nextDay = days[dayIndex + 1];
    if (nextDay === undefined) return;

    const sourceByPeriod = new Map<number, TimetableSlotData>(
      slotsByDay[day].map((slot): [number, TimetableSlotData] => [slot.period_number, slot])
    );

    let copiedCount = 0;

    setCellValues((prev) => {
      const next = { ...prev };
      slotsByDay[nextDay].forEach((targetSlot) => {
        const sourceSlot = sourceByPeriod.get(targetSlot.period_number);
        if (sourceSlot && prev[sourceSlot.id]?.subjectKey) {
          next[targetSlot.id] = { ...prev[sourceSlot.id] };
          copiedCount += 1;
        }
      });
      return next;
    });

    setCopyFeedback({ day: nextDay, count: copiedCount });
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Saves every dirty (picked-but-unsaved) cell across the WHOLE section in one go —
  // the per-cell conflict check still runs for each, so a real double-booking still fails.
  const saveAll = async () => {
    if (dirtySlots.length === 0) return;

    setSavingAll(true);
    let saved = 0;
    const errors: Record<number, string> = {};

    for (const slot of dirtySlots) {
      const value = cellValues[slot.id];
      const payload = value.subjectKey.startsWith('cs-')
        ? { class_subject_id: Number(value.subjectKey.replace('cs-', '')), timetable_activity_id: null, teacher_id: value.teacherId }
        : value.subjectKey.startsWith('act-')
        ? { class_subject_id: null, timetable_activity_id: Number(value.subjectKey.replace('act-', '')), teacher_id: value.teacherId }
        : { class_subject_id: null, timetable_activity_id: null, teacher_id: null };

      try {
        await timetableService.updateSlot(timetableId, slot.id, payload);
        saved += 1;
      } catch (err: any) {
        errors[slot.id] = err?.response?.data?.message || 'Could not save this period.';
      }
    }

    setCellErrors(errors);
    await queryClient.invalidateQueries({ queryKey: ['timetables', 'slots', timetableId] });
    await queryClient.invalidateQueries({ queryKey: ['timetables', 'teacher-busy-slots'] });
    setSavingAll(false);
    setSaveAllFeedback({ saved, failed: Object.keys(errors).length });
    setTimeout(() => setSaveAllFeedback(null), 4000);
  };

  const confirmDelete = () => {
    if (!slotToDelete) return;

    deleteMutation.mutate(
      { timetableId, slotId: slotToDelete.id, data: { class_subject_id: null, timetable_activity_id: null, teacher_id: null } },
      {
        onSuccess: () => {
          setCellValues((prev) => ({ ...prev, [slotToDelete.id]: { subjectKey: '', teacherId: null } }));
          setSlotToDelete(null);
          queryClient.invalidateQueries({ queryKey: ['timetables', 'teacher-busy-slots'] });
        },
      }
    );
  };

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h4 className="text-base font-bold text-slate-900">{sectionLabel}</h4>
        <div className="flex items-center gap-3">
          {saveAllFeedback && (
            <span className={`text-xs font-bold ${saveAllFeedback.failed > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              Saved {saveAllFeedback.saved}{saveAllFeedback.failed > 0 ? `, ${saveAllFeedback.failed} failed` : ''}
            </span>
          )}
          <Button
            onClick={saveAll}
            disabled={savingAll || dirtySlots.length === 0}
            leftIcon={savingAll ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          >
            {savingAll ? 'Saving...' : dirtySlots.length > 0 ? `Save (${dirtySlots.length})` : 'Save'}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider sticky left-0 bg-slate-800">Day</th>
              {periodNumbers.map((p) => (
                <th key={p} className="px-2 py-3 text-xs font-bold uppercase tracking-wider text-center border-l border-slate-700">
                  Period {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {days.map((day, index) => (
              <tr key={day} className="hover:bg-slate-50/30">
                <td className="px-4 py-2 sticky left-0 bg-white border-r border-slate-100">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-700 text-sm">{dayLabel(day)}</span>
                    {index < days.length - 1 && (
                      <button
                        type="button"
                        onClick={() => copyRowToNextDay(day)}
                        disabled={!dayHasAssignments(day)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 text-[9px] font-bold uppercase tracking-wider hover:bg-brand-100 transition-colors self-start disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-50"
                        title={
                          dayHasAssignments(day)
                            ? `Copy ${dayLabel(day)}'s selections to ${dayLabel(days[index + 1])}`
                            : `Pick a subject/activity for at least one period on ${dayLabel(day)} first`
                        }
                      >
                        <Copy size={10} /> Copy Row
                      </button>
                    )}
                    {copyFeedback?.day === day && (
                      <span className="text-[9px] font-bold text-emerald-600">
                        {copyFeedback.count > 0 ? `Copied ${copyFeedback.count} period(s)` : 'Nothing to copy'}
                      </span>
                    )}
                  </div>
                </td>
                {periodNumbers.map((p) => {
                  const slot = slotsByDay[day].find((s) => s.period_number === p);
                  if (!slot) {
                    return (
                      <td key={p} className="px-2 py-2 text-center text-slate-300 border-l border-slate-100 text-xs">
                        &mdash;
                      </td>
                    );
                  }
                  return (
                    <td key={p} className="p-0 border-l border-slate-100 align-top">
                      <TimetableCell
                        slot={slot}
                        value={cellValues[slot.id] || cellValueFromSlot(slot)}
                        isEditing={editingSlotId === slot.id}
                        isDirty={isCellDirty(slot)}
                        error={cellErrors[slot.id]}
                        subjectOptions={subjectOptions}
                        activityOptions={activityOptions}
                        teacherOptions={teacherOptions}
                        busySlots={busySlots}
                        onStartEdit={() => setEditingSlotId(slot.id)}
                        onConfirm={(value) => {
                          setCellValues((prev) => ({ ...prev, [slot.id]: value }));
                          setCellErrors((prev) => {
                            if (!prev[slot.id]) return prev;
                            const next = { ...prev };
                            delete next[slot.id];
                            return next;
                          });
                          setEditingSlotId(null);
                        }}
                        onDeleteRequest={() => setSlotToDelete(slot)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={!!slotToDelete}
        onClose={() => setSlotToDelete(null)}
        onConfirm={confirmDelete}
        title="Clear this period?"
        message={
          slotToDelete
            ? `Remove the assignment for ${dayLabel(slotToDelete.day_of_week)} Period ${slotToDelete.period_number}?`
            : ''
        }
        confirmLabel="Yes, Clear"
        isLoading={deleteMutation.isPending}
      />
    </Card>
  );
};

interface PeriodAllocationGridProps {
  timetableId: number;
  branchId: number;
  /** Lets the empty-state send the admin straight to the Sections tab to fix the gap. */
  onGoToSections?: () => void;
}

export const PeriodAllocationGrid: React.FC<PeriodAllocationGridProps> = ({ timetableId, branchId, onGoToSections }) => {
  const { data, isLoading } = useTimetableSlots(timetableId);
  const { data: busySlots } = useTeacherBusySlots(branchId);
  const regenerateMutation = useRegenerateTimetable();

  const sections = useMemo(() => {
    const grouped: Record<number, TimetableSlotData[]> = {};
    (data?.slots || []).forEach((slot) => {
      grouped[slot.section_id] = grouped[slot.section_id] || [];
      grouped[slot.section_id].push(slot);
    });
    return grouped;
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
        <p>Loading period allocation grid...</p>
      </div>
    );
  }

  if (Object.keys(sections).length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
        <AlertTriangle className="w-10 h-10 text-amber-400 mb-4" />
        <p className="text-slate-700 font-bold mb-1">No sections found for this Timetable's Group</p>
        <p className="text-sm text-slate-500 max-w-md mb-5">
          This Group's level(s) don't have any Sections in this campus yet. Add a Section for the
          relevant level, then come back and click Regenerate to build the grid.
        </p>
        <div className="flex items-center gap-3">
          {onGoToSections && (
            <Button onClick={onGoToSections} leftIcon={<Plus size={16} />}>
              Add a Section
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => regenerateMutation.mutate({ id: timetableId, data: {} })}
            disabled={regenerateMutation.isPending}
          >
            {regenerateMutation.isPending ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(sections).map(([sectionId, sectionSlots]) => {
        const section = sectionSlots[0]?.section;
        const label = section ? `${section.school_class?.name || ''} ${section.name}`.trim() : `Section #${sectionId}`;

        return (
          <SectionScheduleBlock
            key={sectionId}
            sectionLabel={label}
            sectionSlots={sectionSlots}
            timetableId={timetableId}
            branchId={branchId}
            busySlots={busySlots || []}
          />
        );
      })}
    </div>
  );
};
