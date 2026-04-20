export interface AdmissionKeyStudent {
  name: string;
  class: string;
}

export interface AdmissionKeyData {
  id: number;
  added_by: number;
  branch_id: number;
  key: string;
  visitor_name: string;
  address: string;
  purpose: string;
  remarks: string;
  students: AdmissionKeyStudent[];
  created_at: string;
  updated_at: string;
}

export interface CreateAdmissionKeyPayload {
  branch_id: number;
  key: string;
  visitor_name: string;
  address: string;
  purpose: string;
  remarks: string;
  students: AdmissionKeyStudent[];
}

export interface AdmissionKeyResponse {
  status: boolean;
  data: AdmissionKeyData[];
}
