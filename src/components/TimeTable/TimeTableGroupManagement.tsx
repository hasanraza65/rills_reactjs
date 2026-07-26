import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Loader2, Trash2, Edit2, X, Layers } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import {
  useTimetableGroups,
  useCreateTimetableGroup,
  useUpdateTimetableGroup,
  useDeleteTimetableGroup,
} from '../../hooks/use-timetable-group';
import { useClasses } from '../../hooks/use-class';
import { TimetableGroupData } from '../../types/api/timetable-group';
import { useBranchStore } from '../../store/use-branch-store';

export const TimeTableGroupManagement: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId || 1;

  const { data: groups, isLoading } = useTimetableGroups(branchId);
  const { data: classes } = useClasses(branchId);

  const createMutation = useCreateTimetableGroup();
  const updateMutation = useUpdateTimetableGroup();
  const deleteMutation = useDeleteTimetableGroup();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TimetableGroupData | null>(null);
  const [name, setName] = useState('');
  const [classIds, setClassIds] = useState<number[]>([]);
  const [groupToDelete, setGroupToDelete] = useState<TimetableGroupData | null>(null);

  const openAddForm = () => {
    setEditingGroup(null);
    setName('');
    setClassIds([]);
    setIsFormOpen(true);
  };

  const openEditForm = (group: TimetableGroupData) => {
    setEditingGroup(group);
    setName(group.name);
    setClassIds(group.classes?.map((c) => c.id) || []);
    setIsFormOpen(true);
  };

  const toggleClass = (id: number) => {
    setClassIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || classIds.length === 0) return;

    if (editingGroup) {
      updateMutation.mutate(
        { id: editingGroup.id, data: { name, class_ids: classIds } },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createMutation.mutate(
        { branch_id: branchId, name, class_ids: classIds },
        { onSuccess: () => setIsFormOpen(false) }
      );
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Time Table Groups</h3>
          <p className="text-sm text-slate-500">Named groupings of grade levels that share one schedule (e.g. "Level Six to Seven").</p>
        </div>
        <Button onClick={openAddForm} leftIcon={<Plus size={18} />}>
          Add Group
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
            <p>Loading groups...</p>
          </div>
        ) : !groups || groups.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No Time Table Groups"
            description="Create a group to bundle grade levels that share one schedule structure."
            actionLabel="Add Group"
            onAction={openAddForm}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Levels Covered</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {groups.map((group) => (
                  <tr key={group.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{group.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {group.classes?.map((c) => (
                          <span key={c.id} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditForm(group)} className="p-2 text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setGroupToDelete(group)} className="p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">{editingGroup ? 'Edit Group' : 'Add Time Table Group'}</h3>
                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Group Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Level Six to Seven Time Table"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoFocus
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Levels Covered</label>
                    <div className="grid grid-cols-2 gap-2">
                      {classes?.map((c) => (
                        <label
                          key={c.id}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                            classIds.includes(c.id) ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <input type="checkbox" checked={classIds.includes(c.id)} onChange={() => toggleClass(c.id)} className="accent-brand-500" />
                          <span className="text-sm font-medium">{c.name}</span>
                        </label>
                      ))}
                    </div>
                    {classIds.length === 0 && <p className="text-xs text-rose-500">Select at least one level.</p>}
                  </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Group'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={() => groupToDelete && deleteMutation.mutate(groupToDelete.id, { onSuccess: () => setGroupToDelete(null) })}
        title="Delete Time Table Group?"
        message={`Are you sure you want to delete "${groupToDelete?.name}"? This won't be possible if a Periods template or Timetable already references it.`}
        confirmLabel="Yes, Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
