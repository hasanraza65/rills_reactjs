import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Loader2,
  BookOpen,
  ArrowLeft,
  Layers,
  Plus
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { useClasses } from '../../hooks/use-class';
import { useBranchStore } from '../../store/use-branch-store';
import { ClassSection } from '../../types/api/class';

interface MockSubject {
  id: number;
  name: string;
  teacher: string;
  addedOn: string;
}

// Placeholder for the actual subjects view for a specific section
const SectionSubjectsView: React.FC<{ section: ClassSection, className: string, onBack: () => void }> = ({ section, className, onBack }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');

  const [subjects, setSubjects] = useState<MockSubject[]>([
    { id: 1, name: 'Mathematics', teacher: 'John Doe', addedOn: '2026-04-28' },
    { id: 2, name: 'English Literature', teacher: 'Jane Smith', addedOn: '2026-04-28' },
    { id: 3, name: 'General Science', teacher: 'Alice Johnson', addedOn: '2026-04-28' },
  ]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSubject: MockSubject = {
      id: Date.now(),
      name: subjectName,
      teacher: teacherName,
      addedOn: new Date().toISOString().split('T')[0]
    };
    
    setSubjects([...subjects, newSubject]);
    setIsAddModalOpen(false);
    setSubjectName('');
    setTeacherName('');
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
              {className} - Section {section.name} Subjects
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">Manage subjects and syllabus for this section</p>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus size={18} />}>
          Add Subject
        </Button>
      </div>
      
      <Card padding="none" className="overflow-hidden">
        {subjects.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
             <BookOpen size={48} className="mb-4 opacity-50" />
             <p className="text-xl font-bold text-slate-800 mb-2">No Subjects Yet</p>
             <p className="text-sm text-center max-w-md text-slate-500">
                Click the "Add Subject" button to start adding subjects for Class <strong className="text-slate-700">{className}</strong>, Section <strong className="text-slate-700">{section.name}</strong>.
             </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[30%]">Subject Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[30%]">Teacher</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[20%]">Added On</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right w-[20%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{sub.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {sub.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">{sub.teacher}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-slate-500 font-medium">{sub.addedOn}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button 
                         onClick={() => setSubjects(subjects.filter(s => s.id !== sub.id))}
                         className="text-rose-500 hover:text-rose-600 text-xs font-bold px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                       >
                         Remove
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
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">
                  Add New Subject
                </h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600 shadow-sm"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Subject Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mathematics, English..." 
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      required
                      autoFocus
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Teacher Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe..." 
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" 
                    />
                  </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
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
                    className="w-full sm:w-auto shadow-lg shadow-brand-200"
                  >
                    Save Subject
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

export const SubjectsManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<{ section: ClassSection, className: string } | null>(null);
  
  const { selectedBranchId } = useBranchStore();
  const { data: classes, isLoading, error } = useClasses(selectedBranchId || 1);

  if (selectedSection) {
    return <SectionSubjectsView section={selectedSection.section} className={selectedSection.className} onBack={() => setSelectedSection(null)} />;
  }

  const filteredClasses = classes?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center sm:text-left">Subjects Management</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base text-center sm:text-left">Select a class section to manage its subjects</p>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="Search classes..."
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

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
            <p className="font-bold uppercase tracking-widest text-sm">Loading classes...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-rose-500">
            <p className="font-bold">Error loading classes. Please try again later.</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <EmptyState 
            icon={BookOpen}
            title="No Classes Found"
            description="No classes match your search query or no classes have been created yet."
            actionLabel="Clear Search"
            onAction={() => setSearchQuery('')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[35%]">Class Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[65%]">Sections (Click to manage subjects)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredClasses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
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
                            <button
                              key={section.id}
                              onClick={() => setSelectedSection({ section, className: c.name })}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider hover:border-brand-500 hover:text-brand-600 hover:shadow-md transition-all shadow-sm"
                            >
                              <Layers size={14} className="opacity-70" />
                              {section.name}
                            </button>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No sections available</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
