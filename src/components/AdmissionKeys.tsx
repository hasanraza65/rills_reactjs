import React from 'react';
import { 
  Key, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  Calendar,
  User,
  Hash
} from 'lucide-react';
import { 
  useAdmissionKeys, 
  useDeleteAdmissionKey, 
  useCreateAdmissionKey,
  useUpdateAdmissionKey 
} from '../hooks/use-admission-keys';
import { AdmissionKeyData } from '../types/api/admission-key';
import { EmptyState } from './ui/EmptyState';
import { DeleteConfirmationModal } from './ui/DeleteConfirmationModal';
import { AddAdmissionKeyModal } from './AddAdmissionKeyModal';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export const AdmissionKeys: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [deletingKeyId, setDeletingKeyId] = React.useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingKey, setEditingKey] = React.useState<AdmissionKeyData | null>(null);
  
  const { data: keys, isLoading, error } = useAdmissionKeys();
  const deleteKeyMutation = useDeleteAdmissionKey();
  const createKeyMutation = useCreateAdmissionKey();
  const updateKeyMutation = useUpdateAdmissionKey();

  const filteredKeys = keys?.filter(item => 
    item.key.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSave = async (phoneNumber: string) => {
    try {
      if (editingKey) {
        await updateKeyMutation.mutateAsync({
          id: editingKey.id,
          data: {
            branch_id: editingKey.branch_id,
            key: phoneNumber
          }
        });
      } else {
        await createKeyMutation.mutateAsync({
          branch_id: 1, // Assuming default branch ID 1
          key: phoneNumber
        });
      }
      setIsAddModalOpen(false);
      setEditingKey(null);
    } catch (err) {
      console.error('Failed to save key:', err);
    }
  };

  const handleEdit = (item: AdmissionKeyData) => {
    setEditingKey(item);
    setIsAddModalOpen(true);
  };

  const handleDelete = async () => {
    if (deletingKeyId) {
      await deleteKeyMutation.mutateAsync(deletingKeyId);
      setDeletingKeyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Admission Keys</h3>
          <p className="text-slate-500 text-sm font-medium">Manage temporary admission access keys</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          Generate New Key
        </button>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              placeholder="Search keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all border border-transparent font-bold text-sm">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto lg:block">
          <table className="w-full text-left hidden lg:table">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Key</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Added By</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Branch ID</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created At</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
                      <p className="text-sm font-bold uppercase tracking-widest">Loading Keys...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-rose-500 font-bold">
                    Failed to load admission keys.
                  </td>
                </tr>
              ) : filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <EmptyState 
                      icon={Key}
                      title="No Keys Found"
                      description={searchQuery ? `No keys match "${searchQuery}"` : "Generate your first admission key to get started."}
                      actionLabel={searchQuery ? "Clear Search" : "Generate Key"}
                      onAction={searchQuery ? () => setSearchQuery('') : () => {}}
                    />
                  </td>
                </tr>
              ) : (
                filteredKeys.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Key size={18} />
                        </div>
                        <span className="text-sm font-bold text-slate-800">{item.key}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <User size={14} className="text-slate-400" />
                        User ID: {item.added_by}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <Hash size={14} className="text-slate-400" />
                        Branch: {item.branch_id}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Calendar size={14} className="text-slate-400" />
                        {format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setDeletingKeyId(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile View */}
          <div className="lg:hidden divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-10 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-brand-500 mx-auto mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Keys...</p>
              </div>
            ) : filteredKeys.map(item => (
              <div key={item.id} className="p-5 space-y-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Key size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{item.key}</p>
                      <p className="text-xs text-slate-400">Branch ID: {item.branch_id}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => setDeletingKeyId(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                    <User size={12} />
                    Added by: {item.added_by}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">
                    {format(new Date(item.created_at), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DeleteConfirmationModal 
        isOpen={!!deletingKeyId}
        onClose={() => setDeletingKeyId(null)}
        onConfirm={handleDelete}
        title="Delete Admission Key"
        message="Are you sure you want to delete this admission key? This action will revoke access associated with this key."
        isLoading={deleteKeyMutation.isPending}
      />

      <AddAdmissionKeyModal 
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingKey(null);
        }}
        onConfirm={handleSave}
        isLoading={createKeyMutation.isPending || updateKeyMutation.isPending}
        initialValue={editingKey?.key}
        mode={editingKey ? 'edit' : 'create'}
      />
    </div>
  );
};
