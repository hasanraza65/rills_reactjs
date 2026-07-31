import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Loader2, Plus, Trash2, X } from 'lucide-react';
import { Select } from '../ui/Select';
import { useClasses } from '../../hooks/use-class';
import { useSectionsByClass } from '../../hooks/use-section';
import {
  useTeacherSubjects,
  useBranchSubjects,
  useCreateClassSubject,
  useDeleteClassSubject,
} from '../../hooks/use-class-subject';

const NEW_SUBJECT_VALUE = '__new__';

interface TeacherSubjectsModalProps {
  teacherId: number;
  teacherName: string;
  branchId: number;
  onClose: () => void;
}

export const TeacherSubjectsModal: React.FC<TeacherSubjectsModalProps> = ({
  teacherId, teacherName, branchId, onClose,
}) => {
  const { data: assignments, isLoading } = useTeacherSubjects(teacherId, branchId);
  const { data: branchSubjects } = useBranchSubjects(branchId);
  const { data: classes } = useClasses(branchId);

  const [classId, setClassId] = useState<number | ''>('');
  const [sectionId, setSectionId] = useState<number | ''>('');
  const [subjectChoice, setSubjectChoice] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: sections } = useSectionsByClass(classId === '' ? null : classId);

  const createMutation = useCreateClassSubject();
  const deleteMutation = useDeleteClassSubject();

  const sortedAssignments = useMemo(
    () => [...(assignments?.data ?? [])].sort((a, b) => a.subject_name.localeCompare(b.subject_name)),
    [assignments]
  );

  // The full catalogue of subject names already in use anywhere in the branch —
  // lets an existing subject like "Math" be handed to another teacher (e.g.
  // Hassan, alongside Mubeen) without retyping/misspelling the name.
  const subjectNames = useMemo(
    () => Array.from(new Set((branchSubjects?.data ?? []).map((s) => s.subject_name))).sort((a, b) => a.localeCompare(b)),
    [branchSubjects]
  );

  const effectiveSubjectName = subjectChoice === NEW_SUBJECT_VALUE ? newSubjectName.trim() : subjectChoice;

  // A subject is ticked in the picker when this teacher already teaches it
  // anywhere (matches the "Current Subjects" list above), independent of
  // whichever class/section is currently selected in the Add form.
  const isAssignedToTeacher = (name: string): boolean =>
    sortedAssignments.some((a) => a.subject_name === name);

  const isDuplicate = useMemo(() => {
    if (classId === '' || sectionId === '' || !effectiveSubjectName) return false;
    return sortedAssignments.some(
      (a) => a.class_id === classId && a.section_id === sectionId && a.subject_name === effectiveSubjectName
    );
  }, [sortedAssignments, classId, sectionId, effectiveSubjectName]);

  const handleAdd = async () => {
    if (classId === '' || sectionId === '' || !effectiveSubjectName || isDuplicate) return;
    await createMutation.mutateAsync({
      class_id: classId,
      section_id: sectionId,
      teacher_id: teacherId,
      subject_name: effectiveSubjectName,
      branch_id: branchId,
    });
    setSubjectChoice('');
    setNewSubjectName('');
  };

  const handleDelete = async (id: number, secId: number) => {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync({ id, sectionId: secId });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-lg max-h-[85vh] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">Assign Subjects</h3>
              <p className="text-xs text-slate-400">{teacherName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Current Subjects</p>
            {isLoading ? (
              <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-brand-500" /></div>
            ) : sortedAssignments.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No subjects assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {sortedAssignments.map((cs) => (
                  <div key={cs.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{cs.subject_name}</p>
                      <p className="text-xs text-slate-400">{cs.class?.name ?? '—'} · {cs.section?.name ?? '—'}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(cs.id, cs.section_id)}
                      disabled={deletingId === cs.id}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
                      title="Remove"
                    >
                      {deletingId === cs.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add Subject</p>
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={classId === '' ? '' : String(classId)}
                placeholder="Select Class"
                options={(classes ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
                onChange={(v) => { setClassId(v ? Number(v) : ''); setSectionId(''); }}
              />
              <Select
                value={sectionId === '' ? '' : String(sectionId)}
                placeholder="Select Section"
                options={(sections ?? []).map((s) => ({ value: String(s.id), label: s.name }))}
                onChange={(v) => setSectionId(v ? Number(v) : '')}
                disabled={classId === ''}
              />
            </div>
            <Select
              value={subjectChoice}
              placeholder="Select Subject"
              options={subjectNames.map((name) => ({ value: name, label: name, tick: isAssignedToTeacher(name) }))}
              onChange={(v) => { setSubjectChoice(v); setNewSubjectName(''); }}
              extraOption={{ value: NEW_SUBJECT_VALUE, label: '+ Add New Subject' }}
            />
            {subjectChoice === NEW_SUBJECT_VALUE && (
              <input
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="New subject name (e.g. Mathematics)"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            )}
            {isDuplicate && (
              <p className="text-xs font-medium text-amber-600">Already assigned to this teacher in this class/section.</p>
            )}
            <button
              onClick={handleAdd}
              disabled={classId === '' || sectionId === '' || !effectiveSubjectName || isDuplicate || createMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 text-white text-sm font-bold rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-all"
            >
              {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Add Subject
            </button>
          </div>
        </div>

        <div className="px-8 py-5 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
