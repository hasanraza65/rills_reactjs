import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../lib/services/invoice-service';
import { CreateInvoiceInput } from '../types/api/invoice';

/**
 * Hook to fetch the list of invoices.
 */
export const useInvoices = (branchId: number = 1) => {
  return useQuery({
    queryKey: ['invoices', 'list', branchId],
    queryFn: () => invoiceService.getInvoices(branchId),
  });
};

/**
 * Hook to fetch a single invoice.
 */
export const useInvoice = (id: number | null) => {
  return useQuery({
    queryKey: ['invoices', 'detail', id],
    queryFn: () => invoiceService.getInvoice(id!),
    enabled: !!id,
  });
};

/**
 * Hook to generate a new invoice.
 */
export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceInput) => invoiceService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
    },
  });
};

/**
 * Hook to delete an invoice.
 */
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => invoiceService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
