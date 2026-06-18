import { apiClient } from '../api-client';
import {
  InvoiceData,
  CreateInvoiceInput,
  PayInvoiceInput,
  PayInvoiceResponse,
  WalletData,
} from '../../types/api/invoice';

export const invoiceService = {
  getInvoices: async (branchId: number): Promise<InvoiceData[]> => {
    const res = await apiClient.get<{ success: boolean; data: InvoiceData[] }>('/invoices', {
      params: { branch_id: branchId },
    });
    return res.data.data;
  },

  getInvoice: async (id: number): Promise<InvoiceData> => {
    const res = await apiClient.get<InvoiceData>(`/invoices/${id}`);
    return res.data;
  },

  createInvoice: async (data: CreateInvoiceInput): Promise<InvoiceData> => {
    const res = await apiClient.post<{ success: boolean; data: InvoiceData }>('/invoices/create', data);
    return res.data.data;
  },

  deleteInvoice: async (id: number): Promise<void> => {
    await apiClient.delete(`/invoices/${id}`);
  },

  getWallet: async (parentId: number): Promise<WalletData> => {
    const res = await apiClient.get<{ success: boolean; data: WalletData }>(`/wallet/${parentId}`);
    return res.data.data;
  },

  payInvoice: async (data: PayInvoiceInput): Promise<PayInvoiceResponse> => {
    const res = await apiClient.post<PayInvoiceResponse>('/payments/pay', data);
    return res.data;
  },
};
