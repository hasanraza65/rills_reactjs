import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../lib/services/invoice-service';
import { PayInvoiceInput } from '../types/api/invoice';

export const usePayInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PayInvoiceInput) => invoiceService.payInvoice(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
};
