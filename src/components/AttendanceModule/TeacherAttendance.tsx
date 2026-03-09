import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar as CalendarIcon, 
  Users, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Save,
  CheckSquare,
  MinusSquare,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, STUDENTS, CLASSES, AttendanceStatus, Student } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';

export const TeacherAttendance: React.FC = () => {
  const [selectedClassId, setSelectedClassId] = useState(CLASSES[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentClass = CLASSES.find(c => c.id === selectedClassId);
  const classStudents = STUDENTS.filter(s => s.classId === selectedClassId);
  const filteredStudents = classStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.rollNumber.includes(searchQuery)
  );

  // Initialize attendance if not present
  useEffect(() => {
    const initialAttendance: Record<string, AttendanceStatus> = {};
    classStudents.forEach(s => {
      initialAttendance[s.id] = 'PRESENT'; // Default to present
    });
    setAttendance(initialAttendance);
  }, [selectedClassId, selectedDate]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
    // Auto-save simulation
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const bulkMark = (status: AttendanceStatus) => {
    const newAttendance = { ...attendance };
    filteredStudents.forEach(s => {
      newAttendance[s.id] = status;
    });
    setAttendance(newAttendance);
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const stats = {
    present: Object.values(attendance).filter(s => s === 'PRESENT').length,
    absent: Object.values(attendance).filter(s => s === 'ABSENT').length,
    late: Object.values(attendance).filter(s => s === 'LATE').length,
    leave: Object.values(attendance).filter(s => s === 'LEAVE').length,
    total: classStudents.length
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Daily Attendance</h3>
          <p className="text-slate-500 font-bold mt-1">Mark and manage attendance for your class</p>
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
          <div className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all shadow-sm uppercase tracking-wider",
            isSaving ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
          )}>
            {isSaving ? (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                All changes saved
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">My Classes</h4>
          <div className="space-y-3">
            {CLASSES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClassId(c.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-5 rounded-[2rem] text-left transition-all border-2",
                  selectedClassId === c.id 
                    ? "bg-brand-500 border-brand-500 text-white shadow-xl shadow-brand-100" 
                    : "bg-white border-transparent text-slate-600 hover:border-slate-100 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                  selectedClassId === c.id ? "bg-white/20" : "bg-slate-50 text-slate-400"
                )}>
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-base font-black">{c.name}</p>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    selectedClassId === c.id ? "text-brand-100" : "text-slate-400"
                  )}>Section {c.section}</p>
                </div>
              </button>
            ))}
          </div>

          <Card className="p-8 space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Attendance Summary</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 text-emerald-700 shadow-sm">
                <span className="text-xs font-black uppercase tracking-wider">Present</span>
                <span className="text-2xl font-black">{stats.present}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 text-rose-700 shadow-sm">
                <span className="text-xs font-black uppercase tracking-wider">Absent</span>
                <span className="text-2xl font-black">{stats.absent}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 text-amber-700 shadow-sm">
                <span className="text-xs font-black uppercase tracking-wider">Late</span>
                <span className="text-2xl font-black">{stats.late}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 text-slate-600 shadow-sm">
                <span className="text-xs font-black uppercase tracking-wider">On Leave</span>
                <span className="text-2xl font-black">{stats.leave}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student by name or roll number..."
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20 outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  onClick={() => bulkMark('PRESENT')}
                  className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                  icon={CheckSquare}
                >
                  All Present
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => bulkMark('ABSENT')}
                  className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                  icon={MinusSquare}
                >
                  All Absent
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredStudents.map((student, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.02 }}
                    key={student.id}
                    className="flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 border-2 border-transparent hover:border-slate-100 transition-all group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center font-black text-slate-400 shadow-sm text-lg">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-800">{student.name}</p>
                        <p className="text-xs text-slate-400 font-bold">Roll: {student.rollNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleStatusChange(student.id, 'PRESENT')}
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                          attendance[student.id] === 'PRESENT' 
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" 
                            : "bg-white text-slate-300 hover:bg-emerald-50 hover:text-emerald-500"
                        )}
                        title="Present"
                      >
                        <CheckCircle2 size={24} />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'ABSENT')}
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                          attendance[student.id] === 'ABSENT' 
                            ? "bg-rose-500 text-white shadow-lg shadow-rose-100" 
                            : "bg-white text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                        )}
                        title="Absent"
                      >
                        <XCircle size={24} />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'LATE')}
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                          attendance[student.id] === 'LATE' 
                            ? "bg-amber-500 text-white shadow-lg shadow-amber-100" 
                            : "bg-white text-slate-300 hover:bg-amber-50 hover:text-amber-500"
                        )}
                        title="Late"
                      >
                        <Clock size={24} />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'LEAVE')}
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                          attendance[student.id] === 'LEAVE' 
                            ? "bg-slate-600 text-white shadow-lg shadow-slate-100" 
                            : "bg-white text-slate-300 hover:bg-slate-100 hover:text-slate-600"
                        )}
                        title="On Leave"
                      >
                        <FileText size={24} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredStudents.length === 0 && (
                <EmptyState 
                  icon={Search}
                  title="No students found"
                  description="Try searching with a different name or roll number."
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
