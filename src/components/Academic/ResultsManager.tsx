import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Plus,
  Trophy,
  Download,
  Printer,
  Edit2,
  Trash2,
  X,
  User,
  GraduationCap
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface MockResult {
  id: string;
  studentName: string;
  className: string;
  sectionName: string;
  examType: string;
  totalMarks: number;
  obtainedMarks: number;
  grade: string;
  status: 'Pass' | 'Fail';
}

const DUMMY_RESULTS: MockResult[] = [
  {
    id: 'STU-1001',
    studentName: 'Ali Khan',
    className: 'ONE',
    sectionName: 'A',
    examType: 'Mid Term',
    totalMarks: 500,
    obtainedMarks: 450,
    grade: 'A+',
    status: 'Pass'
  },
  {
    id: 'STU-1002',
    studentName: 'Sara Ahmed',
    className: 'ONE',
    sectionName: 'A',
    examType: 'Mid Term',
    totalMarks: 500,
    obtainedMarks: 380,
    grade: 'B',
    status: 'Pass'
  },
  {
    id: 'STU-1003',
    studentName: 'Usman Ali',
    className: 'TWO',
    sectionName: 'B',
    examType: 'Mid Term',
    totalMarks: 500,
    obtainedMarks: 150,
    grade: 'F',
    status: 'Fail'
  }
];

export const ResultsManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [resultsList, setResultsList] = useState<MockResult[]>(DUMMY_RESULTS);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<MockResult | null>(null);
  const [resultToDelete, setResultToDelete] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<MockResult>>({
    studentName: '',
    className: '',
    sectionName: '',
    examType: 'Mid Term',
    totalMarks: 500,
    obtainedMarks: 0,
  });

  const filteredList = resultsList.filter(r => 
    r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateGrade = (obtained: number, total: number) => {
    const percentage = (obtained / total) * 100;
    if (percentage >= 90) return { grade: 'A+', status: 'Pass' };
    if (percentage >= 80) return { grade: 'A', status: 'Pass' };
    if (percentage >= 70) return { grade: 'B', status: 'Pass' };
    if (percentage >= 60) return { grade: 'C', status: 'Pass' };
    if (percentage >= 50) return { grade: 'D', status: 'Pass' };
    return { grade: 'F', status: 'Fail' };
  };

  const handleOpenAddModal = () => {
    setEditingResult(null);
    setFormData({
      studentName: '',
      className: '',
      sectionName: '',
      examType: 'Mid Term',
      totalMarks: 500,
      obtainedMarks: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (result: MockResult) => {
    setEditingResult(result);
    setFormData(result);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setResultToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (resultToDelete) {
      setResultsList(resultsList.filter(r => r.id !== resultToDelete));
      setIsDeleteModalOpen(false);
      setResultToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { grade, status } = calculateGrade(
      Number(formData.obtainedMarks), 
      Number(formData.totalMarks)
    );

    if (editingResult) {
      // Update
      setResultsList(resultsList.map(r => 
        r.id === editingResult.id 
          ? { ...r, ...formData, grade, status: status as 'Pass' | 'Fail' } as MockResult
          : r
      ));
    } else {
      // Add
      const newResult: MockResult = {
        ...(formData as MockResult),
        id: `STU-${Math.floor(Math.random() * 9000) + 1000}`,
        grade,
        status: status as 'Pass' | 'Fail'
      };
      setResultsList([newResult, ...resultsList]);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 justify-end">
        <Button variant="outline" leftIcon={<Download size={18} />}>
          Export CSV
        </Button>
        <Button onClick={handleOpenAddModal} leftIcon={<Plus size={18} />}>
          Add Result
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        {/* Search & Filter Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="Search by student name, ID or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all border border-transparent font-bold text-sm w-full sm:w-auto justify-center">
            <Filter size={18} />
            Filters
          </button>
        </div>

        {filteredList.length === 0 ? (
          <EmptyState 
            icon={Trophy}
            title="No Results Found"
            description="No examination results match your search criteria or none have been added yet."
            actionLabel="Add Result"
            onAction={handleOpenAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Student ID</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[25%]">Student Info</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Exam Type</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Score</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-500">{item.id}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.studentName}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Class {item.className} ({item.sectionName})
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-md">
                        {item.examType}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <p className="text-sm font-black text-slate-800">{item.obtainedMarks} <span className="text-slate-400 text-xs font-bold">/ {item.totalMarks}</span></p>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">Grade: <span className="text-brand-600">{item.grade}</span></p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg w-fit ${
                        item.status === 'Pass' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {item.status}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
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
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingResult ? 'Edit Result' : 'Add New Result'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Student Name</label>
                    <input 
                      type="text"
                      value={formData.studentName}
                      onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                      required
                      placeholder="e.g. Ali Khan"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Class Name</label>
                      <input 
                        type="text"
                        value={formData.className}
                        onChange={(e) => setFormData({...formData, className: e.target.value})}
                        required
                        placeholder="e.g. ONE"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Section</label>
                      <input 
                        type="text"
                        value={formData.sectionName}
                        onChange={(e) => setFormData({...formData, sectionName: e.target.value})}
                        required
                        placeholder="e.g. A"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Exam Type</label>
                    <select 
                      value={formData.examType}
                      onChange={(e) => setFormData({...formData, examType: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700" 
                    >
                      <option value="Mid Term">Mid Term</option>
                      <option value="Final Term">Final Term</option>
                      <option value="Monthly Test">Monthly Test</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Total Marks</label>
                      <input 
                        type="number"
                        value={formData.totalMarks}
                        onChange={(e) => setFormData({...formData, totalMarks: Number(e.target.value)})}
                        required
                        min="1"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Obtained Marks</label>
                      <input 
                        type="number"
                        value={formData.obtainedMarks}
                        onChange={(e) => setFormData({...formData, obtainedMarks: Number(e.target.value)})}
                        required
                        min="0"
                        max={formData.totalMarks}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700" 
                      />
                    </div>
                  </div>

                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingResult ? 'Update Result' : 'Save Result'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Delete Result?</h3>
                <p className="text-slate-500 text-sm">
                  Are you sure you want to delete this result? This action cannot be undone.
                </p>
                <div className="pt-4 flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                  <Button className="flex-1 bg-rose-500 hover:bg-rose-600 shadow-rose-200" onClick={confirmDelete}>Delete</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
