import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type UserRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'BRANCH_ADMIN' | 'TEACHER' | 'PARENT' | 'GATE_KEEPER' | 'LIBRARIAN';

export type PlanType = 'FREE' | 'PAID';

export interface User {
  id: string;
  name: string;
  email?: string;
  cnic?: string;
  role: UserRole;
  roles?: UserRole[];
  avatar?: string;
  branchId?: string;
}

export interface Branch {
  id: string;
  schoolId: string;
  name: string;
  location: string;
  plan: PlanType;
  isActive: boolean;
  adminEmail?: string;
}

export interface School {
  id: string;
  name: string;
  logo?: string;
  adminName: string;
  adminEmail: string;
  branches: Branch[];
}

export interface PricingConfig {
  freeBranchLimit: number;
  paidBranchMonthlyCost: number;
  currency: string;
}

export type FeeFrequency = 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export interface FeeHead {
  id: string;
  name: string;
  amount: number;
  frequency: FeeFrequency;
  isEnabled: boolean;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  months: string[]; // e.g., ["2024-03"]
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE';
  referenceNumber?: string;
  note?: string;
}

export interface StudentFeeStatus {
  studentId: string;
  totalAnnualFee: number;
  totalPaid: number;
  totalPending: number;
  installments: {
    month: string;
    amount: number;
    paid: number;
    status: 'PAID' | 'PARTIAL' | 'PENDING';
  }[];
}

export interface Class {
  id: string;
  name: string;
  section: string;
  branchId: string;
  baseFeeHeads?: FeeHead[];
}

export interface Parent {
  id: string;
  name: string;
  cnic: string;
  phone: string;
  email: string;
  address: string;
  childrenIds: string[];
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  classId: string;
  branchId: string;
  parentId: string;
  gender: 'MALE' | 'FEMALE';
  dob: string;
  feeCustomization: FeeHead[];
  annualFee: number;
  avatar?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  location?: string;
}

export interface IssuedBook {
  id: string;
  bookId: string;
  studentId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE';
}

export const BOOKS_DATA: Book[] = [
  { id: 'b1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', category: 'Fiction', totalCopies: 5, availableCopies: 3, location: 'Shelf A1' },
  { id: 'b2', title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0061120084', category: 'Fiction', totalCopies: 3, availableCopies: 1, location: 'Shelf A2' },
  { id: 'b3', title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0553380163', category: 'Science', totalCopies: 8, availableCopies: 8, location: 'Shelf B1' },
  { id: 'b4', title: 'The Art of Computer Programming', author: 'Donald Knuth', isbn: '978-0201896831', category: 'Technology', totalCopies: 2, availableCopies: 2, location: 'Shelf C1' },
];

export const ISSUED_BOOKS_DATA: IssuedBook[] = [
  { id: 'ib1', bookId: 'b1', studentId: 'st1', issueDate: '2024-02-15', dueDate: '2024-03-01', status: 'OVERDUE', fineAmount: 150 },
  { id: 'ib2', bookId: 'b2', studentId: 'st1', issueDate: '2024-02-28', dueDate: '2024-03-14', status: 'ISSUED', fineAmount: 0 },
];

export type VisitorType = 'NEW_ADMISSION' | 'MEETING' | 'DELIVERY' | 'OTHER';

export interface Visitor {
  id: string;
  name: string;
  cnic?: string;
  type: VisitorType;
  purpose: string;
  entryTime: string;
  exitTime?: string;
  date: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
}

export const ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { id: 'att1', studentId: 'st1', date: '2024-03-01', status: 'PRESENT' },
  { id: 'att2', studentId: 'st1', date: '2024-03-02', status: 'PRESENT' },
  { id: 'att3', studentId: 'st1', date: '2024-03-03', status: 'ABSENT' },
  { id: 'att4', studentId: 'st1', date: '2024-03-04', status: 'LATE' },
  { id: 'att5', studentId: 'st1', date: '2024-03-05', status: 'PRESENT' },
];

export interface Syllabus {
  id: string;
  classId: string;
  subject: string;
  title: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  assignedBranches: string[];
  assignedSchools: string[];
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  classId: string;
  teacherId: string;
  subject: string;
  content: string;
  date: string;
  attachments?: { name: string; url: string }[];
}

export const SYLLABUS_DATA: Syllabus[] = [
  {
    id: 'syl1',
    classId: 'c1',
    subject: 'Mathematics',
    title: 'Grade 1 Math Syllabus 2024',
    description: 'Comprehensive guide covering addition, subtraction, and basic geometry.',
    fileName: 'math_grade1_2024.pdf',
    assignedBranches: ['b1', 'b2'],
    assignedSchools: ['s1'],
    createdAt: '2024-01-15',
  },
  {
    id: 'syl2',
    classId: 'c2',
    subject: 'English',
    title: 'Grade 2 English Literature',
    description: 'Focus on reading comprehension and creative writing.',
    fileName: 'english_grade2.pdf',
    assignedBranches: ['b1'],
    assignedSchools: ['s1'],
    createdAt: '2024-01-20',
  }
];

export const DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: 'd1',
    classId: 'c1',
    teacherId: 't1',
    subject: 'Mathematics',
    content: 'Completed Chapter 3: Addition up to 100. Homework: Exercise 3.2, Questions 1-5.',
    date: '2024-03-02',
    attachments: [{ name: 'Math_HW_Sheet.pdf', url: '#' }]
  },
  {
    id: 'd2',
    classId: 'c1',
    teacherId: 't1',
    subject: 'English',
    content: 'Read "The Little Red Hen". Students practiced identifying the main character and setting.',
    date: '2024-03-02',
  },
  {
    id: 'd3',
    classId: 'c1',
    teacherId: 't1',
    subject: 'Science',
    content: 'Introduction to Plants. Discussed parts of a plant (roots, stem, leaves).',
    date: '2024-03-01',
    attachments: [{ name: 'Plant_Diagram.jpg', url: '#' }]
  }
];

