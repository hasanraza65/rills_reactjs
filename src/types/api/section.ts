/**
 * @fileoverview Type definitions for Class Sections.
 */

export interface SectionClass {
  id: number;
  added_by: number;
  branch_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface SectionData {
  id: number;
  added_by: number;
  branch_id: number;
  school_class_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  school_class: SectionClass;
}

export interface CreateSectionInput {
  name: string;
  school_class_id: number;
  branch_id: number;
}

export interface UpdateSectionInput {
  name?: string;
  school_class_id?: number;
}
