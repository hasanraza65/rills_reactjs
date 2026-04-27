import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calendar, Search } from 'lucide-react';
import { CLASSES } from '../../types';

interface StudentAttendanceRecord {
  id: string;
  name: string;
  father: string;
  dateStatus: 'P' | 'A' | 'L' | 'H' | '--';
  totalP: number;
  totalA: number;
  totalL: number;
  totalH: number;
}

const MOCK_DATA: StudentAttendanceRecord[] = [
  { id: '1', name: 'Ali Khan', father: 'Kamran Khan', dateStatus: 'P', totalP: 22, totalA: 2, totalL: 1, totalH: 0 },
  { id: '2', name: 'Sara Ahmed', father: 'Ahmed Raza', dateStatus: 'A', totalP: 18, totalA: 5, totalL: 2, totalH: 0 },
  { id: '3', name: 'Usman Bilal', father: 'Bilal Haq', dateStatus: 'L', totalP: 20, totalA: 0, totalL: 5, totalH: 0 },
  { id: '4', name: 'Zainab Noor', father: 'Noor Muhammad', dateStatus: 'P', totalP: 25, totalA: 0, totalL: 0, totalH: 0 },
  { id: '5', name: 'Omer Farooq', father: 'Farooq Azam', dateStatus: 'H', totalP: 21, totalA: 1, totalL: 1, totalH: 2 },
];

export const StudentAttendanceManager: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [startDate, setStartDate] = useState('2026-04-27');
  const [endDate, setEndDate] = useState('2026-04-28');
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'P': return 'bg-emerald-500 text-white shadow-emerald-200';
      case 'A': return 'bg-rose-500 text-white shadow-rose-200';
      case 'L': return 'bg-slate-400 text-white shadow-slate-200';
      case 'H': return 'bg-blue-500 text-white shadow-blue-200';
      default: return 'bg-emerald-400 text-white shadow-emerald-200'; // the green '--' button in screenshot
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-6">Student Attendance</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Select Class</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 shadow-sm appearance-none"
              >
                <option value="">Choose...</option>
                {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Select Section</label>
              <select 
                value={selectedSection} 
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 shadow-sm appearance-none"
              >
                <option value="">Choose...</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Select Student</label>
              <select 
                value={selectedStudent} 
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 shadow-sm appearance-none"
              >
                <option value="">Choose...</option>
                <option value="ALL">All Students</option>
                <option value="1">Ali Khan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Start Date</label>
              <div className="relative">
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 shadow-sm"
                />
                <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">End Date</label>
              <div className="relative">
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 shadow-sm"
                />
                <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full sm:w-64">Submit</Button>
          </div>
        </form>
      </div>

      {isSubmitted && (
        <Card padding="none" className="overflow-hidden bg-white shadow-sm border border-slate-100">
          <div className="p-8">
            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500"><span className="w-6 h-6 rounded flex items-center justify-center bg-emerald-500 text-white text-xs">P</span> {`=>`} present</div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500"><span className="w-6 h-6 rounded flex items-center justify-center bg-rose-500 text-white text-xs">A</span> {`=>`} absent</div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500"><span className="w-6 h-6 rounded flex items-center justify-center bg-slate-400 text-white text-xs">L</span> {`=>`} leave</div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500"><span className="w-6 h-6 rounded flex items-center justify-center bg-blue-500 text-white text-xs">H</span> {`=>`} halfday</div>
            </div>

            {/* Month Badge */}
            <div className="flex justify-center mb-8">
              <div className="px-8 py-3 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-50 text-xl font-bold text-slate-600">
                Apr 2026
              </div>
            </div>

            {/* Mark All Button */}
            <div className="flex justify-center mb-8">
              <button className="w-32 h-10 rounded-lg bg-emerald-400 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-200 flex items-center justify-center text-white font-black text-lg">
                --
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-x-2 border-spacing-y-4">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-white border-2 border-slate-800 rounded-xl text-center text-xs font-bold text-slate-800 w-16">#</th>
                    <th className="px-6 py-3 bg-white border-2 border-slate-800 rounded-xl text-center text-xs font-bold text-slate-800">Students</th>
                    <th className="px-6 py-3 bg-white border-2 border-slate-800 rounded-xl text-center text-xs font-bold text-slate-800">Father</th>
                    <th className="px-6 py-3 bg-sky-300 rounded-xl text-center text-xs font-bold text-white">Apr 27</th>
                    <th className="px-6 py-3 bg-slate-900 rounded-xl text-center text-xs font-bold text-white">Total P</th>
                    <th className="px-6 py-3 bg-slate-900 rounded-xl text-center text-xs font-bold text-white">Total A</th>
                    <th className="px-6 py-3 bg-slate-900 rounded-xl text-center text-xs font-bold text-white">Total L</th>
                    <th className="px-6 py-3 bg-slate-900 rounded-xl text-center text-xs font-bold text-white">Total H</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_DATA.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 bg-slate-50 rounded-xl text-center text-sm font-bold text-slate-600">{row.id}</td>
                      <td className="px-6 py-3 bg-slate-50 rounded-xl text-center text-sm font-bold text-slate-800">{row.name}</td>
                      <td className="px-6 py-3 bg-slate-50 rounded-xl text-center text-sm font-bold text-slate-600">{row.father}</td>
                      <td className="px-2 py-3 text-center">
                        <button className={`w-full h-full py-2 rounded-lg font-bold shadow-sm transition-transform hover:scale-105 ${getStatusColor(row.dateStatus)}`}>
                          {row.dateStatus}
                        </button>
                      </td>
                      <td className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-center text-sm font-bold">{row.totalP}</td>
                      <td className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl text-center text-sm font-bold">{row.totalA}</td>
                      <td className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-center text-sm font-bold">{row.totalL}</td>
                      <td className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl text-center text-sm font-bold">{row.totalH}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </Card>
      )}
    </div>
  );
};