export const ROLES: Record<UserRole, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-purple-500' },
  SCHOOL_ADMIN: { label: 'School Admin', color: 'bg-blue-500' },
  BRANCH_ADMIN: { label: 'Branch Admin', color: 'bg-indigo-500' },
  TEACHER: { label: 'Teacher', color: 'bg-emerald-500' },
  PARENT: { label: 'Parent', color: 'bg-amber-500' },
  GATE_KEEPER: { label: 'Gate Keeper', color: 'bg-rose-500' },
  LIBRARIAN: { label: 'Librarian', color: 'bg-cyan-500' },
};

export const BRANCHES: Branch[] = [
  { id: 'b1', schoolId: 's1', name: 'Main Campus', location: 'Gulberg, Lahore', plan: 'PAID', isActive: true },
  { id: 'b2', schoolId: 's1', name: 'DHA Branch', location: 'Phase 5, Lahore', plan: 'PAID', isActive: true },
  { id: 'b3', schoolId: 's2', name: 'North Campus', location: 'Nazimabad, Karachi', plan: 'FREE', isActive: true },
];

export const SCHOOLS: School[] = [
  {
    id: 's1',
    name: 'Beaconhouse School System',
    adminName: 'Ahmed Ali',
    adminEmail: 'ahmed@beaconhouse.edu.pk',
    branches: [
      { id: 'b1', schoolId: 's1', name: 'Main Campus', location: 'Gulberg, Lahore', plan: 'PAID', isActive: true },
      { id: 'b2', schoolId: 's1', name: 'DHA Branch', location: 'Phase 5, Lahore', plan: 'PAID', isActive: true },
    ]
  },
  {
    id: 's2',
    name: 'The City School',
    adminName: 'Fatima Khan',
    adminEmail: 'fatima@cityschool.edu.pk',
    branches: [
      { id: 'b3', schoolId: 's2', name: 'North Campus', location: 'Nazimabad, Karachi', plan: 'FREE', isActive: true },
    ]
  },
  {
    id: 's3',
    name: 'Roots Millennium',
    adminName: 'Zainab Qureshi',
    adminEmail: 'zainab@roots.edu.pk',
    branches: []
  }
];

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnic: string;
  role: 'TEACHER' | 'ADMIN' | 'SUPPORT' | 'GATE_KEEPER';
  branchId: string;
  designation: string;
  joiningDate: string;
  avatar?: string;
  linkedChildrenIds?: string[]; // For teachers who are also parents
}

export interface Allowance {
  id: string;
  name: string;
  amount: number;
  type: 'FIXED' | 'PERCENTAGE';
}

export interface Deduction {
  id: string;
  name: string;
  amount: number;
  type: 'FIXED' | 'PERCENTAGE';
}

export interface SalaryStructure {
  staffId: string;
  basicSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
}

export interface Payslip {
  id: string;
  staffId: string;
  month: string; // e.g., "2024-03"
  basicSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  netSalary: number;
  status: 'PAID' | 'PENDING';
  paymentDate?: string;
  allowancesBreakdown: { name: string; amount: number }[];
  deductionsBreakdown: { name: string; amount: number }[];
}

