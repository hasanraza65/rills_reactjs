/**
 * @fileoverview Maps sidebar/dashboard tab IDs to permission module slugs.
 *
 * The sidebar uses UI tab IDs (e.g. 'student-attendance', 'fees-config') while
 * the backend permission system uses module slugs (e.g. 'student_attendance',
 * 'fees'). This is the ONE place that bridges the two.
 *
 * A tab that is NOT listed here is considered ungoverned and is always visible
 * (e.g. 'overview', 'messages', 'settings' — placeholders with no module yet).
 */

export const TAB_MODULE_MAP: Record<string, string> = {
  // General
  overview: 'dashboard',

  // Academic
  students: 'students',
  'add-student': 'students',
  families: 'families',
  diary: 'diaries',
  'what-i-learnt': 'diaries',
  syllabus: 'syllabus',
  'class-syllabus': 'syllabus',
  subjects: 'syllabus',
  curriculum: 'syllabus',
  'lesson-plan-teachers': 'lesson_plans',
  'add-lesson-plan': 'lesson_plans',
  'lesson-plan-list': 'lesson_plans',

  // Attendance
  attendance: 'student_attendance',
  'student-attendance': 'student_attendance',
  'staff-attendance': 'staff_attendance',

  // Finance
  fees: 'fees',
  'fees-students': 'fees',
  'fees-config': 'fees',
  invoices: 'fees',
  finance: 'fees',

  // Administration
  staff: 'staff',
  branches: 'branches',
  classes: 'classes_sections',
  sections: 'classes_sections',
  'class-subjects': 'classes_sections',
  'admission-keys': 'students',
  visitors: 'visitors',
  library: 'library',
  roles: 'roles',

  // Reports
  results: 'reports',
};

/** Returns the module slug governing a tab, or null if the tab is ungoverned. */
export const moduleForTab = (tabId: string): string | null =>
  TAB_MODULE_MAP[tabId] ?? null;
