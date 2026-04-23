export interface InvoiceItem {
  id: number;
  invoice_id: number;
  student_id: number;
  head_name: string;
  amount: string;
  total_amount?: number;
  paid?: number;
  remaining?: number;
  student?: any;
  created_at: string;
  updated_at: string;
}

export interface InvoiceData {
  id: number;
  invoice_no: string;
  branch_id: number;
  student_id: number | null;
  parent_id: number;
  issue_date: string;
  due_date: string;
  total_amount: string;
  status: string;
  created_at: string;
  updated_at: string;
  items: InvoiceItem[];
  parent?: any;
  student?: any;
}

export interface CreateInvoiceInput {
  branch_id: number;
  issue_date: string;
  due_date: string;
  student_ids: number[];
}
