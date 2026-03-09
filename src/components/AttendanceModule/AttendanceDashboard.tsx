import React from 'react';
import { UserRole } from '../../types';
import { TeacherAttendance } from './TeacherAttendance';
import { AdminAttendanceReports } from './AdminAttendanceReports';
import { ParentAttendanceView } from './ParentAttendanceView';

interface AttendanceDashboardProps {
  role: UserRole;
}

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ role }) => {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'SCHOOL_ADMIN':
    case 'BRANCH_ADMIN':
      return <AdminAttendanceReports />;
    case 'TEACHER':
      return <TeacherAttendance />;
    case 'PARENT':
      return <ParentAttendanceView />;
    default:
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
            <UserRoleIcon role={role} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Attendance Module</h3>
          <p className="text-slate-500 max-w-xs mx-auto">This module is not available for your current role.</p>
        </div>
      );
  }
};

const UserRoleIcon: React.FC<{ role: UserRole }> = ({ role }) => {
  // Simple helper for default view
  return null;
};
