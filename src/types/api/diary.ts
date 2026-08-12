/**
 * @fileoverview API types for diaries.
 */

export type DiaryStatus = 'Pending' | 'Approved';

export interface DiaryClassSubject {
  id: number;
  branch_id: number;
  class_id: number;
  section_id: number;
  teacher_id: number;
  subject_name: string;
  created_at: string;
  updated_at: string;
  class?: { id: number; name: string };
  section?: { id: number; name: string };
}

export interface DiaryData {
  id: number;
  branch_id: number;
  class_subject_id: number;
  topic: string;
  activity: string | null;
  page_number: string | null;
  resources: string | null;
  link: string | null;
  home_work: string | null;
  date: string;
  status: DiaryStatus | null;
  created_at: string;
  updated_at: string;
  class_subject?: DiaryClassSubject;
}

export interface DiariesResponse {
  success: boolean;
  data: DiaryData[];
}

export interface DiaryDetailResponse {
  success: boolean;
  data: DiaryData;
}

/** Query params accepted by GET /diaries. The backend scopes by role on top of these. */
export interface DiaryFilters {
  branch_id?: number;
  section_id?: number;
  class_subject_id?: number;
  date?: string;
  topic?: string;
}

export interface CreateDiaryInput {
  class_subject_id: number;
  topic: string;
  date: string;
  page_number?: string;
  resources?: string;
  link?: string;
  activity?: string;
  home_work?: string;
  status?: DiaryStatus;
}

/** Every editable field — an edit must never silently drop the ones it doesn't show. */
export interface UpdateDiaryInput {
  class_subject_id?: number;
  topic?: string;
  date?: string;
  page_number?: string;
  resources?: string;
  link?: string;
  activity?: string;
  home_work?: string;
  status?: DiaryStatus;
  _method: 'PUT';
}
