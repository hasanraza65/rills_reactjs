import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  FileText,
  Download,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, ATTENDANCE_RECORDS, AttendanceStatus } from '../../types';

export const ParentAttendanceView: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getAttendanceForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return ATTENDANCE_RECORDS.find(r => r.date === dateStr);
  };

  const stats = {
    present: ATTENDANCE_RECORDS.filter(r => r.status === 'PRESENT').length,
    absent: ATTENDANCE_RECORDS.filter(r => r.status === 'ABSENT').length,
    late: ATTENDANCE_RECORDS.filter(r => r.status === 'LATE').length,
    total: ATTENDANCE_RECORDS.length,
    percentage: Math.round((ATTENDANCE_RECORDS.filter(r => r.status === 'PRESENT').length / ATTENDANCE_RECORDS.length) * 100) || 0
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Child Attendance</h3>
          <p className="text-slate-500 font-medium">Track your child's daily presence and punctuality</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <button 
              onClick={() => setView('calendar')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                view === 'calendar' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Calendar
            </button>
            <button 
              onClick={() => setView('list')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                view === 'list' ? "bg-brand-500 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:text-slate-700"
              )}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <TrendingUp size={32} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attendance Rate</p>
                <p className="text-3xl font-black text-slate-800">{stats.percentage}%</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 text-emerald-700">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-bold">Present Days</span>
                </div>
                <span className="text-lg font-black">{stats.present}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 text-rose-700">
                <div className="flex items-center gap-3">
                  <XCircle size={18} />
                  <span className="text-sm font-bold">Absent Days</span>
                </div>
                <span className="text-lg font-black">{stats.absent}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 text-amber-700">
                <div className="flex items-center gap-3">
                  <Clock size={18} />
                  <span className="text-sm font-bold">Late Arrivals</span>
                </div>
                <span className="text-lg font-black">{stats.late}</span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400 mb-4">
                <Info size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Quick Note</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Attendance is updated daily by 10:00 AM. Please contact the school office if you find any discrepancies.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-xl shadow-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Remarks</h4>
              <FileText size={18} className="text-slate-500" />
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs font-bold text-brand-400 mb-1">March 04, 2024</p>
                <p className="text-xs text-slate-300">Arrived late due to heavy traffic in Gulberg area.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs font-bold text-brand-400 mb-1">Feb 28, 2024</p>
                <p className="text-xs text-slate-300">Participated in Inter-School Debate competition.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {view === 'calendar' ? (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xl font-extrabold text-slate-800">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                      <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-4 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-4">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const record = getAttendanceForDay(day);
                    return (
                      <div 
                        key={day}
                        className={cn(
                          "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group cursor-default",
                          record?.status === 'PRESENT' ? "bg-emerald-50 text-emerald-600" :
                          record?.status === 'ABSENT' ? "bg-rose-50 text-rose-600" :
                          record?.status === 'LATE' ? "bg-amber-50 text-amber-600" :
                          "bg-slate-50 text-slate-400"
                        )}
                      >
                        <span className="text-sm font-bold">{day}</span>
                        {record && (
                          <div className="mt-1">
                            {record.status === 'PRESENT' && <CheckCircle2 size={12} />}
                            {record.status === 'ABSENT' && <XCircle size={12} />}
                            {record.status === 'LATE' && <Clock size={12} />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-6 pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-500">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-slate-500">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-slate-500">Late</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="text-xs font-bold text-slate-500">No Record</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
              >
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Day</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ATTENDANCE_RECORDS.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-slate-800">{new Date(record.date).toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-medium text-slate-600">
                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <div className={cn(
                            "flex items-center gap-1.5 text-xs font-bold",
                            record.status === 'PRESENT' ? "text-emerald-600" :
                            record.status === 'ABSENT' ? "text-rose-600" :
                            "text-amber-600"
                          )}>
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              record.status === 'PRESENT' ? "bg-emerald-600" :
                              record.status === 'ABSENT' ? "bg-rose-600" :
                              "bg-amber-600"
                            )} />
                            {record.status}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs text-slate-500 italic">{record.remarks || 'No remarks'}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
