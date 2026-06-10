import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Loader2,
  BookOpen,
  ArrowLeft,
  Layers,
  GraduationCap,
  Calendar,
  ChevronRight,
  Plus,
  X,
  User,
  Edit2,
  Trash2
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { useClasses } from '../hooks/use-class';
import { useClassSubjects, useCreateClassSubject, useUpdateClassSubject, useDeleteClassSubject } from '../hooks/use-class-subject';
import { useBranchStore } from '../store/use-branch-store';
import { ClassSection } from '../types/api/class';
import { ClassSubjectData } from '../types/api/class-subject';

/**
 * Section Subjects View - Shows subjects for a specific section
 * Includes Add Subject functionality
 */
const SectionSubjectsView: React.FC<{ 
  section: ClassSection; 
  className: string; 
  onBack: () => void;
}> = ({ section, className: classTitle, onBack }) => {
  const { data: subjectsResponse, isLoading, error } = useClassSubjects(section.id);
  const createMutation = useCreateClassSubject();
  const updateMutation = useUpdateClassSubject();
  const deleteMutation = useDeleteClassSubject();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [teacherId, setTeacherId] = useState<number>(1);

  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<ClassSubjectData | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editTeacherId, setEditTeacherId] = useState<number>(1);

  // Delete state
  const [subjectToDelete, setSubjectToDelete] = useState<ClassSubjectData | null>(null);

  const subjects = subjectsResponse?.data || [];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    createMutation.mutate(
      {
        class_id: section.school_class_id,
        section_id: section.id,
        teacher_id: teacherId,
        subject_name: subjectName.trim(),
        branch_id: 1,
      },
      {
        onSuccess: () => {
          setIsAddModalOpen(false);
          setSubjectName('');
          setTeacherId(1);
        },
      }
    );
  };

  const handleOpenEdit = (sub: ClassSubjectData) => {
    setEditingSubject(sub);
    setEditSubjectName(sub.name || sub.subject_name || '');
    setEditTeacherId(sub.teacher_id || 1);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editSubjectName.trim()) return;

    updateMutation.mutate(
      {
        id: editingSubject.id,
        data: {
          class_id: section.school_class_id,
          section_id: section.id,
          teacher_id: editTeacherId,
          subject_name: editSubjectName.trim(),
          _method: 'PUT',
        },
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setEditingSubject(null);
        },
      }
    );
  };

  const confirmDelete = () => {
    if (!subjectToDelete) return;
    deleteMutation.mutate(
      { id: subjectToDelete.id, sectionId: section.id },
      { onSuccess: () => setSubjectToDelete(null) }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {classTitle} — Section {section.name}
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              Subjects assigned to this section
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mr-4">
            <button onClick={onBack} className="hover:text-brand-500 transition-colors">Classes</button>
            <ChevronRight size={12} />
            <span className="text-brand-600">{classTitle} / {section.name}</span>
          </div>
          
          {/* Add Subject Button */}
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            leftIcon={<Plus size={18} />}
            className="w-full sm:w-auto shadow-xl shadow-brand-200"
          >
            Add Subject
          </Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-500" />
            <p className="text-sm font-bold uppercase tracking-widest">Loading subjects...</p>
          </div>
        ) : error ? (
          <div className="p-16 flex flex-col items-center justify-center text-rose-500 bg-rose-50/30">
            <p className="font-bold text-lg">Failed to load subjects</p>
            <p className="text-sm opacity-80 mt-1">There was an error communicating with the server.</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
              <BookOpen size={36} className="text-slate-300" />
            </div>
            <p className="text-xl font-bold text-slate-800 mb-2">No Subjects Found</p>
            <p className="text-sm text-center max-w-md text-slate-500">
              No subjects have been assigned to <strong className="text-slate-700">{classTitle}</strong> — Section <strong className="text-slate-700">{section.name}</strong> yet.
            </p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="mt-6 px-6 py-3 bg-brand-500 text-white rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-200 flex items-center gap-2"
            >
              <Plus size={18} />
              Add First Subject
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[8%]">#</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[30%]">Subject Name</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[25%]">Section</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[22%]">Added On</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right w-[15%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subjects.map((sub, idx) => (
                    <motion.tr 
                      key={sub.id} 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-slate-400">{idx + 1}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-brand-100">
                            {(sub.name || sub.subject_name || 'S').charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{sub.name || sub.subject_name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {sub.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider border border-indigo-100/50">
                          {classTitle} — {section.name}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                          <Calendar size={14} className="text-slate-400" />
                          {sub.created_at ? new Date(sub.created_at).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric'
                          }) : '—'}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEdit(sub)}
                            className="p-2 text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all" 
                            title="Edit Subject"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setSubjectToDelete(sub)}
                            className="p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all" 
                            title="Delete Subject"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-100">
              {subjects.map((sub, idx) => (
                <motion.div 
                  key={sub.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-5 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-brand-100">
                      {(sub.name || sub.subject_name || 'S').charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-800">{sub.name || sub.subject_name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {sub.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase border border-indigo-100/50">
                      {classTitle} — {section.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleOpenEdit(sub)}
                        className="p-2.5 text-slate-400 bg-slate-50 rounded-xl hover:text-brand-500 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setSubjectToDelete(sub)}
                        className="p-2.5 text-rose-400 bg-rose-50/50 rounded-xl hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Edit Subject Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Subject</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {classTitle} — Section {section.name}
                  </p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen size={14} className="text-brand-500" />
                      Subject Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mathematics"
                      value={editSubjectName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditSubjectName(e.target.value)}
                      required
                      autoFocus
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none transition-all font-medium text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <User size={14} className="text-indigo-500" />
                      Assign Teacher
                    </label>
                    <select
                      value={editTeacherId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditTeacherId(Number(e.target.value))}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-sm appearance-none"
                    >
                      <option value={1}>Default Teacher (ID: 1)</option>
                    </select>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
                  <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="shadow-xl shadow-brand-200" isLoading={updateMutation.isPending}>Save Changes</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {subjectToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
            >
              <div className="p-6 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
                  <Trash2 size={26} className="text-rose-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Subject?</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Are you sure you want to delete <span className="text-slate-700 font-bold">"{subjectToDelete.subject_name}"</span>? This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setSubjectToDelete(null)} disabled={deleteMutation.isPending}>Cancel</Button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Add New Subject</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {classTitle} — Section {section.name}
                  </p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleAddSubmit}>
                <div className="p-6 space-y-5">
                  {/* Subject Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen size={14} className="text-brand-500" />
                      Subject Name
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Mathematics, English, Science..."
                      value={subjectName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubjectName(e.target.value)}
                      required
                      autoFocus
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none transition-all font-medium text-sm"
                    />
                  </div>

                  {/* Teacher Selection (Hardcoded for now) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <User size={14} className="text-indigo-500" />
                      Assign Teacher
                    </label>
                    <select
                      value={teacherId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTeacherId(Number(e.target.value))}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none transition-all font-medium text-sm appearance-none"
                    >
                      <option value={1}>Default Teacher (ID: 1)</option>
                    </select>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Teacher list will be dynamic in a future update.
                    </p>
                  </div>

                  {/* Info Bar */}
                  <div className="p-3 rounded-xl bg-brand-50/50 border border-brand-100/50">
                    <div className="flex items-center gap-3 text-xs text-brand-700 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Class:</span>
                        <span className="font-bold">{classTitle}</span>
                      </div>
                      <span className="text-brand-300">•</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Section:</span>
                        <span className="font-bold">{section.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 rounded-b-3xl">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto shadow-xl shadow-brand-200"
                    isLoading={createMutation.isPending}
                  >
                    Add Subject
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


/**
 * SubjectModule - Main component showing classes + section buttons
 * When a section is clicked, navigates to subjects view
 */
export const SubjectModule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<{ section: ClassSection; className: string } | null>(null);
  
  const { selectedBranchId } = useBranchStore();
  const { data: classes, isLoading, error } = useClasses(selectedBranchId || 1);

  // If a section is selected, show subjects view
  if (selectedSection) {
    return (
      <SectionSubjectsView 
        section={selectedSection.section} 
        className={selectedSection.className} 
        onBack={() => setSelectedSection(null)} 
      />
    );
  }

  const filteredClasses = classes?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center sm:text-left">
            Subjects
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base text-center sm:text-left">
            Select a class section to view its subjects
          </p>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        {/* Search & Filter */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium"
            />
          </div>
          <Button variant="outline" leftIcon={<Filter size={18} />} className="w-full sm:w-auto justify-center">
            Filters
          </Button>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
            <p className="text-sm font-bold uppercase tracking-widest">Loading classes...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-rose-500 bg-rose-50/30">
            <p className="font-bold">Failed to load classes</p>
            <p className="text-sm opacity-80 mt-1">There was an error communicating with the server.</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <EmptyState 
            icon={GraduationCap}
            title="No Classes Found"
            description={searchQuery ? `No classes match "${searchQuery}"` : "No classes have been created yet."}
            actionLabel={searchQuery ? "Clear Search" : undefined}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[35%]">Class Name</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[65%]">Sections (Click to view subjects)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredClasses.map((c, idx) => (
                    <motion.tr 
                      key={c.id} 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-brand-100">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{c.name}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">ID: {c.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-2">
                          {c.sections && c.sections.length > 0 ? (
                            c.sections.map(section => (
                              <motion.button
                                key={section.id}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedSection({ section, className: c.name })}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 hover:shadow-lg hover:shadow-brand-100/50 transition-all shadow-sm cursor-pointer"
                              >
                                <Layers size={14} className="opacity-70" />
                                Section {section.name}
                                <ChevronRight size={12} className="ml-1 opacity-50" />
                              </motion.button>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic font-medium">No sections available</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredClasses.map((c, idx) => (
                <motion.div 
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="p-5 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-brand-100">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {c.id}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sections</p>
                    <div className="flex flex-wrap gap-2">
                      {c.sections && c.sections.length > 0 ? (
                        c.sections.map(section => (
                          <button
                            key={section.id}
                            onClick={() => setSelectedSection({ section, className: c.name })}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider hover:border-brand-500 hover:text-brand-600 hover:shadow-md transition-all shadow-sm"
                          >
                            <Layers size={14} className="opacity-70" />
                            Section {section.name}
                            <ChevronRight size={12} className="ml-1 opacity-50" />
                          </button>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No sections available</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
