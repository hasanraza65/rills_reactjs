// ── Shared refs ────────────────────────────────────────────────────────────────
export interface ClassRef {
  id: number;
  name: string;
}

export interface SubjectRef {
  id: number;
  name: string;
  class_id?: number;
  school_class?: ClassRef | null;
}

// ── Subjects ────────────────────────────────────────────────────────────────────
export interface QbSubject {
  id: number;
  branch_id: number | null;
  class_id: number;
  name: string;
  school_class?: ClassRef | null;
}

export interface CreateSubjectInput {
  name: string;
  class_id: number;
  branch_id?: number | null;
}

// ── Topics ──────────────────────────────────────────────────────────────────────
export interface TopicObjective {
  id: number;
  topic_id: number;
  objective: string;
}

export interface TopicAttachment {
  id: number;
  topic_id: number;
  file_path: string;
  file_name: string;
}

export interface QbTopic {
  id: number;
  branch_id: number | null;
  class_id: number;
  subject_id: number;
  name: string;
  description: string | null;
  methodology: string | null;
  resources: string | null;
  duration_minutes: number | null;
  subject?: SubjectRef | null;
  school_class?: ClassRef | null;
  objectives?: TopicObjective[];
  attachments?: TopicAttachment[];
  // present only in lesson-plan/teacher-topics responses
  is_done?: boolean;
  completed_date?: string | null;
}

export interface CreateTopicsInput {
  class_id: number;
  subject_id: number;
  branch_id?: number | null;
  topic_names: string[];
}

export interface UpdateLessonPlanInput {
  name?: string;
  description?: string;
  methodology?: string;
  resources?: string;
  duration_minutes?: number | string;
  objectives?: string[];
  attachments?: File[];
}

// ── Teacher assignment ──────────────────────────────────────────────────────────
export interface LessonPlanTeacher {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  branch_id: number | null;
  branch?: { id: number; branch_name: string } | null;
  assigned_subjects_count: number;
}

export interface AssignedSubject {
  id: number;
  user_id: number;
  subject_id: number;
  branch_id: number | null;
  subject?: SubjectRef | null;
}

export interface TeacherSubjectsData {
  teacher: { id: number; name: string; email: string; phone: string | null };
  assigned_subjects: AssignedSubject[];
  all_subjects: QbSubject[];
}

/** A subject with its topics and completion progress (teacher-topics / my). */
export interface LessonPlanSubjectProgress {
  id: number;
  name: string;
  class_id: number;
  school_class?: ClassRef | null;
  topics: QbTopic[];
  total_topics: number;
  done_topics: number;
}

export interface TeacherTopicsData {
  teacher: { id: number; name: string; email: string };
  subjects: LessonPlanSubjectProgress[];
}

export type TopicStatus = 'done' | 'undone';
