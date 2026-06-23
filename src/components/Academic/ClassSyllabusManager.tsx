import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { 
  Search, 
  Filter, 
  FileText,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Calendar,
  X
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface MockClassSyllabus {
  id: number;
  subject: string;
  month: string;
  page: string;
  link: string;
  content: string;
}

const DUMMY_SYLLABUS: MockClassSyllabus[] = [
  {
    id: 1,
    subject: 'Mathematics',
    month: '2026-04',
    page: '12-45',
    link: 'https://example.com/math-syllabus',
    content: 'Algebra, Geometry basics, and Trigonometry introduction.'
  },
  {
    id: 2,
    subject: 'English Literature',
    month: '2026-05',
    page: '1-100',
    link: '',
    content: 'Reading comprehension, novel study (1984), and essay writing.'
  }
];

export const ClassSyllabusManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [syllabusList, setSyllabusList] = useState<MockClassSyllabus[]>(DUMMY_SYLLABUS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);

  // Global Config State
  const [syllabusDeadline, setSyllabusDeadline] = useState('2026-08-26');
  const [syllabusMonthConfig, setSyllabusMonthConfig] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modals for config
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);

  // Form state
  const [subject, setSubject] = useState('');
  const [month, setMonth] = useState('');
  const [page, setPage] = useState('');
  const [link, setLink] = useState('');
  const [content, setContent] = useState('');

  const filteredList = syllabusList.filter(s => 
    s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingId(null);
    setSubject('');
    setMonth('');
    setPage('');
    setLink('');
    setContent('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MockClassSyllabus) => {
    setEditingId(item.id);
    setSubject(item.subject);
    setMonth(item.month);
    setPage(item.page);
    setLink(item.link);
    setContent(item.content);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteConfirmationId !== null) {
      setSyllabusList(syllabusList.filter(s => s.id !== deleteConfirmationId));
      setDeleteConfirmationId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setSyllabusList(syllabusList.map(s => s.id === editingId ? {
        ...s, subject, month, page, link, content
      } : s));
    } else {
      const newItem: MockClassSyllabus = {
        id: Date.now(),
        subject,
        month,
        page,
        link,
        content
      };
      setSyllabusList([...syllabusList, newItem]);
    }
    setIsModalOpen(false);
  };

  const handleUpdateDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('Deadline updated successfully!');
    setIsDeadlineModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleUpdateMonth = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('Month updated successfully!');
    setIsMonthModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-end gap-4">
        
        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
          <Button variant="outline" onClick={() => setIsDeadlineModalOpen(true)} leftIcon={<Calendar size={18} />}>
            Deadline
          </Button>
          <Button variant="outline" onClick={() => setIsMonthModalOpen(true)} leftIcon={<Calendar size={18} />}>
            Month
          </Button>
          <Button onClick={handleOpenAddModal} leftIcon={<Plus size={18} />}>
            Add Syllabus
          </Button>
        </div>
      </div>

      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 text-green-700 p-3 rounded-xl text-sm font-medium border border-green-200 text-center"
        >
          {successMessage}
        </motion.div>
      )}

      <Card padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="Search syllabus..."
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
            icon={FileText}
            title="No Syllabus Found"
            description="No syllabus matches your search or none has been added yet."
            actionLabel={searchQuery ? "Clear Search" : "Add Syllabus"}
            onAction={searchQuery ? () => setSearchQuery('') : handleOpenAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[25%]">Subject & Month</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Page</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[40%]">Content</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right w-[20%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.subject}</p>
                          <div className="flex items-center gap-1 mt-0.5 text-xs font-medium text-slate-500">
                             <Calendar size={12} />
                             {item.month}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">{item.page || '-'}</p>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-500 hover:text-brand-600 mt-1 transition-colors">
                          <ExternalLink size={10} /> Link
                        </a>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div 
                        className="text-sm text-slate-500 font-medium line-clamp-2 prose prose-sm max-w-none" 
                        dangerouslySetInnerHTML={{ __html: item.content || '<span class="italic text-slate-400">No content provided</span>' }} 
                      />
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => handleOpenEditModal(item)}
                           className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all"
                         >
                           <Edit2 size={16} />
                         </button>
                         <button 
                           onClick={() => setDeleteConfirmationId(item.id)}
                           className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
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

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100 my-8"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? 'Update Syllabus' : 'Add Syllabus'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600 shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6 sm:p-8 space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subject Field */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Subject</label>
                      <select 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 appearance-none" 
                      >
                        <option value="" disabled>Choose Subject</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="English Literature">English Literature</option>
                        <option value="General Science">General Science</option>
                        <option value="History">History</option>
                        <option value="Computer Science">Computer Science</option>
                      </select>
                    </div>

                    {/* Month Field */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Month</label>
                      <input 
                        type="month" 
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700" 
                      />
                    </div>
                    
                    {/* Page Field */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Page</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Page 12 - 45" 
                        value={page}
                        onChange={(e) => setPage(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700" 
                      />
                    </div>

                    {/* Link Field */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Link</label>
                      <input 
                        type="url" 
                        placeholder="https://..." 
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700" 
                      />
                    </div>
                  </div>

                  {/* Content Field */}
                  <div className="space-y-2 pb-12">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Content</label>
                    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                      <ReactQuill 
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        className="h-48"
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                            [{'list': 'ordered'}, {'list': 'bullet'}],
                            ['link'],
                            ['clean']
                          ],
                        }}
                      />
                    </div>
                  </div>

                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="w-full sm:w-auto shadow-lg shadow-brand-200"
                  >
                    {editingId ? 'Update' : 'Submit'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {deleteConfirmationId !== null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Syllabus</h3>
                <p className="text-slate-500 text-sm">
                  Are you sure you want to delete this syllabus item? This action cannot be undone.
                </p>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setDeleteConfirmationId(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmDelete}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200 border-none"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deadline Modal */}
      <AnimatePresence>
        {isDeadlineModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">Syllabus Deadline</h3>
                <button onClick={() => setIsDeadlineModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateDeadline}>
                <div className="p-6 space-y-4">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Select Date</label>
                  <input 
                    type="date"
                    value={syllabusDeadline}
                    onChange={(e) => setSyllabusDeadline(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700" 
                  />
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsDeadlineModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Update</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Month Modal */}
      <AnimatePresence>
        {isMonthModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">Syllabus Month</h3>
                <button onClick={() => setIsMonthModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateMonth}>
                <div className="p-6 space-y-4">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Select Month</label>
                  <input 
                    type="month"
                    value={syllabusMonthConfig}
                    onChange={(e) => setSyllabusMonthConfig(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700" 
                  />
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsMonthModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Update</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
