/**
 * @fileoverview API types for classes and sections.
 */

export interface ClassSection {
  id: number;
  added_by: number;
  branch_id: number;
  school_class_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ClassData {
  id: number;
  added_by: number;
  branch_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  sections?: ClassSection[];
}

export interface CreateClassInput {
  name: string;
  branch_id: number;
}

export interface UpdateClassInput {
  name: string;
}
