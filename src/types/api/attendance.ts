export type AttendanceStatusCode = 'P' | 'A' | 'L' | 'H';

export const STATUS_LABELS: Record<AttendanceStatusCode, string> = {
  P: 'Present',
  A: 'Absent',
  L: 'Leave',
  H: 'Half-day',
};

// ─── Student Attendance ────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id?: number;
  status: AttendanceStatusCode;
  remarks?: string | null;
}

export interface StudentInSection {
  id: number;
  name: string;
  admission_no: string | null;
  gender: string | null;
  attendance: AttendanceRecord | null;
}

export interface SectionViewData {
  section: { id: number; name: string; class_name: string | null };
  date: string;
  already_marked: boolean;
  students: StudentInSection[];
}

export interface MarkStudentRecord {
  student_id: number;
  status: AttendanceStatusCode;
  remarks?: string | null;
}

export interface MarkStudentAttendanceInput {
  branch_id: number;
  section_id: number;
  date: string;
  records: MarkStudentRecord[];
}

export interface StudentReportRow {
  student_id: number;
  student_name: string;
  father_name: string | null;
  admission_no: string | null;
  records: Record<string, AttendanceRecord | null>;
  totals: Record<AttendanceStatusCode, number>;
}

export interface StudentReportData {
  data: StudentReportRow[];
  dates: string[];
}

export interface StudentParentViewData {
  student: {
    id: number;
    name: string;
    class_name: string | null;
    section_name: string | null;
  };
  records: { date: string; status: AttendanceStatusCode; remarks: string | null }[];
  totals: Record<AttendanceStatusCode, number>;
}

export interface MyChild {
  id: number;
  name: string;
  admission_no: string | null;
  class_name: string | null;
  section_name: string | null;
}

export interface StudentAttendanceSummary {
  date: string;
  total_marked: number;
  counts: Record<AttendanceStatusCode, number>;
  present_percentage: number;
  trends: { date: string; label: string; present_pct: number; total: number }[];
  by_section: {
    section_id: number;
    section_name: string;
    total: number;
    present: number;
    present_pct: number;
  }[];
}

// ─── Staff Attendance ──────────────────────────────────────────────────────────

export interface StaffMember {
  id: number;
  name: string;
  role: number;
  avatar: string | null;
  attendance: AttendanceRecord | null;
}

export interface BranchViewData {
  branch_id: number;
  date: string;
  already_marked: boolean;
  staff: StaffMember[];
}

export interface MarkStaffRecord {
  user_id: number;
  status: AttendanceStatusCode;
  remarks?: string | null;
}

export interface MarkStaffAttendanceInput {
  branch_id: number;
  date: string;
  records: MarkStaffRecord[];
}

export interface StaffReportRow {
  user_id: number;
  name: string;
  role: string;
  records: Record<string, AttendanceRecord | null>;
  totals: Record<AttendanceStatusCode, number>;
}

export interface StaffReportData {
  data: StaffReportRow[];
  dates: string[];
}

export interface StaffAttendanceSummary {
  date: string;
  total_marked: number;
  counts: Record<AttendanceStatusCode, number>;
  present_percentage: number;
  trends: { date: string; label: string; present_pct: number; total: number }[];
}
