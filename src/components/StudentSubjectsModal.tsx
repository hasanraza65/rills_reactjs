import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ListChecks, Save } from 'lucide-react';
import { StudentData } from '../types/api/student';
import { useClassSubjects } from '../hooks/use-class-subject';
import { useStudentSubjectsMap, useSetStudentExamSubjects } from '../hooks/use-exam-subject';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';

interface StudentSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentData | null;
  branchId: number;
}

/**
 * Which subjects one student is examined in. By default every student takes every
 * subject their class offers — this only needs touching to opt a student OUT of a
 * subject (e.g. an elective they don't take). Uncheck what doesn't apply, Save.
 */
export const StudentSubjectsModal: React.FC<StudentSubjectsModalProps> = ({ isOpen, onClose, student, branchId }) => {
  const sectionId = student?.section_id ?? null;
  const { data: subjectsResp } = useClassSubjects(sectionId, branchId);
  const subjects = subjectsResp?.data ?? [];

  const { data: assignedMap } = useStudentSubjectsMap(student ? [student.id] : []);
  const setStudentSubjects = useSetStudentExamSubjects();

  const [checked, setChecked] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!student || subjects.length === 0) {
      setChecked(new Set());
      return;
    }
    const existing = assignedMap?.[student.id];
    // No saved rows yet for this student → default to "takes every subject". Once
    // they've been explicitly saved once (even to an empty set), respect that exactly.
    setChecked(new Set(existing && existing.length > 0 ? existing : subjects.map((s) => s.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id, subjects, assignedMap]);

  const toggle = (subjectId: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) next.delete(subjectId);
      else next.add(subjectId);
      return next;
    });
  };

  const handleSave = () => {
    if (!student) return;
    setStudentSubjects.mutate(
      { studentId: student.id, classSubjectIds: Array.from(checked) },
      { onSuccess: onClose }
    );
  };

  if (!isOpen || !student) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Subjects — {student.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {student.class?.name ?? 'No class'} {student.section?.name ? `(${student.section.name})` : ''}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-2 max-h-80 overflow-y-auto">
            {!sectionId ? (
              <EmptyState
                icon={ListChecks}
                title="No Class Assigned"
                description="Assign this student to a class & section first, then their subjects can be managed here."
              />
            ) : subjects.length === 0 ? (
              <p className="text-sm text-slate-400">No subjects found for this section.</p>
            ) : (
              subjects.map((sub) => (
                <label
                  key={sub.id}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                    checked.has(sub.id) ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked.has(sub.id)}
                    onChange={() => toggle(sub.id)}
                    className="accent-brand-500"
                  />
                  <span className="text-sm font-medium">{sub.subject_name}</span>
                </label>
              ))
            )}
          </div>

          {sectionId && subjects.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave} leftIcon={<Save size={18} />} isLoading={setStudentSubjects.isPending}>
                Save
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
