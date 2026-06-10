export interface DiaryClassSubject {
  id: number;
  branch_id: number;
  class_id: number;
  section_id: number;
  teacher_id: number;
  subject_name: string;
  campus_id: number | null;
  session_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface DiaryData {
  id: number;
  branch_id: number;
  class_subject_id: number;
  topic: string;
  description: string | null;
  date: string;
  status: string | null;
  campus_id: number | null;
  session_id: number | null;
  created_at: string;
  updated_at: string;
  class_subject: DiaryClassSubject;
}

export interface DiariesResponse {
  success: boolean;
  data: DiaryData[];
}

export interface DiaryDetailResponse {
  success: boolean;
  data: DiaryData;
}

export interface CreateDiaryInput {
  class_subject_id: number;
  topic: string;
  description: string;
  page_number: string;
  resources: string;
  link: string;
  home_work: string;
  date: string;
  status: string;
  branch_id: number;
}

export interface UpdateDiaryInput {
  topic: string;
  description: string;
  date: string;
  status: string;
  _method: 'PUT';
}
