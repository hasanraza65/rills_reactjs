import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Download,
  X,
  BookOpen,
  Layers,
  CheckCircle,
  Clock,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { classSubjectService } from '../../lib/services/class-subject-service';
import { ClassSubjectData } from '../../types/api/class-subject';

interface MockDiarySection {
  id: number;
  sectionName: string;
  className: string;
  todayApprove: string;
}

const DUMMY_DIARIES: MockDiarySection[] = [
  {
    id: 1,
    sectionName: 'KK 101',
    className: 'ONE',
    todayApprove: 'Not created'
  },
  {
    id: 2,
    sectionName: 'A',
    className: 'TWO',
    todayApprove: 'Approved'
  },
  {
    id: 3,
    sectionName: 'B',
    className: 'TWO',
    todayApprove: 'Pending'
  }
];

const DiaryDetailView: React.FC<{ section: MockDiarySection, onBack: () => void }> = ({ section, onBack }) => {
  const [selectedDate, setSelectedDate] = useState('2026-04-27');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [tempDate, setTempDate] = useState('2026-04-27');
  
  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedDate(tempDate);
    setIsDateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Class Diary
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">View daily logs and homework</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setIsDateModalOpen(true)} leftIcon={<Calendar size={18} />}>
            Select Date
          </Button>
        </div>
      </div>

      {/* Document View */}
      <Card className="w-full overflow-hidden p-0 border-t-4 border-t-brand-500 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-b from-brand-50/50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center shadow-sm">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">What I have Learnt</h1>
              <p className="text-sm sm:text-base font-bold text-slate-500 mt-0.5">{section.className} ({section.sectionName})</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm mt-4 sm:mt-0">
             <Calendar size={16} className="text-brand-500" /> Date: {new Date(selectedDate).toDateString()}
          </div>
        </div>

        <div className="p-6 sm:p-10">
           <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-200 shadow-inner">
             
             {[
               { label: 'Heads', value: 'English Literature' },
               { label: 'Topic', value: 'Reading Comprehension & Grammar' },
               { label: 'Page.No', value: '45 - 48' },
               { label: 'Resource', value: 'Oxford English Book 2' },
               { label: 'Activity', value: 'Group reading and class discussion on the story of the brave little tailor.' },
               { label: 'Home Work', value: 'Complete the questions on page 49 in your notebook.' },
               { label: 'Link', value: 'https://example.com/materials/english-ch4' }
             ].map((row, idx) => (
               <div key={idx} className="flex flex-col sm:flex-row p-4 sm:p-5 hover:bg-white transition-colors group">
                 <div className="w-full sm:w-1/4 font-black text-slate-400 text-xs sm:text-sm uppercase tracking-widest group-hover:text-brand-500 transition-colors pt-0.5">
                   {row.label}
                 </div>
                 <div className="w-full sm:w-3/4 font-bold text-slate-700 text-sm sm:text-base mt-1 sm:mt-0 leading-relaxed">
                   {row.label === 'Link' ? (
                     <a href="#" className="text-brand-500 hover:text-brand-600 hover:underline">{row.value}</a>
                   ) : (
                     row.value
                   )}
                 </div>
               </div>
             ))}

           </div>
        </div>
      </Card>
      
      <div className="flex justify-start w-full pt-2">
        <Button leftIcon={<Download size={18} />} variant="outline" className="bg-white hover:bg-slate-50">
          Download
        </Button>
      </div>

      {/* Date Selection Modal */}
      <AnimatePresence>
        {isDateModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">Filter Date</h3>
                <button onClick={() => setIsDateModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleDateSubmit}>
                <div className="p-6 space-y-4">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Select Date</label>
                  <input 
                    type="date"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700" 
                  />
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsDateModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const today = new Date().toISOString().split('T')[0];

interface AddDiaryForm {
  subject_id: string;
  topic: string;
  page_number: string;
  resources: string;
  date: string;
  link: string;
  activity: string;
  home_work: string;
}

const AddDiaryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [subjects, setSubjects] = useState<ClassSubjectData[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [form, setForm] = useState<AddDiaryForm>({
    subject_id: '',
    topic: '',
    page_number: '',
    resources: '',
    date: today,
    link: '',
    activity: '',
    home_work: '',
  });

  useEffect(() => {
    classSubjectService.getSubjectsByBranch(1).then(res => {
      setSubjects(res.data ?? []);
    }).catch(() => {
      setSubjects([]);
    }).finally(() => {
      setLoadingSubjects(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: AddDiaryForm) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up diary creation API
    console.log('Diary form submitted:', form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-0.5">Class Diary</p>
            <h3 className="text-lg font-bold text-slate-900">Create New</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Subjects</label>
              <div className="relative">
                <select
                  name="subject_id"
                  value={form.subject_id}
                  onChange={handleChange}
                  required
                  className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 pr-10"
                >
                  <option value="" disabled>
                    {loadingSubjects ? 'Loading...' : 'Choose Subject'}
                  </option>
                  {subjects.map((s: ClassSubjectData) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Topic / Page Number / Resources / Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Topic</label>
                <input
                  type="text"
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  placeholder="Topic"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Page Number</label>
                <input
                  type="text"
                  name="page_number"
                  value={form.page_number}
                  onChange={handleChange}
                  placeholder="e.g 1-3"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Resources</label>
                <input
                  type="text"
                  name="resources"
                  value={form.resources}
                  onChange={handleChange}
                  placeholder="e.g Book"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm"
                />
              </div>
            </div>

            {/* Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Link</label>
              <input
                type="url"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="Enter Link"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm"
              />
            </div>

            {/* Activity / Home Work */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Activity</label>
                <textarea
                  name="activity"
                  value={form.activity}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Home Work</label>
                <textarea
                  name="home_work"
                  value={form.home_work}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-start gap-3 shrink-0">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const DiariesManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [diariesList] = useState<MockDiarySection[]>(DUMMY_DIARIES);
  const [selectedSection, setSelectedSection] = useState<MockDiarySection | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredList = diariesList.filter(d =>
    d.sectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedSection) {
    return <DiaryDetailView section={selectedSection} onBack={() => setSelectedSection(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center sm:text-left">Diaries</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base text-center sm:text-left">Manage what I have learnt</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
          <Button variant="outline" className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200">
            All Diaries
          </Button>
          <Button leftIcon={<Plus size={18} />} onClick={() => setIsAddModalOpen(true)}>
            Add New
          </Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="Search sections or classes..."
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
            icon={BookOpen}
            title="No Diaries Found"
            description="No sections match your search criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[10%]">ID</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[25%]">Section Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[25%]">Class Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[20%]">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[20%] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-500">#{item.id}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                          <Layers size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.sectionName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">{item.className}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg w-fit ${
                        item.todayApprove === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                        item.todayApprove === 'Pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {item.todayApprove === 'Approved' ? <CheckCircle size={14} /> : <Clock size={14} />}
                        {item.todayApprove}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setSelectedSection(item)}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:border-brand-500 hover:text-brand-600 hover:shadow-md transition-all shadow-sm flex items-center gap-2 ml-auto"
                      >
                        <BookOpen size={14} />
                        View Diary
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AnimatePresence>
        {isAddModalOpen && <AddDiaryModal onClose={() => setIsAddModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};
