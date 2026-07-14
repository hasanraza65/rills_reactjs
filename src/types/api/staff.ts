export type Gender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface StaffProfile {
  id: number;
  user_id: number;
  branch_id: number | null;
  father_husband_name: string | null;
  gender: Gender | null;
  dob: string | null;
  date_of_joining: string | null;
  marital_status: MaritalStatus | null;
  whatsapp_no: string | null;
  emergency_contact_no: string | null;
  current_address: string | null;
  permanent_address: string | null;
}

export interface StaffRoleRef {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  cnic: string | null;
  phone: string | null;
  user_role: number;
  branch_id: number | null;
  avatar: string | null;
  staff_profile: StaffProfile | null;
  role: StaffRoleRef | null;
}

/** Payload for creating / updating a staff member. */
export interface StaffFormInput {
  name: string;
  father_husband_name?: string;
  cnic?: string;
  gender?: Gender | '';
  dob?: string;
  date_of_joining?: string;
  marital_status?: MaritalStatus | '';
  contact_no?: string;
  whatsapp_no?: string;
  emergency_contact_no?: string;
  current_address?: string;
  permanent_address?: string;
  user_role: number;
  branch_id?: number | null;
  email?: string;
  password?: string;
}
