import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Loader2, 
  X,
  Phone,
  Shield,
  MapPin,
  GraduationCap,
  Briefcase,
  User
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { EmptyState } from './ui/EmptyState';
import { useParents, useParent, useCreateParent, useUpdateParent, useDeleteParent } from '../hooks/use-parent';
import { ParentData, CreateParentInput } from '../types/api/parent';

export const FamilyManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentData | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [parentToDelete, setParentToDelete] = useState<ParentData | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateParentInput>({
    branch_id: 1,
    father_name: '',
    father_cnic: '',
    father_education: '',
    father_occupation: '',
    father_contact_no: '',
    mother_name: '',
    mother_cnic: '',
    mother_education: '',
    mother_occupation: '',
    mother_contact_no: '',
    address: '',
    guardian_type: 'father'
  });

  const { data: parents, isLoading, error } = useParents();
  const { data: parentDetails, isLoading: isLoadingDetails } = useParent(selectedParentId);

  const createMutation = useCreateParent();
  const updateMutation = useUpdateParent();
  const deleteMutation = useDeleteParent();

  const filteredParents = parents?.filter(p => 
    p.father_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mother_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.father_cnic.includes(searchQuery) ||
    p.mother_cnic.includes(searchQuery)
  ) || [];

  const handleOpenAddForm = () => {
    setEditingParent(null);
    setFormData({
      branch_id: 1,
      father_name: '',
      father_cnic: '',
      father_education: '',
      father_occupation: '',
      father_contact_no: '',
      mother_name: '',
      mother_cnic: '',
      mother_education: '',
      mother_occupation: '',
      mother_contact_no: '',
      address: '',
      guardian_type: 'father'
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (p: ParentData) => {
    setEditingParent(p);
    setFormData({
      branch_id: p.branch_id,
      father_name: p.father_name,
      father_cnic: p.father_cnic,
      father_education: p.father_education,
      father_occupation: p.father_occupation,
      father_contact_no: p.father_contact_no,
      mother_name: p.mother_name,
      mother_cnic: p.mother_cnic,
      mother_education: p.mother_education,
      mother_occupation: p.mother_occupation,
      mother_contact_no: p.mother_contact_no,
      address: p.address,
      guardian_type: p.guardian_type
    });
    setIsFormOpen(true);
  };

  const handleViewDetails = (id: number) => {
    setSelectedParentId(id);
    setIsDetailsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingParent) {
      updateMutation.mutate(
        { id: editingParent.id, data: formData },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => setIsFormOpen(false)
      });
    }
  };

  const confirmDelete = () => {
    if (parentToDelete) {
      deleteMutation.mutate(parentToDelete.id, {
        onSuccess: () => setParentToDelete(null)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Family Directory</h2>
          <p className="text-slate-500 font-medium mt-1">Manage parent information and family records</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleOpenAddForm} leftIcon={<Plus size={18} />}>
            Add Family
          </Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or CNIC..."
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
            <p className="text-sm font-medium">Loading families...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-rose-500 bg-rose-50/30">
            <p className="font-bold">Failed to load families</p>
            <p className="text-sm opacity-80 mt-1">Please try again later.</p>
          </div>
        ) : filteredParents.length === 0 ? (
          <EmptyState 
            icon={Users}
            title="No Families Found"
            description={searchQuery ? `No records match "${searchQuery}"` : "Start by adding your first family record."}
            actionLabel={searchQuery ? "Clear Search" : "Add Family"}
            onAction={searchQuery ? () => setSearchQuery('') : handleOpenAddForm}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[150px] sm:w-[30%]">Father Name</th>
                  <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[150px] sm:w-[30%]">Mother Name</th>
                  <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[100px] sm:w-[15%]">Guardian</th>
                  <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[120px] sm:w-[15%]">Contact</th>
                  <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right w-[100px] sm:w-[10%]">Actions</th>

                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {filteredParents.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          {p.father_name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{p.father_name || 'Father Name'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.father_cnic || 'CNIC'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                          {p.mother_name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{p.mother_name || 'Mother Name'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.mother_cnic || 'CNIC'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        p.guardian_type === 'father' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {p.guardian_type}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                        <Phone size={14} className="text-slate-400" />
                        {p.father_contact_no}
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleViewDetails(p.id)}
                          className="p-2 text-slate-400 sm:text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenEditForm(p)}
                          className="p-2 text-slate-400 sm:text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all"
                          title="Edit Family"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setParentToDelete(p)}
                          className="p-2 text-slate-400 sm:text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
                          title="Delete Family"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-8"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    {editingParent ? 'Edit Family' : 'Add New Family'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {editingParent ? 'Update family information' : 'Register a new family in the directory'}
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
                <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">

                  {/* Father Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                        <User size={18} />
                      </div>
                      <h4 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Father Details</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Father Name</label>
                        <input
                          type="text"
                          value={formData.father_name}
                          onChange={(e) => setFormData({...formData, father_name: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Father CNIC</label>
                        <input
                          type="text"
                          placeholder="35201-XXXXXXX-X"
                          value={formData.father_cnic}
                          onChange={(e) => setFormData({...formData, father_cnic: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Education</label>
                        <input
                          type="text"
                          value={formData.father_education}
                          onChange={(e) => setFormData({...formData, father_education: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Occupation</label>
                        <input
                          type="text"
                          value={formData.father_occupation}
                          onChange={(e) => setFormData({...formData, father_occupation: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700">Contact Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input
                            type="text"
                            value={formData.father_contact_no}
                            onChange={(e) => setFormData({...formData, father_contact_no: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl pl-12 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mother Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                        <User size={18} />
                      </div>
                      <h4 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Mother Details</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Mother Name</label>
                        <input
                          type="text"
                          value={formData.mother_name}
                          onChange={(e) => setFormData({...formData, mother_name: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Mother CNIC</label>
                        <input
                          type="text"
                          placeholder="35201-XXXXXXX-X"
                          value={formData.mother_cnic}
                          onChange={(e) => setFormData({...formData, mother_cnic: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Education</label>
                        <input
                          type="text"
                          value={formData.mother_education}
                          onChange={(e) => setFormData({...formData, mother_education: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Occupation</label>
                        <input
                          type="text"
                          value={formData.mother_occupation}
                          onChange={(e) => setFormData({...formData, mother_occupation: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700">Contact Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input
                            type="text"
                            value={formData.mother_contact_no}
                            onChange={(e) => setFormData({...formData, mother_contact_no: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl pl-12 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* General Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
                        <Shield size={18} />
                      </div>
                      <h4 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Preferences & Location</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Guardian Type</label>
                        <select
                          value={formData.guardian_type}
                          onChange={(e) => setFormData({...formData, guardian_type: e.target.value as 'father' | 'mother'})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium appearance-none"
                          required
                        >
                          <option value="father">Father</option>
                          <option value="mother">Mother</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700">Residential Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl pl-12 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
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
                    className="w-full sm:w-auto shadow-xl shadow-brand-200 px-8"
                    isLoading={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingParent ? 'Update Family' : 'Create Family'}
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
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-slate-100 my-8"
            >

              {/* Header */}
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start justify-between relative bg-gradient-to-br from-brand-50/50 to-white gap-4">
                <div className="flex items-center gap-4 sm:gap-6">
                  {parentDetails ? (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-2xl sm:text-4xl shadow-lg shadow-brand-500/20 ring-4 ring-white shrink-0">
                      {parentDetails.father_name?.charAt(0) || 'P'}
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 animate-pulse ring-4 ring-white shrink-0" />
                  )}
                  <div className="pt-1">
                    {parentDetails ? (
                      <>
                        <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{parentDetails.father_name} & {parentDetails.mother_name}</h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                          <span className="px-2 py-0.5 rounded-full bg-white/80 backdrop-blur shadow-sm text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-100">
                            ID: FAM-{parentDetails.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-widest shadow-sm border ${
                            parentDetails.guardian_type === 'father' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                          }`}>
                            Guardian: {parentDetails.guardian_type}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="h-6 sm:h-8 w-32 sm:w-48 bg-slate-100 rounded-lg animate-pulse" />
                        <div className="h-4 sm:h-5 w-20 sm:w-24 bg-slate-100 rounded-lg animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setIsDetailsOpen(false)} 
                  className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-600 shadow-sm hover:shadow-md bg-transparent sm:absolute sm:top-8 sm:right-8 self-end sm:self-auto"
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 rotate-45" />
                </button>
              </div>


              {/* Body */}
              <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
                {isLoadingDetails ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
                    <p className="text-sm font-bold uppercase tracking-widest">Loading Records...</p>
                  </div>
                ) : parentDetails && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Father Card */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-600">
                          <User size={18} />
                          <h4 className="font-bold text-sm uppercase tracking-wider">Father Details</h4>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CNIC</p>
                              <p className="text-sm font-bold text-slate-800">{parentDetails.father_cnic}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Education</p>
                              <p className="text-sm font-bold text-slate-800">{parentDetails.father_education}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Occupation</p>
                              <p className="text-sm font-bold text-slate-800">{parentDetails.father_occupation}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                              <p className="text-sm font-bold text-slate-800">{parentDetails.father_contact_no}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mother Card */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-rose-600">
                          <User size={18} />
                          <h4 className="font-bold text-sm uppercase tracking-wider">Mother Details</h4>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CNIC</p>
                              <p className="text-sm font-bold text-slate-800">{parentDetails.mother_cnic}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Education</p>
                              <p className="text-sm font-bold text-slate-800">{parentDetails.mother_education}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Occupation</p>
                              <p className="text-sm font-bold text-slate-800">{parentDetails.mother_occupation}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                              <p className="text-sm font-bold text-slate-800">{parentDetails.mother_contact_no}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address Box */}
                    <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-2 relative overflow-hidden group">
                      <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 text-white/5 -rotate-12 transition-transform group-hover:scale-110" />
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Permanent Address</p>
                      <p className="font-bold relative z-10">{parentDetails.address}</p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 rounded-b-[2rem]">
                <Button 
                  variant="ghost" 
                  className="px-8"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  className="px-8 shadow-xl shadow-brand-200"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleOpenEditForm(parentDetails!);
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
        {parentToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-slate-100 p-6 text-center relative"
            >
              <button 
                onClick={() => setParentToDelete(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
              
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Family record?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete <strong className="text-slate-700">{parentToDelete.father_name}</strong>'s family record? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 w-full">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setParentToDelete(null)}
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
