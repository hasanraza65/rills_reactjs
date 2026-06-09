/**
 * @fileoverview API types for class-subjects.
 */

export interface ClassSubjectData {
  id: number;
  section_id: number;
  name: string;
  teacher_name?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any; // Allow extra fields from API
}

export interface ClassSubjectsResponse {
  success: boolean;
  data: ClassSubjectData[];
}

export interface CreateClassSubjectInput {
  class_id: number;
  section_id: number;
  teacher_id: number;
  subject_name: string;
}

export interface UpdateClassSubjectInput {
  class_id: number;
  section_id: number;
  teacher_id: number;
  subject_name: string;
  _method: 'PUT';
}
