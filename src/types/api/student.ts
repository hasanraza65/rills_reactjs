import { ClassData } from './class';
import { SectionData } from './section';
import { ParentData } from './parent';

export interface StudentData {
  id: number;
  added_by: number;
  branch_id: number;
  admission_no: string;
  admission_date: string | null;
  photo: string | null;
  name: string;
  dob: string;
  gender: 'male' | 'female';
  nationality: string;
  address: string;
  home_contact: string;
  currently_studying: string;
  class_id: number;
  section_id: number;
  previous_schools: string[];
  health_issues: string[];
  health_details: string;
  parent_id: number;
  source: string;
  attachments: any | null;
  created_at: string;
  updated_at: string;
  class?: ClassData;
  section?: SectionData;
  parent?: ParentData;
  siblings?: StudentData[];
}

export interface CreateStudentInput {
  branch_id: number;
  name: string;
  admission_no?: string;
  admission_date?: string;
  class_id: number;
  section_id: number;
  parent_id: number;
  gender: 'male' | 'female';
  dob: string;
  nationality?: string;
  address?: string;
  home_contact: string;
  currently_studying?: string;
  previous_schools?: string[];
  health_issues?: string[];
  health_details?: string;
  source?: string;
}

export interface UpdateStudentInput extends Partial<CreateStudentInput> {}
