import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

interface PaymentItem {
  invoice_item_id: number;
  amount: number;
}

interface PayInvoicePayload {
  invoice_id: number;
  payment_method: string;
  use_wallet?: boolean;
  items: PaymentItem[];
}

export const usePayInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PayInvoicePayload) => {
      const response = await apiClient.post('/payments/pay', payload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate both lists and details to reflect new paid amounts
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
