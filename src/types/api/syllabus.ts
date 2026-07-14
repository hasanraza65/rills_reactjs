/**
 * @fileoverview API types for syllabus entries.
 */

export type SyllabusStatus = 'Pending' | 'Approved';

export interface SyllabusClassSubject {
  id: number;
  branch_id: number;
  class_id: number;
  section_id: number;
  teacher_id: number;
  subject_name: string;
  class?: { id: number; name: string };
  section?: { id: number; name: string };
}

export interface SyllabusData {
  id: number;
  branch_id: number;
  subject_id: number;
  /** The syllabus's date field. Backend column/param is still named `month`. */
  month: string;
  page: string | null;
  link: string | null;
  content: string;
  status: SyllabusStatus | null;
  created_at: string;
  updated_at: string;
  subject?: SyllabusClassSubject;
}

export interface SyllabusesResponse {
  success: boolean;
  data: SyllabusData[];
}

export interface SyllabusDetailResponse {
  success: boolean;
  data: SyllabusData;
}

/** Query params accepted by GET /syllabus. The backend scopes by role on top of these. */
export interface SyllabusFilters {
  branch_id?: number;
  section_id?: number;
  subject_id?: number;
  date?: string;
}

export interface CreateSyllabusInput {
  subject_id: number;
  month: string;
  page?: string;
  link?: string;
  content: string;
  status?: SyllabusStatus;
}

/** Every editable field — an edit must never silently drop the ones it doesn't show. */
export interface UpdateSyllabusInput {
  subject_id?: number;
  month?: string;
  page?: string;
  link?: string;
  content?: string;
  status?: SyllabusStatus;
  _method: 'PUT';
}
