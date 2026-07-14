import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, CheckCircle2, BookOpen } from 'lucide-react';
import { cn } from '../../types';
import { useBranchStore } from '../../store/use-branch-store';
import { useMyLessonPlan, useSetTopicStatus } from '../../hooks/use-lesson-plan';

interface FlatRow {
  topicId: number;
  subjectId: number;
  topic: string;
  subject: string;
  className: string;
  sectionName: string;
  isDone: boolean;
  completedDate: string | null;
}

export const LessonPlanList: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const { data: subjects, isLoading } = useMyLessonPlan();
  const setStatus = useSetTopicStatus();

  const [search, setSearch] = useState('');
  const [confirming, setConfirming] = useState<FlatRow | null>(null);
  const [busyTopicId, setBusyTopicId] = useState<number | null>(null);

  const rows: FlatRow[] = useMemo(() => {
    const out: FlatRow[] = [];
    (subjects ?? []).forEach((s) => {
      s.topics.forEach((t) => {
        out.push({
          topicId: t.id,
          subjectId: s.id,
          topic: t.name,
          subject: s.subject_name,
          className: s.class?.name ?? '—',
          sectionName: s.section?.name ?? '',
          isDone: !!t.is_done,
          completedDate: t.completed_date ?? null,
        });
      });
    });
    return out;
  }, [subjects]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rows.filter((r) => !q || r.topic.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q) || r.className.toLowerCase().includes(q) || r.sectionName.toLowerCase().includes(q));
  }, [rows, search]);

  const doneCount = rows.filter((r) => r.isDone).length;

  const mark = async (row: FlatRow, status: 'done' | 'undone') => {
    setBusyTopicId(row.topicId);
    try {
      await setStatus.mutateAsync({ topicId: row.topicId, subjectId: row.subjectId, status, branchId: selectedBranchId });
    } finally {
      setBusyTopicId(null);
      setConfirming(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Lesson Plan</h2>
          <p className="text-slate-500 font-medium">Track and update your topic completion status.</p>
        </div>
        {rows.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
            <span className="text-sm font-bold text-slate-700">{doneCount}/{rows.length}</span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">topics done</span>
          </div>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <input placeholder="Search topics, subjects or classes..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-slate-100 rounded-xl py-3 pl-12 pr-4 text-sm outline-none font-medium shadow-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/60">
                {['Topic', 'Subject', 'Class', 'Status'].map((h, i) => (
                  <th key={h} className={cn('px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest', i === 3 && 'text-center')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <BookOpen size={40} strokeWidth={1.5} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-400 font-bold text-sm">
                      {rows.length === 0 ? 'No subjects assigned to you yet.' : 'No topics match your search.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.topicId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{r.topic}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{r.subject}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {r.sectionName ? `${r.className} / ${r.sectionName}` : r.className}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {r.isDone ? (
                        <button
                          onClick={() => mark(r, 'undone')}
                          disabled={busyTopicId === r.topicId}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold rounded-xl text-xs hover:bg-emerald-100 transition-all min-w-28 justify-center"
                          title="Click to mark as pending"
                        >
                          {busyTopicId === r.topicId ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Done
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirming(r)}
                          disabled={busyTopicId === r.topicId}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-200 hover:border-amber-500 transition-all font-bold rounded-xl text-xs min-w-28 justify-center"
                        >
                          {busyTopicId === r.topicId ? <Loader2 size={14} className="animate-spin" /> : 'Pending'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm mark-done */}
      <AnimatePresence>
        {confirming && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={28} /></div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-1">Mark as done?</h3>
              <p className="text-slate-500 text-sm mb-6">“{confirming.topic}” will be marked completed today.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirming(null)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">Cancel</button>
                <button onClick={() => mark(confirming, 'done')} disabled={busyTopicId != null} className="flex-1 py-3 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 disabled:opacity-60 flex items-center justify-center gap-2">
                  {busyTopicId != null ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Yes, mark done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
