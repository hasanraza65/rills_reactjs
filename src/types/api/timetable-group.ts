/**
 * @fileoverview API types for Time Table Groups (named grade-level groupings, e.g.
 * "Level Six to Seven Time Table", reused by Periods templates and generated Timetables).
 */

export interface TimetableGroupClass {
  id: number;
  name: string;
}

export interface TimetableGroupData {
  id: number;
  branch_id: number;
  name: string;
  added_by: number | null;
  created_at: string;
  updated_at: string;
  classes?: TimetableGroupClass[];
}

export interface CreateTimetableGroupInput {
  branch_id: number;
  name: string;
  class_ids: number[];
}

export interface UpdateTimetableGroupInput {
  name: string;
  class_ids: number[];
}
