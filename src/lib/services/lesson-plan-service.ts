import { apiClient } from '../api-client';
import type {
  QbTopic,
  CreateTopicsInput,
  UpdateLessonPlanInput,
  LessonPlanTeacher,
  TeacherSubjectsData,
  TeacherTopicsData,
  LessonPlanSubjectProgress,
  TopicStatus,
} from '../../types/api/lesson-plan';

/** Backend wraps most responses as { success, data }. */
const unwrap = <T>(res: { data: { data: T } }) => res.data.data;

// Subjects are managed via classSubjectService (/class-subjects) — see
// hooks/use-class-subject.ts — not a separate lesson-plan-only endpoint.

export const lessonPlanService = {
  // ── Topics ────────────────────────────────────────────────────────────
  getTopics: (params?: { subject_id?: number; class_id?: number; branch_id?: number | null }) =>
    apiClient.get<{ data: QbTopic[] }>('/qb-topics', { params }).then(unwrap),

  getTopic: (id: number) =>
    apiClient.get<{ data: QbTopic }>(`/qb-topics/${id}`).then(unwrap),

  createTopics: (payload: CreateTopicsInput) =>
    apiClient.post<{ data: QbTopic[] }>('/qb-topics', payload).then(unwrap),

  deleteTopic: (id: number) =>
    apiClient.delete<{ message: string }>(`/qb-topics/${id}`).then((r) => r.data),

  /** Save lesson-plan content for a topic. Uses multipart to allow file attachments. */
  updateLessonPlan: (id: number, payload: UpdateLessonPlanInput) => {
    const fd = new FormData();
    // Laravel treats PUT + multipart awkwardly; send POST with method spoofing.
    fd.append('_method', 'PUT');
    if (payload.name !== undefined) fd.append('name', payload.name);
    if (payload.description !== undefined) fd.append('description', payload.description ?? '');
    if (payload.methodology !== undefined) fd.append('methodology', payload.methodology ?? '');
    if (payload.resources !== undefined) fd.append('resources', payload.resources ?? '');
    if (payload.duration_minutes !== undefined && payload.duration_minutes !== '')
      fd.append('duration_minutes', String(payload.duration_minutes));
    (payload.objectives ?? []).forEach((obj) => fd.append('objectives[]', obj));
    (payload.attachments ?? []).forEach((file) => fd.append('attachments[]', file));

    return apiClient
      .post<{ data: QbTopic }>(`/qb-topics/${id}/lesson-plan`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrap);
  },

  // ── Teacher assignments (admin) ───────────────────────────────────────
  getTeachers: (branchId?: number | null) =>
    apiClient
      .get<{ data: LessonPlanTeacher[] }>('/lesson-plan/teachers', {
        params: { branch_id: branchId ?? undefined },
      })
      .then(unwrap),

  getTeacherSubjects: (teacherId: number) =>
    apiClient.get<{ data: TeacherSubjectsData }>(`/lesson-plan/teachers/${teacherId}/subjects`).then(unwrap),

  assignSubjects: (teacherId: number, subjectIds: number[], branchId?: number | null) =>
    apiClient
      .post(`/lesson-plan/teachers/${teacherId}/subjects`, {
        subject_ids: subjectIds,
        branch_id: branchId ?? undefined,
      })
      .then((r) => r.data),

  getTeacherTopics: (teacherId: number) =>
    apiClient.get<{ data: TeacherTopicsData }>(`/lesson-plan/teachers/${teacherId}/topics`).then(unwrap),

  // ── Teacher self-service ──────────────────────────────────────────────
  getMyLessonPlan: () =>
    apiClient.get<{ data: LessonPlanSubjectProgress[] }>('/lesson-plan/my').then(unwrap),

  setTopicStatus: (topicId: number, subjectId: number, status: TopicStatus, branchId?: number | null) =>
    apiClient
      .post('/lesson-plan/topic-status', {
        topic_id: topicId,
        subject_id: subjectId,
        status,
        branch_id: branchId ?? undefined,
      })
      .then((r) => r.data),
};
