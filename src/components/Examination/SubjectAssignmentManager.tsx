import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Users, BookOpen, X, User } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { useBranchStore } from '../../store/use-branch-store';
import { useClasses } from '../../hooks/use-class';
import { useSections } from '../../hooks/use-section';
import { useClassSubjects } from '../../hooks/use-class-subject';
import { useStudents } from '../../hooks/use-student';
import {
  useExamSubjectGroups,
  useCreateExamSubjectGroup,
  useStudentSubjectsMap,
  useBulkAssignExamSubjects,
  useSetStudentExamSubjects,
} from '../../hooks/use-exam-subject';

const NEW_GROUP_OPTION = '__new__';

export const SubjectAssignmentManager: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId ?? 1;

  const { data: classes } = useClasses(branchId);
  const { data: sections } = useSections(branchId);
  const { data: allStudents } = useStudents(branchId);

  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [searched, setSearched] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupSubjectIds, setGroupSubjectIds] = useState<number[]>([]);

  const [activeStudent, setActiveStudent] = useState<any | null>(null);
  const [draftSubjectIds, setDraftSubjectIds] = useState<number[]>([]);

  const { data: subjectsResp } = useClassSubjects(sectionId ? Number(sectionId) : null, branchId);
  const subjects = subjectsResp?.data ?? [];

  const { data: sectionGroupsResp } = useExamSubjectGroups(sectionId ? Number(sectionId) : null);
  const sectionGroups = sectionGroupsResp ?? [];
  const createSubjectGroup = useCreateExamSubjectGroup();
  const bulkAssignSubjects = useBulkAssignExamSubjects();
  const setStudentSubjects = useSetStudentExamSubjects();

  const filteredSections = (sections ?? []).filter((s) => !classId || String(s.school_class_id) === classId);

  const classStudents = useMemo(() => {
    if (!searched || !allStudents) return [];
    return allStudents.filter((s) => s.class_id === Number(classId) && s.section_id === Number(sectionId));
  }, [searched, allStudents, classId, sectionId]);

  const { data: studentSubjects } = useStudentSubjectsMap(classStudents.map((s) => s.id));
  const studentSubjectsMap = studentSubjects ?? {};

  const activeGroup = sectionGroups.find((g) => String(g.id) === groupId) ?? null;
  const activeGroupSubjectIds = activeGroup?.subjects?.map((s) => s.id) ?? [];

  const handleSearch = () => {
    setSelectedIds(new Set());
    setSearched(true);
  };

  const toggleSelected = (studentId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === classStudents.length ? new Set() : new Set(classStudents.map((s) => s.id))
    );
  };

  const handleAssignGroup = () => {
    if (!activeGroup || selectedIds.size === 0 || activeGroupSubjectIds.length === 0) return;
    bulkAssignSubjects.mutate(
      { studentIds: Array.from(selectedIds), classSubjectIds: activeGroupSubjectIds },
      { onSuccess: () => setSelectedIds(new Set()) }
    );
  };

  const handleOpenGroupModal = () => {
    setGroupName('');
    setGroupSubjectIds([]);
    setIsGroupModalOpen(true);
  };

  const toggleGroupSubject = (subjectId: number) => {
    setGroupSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || groupSubjectIds.length === 0) return;
    createSubjectGroup.mutate(
      { branch_id: branchId, section_id: Number(sectionId), name: groupName.trim(), subject_ids: groupSubjectIds },
      {
        onSuccess: (newGroup) => {
          setGroupId(String(newGroup.id));
          setIsGroupModalOpen(false);
        },
      }
    );
  };

  const handleOpenSubjectsModal = (student: any) => {
    setActiveStudent(student);
    const existing = studentSubjectsMap[student.id];
    // No saved rows yet → default to "takes every subject", matching the same default
    // used in the Students list's own Subjects button.
    setDraftSubjectIds(existing && existing.length > 0 ? existing : subjects.map((s) => s.id));
  };

  const toggleDraftSubject = (subjectId: number) => {
    setDraftSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleSaveStudentSubjects = () => {
    if (!activeStudent) return;
    setStudentSubjects.mutate(
      { studentId: activeStudent.id, classSubjectIds: draftSubjectIds },
      { onSuccess: () => setActiveStudent(null) }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center sm:text-left">
          Assign Subjects
        </h2>
        <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base text-center sm:text-left">
          Assign exam subjects to students — individually, or in bulk via a subject group
        </p>
      </div>

      <Card padding="md">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Class</label>
            <Select
              value={classId}
              onChange={(v) => { setClassId(v); setSectionId(''); setGroupId(''); setSearched(false); }}
              options={(classes ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
              placeholder="Select class"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Section</label>
            <Select
              value={sectionId}
              onChange={(v) => { setSectionId(v); setGroupId(''); setSearched(false); }}
              options={filteredSections.map((s) => ({ value: String(s.id), label: s.name }))}
              placeholder={classId ? 'Select section' : 'Select class first'}
              disabled={!classId}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Subject Group</label>
            <Select
              value={groupId}
              onChange={(v) => (v === NEW_GROUP_OPTION ? handleOpenGroupModal() : setGroupId(v))}
              options={sectionGroups.map((g) => ({ value: String(g.id), label: g.name }))}
              extraOption={{ value: NEW_GROUP_OPTION, label: '+ Create New Group' }}
              placeholder={sectionId ? 'Select group (optional)' : 'Select section first'}
              disabled={!sectionId}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSearch} disabled={!classId || !sectionId} leftIcon={<Search size={18} />}>
            Search
          </Button>
        </div>
      </Card>

      {!searched ? (
        <Card padding="none">
          <EmptyState
            icon={Users}
            title="Search for Students"
            description="Select a class and section above, then search to see students and assign their exam subjects."
          />
        </Card>
      ) : classStudents.length === 0 ? (
        <Card padding="none">
          <EmptyState icon={User} title="No Students Found" description="No students are enrolled in this class & section for this branch." />
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedIds.size === classStudents.length}
                onChange={toggleSelectAll}
                className="accent-brand-500"
              />
              <span className="text-sm font-bold text-slate-600">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
              </span>
            </label>
            <Button
              onClick={handleAssignGroup}
              disabled={!activeGroup || selectedIds.size === 0}
              leftIcon={<BookOpen size={18} />}
              title={!activeGroup ? 'Select a subject group first' : undefined}
              isLoading={bulkAssignSubjects.isPending}
            >
              Assign "{activeGroup?.name ?? 'Group'}" to Selected
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 w-[5%]"></th>
                  <th className="px-2 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[22%]">Student</th>
                  <th className="px-2 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Class</th>
                  <th className="px-2 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[18%]">Father Name</th>
                  <th className="px-2 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[25%]">Subjects Assigned</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {classStudents.map((s) => {
                  const assignedIds = studentSubjectsMap[s.id] ?? [];
                  const assignedNames = assignedIds
                    .map((id) => subjects.find((sub) => sub.id === id)?.subject_name)
                    .filter(Boolean) as string[];
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(s.id)}
                          onChange={() => toggleSelected(s.id)}
                          className="accent-brand-500"
                        />
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{s.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{s.admission_no}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <p className="text-sm text-slate-600 font-medium">
                          {s.class?.name ?? classId} ({s.section?.name ?? sectionId})
                        </p>
                      </td>
                      <td className="px-2 py-4">
                        <p className="text-sm text-slate-600 font-medium">{s.parent?.father_name ?? '-'}</p>
                      </td>
                      <td className="px-2 py-4">
                        {assignedNames.length === 0 ? (
                          <span className="text-xs text-slate-400 font-medium">Not assigned</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {assignedNames.map((name) => (
                              <span key={name} className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-[11px] rounded-md">
                                {name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => handleOpenSubjectsModal(s)} leftIcon={<BookOpen size={14} />}>
                          Subjects
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Subject Group modal */}
      <AnimatePresence>
        {isGroupModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">Create Subject Group</h3>
                <button onClick={() => setIsGroupModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveGroup}>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Group Name</label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                      placeholder="e.g. Science Group"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Subjects</label>
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {subjects.map((sub) => (
                        <label
                          key={sub.id}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                            groupSubjectIds.includes(sub.id) ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={groupSubjectIds.includes(sub.id)}
                            onChange={() => toggleGroupSubject(sub.id)}
                            className="accent-brand-500"
                          />
                          <span className="text-sm font-medium">{sub.subject_name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsGroupModalOpen(false)}>Cancel</Button>
                  <Button type="submit" isLoading={createSubjectGroup.isPending}>Save Group</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Per-student subjects modal */}
      <AnimatePresence>
        {activeStudent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">Assign Subjects — {activeStudent.name}</h3>
                <button onClick={() => setActiveStudent(null)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-2 max-h-80 overflow-y-auto">
                {subjects.length === 0 ? (
                  <p className="text-sm text-slate-400">No subjects found for this section.</p>
                ) : (
                  subjects.map((sub) => (
                    <label
                      key={sub.id}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                        draftSubjectIds.includes(sub.id) ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={draftSubjectIds.includes(sub.id)}
                        onChange={() => toggleDraftSubject(sub.id)}
                        className="accent-brand-500"
                      />
                      <span className="text-sm font-medium">{sub.subject_name}</span>
                    </label>
                  ))
                )}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setActiveStudent(null)}>Cancel</Button>
                <Button onClick={handleSaveStudentSubjects} isLoading={setStudentSubjects.isPending}>Save</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
