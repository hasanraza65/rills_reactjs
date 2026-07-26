import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { renderToString } from 'react-dom/server';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Loader2, Trash2, Grid3x3, Printer, X, CalendarClock } from 'lucide-react';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { useTimetables, useDeleteTimetable, useUpdateTimetable } from '../../hooks/use-timetable';
import { timetableService } from '../../lib/services/timetable-service';
import { TimetableData } from '../../types/api/timetable';
import { useBranches } from '../../hooks/use-branch';
import { useBranchStore } from '../../store/use-branch-store';
import { TIMETABLE_DAYS } from '../../lib/timetable-days';
import { TimeTableDailyPrintTemplate } from './TimeTableDailyPrintTemplate';
import { PeriodAllocationGrid } from './PeriodAllocationGrid';

interface TimeTableListProps {
  onTabChange?: (tab: string) => void;
}

export const TimeTableList: React.FC<TimeTableListProps> = ({ onTabChange }) => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId || 1;

  const { data: timetables, isLoading } = useTimetables(branchId);
  const { data: branches } = useBranches();
  const deleteMutation = useDeleteTimetable();
  const updateMutation = useUpdateTimetable();

  const toggleActive = (tt: TimetableData) => {
    updateMutation.mutate({ id: tt.id, data: { title: tt.title, is_active: !tt.is_active } });
  };

  const [gridTimetable, setGridTimetable] = useState<TimetableData | null>(null);
  const [printMenuFor, setPrintMenuFor] = useState<number | null>(null);
  const [printingDay, setPrintingDay] = useState<{ timetableId: number; day: number } | null>(null);
  const [timetableToDelete, setTimetableToDelete] = useState<TimetableData | null>(null);

  const branchName = (id: number) => branches?.find((b) => b.id === id)?.branch_name || `Branch #${id}`;

  const handlePrintDay = async (timetable: TimetableData, day: number) => {
    setPrintMenuFor(null);
    setPrintingDay({ timetableId: timetable.id, day });
    try {
      const data = await timetableService.getDailyPrint(timetable.id, day);
      const htmlString = renderToString(<TimeTableDailyPrintTemplate data={data} />);
      const opt = {
        margin: 10,
        filename: `Timetable_${timetable.title}_${TIMETABLE_DAYS.find((d) => d.value === day)?.label}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
          onclone: (doc: Document) => {
            doc.querySelectorAll('style,link[rel="stylesheet"]').forEach((el) => el.remove());
          },
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'landscape' as const },
      };
      await html2pdf().set(opt).from(htmlString).save();
    } catch (e) {
      console.error('Daily print error:', e);
    } finally {
      setPrintingDay(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Time Table Level List</h3>
        <p className="text-sm text-slate-500">Every generated Timetable — edit its grid, print a day, or delete it.</p>
      </div>

      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
            <p>Loading timetables...</p>
          </div>
        ) : !timetables || timetables.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No Timetables Generated"
            description="Use the Time Table tab to generate one from a Group and Periods template."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group Time Table</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campus</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created By</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modified By</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {timetables.map((tt) => (
                  <tr key={tt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{tt.group?.name || tt.title}</p>
                      <p className="text-xs text-slate-400">{tt.title}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{branchName(tt.branch_id)}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleActive(tt)}
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
                    <td className="px-6 py-4 text-sm text-slate-600">{tt.creator?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{tt.updater?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 relative">
                        <button
                          onClick={() => setGridTimetable(tt)}
                          className="p-2 text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all"
                          title="Edit Grid"
                        >
                          <Grid3x3 size={16} />
                        </button>
                        <button
                          onClick={() => setPrintMenuFor(printMenuFor === tt.id ? null : tt.id)}
                          className="p-2 text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all"
                          title="Print by Day"
                        >
                          {printingDay?.timetableId === tt.id ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                        </button>
                        <button
                          onClick={() => setTimetableToDelete(tt)}
                          className="p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>

                        {printMenuFor === tt.id && (
                          <div className="absolute right-0 top-10 z-20 bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-36">
                            {TIMETABLE_DAYS.map((d) => (
                              <button
                                key={d.value}
                                onClick={() => handlePrintDay(tt, d.value)}
                                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-600"
                              >
                                {d.label}
                              </button>
                            ))}
                          </div>
                        )}
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
        {gridTimetable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-900">{gridTimetable.title}</h3>
                <button onClick={() => setGridTimetable(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto bg-slate-50/50">
                <PeriodAllocationGrid
                  timetableId={gridTimetable.id}
                  branchId={gridTimetable.branch_id}
                  onGoToSections={onTabChange ? () => onTabChange('sections') : undefined}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={!!timetableToDelete}
        onClose={() => setTimetableToDelete(null)}
        onConfirm={() => timetableToDelete && deleteMutation.mutate(timetableToDelete.id, { onSuccess: () => setTimetableToDelete(null) })}
        title="Delete Timetable?"
        message={`Are you sure you want to delete "${timetableToDelete?.title}"? This will remove its entire period allocation grid.`}
        confirmLabel="Yes, Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
