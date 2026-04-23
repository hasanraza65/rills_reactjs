export interface InvoiceData {
  id: number;
  branch_id: number;
  issue_date: string;
  due_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  // Add other fields as per API response if known
}

export interface CreateInvoiceInput {
  branch_id: number;
  issue_date: string;
  due_date: string;
  student_ids: number[];
}
