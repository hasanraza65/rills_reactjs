import { apiClient } from '../api-client';
import { InvoiceData, CreateInvoiceInput } from '../../types/api/invoice';

export const invoiceService = {
  /**
   * Fetches the list of invoices for a given branch.
   */
  getInvoices: async (branchId: number = 1): Promise<InvoiceData[]> => {
    const response = await apiClient.get<InvoiceData[]>('/invoices', {
      params: { branch_id: branchId }
    });
    return response.data;
  },

  /**
   * Creates a new invoice.
   */
  createInvoice: async (data: CreateInvoiceInput): Promise<any> => {
    const response = await apiClient.post('/invoices/create', data);
    return response.data;
  }
};
