import React, { useState, useRef, useEffect } from 'react';
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
  User,
  ChevronDown,
  Check
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { EmptyState } from './ui/EmptyState';
import { useParents, useParent, useCreateParent, useUpdateParent, useDeleteParent } from '../hooks/use-parent';
import { ParentData, CreateParentInput } from '../types/api/parent';
import { useBranchStore } from '../store/use-branch-store';

export const FamilyManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentData | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [parentToDelete, setParentToDelete] = useState<ParentData | null>(null);
  const { selectedBranchId } = useBranchStore();
  
  const [isGuardianTypeDropdownOpen, setIsGuardianTypeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState<CreateParentInput>({
    branch_id: selectedBranchId || 1,
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
    guardian_type: 'father',
    guardian_name: '',
    guardian_cnic: '',
    guardian_education: '',
    guardian_occupation: '',
    guardian_contact_no: ''
  });

  const { data: parents, isLoading, error } = useParents(selectedBranchId || 1);
  const { data: parentDetails, isLoading: isLoadingDetails } = useParent(selectedParentId);

  const createMutation = useCreateParent();
  const updateMutation = useUpdateParent();
  const deleteMutation = useDeleteParent();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsGuardianTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredParents = React.useMemo(() => {
    let list: ParentData[] = [];
    if (Array.isArray(parents)) {
      list = parents;
    } else if (parents && typeof parents === 'object') {
      const pList = parents as any;
      list = pList.data || pList.parents || pList.items || [];
    }
    
    if (!Array.isArray(list)) list = [];

    return list.filter(p => 
      p.father_name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      p.mother_name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      p.father_cnic?.includes(searchQuery) ||
      p.mother_cnic?.includes(searchQuery)
    );
  }, [parents, searchQuery]);

  const handleOpenAddForm = () => {
    setEditingParent(null);
    setFormData({
      branch_id: selectedBranchId || 1,
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
      guardian_type: 'father',
      guardian_name: '',
      guardian_cnic: '',
      guardian_education: '',
      guardian_occupation: '',
      guardian_contact_no: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (p: ParentData) => {
    setEditingParent(p);
    setFormData({
      branch_id: p.branch_id,
      father_name: p.father_name || '',
      father_cnic: p.father_cnic || '',
      father_education: p.father_education || '',
      father_occupation: p.father_occupation || '',
      father_contact_no: p.father_contact_no || '',
      mother_name: p.mother_name || '',
      mother_cnic: p.mother_cnic || '',
      mother_education: p.mother_education || '',
      mother_occupation: p.mother_occupation || '',
      mother_contact_no: p.mother_contact_no || '',
      address: p.address || '',
      guardian_type: p.guardian_type || 'father',
      guardian_name: p.guardian_name || '',
      guardian_cnic: p.guardian_cnic || '',
      guardian_education: p.guardian_education || '',
      guardian_occupation: p.guardian_occupation || '',
      guardian_contact_no: p.guardian_contact_no || ''
    });
    setIsFormOpen(true);
  };

  const handleViewDetails = (id: number) => {
    setSelectedParentId(id);
    setIsDetailsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare payload based on guardian type
    const payload: CreateParentInput = { ...formData };
    
    if (formData.guardian_type === 'father') {
      payload.guardian_name = formData.father_name;
      payload.guardian_cnic = formData.father_cnic;
      payload.guardian_education = formData.father_education;
      payload.guardian_occupation = formData.father_occupation;
      payload.guardian_contact_no = formData.father_contact_no;
    } else if (formData.guardian_type === 'mother') {
      payload.guardian_name = formData.mother_name;
      payload.guardian_cnic = formData.mother_cnic;
      payload.guardian_education = formData.mother_education;
      payload.guardian_occupation = formData.mother_occupation;
      payload.guardian_contact_no = formData.mother_contact_no;
    }

    if (editingParent) {
      updateMutation.mutate(
        { id: editingParent.id, data: payload },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createMutation.mutate(payload, {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Parent Directory</h2>
          <p className="text-slate-500 text-sm sm:text-base font-medium mt-1">Manage parent details and records</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleOpenAddForm} className="w-full sm:w-auto" leftIcon={<Plus size={18} />}>
            Add Parent
          </Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or CNIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-2.5 sm:py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium"
            />
          </div>
          <Button variant="outline" className="w-full sm:w-auto" leftIcon={<Filter size={18} />}>
            Filters
          </Button>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
            <p className="text-sm font-medium">Loading parents...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-rose-500 bg-rose-50/30">
            <p className="font-bold">Failed to load families</p>
            <p className="text-sm opacity-80 mt-1">Please try again later.</p>
          </div>
        ) : filteredParents.length === 0 ? (
          <EmptyState 
            icon={Users}
            title="No Parents Found"
            description={searchQuery ? `No records match "${searchQuery}"` : "Start by adding your first parent record."}
            actionLabel={searchQuery ? "Clear Search" : "Add Parent"}
            onAction={searchQuery ? () => setSearchQuery('') : handleOpenAddForm}
          />
        ) : (
          <div>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[30%]">Father Name</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[30%]">Mother Name</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Guardian</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Contact</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right w-[10%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {filteredParents.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            {p.father_name?.charAt(0) || 'F'}
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
                          p.guardian_type === 'father' ? 'bg-indigo-50 text-indigo-600' : 
                          p.guardian_type === 'mother' ? 'bg-rose-50 text-rose-600' : 
                          'bg-amber-50 text-amber-600'
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
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleViewDetails(p.id)}
                            className="p-2 text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleOpenEditForm(p)}
                            className="p-2 text-slate-300 hover:bg-slate-100 hover:text-brand-500 rounded-xl transition-all"
                            title="Edit Parent"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setParentToDelete(p)}
                            className="p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
                            title="Delete Parent"
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

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredParents.map((p) => (
                <div key={p.id} className="p-5 flex flex-col gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {p.father_name?.charAt(0) || 'F'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-none">{p.father_name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{p.father_cnic}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {p.mother_name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-none">{p.mother_name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{p.mother_cnic}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0 ${
                      p.guardian_type === 'father' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 
                      p.guardian_type === 'mother' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                      'bg-amber-50 border-amber-100 text-amber-600'
                    }`}>
                      {p.guardian_type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                      <Phone size={14} className="text-slate-400" />
                      {p.father_contact_no}
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleViewDetails(p.id)}
                        className="p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-500 rounded-lg transition-all"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenEditForm(p)}
                        className="p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-500 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setParentToDelete(p)}
                        className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-8 relative"
            >
                <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                      {editingParent ? 'Edit Parent' : 'Add New Parent'}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                      {editingParent ? 'Update parent record' : 'Register new parent'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

              <form onSubmit={handleSubmit}>
                <div className="p-5 sm:p-8 space-y-8 sm:space-y-10 overflow-y-auto max-h-[70vh] custom-scrollbar">

                  {/* Father Details */}
                  <div className="space-y-5 sm:space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                        <User size={18} />
                      </div>
                      <h4 className="font-bold text-slate-800 uppercase text-[10px] sm:text-xs tracking-widest">Father Details</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Father Name</label>
                        <input
                          type="text"
                          value={formData.father_name}
                          onChange={(e) => setFormData({...formData, father_name: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Father CNIC</label>
                        <input
                          type="text"
                          placeholder="35201-XXXXXXX-X"
                          value={formData.father_cnic}
                          onChange={(e) => setFormData({...formData, father_cnic: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Education</label>
                        <input
                          type="text"
                          value={formData.father_education}
                          onChange={(e) => setFormData({...formData, father_education: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupation</label>
                        <input
                          type="text"
                          value={formData.father_occupation}
                          onChange={(e) => setFormData({...formData, father_occupation: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input
                            type="text"
                            value={formData.father_contact_no}
                            onChange={(e) => setFormData({...formData, father_contact_no: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl pl-12 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mother Details */}
                  <div className="space-y-5 sm:space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                        <User size={18} />
                      </div>
                      <h4 className="font-bold text-slate-800 uppercase text-[10px] sm:text-xs tracking-widest">Mother Details</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mother Name</label>
                        <input
                          type="text"
                          value={formData.mother_name}
                          onChange={(e) => setFormData({...formData, mother_name: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mother CNIC</label>
                        <input
                          type="text"
                          placeholder="35201-XXXXXXX-X"
                          value={formData.mother_cnic}
                          onChange={(e) => setFormData({...formData, mother_cnic: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Education</label>
                        <input
                          type="text"
                          value={formData.mother_education}
                          onChange={(e) => setFormData({...formData, mother_education: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupation</label>
                        <input
                          type="text"
                          value={formData.mother_occupation}
                          onChange={(e) => setFormData({...formData, mother_occupation: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input
                            type="text"
                            value={formData.mother_contact_no}
                            onChange={(e) => setFormData({...formData, mother_contact_no: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl pl-12 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* General Info & Guardian Type */}
                  <div className="space-y-5 sm:space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                        <Shield size={18} />
                      </div>
                      <h4 className="font-bold text-slate-800 uppercase text-[10px] sm:text-xs tracking-widest">Preferences & Location</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Custom Guardian Type Dropdown */}
                      <div className="space-y-2 relative" ref={dropdownRef}>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guardian Type</label>
                        <button
                          type="button"
                          onClick={() => setIsGuardianTypeDropdownOpen(!isGuardianTypeDropdownOpen)}
                          className={`w-full flex items-center justify-between px-4 py-3 bg-slate-50 border-2 rounded-xl transition-all ${
                            isGuardianTypeDropdownOpen ? 'border-brand-500 bg-white ring-2 ring-brand-500/10' : 'border-transparent'
                          }`}
                        >
                          <span className="text-sm font-bold text-slate-700 capitalize">{formData.guardian_type}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isGuardianTypeDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isGuardianTypeDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 5 }}
                              className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-2xl ring-1 ring-slate-100 p-2 overflow-hidden border border-slate-50"
                            >
                              {(['father', 'mother', 'other'] as const).map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    setFormData({...formData, guardian_type: type});
                                    setIsGuardianTypeDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-bold transition-all ${
                                    formData.guardian_type === type 
                                      ? 'bg-brand-50 text-brand-600' 
                                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                  }`}
                                >
                                  <span className="capitalize">{type}</span>
                                  {formData.guardian_type === type && <Check className="w-4 h-4" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Residential Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl pl-12 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guardian Details - Conditional */}
                  <AnimatePresence>
                    {formData.guardian_type === 'other' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-5 sm:space-y-6 pt-4 border-t border-slate-100 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 pb-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                            <Shield size={18} />
                          </div>
                          <h4 className="font-bold text-slate-800 uppercase text-[10px] sm:text-xs tracking-widest">Guardian Details (Other)</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guardian Name</label>
                            <input
                              type="text"
                              value={formData.guardian_name}
                              onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
                              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                              required={formData.guardian_type === 'other'}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guardian CNIC</label>
                            <input
                              type="text"
                              placeholder="35201-XXXXXXX-X"
                              value={formData.guardian_cnic}
                              onChange={(e) => setFormData({...formData, guardian_cnic: e.target.value})}
                              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                              required={formData.guardian_type === 'other'}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Education</label>
                            <input
                              type="text"
                              value={formData.guardian_education}
                              onChange={(e) => setFormData({...formData, guardian_education: e.target.value})}
                              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupation</label>
                            <input
                              type="text"
                              value={formData.guardian_occupation}
                              onChange={(e) => setFormData({...formData, guardian_occupation: e.target.value})}
                              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Number</label>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                              <input
                                type="text"
                                value={formData.guardian_contact_no}
                                onChange={(e) => setFormData({...formData, guardian_contact_no: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl pl-12 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 sticky bottom-0 z-10">
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
                    {editingParent ? 'Update Parent' : 'Create Parent'}
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
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] bg-brand-500 text-white flex items-center justify-center font-bold text-xl sm:text-4xl shadow-lg shadow-brand-500/20 ring-4 ring-white shrink-0">
                      {parentDetails.father_name?.charAt(0) || 'F'}
                    </div>
                  ) : (
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 animate-pulse ring-4 ring-white shrink-0" />
                  )}
                  <div className="pt-1">
                    {parentDetails ? (
                      <>
                        <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                          {parentDetails.father_name} & {parentDetails.mother_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                          <span className="px-2 py-0.5 rounded-full bg-white/80 backdrop-blur shadow-sm text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-100">
                            ID: FAM-{parentDetails.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-widest shadow-sm border ${
                            parentDetails.guardian_type === 'father' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 
                            parentDetails.guardian_type === 'mother' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                            'bg-amber-50 border-amber-100 text-amber-600'
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
                  className="p-2 sm:p-2.5 hover:bg-white rounded-xl sm:rounded-2xl transition-all text-slate-400 hover:text-slate-600 shadow-sm hover:shadow-md bg-white/50 sm:bg-transparent absolute top-6 right-6 sm:top-8 sm:right-8"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                      {/* Father Card */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-600">
                          <User size={18} />
                          <h4 className="font-bold text-[10px] sm:text-xs uppercase tracking-widest">Father Details</h4>
                        </div>
                        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CNIC</p>
                              <p className="text-[11px] sm:text-sm font-bold text-slate-800 break-all leading-tight">{parentDetails.father_cnic}</p>
                            </div>
                            <div>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Education</p>
                              <p className="text-[11px] sm:text-sm font-bold text-slate-800 break-all leading-tight">{parentDetails.father_education}</p>
                            </div>
                            <div>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Occupation</p>
                              <p className="text-[11px] sm:text-sm font-bold text-slate-800 break-all leading-tight">{parentDetails.father_occupation}</p>
                            </div>
                            <div>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                              <p className="text-[11px] sm:text-sm font-bold text-slate-800 break-all leading-tight">{parentDetails.father_contact_no}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mother Card */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-rose-600">
                          <User size={18} />
                          <h4 className="font-bold text-[10px] sm:text-xs uppercase tracking-widest">Mother Details</h4>
                        </div>
                        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-nowrap">CNIC</p>
                              <p className="text-[11px] sm:text-sm font-bold text-slate-800 break-all leading-tight">{parentDetails.mother_cnic}</p>
                            </div>
                            <div>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-nowrap">Education</p>
                              <p className="text-[11px] sm:text-sm font-bold text-slate-800 break-all leading-tight">{parentDetails.mother_education}</p>
                            </div>
                            <div>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-nowrap">Occupation</p>
                              <p className="text-[11px] sm:text-sm font-bold text-slate-800 break-all leading-tight">{parentDetails.mother_occupation}</p>
                            </div>
                            <div>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-nowrap">Contact</p>
                              <p className="text-[11px] sm:text-sm font-bold text-slate-800 break-all leading-tight">{parentDetails.mother_contact_no}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Guardian Details - Conditional */}
                    {parentDetails.guardian_type === 'other' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-600">
                          <Shield size={18} />
                          <h4 className="font-bold text-[10px] sm:text-xs uppercase tracking-widest">Guardian Details (Other)</h4>
                        </div>
                        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-amber-50/50 border border-amber-100 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                              <p className="text-sm sm:text-lg font-black text-slate-800">{parentDetails.guardian_name}</p>
                            </div>
                            <div>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CNIC</p>
                              <p className="text-[11px] sm:text-sm font-bold text-slate-800 leading-tight">{parentDetails.guardian_cnic}</p>
                            </div>
                            <div>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                              <p className="text-[11px] sm:text-sm font-bold text-slate-800 leading-tight">{parentDetails.guardian_contact_no}</p>
                            </div>
                            <div>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Education</p>
                              <p className="text-[11px] sm:text-sm font-bold text-slate-800 leading-tight">{parentDetails.guardian_education}</p>
                            </div>
                            <div>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Occupation</p>
                              <p className="text-[11px] sm:text-sm font-bold text-slate-800 leading-tight">{parentDetails.guardian_occupation}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Address Box */}
                    <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 text-white space-y-2 relative overflow-hidden group">
                      <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 text-white/5 -rotate-12 transition-transform group-hover:scale-110" />
                      <p className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest">Permanent Address</p>
                      <p className="text-sm sm:text-base font-bold relative z-10">{parentDetails.address}</p>
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
              className="bg-white w-full max-sm:max-w-xs rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-slate-100 p-6 text-center relative"
            >
              <button 
                onClick={() => setParentToDelete(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Parent record?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete <strong className="text-slate-700">{parentToDelete.father_name}</strong>'s parent record? This action cannot be undone.
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
