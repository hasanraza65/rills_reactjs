import { apiClient } from '../api-client';
import {
  SectionViewData,
  MarkStudentAttendanceInput,
  StudentReportData,
  StudentParentViewData,
  MyChild,
  StudentAttendanceSummary,
  BranchViewData,
  MarkStaffAttendanceInput,
  StaffReportData,
  StaffAttendanceSummary,
} from '../../types/api/attendance';

const wrap = <T>(res: { data: { success: boolean; data: T } }) => res.data.data;

export const attendanceService = {
  // ── Student ──────────────────────────────────────────────────────────────

  getSectionView: async (sectionId: number, date: string): Promise<SectionViewData> => {
    const res = await apiClient.get<{ success: boolean; data: SectionViewData }>(
      '/attendance/students/section',
      { params: { section_id: sectionId, date } }
    );
    return wrap(res);
  },

  markStudentAttendance: async (payload: MarkStudentAttendanceInput): Promise<void> => {
    await apiClient.post('/attendance/students/mark', payload);
  },

  getStudentReport: async (params: {
    branch_id: number;
    section_id: number;
    start_date: string;
    end_date: string;
    student_id?: number;
  }): Promise<StudentReportData> => {
    const res = await apiClient.get<{ success: boolean } & StudentReportData>(
      '/attendance/students/report',
      { params }
    );
    return { data: res.data.data, dates: res.data.dates };
  },

  getParentView: async (params: {
    student_id: number;
    year: number;
    month: number;
  }): Promise<StudentParentViewData> => {
    const res = await apiClient.get<{ success: boolean; data: StudentParentViewData }>(
      '/attendance/students/parent-view',
      { params }
    );
    return wrap(res);
  },

  getMyChildren: async (): Promise<MyChild[]> => {
    const res = await apiClient.get<{ success: boolean; data: MyChild[] }>(
      '/attendance/students/my-children'
    );
    return wrap(res);
  },

  getStudentSummary: async (branchId: number, date?: string): Promise<StudentAttendanceSummary> => {
    const res = await apiClient.get<{ success: boolean; data: StudentAttendanceSummary }>(
      '/attendance/students/summary',
      { params: { branch_id: branchId, date } }
    );
    return wrap(res);
  },

  // ── Staff ─────────────────────────────────────────────────────────────────

  getStaffBranchView: async (branchId: number, date: string): Promise<BranchViewData> => {
    const res = await apiClient.get<{ success: boolean; data: BranchViewData }>(
      '/attendance/staff/branch-view',
      { params: { branch_id: branchId, date } }
    );
    return wrap(res);
  },

  markStaffAttendance: async (payload: MarkStaffAttendanceInput): Promise<void> => {
    await apiClient.post('/attendance/staff/mark', payload);
  },

  getStaffReport: async (branchId: number, month: string): Promise<StaffReportData> => {
    const res = await apiClient.get<{ success: boolean } & StaffReportData>(
      '/attendance/staff/report',
      { params: { branch_id: branchId, month } }
    );
    return { data: res.data.data, dates: res.data.dates };
  },

  getStaffSummary: async (branchId: number, date?: string): Promise<StaffAttendanceSummary> => {
    const res = await apiClient.get<{ success: boolean; data: StaffAttendanceSummary }>(
      '/attendance/staff/summary',
      { params: { branch_id: branchId, date } }
    );
    return wrap(res);
  },
};
