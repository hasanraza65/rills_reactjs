import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus,
  Search, 
  Filter, 
  Calendar,
  Loader2,
  Trash2,
  Edit2,
  Eye,
  Layers,
  Building2,
  Clock,
  X,
  BookOpen
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { EmptyState } from './ui/EmptyState';
import { useSections, useSection, useCreateSection, useUpdateSection, useDeleteSection } from '../hooks/use-section';
import { useClasses } from '../hooks/use-class';
import { SectionData } from '../types/api/section';

export const SectionManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionData | null>(null);
  const [sectionName, setSectionName] = useState('');
  const [parentClassId, setParentClassId] = useState<number>(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<SectionData | null>(null);
  
  const { data: sections, isLoading, error } = useSections();
  const { data: classes } = useClasses();
  const { data: sectionDetails, isLoading: isLoadingDetails } = useSection(selectedSectionId);

  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();
  const deleteMutation = useDeleteSection();

  const filteredSections = sections?.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.school_class.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleOpenAddForm = () => {
    setEditingSection(null);
    setSectionName('');
    setParentClassId(classes?.[0]?.id || 0);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (s: SectionData) => {
    setEditingSection(s);
    setSectionName(s.name);
    setParentClassId(s.school_class_id);
    setIsFormOpen(true);
  };

  const handleViewDetails = (id: number) => {
    setSelectedSectionId(id);
    setIsDetailsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim() || !parentClassId) return;

    if (editingSection) {
      updateMutation.mutate(
        { id: editingSection.id, data: { name: sectionName, school_class_id: parentClassId } },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createMutation.mutate(
        { name: sectionName, school_class_id: parentClassId, branch_id: 1 },
        { onSuccess: () => setIsFormOpen(false) }
      );
    }
  };

  const confirmDelete = () => {
    if (sectionToDelete) {
      deleteMutation.mutate(sectionToDelete.id, {
        onSuccess: () => setSectionToDelete(null)
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sections</h2>
          <p className="text-slate-500 font-medium mt-1">Manage and organize class sections</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleOpenAddForm} leftIcon={<Plus size={18} />}>
            Add Section
          </Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        {/* Search & Filters Inside Card Body Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search sections or classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium"
            />
          </div>
          <Button variant="outline" leftIcon={<Filter size={18} />}>
            Filters
          </Button>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
            <p className="text-sm font-medium">Loading sections...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-rose-500 bg-rose-50/30">
            <p className="font-bold">Failed to load sections</p>
            <p className="text-sm opacity-80 mt-1 center">There was an error communicating with the server.</p>
          </div>
        ) : filteredSections.length === 0 ? (
          <EmptyState 
            icon={Layers}
            title="No Sections Found"
            description={searchQuery ? `No sections match "${searchQuery}"` : "Start by creating your first academic section."}
            actionLabel={searchQuery ? "Clear Search" : "Add Section"}
            onAction={searchQuery ? () => setSearchQuery('') : handleOpenAddForm}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[180px] sm:w-[40%]">Section Name</th>
                  <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[150px] sm:w-[30%]">Parent Class</th>
                  <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[120px] sm:w-[20%]">Created At</th>
                  <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right w-[100px] sm:w-[10%]">Actions</th>

                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSections.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-500 font-medium">ID: {s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                          {s.school_class.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(s.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleViewDetails(s.id)}
                          className="p-2 text-slate-400 sm:text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all" 
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenEditForm(s)}
                          className="p-2 text-slate-400 sm:text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all" 
                          title="Edit Section"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setSectionToDelete(s)}
                          className="p-2 text-slate-400 sm:text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all" 
                          title="Delete Section"
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
                <div>
                  <h3 className="font-bold text-slate-900">
                    {editingSection ? 'Edit Section' : 'Add New Section'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {editingSection ? 'Update section details' : 'Create a new academic section'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Section Name</label>
                    <input
                      type="text"
                      value={sectionName}
                      onChange={(e) => setSectionName(e.target.value)}
                      placeholder="e.g. Section A"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Parent Class</label>
                    <select
                      value={parentClassId}
                      onChange={(e) => setParentClassId(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium appearance-none"
                      required
                    >
                      <option value="">Select a class</option>
                      {classes?.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
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
                    isLoading={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingSection ? 'Save Changes' : 'Create Section'}
                  </Button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <div className="p-6 md:p-8 flex items-start justify-between relative bg-gradient-to-br from-indigo-50/50 to-white">
                <div className="flex items-center gap-5">
                  {sectionDetails ? (
                    <div className="w-16 h-16 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-brand-500/20 ring-4 ring-white">
                      {sectionDetails.name.charAt(0)}
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 animate-pulse ring-4 ring-white" />
                  )}
                  <div className="pt-1">
                    {sectionDetails ? (
                      <>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{sectionDetails.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            ID: {sectionDetails.id}
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
                    <p className="text-sm font-medium">Fetching section details...</p>
                  </div>
                ) : sectionDetails && (
                  <div className="space-y-8">
                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Class Info */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:border-brand-500/20 transition-colors group">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 size={14} className="text-brand-500" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parent Class</p>
                        </div>
                        <p className="text-sm font-bold text-slate-800">{sectionDetails.school_class.name}</p>
                      </div>

                      {/* Branch Info */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:border-brand-500/20 transition-colors group">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen size={14} className="text-indigo-500" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Branch ID</p>
                        </div>
                        <p className="text-sm font-bold text-slate-800">Branch #{sectionDetails.branch_id}</p>
                      </div>

                      {/* Created Info */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:border-brand-500/20 transition-colors group">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={14} className="text-emerald-500" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created On</p>
                        </div>
                        <p className="text-sm font-bold text-slate-700">
                          {new Date(sectionDetails.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>

                      {/* Updated Info */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:border-brand-500/20 transition-colors group">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={14} className="text-amber-500" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Update</p>
                        </div>
                        <p className="text-sm font-bold text-slate-700">
                           {new Date(sectionDetails.updated_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-6 md:p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 rounded-b-[2rem]">
                <Button 
                  className="w-full md:w-auto px-8"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close Details
                </Button>
                <Button 
                  variant="primary"
                  className="w-full md:w-auto px-8 shadow-lg shadow-brand-200"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleOpenEditForm(sectionDetails!);
                  }}
                >
                  Edit Information
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {sectionToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-slate-100 p-6 text-center relative"
            >
              <button 
                onClick={() => setSectionToDelete(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
              
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Section?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete <strong className="text-slate-700">{sectionToDelete.name}</strong>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 w-full">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSectionToDelete(null)}
                >
                  Cancel
                </Button>
                <button 
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="w-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {deleteMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
