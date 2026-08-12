import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Loader2, Trash2, Edit2, X, Sparkles, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import {
  useTimetableActivities,
  useCreateTimetableActivity,
  useUpdateTimetableActivity,
  useDeleteTimetableActivity,
} from '../../hooks/use-timetable-activity';
import { TimetableActivityData } from '../../types/api/timetable-activity';
import { useBranchStore } from '../../store/use-branch-store';

export const TimeTableActivityManagement: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId || 1;

  const { data: activities, isLoading } = useTimetableActivities(branchId);
  const createMutation = useCreateTimetableActivity();
  const updateMutation = useUpdateTimetableActivity();
  const deleteMutation = useDeleteTimetableActivity();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<TimetableActivityData | null>(null);
  const [name, setName] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<TimetableActivityData | null>(null);

  const openAddForm = () => {
    setEditingActivity(null);
    setName('');
    setIsGlobal(false);
    setIsFormOpen(true);
  };

  const openEditForm = (activity: TimetableActivityData) => {
    setEditingActivity(activity);
    setName(activity.name);
    setIsGlobal(activity.branch_id === null);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingActivity) {
      updateMutation.mutate({ id: editingActivity.id, data: { name } }, { onSuccess: () => setIsFormOpen(false) });
    } else {
      createMutation.mutate(
        { name, branch_id: isGlobal ? null : branchId },
        { onSuccess: () => setIsFormOpen(false) }
      );
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Time Table Activities</h3>
          <p className="text-sm text-slate-500">Non-teaching schedule blocks like Assembly, Lunch, Break, Sports, Library.</p>
        </div>
        <Button onClick={openAddForm} leftIcon={<Plus size={18} />}>
          Add Activity
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
            <p>Loading activities...</p>
          </div>
        ) : !activities || activities.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No Activities"
            description="Add non-teaching blocks like Assembly, Lunch, or Break to use in the timetable grid."
            actionLabel="Add Activity"
            onAction={openAddForm}
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {activities.map((activity) => (
              <div key={activity.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-800">{activity.name}</span>
                  {activity.branch_id === null && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                      <Globe size={10} /> Global
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditForm(activity)} className="p-2 text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => setActivityToDelete(activity)} className="p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
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
                <h3 className="font-bold text-slate-900">{editingActivity ? 'Edit Activity' : 'Add Activity'}</h3>
                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Activity Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Assembly, Lunch, Break"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoFocus
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
                    />
                  </div>
                  {!editingActivity && (
                    <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <input type="checkbox" checked={isGlobal} onChange={(e) => setIsGlobal(e.target.checked)} className="accent-brand-500" />
                      Make this available to every campus (global)
                    </label>
                  )}
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Activity'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={!!activityToDelete}
        onClose={() => setActivityToDelete(null)}
        onConfirm={() => activityToDelete && deleteMutation.mutate(activityToDelete.id, { onSuccess: () => setActivityToDelete(null) })}
        title="Delete Activity?"
        message={`Are you sure you want to delete "${activityToDelete?.name}"?`}
        confirmLabel="Yes, Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
