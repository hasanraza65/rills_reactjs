import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../lib/services/invoice-service';
import { CreateInvoiceInput } from '../types/api/invoice';

export const useInvoices = (branchId: number) => {
  return useQuery({
    queryKey: ['invoices', 'list', branchId],
    queryFn: () => invoiceService.getInvoices(branchId),
    enabled: branchId > 0,
  });
};

export const useInvoice = (id: number | null) => {
  return useQuery({
    queryKey: ['invoices', 'detail', id],
    queryFn: () => invoiceService.getInvoice(id!),
    enabled: !!id,
  });
};

export const useWallet = (parentId: number | null | undefined) => {
  return useQuery({
    queryKey: ['wallet', parentId],
    queryFn: () => invoiceService.getWallet(parentId!),
    enabled: !!parentId,
  });
};

export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceInput) => invoiceService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => invoiceService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
