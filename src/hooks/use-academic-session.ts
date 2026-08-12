import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicSessionService } from '../lib/services/academic-session-service';
import { CreateAcademicSessionInput, UpdateAcademicSessionInput } from '../types/api/academic-session';

export const useAcademicSessions = (branchId: number = 1) =>
  useQuery({
    queryKey: ['academic-sessions', branchId],
    queryFn: () => academicSessionService.getSessions(branchId),
  });

export const useCreateAcademicSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAcademicSessionInput) => academicSessionService.createSession(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic-sessions'] }),
  });
};

export const useUpdateAcademicSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAcademicSessionInput }) =>
      academicSessionService.updateSession(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic-sessions'] }),
  });
};

export const useDeleteAcademicSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => academicSessionService.deleteSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic-sessions'] }),
  });
};
