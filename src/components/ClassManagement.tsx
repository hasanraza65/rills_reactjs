import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar,
  Loader2,
  Trash2,
  Edit2,
  Eye,
  Building2,
  Clock,
  Layers,
  BookOpen
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { EmptyState } from './ui/EmptyState';
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass, useClass } from '../hooks/use-class';
import { ClassData } from '../types/api/class';

export const ClassManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [className, setClassName] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassData | null>(null);
  
  const { data: classes, isLoading, error } = useClasses();
  const { data: classDetails, isLoading: isLoadingDetails, error: detailsError } = useClass(selectedClassId || 0);
  
  const createClassMutation = useCreateClass();
  const updateClassMutation = useUpdateClass();
  const deleteClassMutation = useDeleteClass();

  const filteredClasses = classes?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleOpenAddForm = () => {
    setEditingClass(null);
    setClassName('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (c: ClassData) => {
    setEditingClass(c);
    setClassName(c.name);
    setIsFormOpen(true);
  };

  const handleViewDetails = (id: number) => {
    setSelectedClassId(id);
    setIsDetailsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    if (editingClass) {
      updateClassMutation.mutate(
        { id: editingClass.id, data: { name: className } },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createClassMutation.mutate(
        { name: className, branch_id: 1 },
        { onSuccess: () => setIsFormOpen(false) }
      );
    }
  };

  const handleDeleteClick = (c: ClassData) => {
    setClassToDelete(c);
  };

  const confirmDelete = () => {
    if (classToDelete) {
      deleteClassMutation.mutate(classToDelete.id, {
        onSuccess: () => setClassToDelete(null)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Classes</h2>
          <p className="text-slate-500 font-medium mt-1">Manage academic classes and sections</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleOpenAddForm} leftIcon={<Plus size={18} />}>
            Add Class
          </Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>
          <Button variant="outline" leftIcon={<Filter size={18} />}>
            Filters
          </Button>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
            <p>Loading classes...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-rose-500">
            <p>Error loading classes. Please try again later.</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <EmptyState 
            icon={BookOpen}
            title="No Classes Found"
            description="Get started by creating your first academic class."
            actionLabel="Add Class"
            onAction={handleOpenAddForm}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[180px] sm:w-[40%]">Class Name</th>
                  <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[150px] sm:w-[30%]">Sections</th>
                  <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[120px] sm:w-[20%]">Created At</th>
                  <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right w-[100px] sm:w-[10%]">Actions</th>

                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredClasses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{c.name}</p>
                          <p className="text-xs text-slate-500 font-medium">ID: {c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-2">
                        {c.sections && c.sections.length > 0 ? (
                          c.sections.map(section => (
                            <span 
                              key={section.id} 
                              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider"
                            >
                              {section.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No sections</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleViewDetails(c.id)}
                          className="p-2 text-slate-400 sm:text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenEditForm(c)}
                          className="p-2 text-slate-400 sm:text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all"
                          title="Edit Class"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(c)}
                          className="p-2 text-slate-400 sm:text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
                          title="Delete Class"
                        >
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

      {/* View Details Modal */}
      <AnimatePresence>
        {isDetailsOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white w-full max-w-lg rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-slate-100"
            >
              {/* Header */}
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start justify-between relative bg-gradient-to-br from-indigo-50/50 to-white gap-4">
                <div className="flex items-center gap-4 sm:gap-5">
                  {classDetails ? (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-lg shadow-indigo-500/20 ring-4 ring-white shrink-0">
                      {classDetails.name.charAt(0)}
                    </div>

                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 animate-pulse ring-4 ring-white" />
                  )}
                  <div className="pt-1">
                    {classDetails ? (
                      <>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{classDetails.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            ID: {classDetails.id}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="h-7 w-32 bg-slate-100 rounded-lg animate-pulse" />
                        <div className="h-4 w-16 bg-slate-100 rounded-lg animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setIsDetailsOpen(false)} 
                  className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-600 shadow-sm hover:shadow-md bg-transparent sm:absolute sm:top-6 sm:right-6 self-end sm:self-auto"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>

              </div>

              {/* Body */}
              <div className="p-6 md:p-8 pt-4 min-h-[280px]">
                {isLoadingDetails ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-slate-400 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                    <p className="text-sm font-medium">Fetching class details...</p>
                  </div>
                ) : detailsError ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-rose-500 bg-rose-50 rounded-2xl">
                    <p className="font-bold">Failed to load class details</p>
                    <p className="text-sm opacity-80 mt-1">Please try again later.</p>
                  </div>
                ) : classDetails ? (
                  <div className="space-y-8">
                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Branch Info */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:border-brand-500/20 transition-colors group">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 size={14} className="text-brand-500" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Branch</p>
                        </div>
                        <p className="text-sm font-bold text-slate-800">Branch #{classDetails.branch_id}</p>
                      </div>

                      {/* Author Info */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:border-brand-500/20 transition-colors group">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen size={14} className="text-brand-500" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Added By</p>
                        </div>
                        <p className="text-sm font-bold text-slate-800">User #{classDetails.added_by}</p>
                      </div>

                      {/* Created Info */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:border-brand-500/20 transition-colors group">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={14} className="text-brand-500" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created On</p>
                        </div>
                        <p className="text-sm font-bold text-slate-700">
                          {new Date(classDetails.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>

                      {/* Updated Info */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:border-brand-500/20 transition-colors group">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={14} className="text-brand-500" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Update</p>
                        </div>
                        <p className="text-sm font-bold text-slate-700">
                           {new Date(classDetails.updated_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Sections Lineup */}
                    <div>
                       <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-2">
                           <Layers size={16} className="text-slate-400" />
                           <h4 className="text-sm font-bold text-slate-800">Assigned Sections</h4>
                         </div>
                         <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                           {classDetails.sections?.length || 0} Total
                         </span>
                       </div>
                       
                       <div className="flex flex-wrap gap-2">
                         {classDetails.sections && classDetails.sections.length > 0 ? (
                            classDetails.sections.map(sec => (
                              <div 
                                key={sec.id} 
                                className="flex items-center justify-center min-w-[3rem] px-4 py-2.5 bg-white border-2 border-slate-100 shadow-sm rounded-xl text-sm font-bold text-slate-700 hover:border-brand-500 hover:text-brand-600 transition-all cursor-default"
                                title={`Section ID: ${sec.id}`}
                              >
                                {sec.name}
                              </div>
                            ))
                         ) : (
                           <div className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center flex-col text-slate-400 gap-2">
                             <Layers size={20} className="opacity-50" />
                             <p className="text-sm font-medium">No sections configured yet.</p>
                           </div>
                         )}
                       </div>
                    </div>
                  </div>
                ) : null}
              </div>
              
              {/* Footer */}
              <div className="p-6 md:p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 rounded-b-[2rem]">
                <Button 
                  className="w-full md:w-auto px-8"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close Details
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
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
                <h3 className="font-bold text-slate-900">
                  {editingClass ? 'Edit Class' : 'Add New Class'}
                </h3>
                <button 
                  onClick={() => setIsFormOpen(false)} 
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <Plus className="w-5 h-5 rotate-45 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Class Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Grade 1" 
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      required
                      autoFocus
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none" 
                    />
                  </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setIsFormOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="w-full sm:w-auto shadow-xl shadow-brand-200"
                    disabled={createClassMutation.isPending || updateClassMutation.isPending}
                  >
                    {createClassMutation.isPending || updateClassMutation.isPending ? 'Saving...' : 'Save Class'}
                  </Button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {classToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-slate-100 p-6 text-center relative"
            >
              <button 
                onClick={() => setClassToDelete(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
              
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Class?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete <strong className="text-slate-700">{classToDelete.name}</strong>? This action cannot be undone and will remove all associated sections.
              </p>
              
              <div className="flex gap-3 w-full">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setClassToDelete(null)}
                >
                  Cancel
                </Button>
                <button 
                  onClick={confirmDelete}
                  disabled={deleteClassMutation.isPending}
                  className="w-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {deleteClassMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
