import React, { useState } from 'react';
import { Plus, Trash2, Copy, CopyPlus, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { SCHOOL_DAYS as DAYS, DurationMatrix } from '../../lib/timetable-days';

interface PeriodCellsGridProps {
  periods: number[];
  matrix: DurationMatrix;
  onAddRow: () => void;
  onRemoveRow: (periodNumber: number) => void;
  onCopyRowDown: (periodNumber: number) => void;
  onSetDuration: (periodNumber: number, day: number, value: string) => void;
  onCopyColumn: (sourceDay: number, targetDays: number[]) => void;
}

export const PeriodCellsGrid: React.FC<PeriodCellsGridProps> = ({
  periods,
  matrix,
  onAddRow,
  onRemoveRow,
  onCopyRowDown,
  onSetDuration,
  onCopyColumn,
}) => {
  const [copySourceDay, setCopySourceDay] = useState<number>(DAYS[0].value);
  const [copyTargetDays, setCopyTargetDays] = useState<number[]>([]);

  const otherDays = DAYS.filter((d) => d.value !== copySourceDay);
  const allSelected = otherDays.length > 0 && otherDays.every((d) => copyTargetDays.includes(d.value));

  const toggleCopyTarget = (day: number) => {
    setCopyTargetDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const toggleAllTargets = () => {
    setCopyTargetDays(allSelected ? [] : otherDays.map((d) => d.value));
  };

  const applyCopy = () => {
    if (copyTargetDays.length === 0) return;
    onCopyColumn(copySourceDay, copyTargetDays);
    setCopyTargetDays([]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-slate-700">Add Periods</label>
        <span className="text-xs text-slate-400">Leave a cell blank if that period doesn't run on that day.</span>
      </div>

      <div className="mb-4 p-4 bg-brand-50/40 border border-brand-100 rounded-2xl">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-100 text-brand-600 shrink-0">
            <CopyPlus size={15} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-700">Copy day durations</p>
            <p className="text-xs text-slate-500">Fill in one day, then copy its minutes onto other days in one click.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={copySourceDay}
            onChange={(e) => {
              const day = Number(e.target.value);
              setCopySourceDay(day);
              setCopyTargetDays((prev) => prev.filter((d) => d !== day));
            }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20 outline-none"
          >
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          <ArrowRight size={14} className="text-brand-400 shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={toggleAllTargets}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors text-xs font-bold ${
                allSelected ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-dashed border-slate-300 text-slate-500'
              }`}
            >
              {allSelected ? 'Clear all' : 'All days'}
            </button>
            {otherDays.map((d) => (
              <label
                key={d.value}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors text-xs font-bold ${
                  copyTargetDays.includes(d.value) ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={copyTargetDays.includes(d.value)}
                  onChange={() => toggleCopyTarget(d.value)}
                  className="accent-brand-500"
                />
                {d.label}
              </label>
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={applyCopy}
            disabled={copyTargetDays.length === 0}
            title="Copy this day's minutes onto the checked days"
            className="ml-auto"
          >
            Apply
          </Button>
        </div>
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
                      onChange={(e) => onSetDuration(periodNumber, d.value, e.target.value)}
                      className="w-16 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-center text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                    />
                  </td>
                ))}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onCopyRowDown(periodNumber)}
                      disabled={index === periods.length - 1}
                      title="Copy this row's minutes down to the next period"
                      className="p-1.5 text-slate-300 hover:bg-brand-50 hover:text-brand-600 rounded-lg transition-all disabled:opacity-30"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveRow(periodNumber)}
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
        onClick={onAddRow}
        className="mt-3 text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
      >
        <Plus size={16} /> Add another period row
      </button>
    </div>
  );
};
