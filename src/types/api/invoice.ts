export type InvoiceStatus = 'unpaid' | 'partial' | 'paid' | 'carried_forward';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque';

export interface InvoiceParent {
  id: number;
  father_name?: string;
  mother_name?: string;
  father_contact_no?: string;
  mother_contact_no?: string;
  father_cnic?: string;
  mother_cnic?: string;
  father_occupation?: string;
  mother_occupation?: string;
  father_education?: string;
  address?: string;
}

export interface InvoiceStudent {
  id: number;
  name: string;
  admission_no?: string;
}

export interface CarriedFromInfo {
  invoice_id: number;
  invoice_no: string;
  original_amount: number;
}

export interface InvoiceItem {
  id: number;
  student_id: number | null;
  student?: InvoiceStudent;
  head_name: string;
  head_frequency: string;
  amount: number;
  paid: number;
  previous_paid: number;
  remaining: number;
  carried_from: CarriedFromInfo | null;
}

export interface PaymentRecord {
  id: number;
  amount_paid: number;
  wallet_used: number;
  payment_method: PaymentMethod;
  bank_name: string | null;
  reference_no: string | null;
  payment_date: string | null;
  created_at: string;
}

export interface InvoiceData {
  id: number;
  invoice_no: string;
  branch_id: number;
  student_id: number | null;
  parent_id: number;
  issue_date: string;
  due_date: string | null;
  is_overdue: boolean;
  total_amount: number;
  total_paid: number;
  remaining: number;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
  items: InvoiceItem[];
  payments?: PaymentRecord[];
  parent?: InvoiceParent;
  student?: InvoiceStudent;
  wallet_balance?: number;
}

export interface CreateInvoiceInput {
  branch_id: number;
  issue_date: string;
  due_date: string;
  student_ids: number[];
}

export interface PayInvoiceItem {
  invoice_item_id: number;
  amount: number;
}

export interface PayInvoiceInput {
  invoice_id: number;
  payment_method: PaymentMethod;
  bank_name?: string;
  reference_no?: string;
  payment_date?: string;
  use_wallet?: boolean;
  items: PayInvoiceItem[];
}

export interface PayInvoiceResponse {
  success: boolean;
  message: string;
  amount_paid: number;
  wallet_used: number;
  wallet_balance: number;
  invoice_status: InvoiceStatus;
}

export interface WalletData {
  parent_id: number;
  balance: number;
}
