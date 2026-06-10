/**
 * @fileoverview API types for class-subjects.
 */

export interface ClassSubjectData {
  id: number;
  branch_id: number;
  class_id: number;
  section_id: number;
  teacher_id: number;
  subject_name: string;
  created_at: string;
  updated_at: string;
  class?: { id: number; name: string };
  section?: { id: number; name: string };
  teacher?: { id: number; name: string };
  [key: string]: any;
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
