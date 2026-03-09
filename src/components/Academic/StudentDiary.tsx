import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  FileText, 
  Paperclip, 
  Download, 
  Search, 
  Filter,
  ChevronRight,
  User,
  Clock,
  Send,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, CLASSES, DIARY_ENTRIES, UserRole, DiaryEntry } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';

interface StudentDiaryProps {
  role: UserRole;
}

export const StudentDiary: React.FC<StudentDiaryProps> = ({ role }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>(DIARY_ENTRIES);
  const [selectedClass, setSelectedClass] = useState(CLASSES[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({ subject: '', content: '' });

  const filteredEntries = entries.filter(e => {
    const matchesClass = e.classId === selectedClass;
    const matchesDate = e.date === selectedDate;
    return matchesClass && matchesDate;
  });

  const handleAddEntry = () => {
    if (!newEntry.subject || !newEntry.content) return;
    
    const entry: DiaryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      classId: selectedClass,
      teacherId: 't1',
      subject: newEntry.subject,
      content: newEntry.content,
      date: selectedDate,
    };
    
    setEntries([entry, ...entries]);
    setNewEntry({ subject: '', content: '' });
    setIsAddingEntry(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Student Diary</h3>
          <p className="text-slate-500 font-bold mt-1">Daily work logs and homework assignments</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <CalendarIcon size={20} className="text-slate-400 ml-2" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-sm font-black text-slate-700 outline-none pr-2"
            />
          </div>
          {role === 'TEACHER' && (
            <Button 
              onClick={() => setIsAddingEntry(true)}
              icon={Plus}
              size="lg"
              className="shadow-xl shadow-brand-100"
            >
              Add Entry
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Classes</h4>
          <div className="space-y-3">
            {CLASSES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClass(c.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-5 rounded-[2rem] text-left transition-all border-2",
                  selectedClass === c.id 
                    ? "bg-brand-500 border-brand-500 text-white shadow-xl shadow-brand-100" 
                    : "bg-white border-transparent text-slate-600 hover:border-slate-100 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                  selectedClass === c.id ? "bg-white/20" : "bg-slate-50 text-slate-400"
                )}>
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-base font-black">{c.name}</p>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    selectedClass === c.id ? "text-brand-100" : "text-slate-400"
                  )}>Section {c.section}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence>
            {isAddingEntry && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white p-10 rounded-[3rem] border-2 border-brand-100 shadow-premium overflow-hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <Plus size={24} className="text-brand-500" />
                    New Diary Entry
                  </h4>
                  <button 
                    onClick={() => setIsAddingEntry(false)}
                    className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Subject</label>
                    <input 
                      value={newEntry.subject}
                      onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}
                      placeholder="e.g. Mathematics"
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Work Details / Homework</label>
                    <textarea 
                      value={newEntry.content}
                      onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                      placeholder="Enter what was taught in class and any homework assigned..."
                      rows={5}
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-none shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
                    <div className="flex items-center gap-3">
                      <button className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:text-brand-500 transition-all shadow-sm">
                        <Paperclip size={24} />
                      </button>
                      <button className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:text-brand-500 transition-all shadow-sm">
                        <ImageIcon size={24} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => setIsAddingEntry(false)}
                        className="bg-white"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddEntry}
                        icon={Send}
                        className="px-10 shadow-xl shadow-brand-100"
                      >
                        Post Entry
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-10 top-0 bottom-0 w-1 bg-slate-100 rounded-full" />

            <div className="space-y-10">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={entry.id} 
                    className="relative pl-24"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-8 top-10 w-5 h-5 rounded-full bg-brand-500 border-4 border-white shadow-lg z-10" />
                    
                    <Card hover className="p-10 group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-black text-xl shadow-sm">
                            {entry.subject.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{entry.subject}</h4>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                              <Clock size={12} />
                              Posted at 02:30 PM
                            </div>
                          </div>
                        </div>
                        {entry.attachments && entry.attachments.length > 0 && (
                          <span className="px-4 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                            <Paperclip size={14} />
                            {entry.attachments.length} Attachment
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-50 p-8 rounded-[2.5rem] mb-8 shadow-sm">
                        <p className="text-base text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                          {entry.content}
                        </p>
                      </div>

                      {entry.attachments && entry.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-4">
                          {entry.attachments.map((file, i) => (
                            <button 
                              key={i}
                              className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-white border-2 border-slate-50 hover:border-brand-200 hover:bg-brand-50 transition-all group/file shadow-sm"
                            >
                              <FileText size={20} className="text-slate-400 group-hover/file:text-brand-500" />
                              <span className="text-sm font-black text-slate-700 group-hover/file:text-brand-800">{file.name}</span>
                              <Download size={16} className="text-slate-300 group-hover/file:text-brand-500" />
                            </button>
                          ))}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="pl-24 py-24">
                  <EmptyState 
                    icon={CalendarIcon}
                    title="No Entries Found"
                    description={`There are no diary entries for this class on ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
