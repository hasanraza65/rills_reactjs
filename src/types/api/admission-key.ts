export interface AdmissionKeyData {
  id: number;
  added_by: number;
  branch_id: number;
  key: string;
  created_at: string;
  updated_at: string;
}

export interface AdmissionKeyResponse {
  status: boolean;
  data: AdmissionKeyData[];
}
