export interface Branch {
  id: number;
  added_by: number;
  branch_name: string;
  branch_city: string;
  branch_address: string;
  branch_phone: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBranchInput {
  branch_name: string;
  branch_city: string;
  branch_address: string;
  branch_phone: string;
}

export interface UpdateBranchInput extends Partial<CreateBranchInput> {
  _method?: "PUT";
}

export interface BranchResponse {
  status: boolean;
  data: Branch[];
}
