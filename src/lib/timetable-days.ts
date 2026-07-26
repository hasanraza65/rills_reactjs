/**
 * @fileoverview Shared ISO-8601 day-of-week labels (1=Mon ... 7=Sun) used across
 * the Time Table module's forms, grid, and print templates.
 */

export const TIMETABLE_DAYS: { value: number; label: string }[] = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];

export const dayLabel = (day: number): string =>
  TIMETABLE_DAYS.find((d) => d.value === day)?.label || `Day ${day}`;
