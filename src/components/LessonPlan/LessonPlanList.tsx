import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { ChevronLeft, ChevronRight, Eye, AlertCircle } from 'lucide-react';

interface LessonPlanStatusRecord {
  id: number;
  topic: string;
  subjectName: string;
  className: string;
  worksheets: number;
  status: 'Pending' | 'Done';
}

const INITIAL_DATA: LessonPlanStatusRecord[] = [
  { id: 1, topic: 'TEST22', subjectName: 'English', className: 'Level 1', worksheets: 5, status: 'Done' },
  { id: 2, topic: 'TEST2 74', subjectName: 'Danish TEST', className: 'Level 2', worksheets: 2, status: 'Pending' },
  { id: 3, topic: 'Mirza galib', subjectName: 'Urdu', className: 'Level 3', worksheets: 0, status: 'Pending' },
  { id: 4, topic: 'Ch1', subjectName: 'Urdu', className: 'Level 3', worksheets: 0, status: 'Pending' },
  { id: 5, topic: 'One', subjectName: 'Danish TEST', className: 'Level 2', worksheets: 0, status: 'Pending' },
  { id: 6, topic: 'Two', subjectName: 'Danish TEST', className: 'Level 2', worksheets: 0, status: 'Pending' },
  { id: 7, topic: 'Three', subjectName: 'Danish TEST', className: 'Level 2', worksheets: 1, status: 'Pending' },
];

export const LessonPlanList: React.FC = () => {
  const [plans, setPlans] = useState<LessonPlanStatusRecord[]>(INITIAL_DATA);

  // Filters
  const [searchId, setSearchId] = useState('');
  const [searchTopic, setSearchTopic] = useState('');
  const [searchSubject, setSearchSubject] = useState('');
  const [searchClass, setSearchClass] = useState('');
  const [searchWorksheets, setSearchWorksheets] = useState('');

  // Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredPlans = plans.filter(plan => {
    return (
      (searchId === '' || plan.id.toString().includes(searchId)) &&
      (searchTopic === '' || plan.topic.toLowerCase().includes(searchTopic.toLowerCase())) &&
      (searchSubject === '' || plan.subjectName.toLowerCase().includes(searchSubject.toLowerCase())) &&
      (searchClass === '' || plan.className.toLowerCase().includes(searchClass.toLowerCase())) &&
      (searchWorksheets === '' || plan.worksheets.toString().includes(searchWorksheets))
    );
  });

  const handleReset = () => {
    setSearchId('');
    setSearchTopic('');
    setSearchSubject('');
    setSearchClass('');
    setSearchWorksheets('');
  };

  const handlePendingClick = (id: number) => {
    setSelectedId(id);
    setConfirmModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (selectedId !== null) {
      setPlans(prev => prev.map(p => 
        p.id === selectedId ? { ...p, status: 'Done' } : p
      ));
      setConfirmModalOpen(false);
      setSelectedId(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">Lesson Plans Status</h2>
        <p className="text-slate-500 font-medium">View and update the status of lesson plans.</p>
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
        <div className="space-y-2 flex-1 min-w-[150px]">
          <label className="text-xs font-bold text-slate-500 uppercase">Topic</label>
          <input 
            type="text" 
            placeholder="Search topic..." 
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700"
          />
        </div>
        <div className="space-y-2 flex-1 min-w-[150px]">
          <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
          <input 
            type="text" 
            placeholder="Search subject..." 
            value={searchSubject}
            onChange={(e) => setSearchSubject(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700"
          />
        </div>
        <div className="space-y-2 flex-1 min-w-[150px]">
          <label className="text-xs font-bold text-slate-500 uppercase">Class Name</label>
          <input 
            type="text" 
            placeholder="Search class..." 
            value={searchClass}
            onChange={(e) => setSearchClass(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700"
          />
        </div>
        <div className="space-y-2 flex-1 min-w-[150px]">
          <label className="text-xs font-bold text-slate-500 uppercase">Work Sheets</label>
          <input 
            type="text" 
            placeholder="Count..." 
            value={searchWorksheets}
            onChange={(e) => setSearchWorksheets(e.target.value)}
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
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Topic</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Subject Name</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Class Name</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-center">Work Sheets</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-600 text-center">{plan.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">{plan.topic}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">{plan.subjectName}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">{plan.className}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-sm font-bold">
                      {plan.worksheets}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {plan.status === 'Done' ? (
                      <span className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold rounded-xl inline-flex items-center justify-center w-28 text-sm shadow-sm">
                        Done
                      </span>
                    ) : (
                      <button 
                        onClick={() => handlePendingClick(plan.id)}
                        className="px-4 py-2 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-200 hover:border-amber-500 transition-all font-bold rounded-xl inline-flex items-center justify-center w-28 text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-200"
                      >
                        Pending
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors mx-auto flex items-center justify-center">
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPlans.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No lesson plans found matching your filters.
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

      {/* SweetAlert-style Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full border-4 border-amber-100 text-amber-500 flex items-center justify-center mb-6">
              <span className="text-4xl font-black">!</span>
            </div>
            
            <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Are you sure?</h3>
            <p className="text-slate-500 font-medium mb-8">You won't be able to revert this!</p>
            
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={handleConfirmSubmit}
                className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-200 transition-all hover:-translate-y-0.5"
              >
                Yes, submit it!
              </button>
              <button 
                onClick={() => setConfirmModalOpen(false)}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
