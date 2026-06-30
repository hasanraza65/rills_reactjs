import { apiClient } from '../api-client';

export interface AttendanceStat {
  total_marked: number;
  present: number;
  percentage: number;
}

export interface FeeStat {
  total_invoiced: number;
  total_collected: number;
  total_pending: number;
  percentage: number;
}

export interface RecentAdmission {
  id: number;
  name: string;
  admission_no: string;
  admission_date: string | null;
}

export interface SuperAdminOverview {
  total_branches: number;
  total_students: number;
  attendance_today: AttendanceStat;
  fee_collection: FeeStat;
}

export interface SchoolAdminOverview {
  total_branches: number;
  total_students: number;
  attendance_today: AttendanceStat;
  fee_collection: FeeStat;
}

export interface BranchAdminOverview {
  total_students: number;
  attendance_today: AttendanceStat;
  fee_collection: FeeStat;
  recent_admissions: RecentAdmission[];
}

export interface TeacherOverview {
  total_subjects: number;
  subjects: { id: number; name: string }[];
  attendance_today: AttendanceStat;
}

export interface ParentChild {
  id: number;
  name: string;
  admission_no: string;
  attendance_today: 'P' | 'A' | 'L' | 'H' | null;
  fee_summary: {
    total_invoiced: number;
    total_paid: number;
    pending: number;
  };
}

export interface ParentOverview {
  total_children: number;
  children: ParentChild[];
}

export type DashboardOverviewData =
  | SuperAdminOverview
  | SchoolAdminOverview
  | BranchAdminOverview
  | TeacherOverview
  | ParentOverview;

export interface DashboardOverviewResponse {
  success: boolean;
  role: string;
  data: DashboardOverviewData;
}

const wrap = <T>(res: { data: DashboardOverviewResponse }) =>
  res.data as DashboardOverviewResponse & { data: T };

export const dashboardService = {
  getOverview: async (branchId?: number | null): Promise<DashboardOverviewResponse> => {
    const res = await apiClient.get<DashboardOverviewResponse>('/dashboard/overview', {
      params: branchId ? { branch_id: branchId } : undefined,
    });
    return res.data;
  },
};
