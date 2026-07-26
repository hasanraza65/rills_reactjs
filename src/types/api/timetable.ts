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

export interface CreateTimetableInput {
  branch_id: number;
  timetable_group_id: number;
  period_set_id: number;
  title: string;
  date_from: string;
  date_to: string;
  school_time_from: string;
  is_active?: boolean;
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
