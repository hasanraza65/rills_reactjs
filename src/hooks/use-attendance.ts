import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../lib/services/attendance-service';
import {
  MarkStudentAttendanceInput,
  MarkStaffAttendanceInput,
} from '../types/api/attendance';

// ── Student ───────────────────────────────────────────────────────────────────

export const useStudentSectionView = (sectionId: number | null, date: string) => {
  return useQuery({
    queryKey: ['attendance', 'student-section', sectionId, date],
    queryFn: () => attendanceService.getSectionView(sectionId!, date),
    enabled: !!sectionId && !!date,
  });
};

export const useMarkStudentAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarkStudentAttendanceInput) =>
      attendanceService.markStudentAttendance(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', 'student-section', variables.section_id, variables.date],
      });
    },
  });
};

export const useStudentAttendanceReport = (params: {
  branch_id: number;
  section_id: number | null;
  start_date: string;
  end_date: string;
  student_id?: number;
} | null) => {
  return useQuery({
    queryKey: ['attendance', 'student-report', params],
    queryFn: () =>
      attendanceService.getStudentReport({
        branch_id: params!.branch_id,
        section_id: params!.section_id!,
        start_date: params!.start_date,
        end_date: params!.end_date,
        student_id: params!.student_id,
      }),
    enabled: !!params && !!params.section_id,
  });
};

export const useStudentParentView = (params: {
  student_id: number | null;
  year: number;
  month: number;
}) => {
  return useQuery({
    queryKey: ['attendance', 'parent-view', params.student_id, params.year, params.month],
    queryFn: () =>
      attendanceService.getParentView({
        student_id: params.student_id!,
        year: params.year,
        month: params.month,
      }),
    enabled: !!params.student_id,
  });
};

export const useMyChildren = () => {
  return useQuery({
    queryKey: ['attendance', 'my-children'],
    queryFn: () => attendanceService.getMyChildren(),
  });
};

export const useStudentAttendanceSummary = (branchId: number | null, date?: string) => {
  return useQuery({
    queryKey: ['attendance', 'student-summary', branchId, date],
    queryFn: () => attendanceService.getStudentSummary(branchId!, date),
    enabled: !!branchId,
  });
};

// ── Staff ─────────────────────────────────────────────────────────────────────

export const useStaffBranchView = (branchId: number | null, date: string) => {
  return useQuery({
    queryKey: ['attendance', 'staff-branch', branchId, date],
    queryFn: () => attendanceService.getStaffBranchView(branchId!, date),
    enabled: !!branchId && !!date,
  });
};

export const useMarkStaffAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarkStaffAttendanceInput) =>
      attendanceService.markStaffAttendance(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', 'staff-branch', variables.branch_id, variables.date],
      });
    },
  });
};

export const useStaffAttendanceReport = (branchId: number | null, month: string | null) => {
  return useQuery({
    queryKey: ['attendance', 'staff-report', branchId, month],
    queryFn: () => attendanceService.getStaffReport(branchId!, month!),
    enabled: !!branchId && !!month,
  });
};

export const useStaffAttendanceSummary = (branchId: number | null, date?: string) => {
  return useQuery({
    queryKey: ['attendance', 'staff-summary', branchId, date],
    queryFn: () => attendanceService.getStaffSummary(branchId!, date),
    enabled: !!branchId,
  });
};
