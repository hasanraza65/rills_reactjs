import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonPlanService } from '../lib/services/lesson-plan-service';
import type {
  CreateSubjectInput,
  CreateTopicsInput,
  UpdateLessonPlanInput,
  TopicStatus,
} from '../types/api/lesson-plan';

// ── Query keys ──────────────────────────────────────────────────────────────────
const SUBJECTS = 'lp-subjects';
const TOPICS = 'lp-topics';
const TEACHERS = 'lp-teachers';
const TEACHER_SUBJECTS = 'lp-teacher-subjects';
const TEACHER_TOPICS = 'lp-teacher-topics';
const MY_PLAN = 'lp-my';

// ── Subjects ────────────────────────────────────────────────────────────────────
export const useSubjects = (branchId?: number | null, classId?: number) =>
  useQuery({
    queryKey: [SUBJECTS, branchId ?? 'all', classId ?? 'all'],
    queryFn: () => lessonPlanService.getSubjects({ branch_id: branchId ?? undefined, class_id: classId }),
  });

export const useCreateSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubjectInput) => lessonPlanService.createSubject(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SUBJECTS] }),
  });
};

export const useDeleteSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => lessonPlanService.deleteSubject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUBJECTS] });
      qc.invalidateQueries({ queryKey: [TOPICS] });
    },
  });
};

// ── Topics ──────────────────────────────────────────────────────────────────────
export const useTopics = (params: { subject_id?: number; class_id?: number; branch_id?: number | null }, enabled = true) =>
  useQuery({
    queryKey: [TOPICS, params.subject_id ?? 'all', params.class_id ?? 'all', params.branch_id ?? 'all'],
    queryFn: () => lessonPlanService.getTopics(params),
    enabled,
  });

export const useCreateTopics = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTopicsInput) => lessonPlanService.createTopics(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TOPICS] }),
  });
};

export const useDeleteTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => lessonPlanService.deleteTopic(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TOPICS] }),
  });
};

export const useUpdateLessonPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateLessonPlanInput }) =>
      lessonPlanService.updateLessonPlan(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TOPICS] }),
  });
};

// ── Teacher assignment (admin) ────────────────────────────────────────────────────
export const useLessonPlanTeachers = (branchId?: number | null) =>
  useQuery({
    queryKey: [TEACHERS, branchId ?? 'all'],
    queryFn: () => lessonPlanService.getTeachers(branchId),
  });

export const useTeacherSubjects = (teacherId: number | null) =>
  useQuery({
    queryKey: [TEACHER_SUBJECTS, teacherId],
    queryFn: () => lessonPlanService.getTeacherSubjects(teacherId!),
    enabled: teacherId != null,
  });

export const useTeacherTopics = (teacherId: number | null) =>
  useQuery({
    queryKey: [TEACHER_TOPICS, teacherId],
    queryFn: () => lessonPlanService.getTeacherTopics(teacherId!),
    enabled: teacherId != null,
  });

export const useAssignSubjects = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teacherId, subjectIds, branchId }: { teacherId: number; subjectIds: number[]; branchId?: number | null }) =>
      lessonPlanService.assignSubjects(teacherId, subjectIds, branchId),
    onSuccess: (_data, { teacherId }) => {
      qc.invalidateQueries({ queryKey: [TEACHERS] });
      qc.invalidateQueries({ queryKey: [TEACHER_SUBJECTS, teacherId] });
      qc.invalidateQueries({ queryKey: [TEACHER_TOPICS, teacherId] });
    },
  });
};

// ── Teacher self-service ──────────────────────────────────────────────────────────
export const useMyLessonPlan = () =>
  useQuery({ queryKey: [MY_PLAN], queryFn: () => lessonPlanService.getMyLessonPlan() });

export const useSetTopicStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, subjectId, status, branchId }: { topicId: number; subjectId: number; status: TopicStatus; branchId?: number | null }) =>
      lessonPlanService.setTopicStatus(topicId, subjectId, status, branchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [MY_PLAN] });
      qc.invalidateQueries({ queryKey: [TEACHER_TOPICS] });
    },
  });
};
