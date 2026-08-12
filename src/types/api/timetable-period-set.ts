/**
 * @fileoverview API types for Time Table Periods templates (the duration matrix:
 * how many minutes period N lasts on day D, for a given Time Table Group).
 */

export interface TimetablePeriodSetSlotData {
  id?: number;
  day_of_week: number; // ISO-8601: 1=Mon ... 7=Sun
  period_number: number;
  duration_minutes: number;
}

export interface TimetablePeriodSetData {
  id: number;
  branch_id: number;
  timetable_group_id: number;
  title: string;
  added_by: number | null;
  created_at: string;
  updated_at: string;
  group?: { id: number; name: string };
  slots?: TimetablePeriodSetSlotData[];
}

export interface CreateTimetablePeriodSetInput {
  branch_id: number;
  timetable_group_id: number;
  title: string;
  slots: TimetablePeriodSetSlotData[];
}

export interface UpdateTimetablePeriodSetInput {
  title: string;
  slots: TimetablePeriodSetSlotData[];
}
