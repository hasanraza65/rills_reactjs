export interface ParentData {
  id: number;
  added_by: number;
  branch_id: number;
  address: string;
  created_at: string;
  updated_at: string;
  father_name: string;
  father_cnic: string;
  father_education: string;
  father_occupation: string;
  father_contact_no: string;
  mother_name: string;
  mother_cnic: string;
  mother_education: string;
  mother_occupation: string;
  mother_contact_no: string;
  guardian_type: 'father' | 'mother' | 'other';
  guardian_name?: string;
  guardian_cnic?: string;
  guardian_education?: string;
  guardian_occupation?: string;
  guardian_contact_no?: string;
}

export interface CreateParentInput {
  branch_id: number;
  father_name: string;
  father_cnic: string;
  father_education: string;
  father_occupation: string;
  father_contact_no: string;
  mother_name: string;
  mother_cnic: string;
  mother_education: string;
  mother_occupation: string;
  mother_contact_no: string;
  address: string;
  guardian_type: 'father' | 'mother' | 'other';
  guardian_name?: string;
  guardian_cnic?: string;
  guardian_education?: string;
  guardian_occupation?: string;
  guardian_contact_no?: string;
}

export interface UpdateParentInput {
  father_name?: string;
  father_cnic?: string;
  father_education?: string;
  father_occupation?: string;
  father_contact_no?: string;
  mother_name?: string;
  mother_cnic?: string;
  mother_education?: string;
  mother_occupation?: string;
  mother_contact_no?: string;
  address?: string;
  guardian_type?: 'father' | 'mother' | 'other';
  guardian_name?: string;
  guardian_cnic?: string;
  guardian_education?: string;
  guardian_occupation?: string;
  guardian_contact_no?: string;
}
