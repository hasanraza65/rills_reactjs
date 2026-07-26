/**
 * @fileoverview API types for Time Table Activities — non-teaching schedule blocks
 * (Assembly, Lunch, Break, Library, Sports, ...). branch_id null = global, visible to
 * every campus.
 */

export interface TimetableActivityData {
  id: number;
  branch_id: number | null;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTimetableActivityInput {
  branch_id?: number | null;
  name: string;
}

export interface UpdateTimetableActivityInput {
  name: string;
}
