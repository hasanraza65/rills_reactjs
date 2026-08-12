/**
 * @fileoverview API types for generated Timetable instances and their editable slot grid.
 */

export interface TimetableData {
  id: number;
  branch_id: number;
  timetable_group_id: number;
  period_set_id: number;
  title: string;
  date_from: string;
  date_to: string;
  school_time_from: string;
  is_active: boolean;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  group?: { id: number; name: string };
  period_set?: { id: number; title: string };
  creator?: { id: number; name: string };
  updater?: { id: number; name: string };
}

export interface TimetableSlotSection {
  id: number;
  name: string;
  school_class_id: number;
  school_class?: { id: number; name: string };
}

export interface TimetableSlotClassSubject {
  id: number;
  subject_name: string;
  teacher_id: number;
  teacher?: { id: number; name: string };
}

export interface TimetableSlotActivity {
  id: number;
  name: string;
}

export interface TimetableSlotData {
  id: number;
  timetable_id: number;
  section_id: number;
  day_of_week: number; // ISO-8601: 1=Mon ... 7=Sun
  period_number: number;
  start_time: string;
  end_time: string;
  class_subject_id: number | null;
  teacher_id: number | null;
  timetable_activity_id: number | null;
  section?: TimetableSlotSection;
  class_subject?: TimetableSlotClassSubject;
  teacher?: { id: number; name: string };
  activity?: TimetableSlotActivity;
}

export interface TimetableSlotsResponse {
  timetable: TimetableData;
  slots: TimetableSlotData[];
}

/** One teacher-assigned slot from any of this branch's ACTIVE Timetables — used to
 * pre-disable a teacher in the Period Allocation Grid picker when they're already
 * booked elsewhere at an overlapping day/time. */
export interface TeacherBusySlot {
  id: number;
  teacher_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  group_name: string | null;
  section_name: string | null;
}

export interface CreateTimetableInput {
  branch_id: number;
  timetable_group_id: number;
  period_set_id: number;
  title: string;
  date_from: string;
  date_to: string;
  school_time_from: string;
  is_active?: boolean;
  /** Copies every Subject/Activity/Teacher assignment from this Timetable's slots
   * into the new one (matched by section/day/period) — the "copy settings" option. */
  copy_from_timetable_id?: number;
}

/** Meta-only edit — see TimetableController::update for why dates/period_set aren't here. */
export interface UpdateTimetableInput {
  title: string;
  is_active: boolean;
}

export interface RegenerateTimetableInput {
  timetable_group_id?: number;
  period_set_id?: number;
  date_from?: string;
  date_to?: string;
  school_time_from?: string;
  title?: string;
}

export interface UpdateTimetableSlotInput {
  class_subject_id?: number | null;
  timetable_activity_id?: number | null;
  teacher_id?: number | null;
}

export interface DailyPrintPeriod {
  period_number: number;
  time_label: string;
  subject_label: string | null;
  teacher_name: string | null;
}

export interface DailyPrintSection {
  section_id: number;
  level_section_label: string;
  periods: DailyPrintPeriod[];
}

export interface DailyPrintResponse {
  timetable: TimetableData;
  group_name: string;
  day_of_week: number;
  sections: DailyPrintSection[];
}

export interface TeacherPrintPeriod {
  period_number: number;
  time_label: string;
  subject_label: string | null;
  level_section_label: string;
}

export interface TeacherPrintDay {
  day_of_week: number;
  periods: TeacherPrintPeriod[];
  free_count: number;
}

export interface TeacherPrintResponse {
  teacher: { id: number; name: string };
  days: TeacherPrintDay[];
}
