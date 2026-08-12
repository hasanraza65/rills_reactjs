import React, { useMemo, useState } from 'react';
import { renderToString } from 'react-dom/server';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Loader2, Printer, UserSquare2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { useStaffMembers } from '../../hooks/use-staff-members';
import { useTeacherPrint } from '../../hooks/use-timetable';
import { useBranchStore } from '../../store/use-branch-store';
import { useAuthStore } from '../../store/use-auth-store';
import { dayLabel } from '../../lib/timetable-days';
import { TeacherTimeTablePDFTemplate } from './TeacherTimeTablePDFTemplate';

// Anyone can be picked here (Branch Admin, Admin, Teacher, etc.) except Super
// Admin, who manages the system rather than teaching/supervising periods.
const SUPER_ADMIN_ROLE_ID = 1;

interface TeacherTimeTablePrintProps {
  /** Teachers viewing their own schedule skip the picker and only ever see themselves. */
  selfOnly?: boolean;
}

export const TeacherTimeTablePrint: React.FC<TeacherTimeTablePrintProps> = ({ selfOnly = false }) => {
  const { selectedBranchId } = useBranchStore();
  const { user } = useAuthStore();
  const branchId = selectedBranchId || 1;

  const { data: staff } = useStaffMembers(selfOnly ? undefined : branchId);
  const teacherOptions = (staff || []).filter((s) => s.user_role !== SUPER_ADMIN_ROLE_ID);

  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(selfOnly ? (user?.id ?? null) : null);
  const [isPrinting, setIsPrinting] = useState(false);

  const { data, isLoading } = useTeacherPrint(selectedTeacherId);

  const periodNumbers = useMemo(
    () => Array.from(new Set<number>(data?.days.flatMap((d) => d.periods.map((p) => p.period_number)) ?? [])).sort((a, b) => a - b),
    [data]
  );
  const timeLabelForPeriod = (periodNumber: number): string =>
    data?.days.flatMap((d) => d.periods).find((p) => p.period_number === periodNumber)?.time_label || '';

  const handlePrint = async () => {
    if (!data) return;
    setIsPrinting(true);
    try {
      const htmlString = renderToString(<TeacherTimeTablePDFTemplate data={data} />);
      const opt = {
        margin: 10,
        filename: `Timetable_${data.teacher.name}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
          // See TimeTableGenerate.tsx's handlePrintDay for why this matters: without
          // it, html2canvas renders the detached template at the current window's
          // width instead of its own, clipping it before the page-fit scaling ever runs.
          windowWidth: 1040,
          onclone: (doc: Document) => {
            doc.querySelectorAll('style,link[rel="stylesheet"]').forEach((el) => el.remove());
          },
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'landscape' as const },
      };
      await html2pdf().set(opt).from(htmlString).save();
    } catch (e) {
      console.error('Teacher print error:', e);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Teacher Time Table Print</h3>
          <p className="text-sm text-slate-500">{selfOnly ? 'Your full weekly schedule.' : "View and print any teacher's full weekly schedule."}</p>
        </div>
        {data && (
          <Button onClick={handlePrint} leftIcon={isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />} disabled={isPrinting}>
            {isPrinting ? 'Preparing PDF...' : 'Print Timetable'}
          </Button>
        )}
      </div>

      {!selfOnly && (
        <Card padding="md">
          <label className="text-sm font-bold text-slate-700 mb-2 block">Select Teacher</label>
          <div className="w-full sm:w-80">
            <Select
              value={selectedTeacherId ? String(selectedTeacherId) : ''}
              onChange={(v) => setSelectedTeacherId(v ? Number(v) : null)}
              options={teacherOptions.map((t) => ({ value: String(t.id), label: t.name }))}
              placeholder="Select a teacher..."
            />
          </div>
        </Card>
      )}

      {!selectedTeacherId ? (
        <EmptyState icon={UserSquare2} title="No Teacher Selected" description="Choose a teacher above to view their weekly timetable." />
      ) : isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
          <p>Loading timetable...</p>
        </div>
      ) : data ? (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Day</th>
                  {periodNumbers.map((p) => (
                    <th key={p} className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-center">
                      <div>P{p}</div>
                      <div className="text-[9px] font-medium normal-case opacity-70 mt-0.5">{timeLabelForPeriod(p)}</div>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-center">Free</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.days.map((day) => (
                  <tr key={day.day_of_week} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-700">{dayLabel(day.day_of_week)}</td>
                    {periodNumbers.map((p) => {
                      const period = day.periods.find((dp) => dp.period_number === p);
                      return (
                        <td key={p} className="px-3 py-3 text-center">
                          {period?.subject_label ? (
                            <div>
                              <p className="font-bold text-slate-800 text-xs">{period.subject_label}</p>
                              <p className="text-[10px] text-slate-400">{period.level_section_label}</p>
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center font-bold text-brand-600">{day.free_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
};