export const STAFF_DATA: Staff[] = [
  {
    id: 'stf1',
    name: 'Sarah Johnson',
    email: 'sarah.j@eduflow.com',
    phone: '0300-1112223',
    cnic: '35201-1234567-3',
    role: 'TEACHER',
    branchId: 'b1',
    designation: 'Senior Math Teacher',
    joiningDate: '2022-08-15',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    linkedChildrenIds: ['st1']
  },
  {
    id: 'stf2',
    name: 'Michael Chen',
    email: 'm.chen@eduflow.com',
    phone: '0321-4445556',
    cnic: '35201-9876543-1',
    role: 'ADMIN',
    branchId: 'b1',
    designation: 'Branch Coordinator',
    joiningDate: '2021-03-10',
    avatar: 'https://i.pravatar.cc/150?u=michael'
  }
];

export const SALARY_STRUCTURES: SalaryStructure[] = [
  {
    staffId: 'stf1',
    basicSalary: 45000,
    allowances: [
      { id: 'al1', name: 'House Rent', amount: 5000, type: 'FIXED' },
      { id: 'al2', name: 'Conveyance', amount: 3000, type: 'FIXED' }
    ],
    deductions: [
      { id: 'de1', name: 'Tax', amount: 1200, type: 'FIXED' },
      { id: 'de2', name: 'Insurance', amount: 800, type: 'FIXED' }
    ]
  },
  {
    staffId: 'stf2',
    basicSalary: 65000,
    allowances: [
      { id: 'al3', name: 'House Rent', amount: 8000, type: 'FIXED' },
      { id: 'al4', name: 'Utility', amount: 4000, type: 'FIXED' }
    ],
    deductions: [
      { id: 'de3', name: 'Tax', amount: 2500, type: 'FIXED' }
    ]
  }
];

export const PAYSLIPS: Payslip[] = [
  {
    id: 'ps1',
    staffId: 'stf1',
    month: '2024-02',
    basicSalary: 45000,
    totalAllowances: 8000,
    totalDeductions: 2000,
    netSalary: 51000,
    status: 'PAID',
    paymentDate: '2024-02-28',
    allowancesBreakdown: [{ name: 'House Rent', amount: 5000 }, { name: 'Conveyance', amount: 3000 }],
    deductionsBreakdown: [{ name: 'Tax', amount: 1200 }, { name: 'Insurance', amount: 800 }]
  },
  {
    id: 'ps2',
    staffId: 'stf2',
    month: '2024-02',
    basicSalary: 65000,
    totalAllowances: 12000,
    totalDeductions: 2500,
    netSalary: 74500,
    status: 'PENDING',
    allowancesBreakdown: [{ name: 'House Rent', amount: 8000 }, { name: 'Utility', amount: 4000 }],
    deductionsBreakdown: [{ name: 'Tax', amount: 2500 }]
  }
];

export const CLASSES: Class[] = [
  { id: 'c1', name: 'Grade 1', section: 'A', branchId: 'b1' },
  { id: 'c2', name: 'Grade 2', section: 'B', branchId: 'b1' },
  { id: 'c3', name: 'Grade 3', section: 'A', branchId: 'b2' },
];

export const PARENTS: Parent[] = [
  { id: 'p1', name: 'Zubair Ahmed', cnic: '42101-1234567-1', phone: '0300-1234567', email: 'zubair@example.com', address: 'DHA Phase 6, Karachi', childrenIds: ['st1'] },
  { id: 'p2', name: 'Kamran Akmal', cnic: '35201-7654321-2', phone: '0321-7654321', email: 'kamran@example.com', address: 'Gulberg III, Lahore', childrenIds: ['st2'] },
];

export const STUDENTS: Student[] = [
  { 
    id: 'st1', 
    name: 'Ali Zubair', 
    rollNumber: '1001', 
    classId: 'c1', 
    branchId: 'b1', 
    parentId: 'p1', 
    gender: 'MALE', 
    dob: '2015-05-12',
    annualFee: 132000,
    feeCustomization: [
      { id: 'fh1', name: 'Tuition Fee', amount: 8000, frequency: 'MONTHLY', isEnabled: true },
      { id: 'fh2', name: 'Transport', amount: 3000, frequency: 'MONTHLY', isEnabled: true },
      { id: 'fh3', name: 'Lab Charges', amount: 1500, frequency: 'ANNUAL', isEnabled: false },
    ]
  },
];
