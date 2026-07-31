import { useState } from 'react';
import { DurationMatrix, emptyMatrixRow } from '../lib/timetable-days';

/**
 * Shared state + row/column editing logic for the Period Cells grid (Period No. x
 * day-of-week duration matrix), used by both the standalone "Add Periods" form and
 * the Add Group wizard's periods step.
 */
export const usePeriodCells = () => {
  const [periods, setPeriods] = useState<number[]>([1]);
  const [matrix, setMatrix] = useState<DurationMatrix>({ 1: emptyMatrixRow() });

  const reset = (next?: { periods: number[]; matrix: DurationMatrix }) => {
    if (next && next.periods.length) {
      setPeriods(next.periods);
      setMatrix(next.matrix);
    } else {
      setPeriods([1]);
      setMatrix({ 1: emptyMatrixRow() });
    }
  };

  const addRow = () => {
    const nextNumber = periods.length ? Math.max(...periods) + 1 : 1;
    setPeriods([...periods, nextNumber]);
    setMatrix({ ...matrix, [nextNumber]: emptyMatrixRow() });
  };

  const removeRow = (periodNumber: number) => {
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

  // Copies one day's minutes (across every period row) into one or more other days,
  // e.g. filling Monday then copying it onto Tuesday & Wednesday in one go.
  const copyColumn = (sourceDay: number, targetDays: number[]) => {
    const next: DurationMatrix = {};
    periods.forEach((p) => {
      const sourceValue = matrix[p]?.[sourceDay] ?? '';
      next[p] = { ...matrix[p] };
      targetDays.forEach((td) => {
        next[p][td] = sourceValue;
      });
    });
    setMatrix(next);
  };

  return { periods, matrix, reset, addRow, removeRow, copyRowDown, setDuration, copyColumn };
};
