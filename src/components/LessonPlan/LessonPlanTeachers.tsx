import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, ChevronLeft, ChevronRight, UserCircle2 } from 'lucide-react';

interface TeacherRecord {
  id: number;
  name: string;
  email: string;
  campus: string;
  role: string;
  post: string;
  avatar: string;
}

const MOCK_TEACHERS: TeacherRecord[] = [
  { id: 1, name: 'RILLS Alaska', email: 'RILLS@Alaska.edu', campus: 'Alaska', post: 'Role', role: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alaska' },
  { id: 2, name: 'RILLS Himalaya & Margala', email: 'RILLS@Himalaya-Margala.edu', campus: 'Himalaya & Margala', post: 'Role', role: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Himalaya' },
  { id: 3, name: 'RILLS Atlas', email: 'RILLS@Atlas.edu', campus: 'Atlas', post: 'Role', role: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Atlas' },
  { id: 4, name: 'RILLS Alsek+Aures', email: 'RILLS@ALSEK-AURES.edu', campus: 'Alsek+Aures', post: 'Role', role: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alsek' },
  { id: 5, name: 'RILLS Everest', email: 'RILLS@EVEREST.edu', campus: 'Everest', post: 'Role', role: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Everest' },
  { id: 6, name: 'RILLS Olympus+Cameroon', email: 'RILLS@OLYMPUS-CAMEROON.edu', campus: 'Olympus+Cameroon', post: 'Role', role: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olympus' },
  { id: 7, name: 'RILLS Alborz', email: 'RILLS@ALBORZ.edu', campus: 'Alborz', post: 'Role', role: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alborz' },
];

export const LessonPlanTeachers: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchCampus, setSearchCampus] = useState('');
  const [searchPost, setSearchPost] = useState('');

  // Filter logic
  const filteredTeachers = MOCK_TEACHERS.filter(teacher => {
    return (
      (searchId === '' || teacher.id.toString().includes(searchId)) &&
      (searchName === '' || teacher.name.toLowerCase().includes(searchName.toLowerCase())) &&
      (searchCampus === '' || teacher.campus.toLowerCase().includes(searchCampus.toLowerCase())) &&
      (searchPost === '' || teacher.role.toLowerCase().includes(searchPost.toLowerCase()) || teacher.post.toLowerCase().includes(searchPost.toLowerCase()))
    );
  });

  const handleReset = () => {
    setSearchId('');
    setSearchName('');
    setSearchCampus('');
    setSearchPost('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">Teachers Lesson Plan</h2>
        <p className="text-slate-500 font-medium">Manage and view lesson plans and subjects assigned to teachers.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-2 flex-1 min-w-[120px]">
          <label className="text-xs font-bold text-slate-500 uppercase">Search ID</label>
          <input 
            type="text" 
            placeholder="ID..." 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700"
          />
        </div>
        <div className="space-y-2 flex-1 min-w-[180px]">
          <label className="text-xs font-bold text-slate-500 uppercase">Employee Name</label>
          <input 
            type="text" 
            placeholder="Search name..." 
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700"
          />
        </div>
        <div className="space-y-2 flex-1 min-w-[180px]">
          <label className="text-xs font-bold text-slate-500 uppercase">Campus Name</label>
          <input 
            type="text" 
            placeholder="Search campus..." 
            value={searchCampus}
            onChange={(e) => setSearchCampus(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700"
          />
        </div>
        <div className="space-y-2 flex-1 min-w-[180px]">
          <label className="text-xs font-bold text-slate-500 uppercase">Post / Job</label>
          <input 
            type="text" 
            placeholder="Search role..." 
            value={searchPost}
            onChange={(e) => setSearchPost(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700"
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={handleReset}
            className="px-6 h-12 rounded-xl font-bold transition-all text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent"
          >
            Reset
          </button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden bg-white shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-20 text-center">ID</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Employee Name</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Campus Name</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Post/Job</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-center">Topics</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-600 text-center">{teacher.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-xl w-max border border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                        <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{teacher.name}</p>
                        <p className="text-xs font-medium text-slate-500">{teacher.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">{teacher.campus}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-600">{teacher.post}</p>
                    <p className="text-sm font-black text-emerald-500">{teacher.role}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 transition-all text-white font-bold rounded-lg shadow-sm shadow-emerald-200">
                      Topics
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="px-6 py-2 bg-brand-500 hover:bg-brand-600 transition-all text-white font-bold rounded-lg shadow-sm shadow-brand-200">
                      Subjects
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No teachers found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <div className="px-4 py-2 rounded-lg bg-green-50 text-brand-600 text-sm font-bold border border-green-100">
            Showing page 1 of 3
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button className="w-8 h-8 rounded-lg bg-brand-500 text-white font-bold flex items-center justify-center shadow-sm shadow-brand-200">
              1
            </button>
            <button className="w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-50 font-bold flex items-center justify-center transition-colors">
              2
            </button>
            <button className="w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-50 font-bold flex items-center justify-center transition-colors">
              3
            </button>
            <button className="p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
