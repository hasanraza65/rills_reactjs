import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Plus, FileText, Loader2, Trash2, BookOpen, Layers, Paperclip, Check, AlertCircle, ExternalLink,
} from 'lucide-react';
import { cn } from '../../types';
import { useClasses } from '../../hooks/use-class';
import { useSectionsByClass } from '../../hooks/use-section';
import { useClassSubjects, useCreateClassSubject, useDeleteClassSubject } from '../../hooks/use-class-subject';
import { useLessonPlanTeachers } from '../../hooks/use-lesson-plan';
import { useBranchStore } from '../../store/use-branch-store';
import {
  useTopics, useCreateTopics, useDeleteTopic, useUpdateLessonPlan,
} from '../../hooks/use-lesson-plan';
import type { QbTopic, LessonPlanTeacher } from '../../types/api/lesson-plan';

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '').replace(/\/api\/?$/, '');

const inputCls = 'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-300 transition-all';

export const AddLessonPlan: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const { data: classes } = useClasses(selectedBranchId ?? 1);

  const [classId, setClassId] = useState<number | ''>('');
  const [sectionId, setSectionId] = useState<number | ''>('');
  const [subjectId, setSubjectId] = useState<number | ''>('');

  const { data: sections } = useSectionsByClass(classId === '' ? null : classId);
  const { data: subjectsResp } = useClassSubjects(sectionId === '' ? null : sectionId, selectedBranchId);
  const subjects = subjectsResp?.data ?? [];
  const { data: teachers } = useLessonPlanTeachers(selectedBranchId);
  const { data: topics, isLoading: topicsLoading } = useTopics(
    { subject_id: subjectId === '' ? undefined : subjectId, branch_id: selectedBranchId },
    subjectId !== ''
  );

  const createSubject = useCreateClassSubject();
  const deleteSubject = useDeleteClassSubject();
  const createTopics = useCreateTopics();
  const deleteTopic = useDeleteTopic();

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTopics, setShowAddTopics] = useState(false);
  const [editingTopic, setEditingTopic] = useState<QbTopic | null>(null);
  const [deletingTopicId, setDeletingTopicId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  // Reset section (and therefore subject) when class changes
  useEffect(() => { setSectionId(''); }, [classId]);
  // Reset subject when section changes
  useEffect(() => { setSubjectId(''); }, [sectionId]);

  const filteredTopics = useMemo(() => {
    const q = search.toLowerCase().trim();
    return (topics ?? []).filter((t) => !q || t.name.toLowerCase().includes(q));
  }, [topics, search]);

  const selectedSubject = subjects.find((s) => s.id === subjectId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Lesson Plans</h2>
        <p className="text-slate-500 font-medium">Manage subjects, topics and lesson-plan content.</p>
      </div>

      {/* Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="space-y-2 flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class</label>
          <select className={inputCls} value={classId} onChange={(e) => setClassId(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">Select class</option>
            {classes?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-2 flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Section</label>
          <select className={inputCls} value={sectionId} onChange={(e) => setSectionId(e.target.value === '' ? '' : Number(e.target.value))} disabled={classId === ''}>
            <option value="">{classId === '' ? 'Select a class first' : 'Select section'}</option>
            {sections?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-2 flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
          <select className={inputCls} value={subjectId} onChange={(e) => setSubjectId(e.target.value === '' ? '' : Number(e.target.value))} disabled={sectionId === ''}>
            <option value="">{sectionId === '' ? 'Select a section first' : 'Select subject'}</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddSubject(true)}
            disabled={sectionId === ''}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            <BookOpen size={16} /> Add Subject
          </button>
          <button
            onClick={() => setShowAddTopics(true)}
            disabled={subjectId === ''}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 disabled:opacity-50"
          >
            <Plus size={16} /> Add Topics
          </button>
          {selectedSubject && (
            <button
              onClick={() => setDeletingTopicId(-1)} /* -1 => delete subject sentinel */
              className="p-3 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
              title="Delete this subject"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Topics table */}
      {subjectId === '' ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400">
          <Layers size={44} strokeWidth={1.5} className="mx-auto mb-4" />
          <p className="font-bold text-slate-600">Select a class, section and subject to manage topics</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-50">
            <input placeholder="Search topics..." value={search} onChange={(e) => setSearch(e.target.value)} className={cn(inputCls, 'max-w-sm')} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/60">
                  {['Topic', 'Objectives', 'Duration', 'Attachments', 'Action'].map((h, i) => (
                    <th key={h} className={cn('px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest', i >= 1 && 'text-center', i === 4 && 'text-right')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topicsLoading ? (
                  <tr><td colSpan={5} className="px-6 py-14 text-center"><Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto" /></td></tr>
                ) : filteredTopics.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-14 text-center text-slate-400 font-bold">No topics yet. Click “Add Topics” to create some.</td></tr>
                ) : (
                  filteredTopics.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{t.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">{t.objectives?.length ?? 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-500 font-medium">{t.duration_minutes ? `${t.duration_minutes} min` : '—'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">{t.attachments?.length ?? 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditingTopic(t)} className="flex items-center gap-1.5 px-4 py-2 bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white transition-all font-bold rounded-lg text-xs">
                            <FileText size={14} /> Lesson Plan
                          </button>
                          <button onClick={() => setDeletingTopicId(t.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Subject modal */}
      <AnimatePresence>
        {showAddSubject && classId !== '' && sectionId !== '' && (
          <AddSubjectModal
            classId={classId}
            sectionId={sectionId}
            teachers={teachers ?? []}
            isPending={createSubject.isPending}
            onClose={() => setShowAddSubject(false)}
            onSubmit={async (subjectName, teacherId) => {
              await createSubject.mutateAsync({
                subject_name: subjectName,
                class_id: classId,
                section_id: sectionId,
                teacher_id: teacherId,
                branch_id: selectedBranchId ?? 1,
              });
              setShowAddSubject(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Add Topics modal */}
      <AnimatePresence>
        {showAddTopics && subjectId !== '' && classId !== '' && (
          <AddTopicsModal
            isPending={createTopics.isPending}
            onClose={() => setShowAddTopics(false)}
            onSubmit={async (names) => {
              await createTopics.mutateAsync({ class_id: classId, subject_id: subjectId, branch_id: selectedBranchId, topic_names: names });
              setShowAddTopics(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Lesson plan editor */}
      <AnimatePresence>
        {editingTopic && (
          <LessonPlanEditor topic={editingTopic} onClose={() => setEditingTopic(null)} />
        )}
      </AnimatePresence>

      {/* Delete confirm (topic or subject) */}
      <AnimatePresence>
        {deletingTopicId != null && (
          <ConfirmDelete
            label={deletingTopicId === -1 ? 'subject and all its topics' : 'topic'}
            isPending={deletingTopicId === -1 ? deleteSubject.isPending : deleteTopic.isPending}
            onCancel={() => setDeletingTopicId(null)}
            onConfirm={async () => {
              if (deletingTopicId === -1 && subjectId !== '' && sectionId !== '') {
                await deleteSubject.mutateAsync({ id: subjectId, sectionId });
                setSubjectId('');
              } else if (deletingTopicId > 0) {
                await deleteTopic.mutateAsync(deletingTopicId);
              }
              setDeletingTopicId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Add Subject ─────────────────────────────────────────────────────────────────
const AddSubjectModal: React.FC<{
  classId: number; sectionId: number; teachers: LessonPlanTeacher[]; isPending: boolean;
  onClose: () => void; onSubmit: (name: string, teacherId: number) => void;
}> = ({ teachers, isPending, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [teacherId, setTeacherId] = useState<number | ''>('');
  const canSubmit = name.trim() !== '' && teacherId !== '';

  return (
    <ModalShell title="Add Subject" onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Name</label>
          <input autoFocus className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mathematics" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</label>
          <select className={inputCls} value={teacherId} onChange={(e) => setTeacherId(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">{teachers.length === 0 ? 'No teachers in this branch' : 'Select teacher'}</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <ModalActions
          isPending={isPending}
          disabled={!canSubmit}
          onCancel={onClose}
          onConfirm={() => canSubmit && onSubmit(name.trim(), teacherId as number)}
          confirmLabel="Create Subject"
        />
      </div>
    </ModalShell>
  );
};

// ── Add Topics (bulk) ────────────────────────────────────────────────────────────
const AddTopicsModal: React.FC<{
  isPending: boolean; onClose: () => void; onSubmit: (names: string[]) => void;
}> = ({ isPending, onClose, onSubmit }) => {
  const [rows, setRows] = useState<string[]>(['']);
  const valid = rows.map((r) => r.trim()).filter(Boolean);

  return (
    <ModalShell title="Add Topics" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs text-slate-400 font-medium">Add one or more topics for this subject.</p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {rows.map((val, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={inputCls}
                value={val}
                autoFocus={i === rows.length - 1}
                placeholder={`Topic ${i + 1}`}
                onChange={(e) => setRows((r) => r.map((x, idx) => (idx === i ? e.target.value : x)))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setRows((r) => [...r, '']); } }}
              />
              {rows.length > 1 && (
                <button onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))} className="p-2.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"><X size={16} /></button>
              )}
            </div>
          ))}
        </div>
        <button onClick={() => setRows((r) => [...r, ''])} className="flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700">
          <Plus size={14} /> Add another
        </button>
        <ModalActions isPending={isPending} disabled={valid.length === 0} onCancel={onClose} onConfirm={() => onSubmit(valid)} confirmLabel={`Create ${valid.length || ''} Topic${valid.length !== 1 ? 's' : ''}`} />
      </div>
    </ModalShell>
  );
};

// ── Lesson Plan editor ────────────────────────────────────────────────────────────
const LessonPlanEditor: React.FC<{ topic: QbTopic; onClose: () => void }> = ({ topic, onClose }) => {
  const updatePlan = useUpdateLessonPlan();
  const [description, setDescription] = useState(topic.description ?? '');
  const [methodology, setMethodology] = useState(topic.methodology ?? '');
  const [resources, setResources] = useState(topic.resources ?? '');
  const [duration, setDuration] = useState(topic.duration_minutes != null ? String(topic.duration_minutes) : '');
  const [objectives, setObjectives] = useState<string[]>((topic.objectives ?? []).map((o) => o.objective));
  const [newObj, setNewObj] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');

  const addObjective = () => { if (newObj.trim()) { setObjectives((o) => [...o, newObj.trim()]); setNewObj(''); } };

  const save = async () => {
    setError('');
    try {
      await updatePlan.mutateAsync({
        id: topic.id,
        payload: {
          name: topic.name,
          description, methodology, resources,
          duration_minutes: duration,
          objectives,
          attachments: files,
        },
      });
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save lesson plan.');
    }
  };

  return (
    <ModalShell title="Lesson Plan" subtitle={`${topic.school_class?.name ?? ''} / ${topic.subject?.subject_name ?? ''} / ${topic.name}`} onClose={onClose} wide>
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resources / Video Link</label>
            <input className={inputCls} value={resources} onChange={(e) => setResources(e.target.value)} placeholder="Paste a link or resource reference" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration (minutes)</label>
            <input type="number" min={0} className={inputCls} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 40" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lesson Plan Details</label>
          <textarea rows={3} className={cn(inputCls, 'resize-none')} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the lesson plan..." />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Methodology</label>
          <textarea rows={2} className={cn(inputCls, 'resize-none')} value={methodology} onChange={(e) => setMethodology(e.target.value)} placeholder="Teaching methodology..." />
        </div>

        {/* Objectives */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Objectives</label>
          <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <input className={cn(inputCls, 'bg-white')} value={obj} onChange={(e) => setObjectives((o) => o.map((x, idx) => (idx === i ? e.target.value : x)))} />
                <button onClick={() => setObjectives((o) => o.filter((_, idx) => idx !== i))} className="p-2.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600"><X size={16} /></button>
              </div>
            ))}
            <div className="flex items-center gap-3 p-3">
              <input className={cn(inputCls, 'bg-white')} value={newObj} onChange={(e) => setNewObj(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())} placeholder="Add an objective" />
              <button onClick={addObjective} disabled={!newObj.trim()} className="p-2.5 rounded-lg bg-amber-400 text-white hover:bg-amber-500 disabled:opacity-50"><Plus size={16} /></button>
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attachments</label>
          {(topic.attachments?.length ?? 0) > 0 && files.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {topic.attachments!.map((a) => (
                <a key={a.id} href={`${API_ORIGIN}/storage/${a.file_path}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200">
                  <Paperclip size={12} /> {a.file_name} <ExternalLink size={11} />
                </a>
              ))}
            </div>
          )}
          <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-brand-300 hover:text-brand-600 cursor-pointer transition-all w-fit">
            <Paperclip size={16} />
            {files.length > 0 ? `${files.length} file(s) selected` : 'Attach files'}
            <input type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
          </label>
          {files.length > 0 && (
            <p className="text-[11px] text-amber-600 font-medium">Uploading new files will replace the existing attachments.</p>
          )}
        </div>

        {error && <p className="flex items-center gap-2 text-sm text-rose-600 font-medium"><AlertCircle size={16} /> {error}</p>}
        <ModalActions isPending={updatePlan.isPending} onCancel={onClose} onConfirm={save} confirmLabel="Save Lesson Plan" />
      </div>
    </ModalShell>
  );
};

// ── Shared modal primitives ───────────────────────────────────────────────────────
const ModalShell: React.FC<{ title: string; subtitle?: string; wide?: boolean; onClose: () => void; children: React.ReactNode }> = ({ title, subtitle, wide, onClose, children }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
      className={cn('bg-white w-full rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]', wide ? 'max-w-3xl' : 'max-w-md')}
    >
      <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800">{title}</h3>
          {subtitle && <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50"><X size={20} /></button>
      </div>
      <div className="p-8 overflow-y-auto">{children}</div>
    </motion.div>
  </div>
);

const ModalActions: React.FC<{ isPending: boolean; disabled?: boolean; confirmLabel: string; onCancel: () => void; onConfirm: () => void }> = ({ isPending, disabled, confirmLabel, onCancel, onConfirm }) => (
  <div className="flex justify-end gap-3 pt-2">
    <button onClick={onCancel} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">Cancel</button>
    <button onClick={onConfirm} disabled={isPending || disabled} className="px-6 py-3 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand-100">
      {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
      {confirmLabel}
    </button>
  </div>
);

const ConfirmDelete: React.FC<{ label: string; isPending: boolean; onCancel: () => void; onConfirm: () => void }> = ({ label, isPending, onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4"><Trash2 size={28} /></div>
      <h4 className="text-lg font-extrabold text-slate-800 mb-2">Delete {label}?</h4>
      <p className="text-slate-500 text-sm mb-6">This action cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">Cancel</button>
        <button onClick={onConfirm} disabled={isPending} className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 disabled:opacity-60 flex items-center justify-center gap-2">
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
        </button>
      </div>
    </motion.div>
  </div>
);
