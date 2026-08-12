/**
 * @fileoverview API types for Academic Sessions (System Settings). Mirrors the
 * Laravel `academic_sessions` table — used to define a school year's date range,
 * and which one is currently "active" (consumed by the Examination module).
 */

export interface AcademicSession {
  id: number;
  branch_id: number;
  name: string;
  start_date: string; // yyyy-mm-dd
  end_date: string; // yyyy-mm-dd
  is_active: boolean;
  added_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAcademicSessionInput {
  branch_id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
}

export interface UpdateAcademicSessionInput {
  name: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
}
