import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, UserCircle2, Loader2, X, Check, BookOpen, ListChecks, CheckCircle2 } from 'lucide-react';
import { cn } from '../../types';
import { useBranchStore } from '../../store/use-branch-store';
import {
  useLessonPlanTeachers, useTeacherSubjects, useAssignSubjects, useTeacherTopics,
} from '../../hooks/use-lesson-plan';
import type { LessonPlanTeacher } from '../../types/api/lesson-plan';

export const LessonPlanTeachers: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const { data: teachers, isLoading } = useLessonPlanTeachers(selectedBranchId);

  const [search, setSearch] = useState('');
  const [assignFor, setAssignFor] = useState<LessonPlanTeacher | null>(null);
  const [topicsFor, setTopicsFor] = useState<LessonPlanTeacher | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return (teachers ?? []).filter((t) => !q || t.name.toLowerCase().includes(q) || (t.email ?? '').toLowerCase().includes(q));
  }, [teachers, search]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Teachers Lesson Plan</h2>
        <p className="text-slate-500 font-medium">Assign subjects to teachers and track their topic progress.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <input placeholder="Search teachers..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-slate-100 rounded-xl py-3 pl-12 pr-4 text-sm outline-none font-medium shadow-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/60">
                {['Teacher', 'Branch', 'Assigned Subjects', 'Actions'].map((h, i) => (
                  <th key={h} className={cn('px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest', i === 2 && 'text-center', i === 3 && 'text-right')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-16 text-center text-slate-400 font-bold">No teachers found.</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><UserCircle2 size={22} /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{t.name}</p>
                          <p className="text-xs text-slate-400">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{t.branch?.branch_name ?? '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-bold">{t.assigned_subjects_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setTopicsFor(t)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition-all">
                          <ListChecks size={14} /> Topics
                        </button>
                        <button onClick={() => setAssignFor(t)} className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg text-xs transition-all">
                          <BookOpen size={14} /> Subjects
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {assignFor && <AssignSubjectsModal teacher={assignFor} branchId={selectedBranchId} onClose={() => setAssignFor(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {topicsFor && <TeacherTopicsModal teacher={topicsFor} onClose={() => setTopicsFor(null)} />}
      </AnimatePresence>
    </div>
  );
};

// ── Assign subjects modal ─────────────────────────────────────────────────────────
const AssignSubjectsModal: React.FC<{ teacher: LessonPlanTeacher; branchId: number | null; onClose: () => void }> = ({ teacher, branchId, onClose }) => {
  const { data, isLoading } = useTeacherSubjects(teacher.id);
  const assign = useAssignSubjects();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');

  // Seed from currently-assigned subjects
  useEffect(() => {
    if (data) setSelected(new Set(data.assigned_subjects.map((a) => a.subject_id)));
  }, [data]);

  const toggle = (id: number) => setSelected((s) => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const filtered = (data?.all_subjects ?? []).filter((s) => {
    const q = search.toLowerCase().trim();
    return !q || s.name.toLowerCase().includes(q) || (s.school_class?.name ?? '').toLowerCase().includes(q);
  });

  const save = async () => {
    await assign.mutateAsync({ teacherId: teacher.id, subjectIds: Array.from(selected), branchId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">Assign Subjects</h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{teacher.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50"><X size={20} /></button>
        </div>

        <div className="px-8 pt-4 shrink-0">
          <input placeholder="Search subjects..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-brand-300" />
          <p className="text-xs text-slate-400 font-medium mt-2">{selected.size} selected</p>
        </div>

        <div className="p-8 pt-4 overflow-y-auto flex-1 space-y-2">
          {isLoading ? (
            <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-slate-400 font-bold text-sm">No subjects available. Create subjects first.</p>
          ) : (
            filtered.map((s) => {
              const on = selected.has(s.id);
              return (
                <button key={s.id} onClick={() => toggle(s.id)} className={cn('w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left', on ? 'bg-brand-50 border-brand-200' : 'bg-white border-slate-100 hover:border-slate-200')}>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{s.name}</p>
                    {s.school_class?.name && <p className="text-[11px] text-slate-400 font-medium">{s.school_class.name}</p>}
                  </div>
                  <div className={cn('w-6 h-6 rounded-md border-2 flex items-center justify-center', on ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-200')}>
                    {on && <Check size={14} strokeWidth={3} />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-white">Cancel</button>
          <button onClick={save} disabled={assign.isPending} className="px-6 py-3 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 disabled:opacity-60 flex items-center gap-2 shadow-lg shadow-brand-100">
            {assign.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save Assignment
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Teacher topics (read-only progress) ─────────────────────────────────────────────
const TeacherTopicsModal: React.FC<{ teacher: LessonPlanTeacher; onClose: () => void }> = ({ teacher, onClose }) => {
  const { data, isLoading } = useTeacherTopics(teacher.id);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">Topic Progress</h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{teacher.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50"><X size={20} /></button>
        </div>
        <div className="p-8 overflow-y-auto flex-1 space-y-5">
          {isLoading ? (
            <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto" /></div>
          ) : !data || data.subjects.length === 0 ? (
            <p className="py-10 text-center text-slate-400 font-bold text-sm">No subjects assigned to this teacher yet.</p>
          ) : (
            data.subjects.map((subject) => {
              const pct = subject.total_topics > 0 ? Math.round((subject.done_topics / subject.total_topics) * 100) : 0;
              return (
                <div key={subject.id} className="border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 bg-slate-50/70 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{subject.name}</p>
                      {subject.school_class?.name && <p className="text-[11px] text-slate-400 font-medium">{subject.school_class.name}</p>}
                    </div>
                    <span className="text-xs font-black text-slate-600">{subject.done_topics}/{subject.total_topics} · {pct}%</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {subject.topics.length === 0 ? (
                      <p className="px-5 py-4 text-xs text-slate-400 font-medium">No topics in this subject.</p>
                    ) : (
                      subject.topics.map((topic) => (
                        <div key={topic.id} className="px-5 py-3 flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600">{topic.name}</span>
                          {topic.is_done ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold"><CheckCircle2 size={14} /> Done</span>
                          ) : (
                            <span className="text-amber-500 text-xs font-bold">Pending</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
