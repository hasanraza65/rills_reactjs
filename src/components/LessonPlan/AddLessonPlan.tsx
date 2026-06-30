import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { ChevronLeft, ChevronRight, X, Plus, Paperclip, FileText } from 'lucide-react';

interface LessonPlanRecord {
  id: number;
  topic: string;
  subjectName: string;
  className: string;
  worksheets: number;
  objectives: number;
}

const INITIAL_MOCK_LESSON_PLANS: LessonPlanRecord[] = [
  { id: 1, topic: 'TEST22', subjectName: 'English', className: 'Level 1', worksheets: 4, objectives: 3 },
  { id: 2, topic: 'TEST2 74', subjectName: 'Danish TEST', className: 'Level 2', worksheets: 2, objectives: 0 },
  { id: 3, topic: 'Mirza galib', subjectName: 'Urdu', className: 'Level 3', worksheets: 0, objectives: 0 },
  { id: 4, topic: 'Ch1', subjectName: 'Urdu', className: 'Level 3', worksheets: 0, objectives: 0 },
  { id: 5, topic: 'One', subjectName: 'Danish TEST', className: 'Level 2', worksheets: 0, objectives: 0 },
  { id: 6, topic: 'Two', subjectName: 'Danish TEST', className: 'Level 2', worksheets: 0, objectives: 0 },
  { id: 7, topic: 'Three', subjectName: 'Danish TEST', className: 'Level 2', worksheets: 1, objectives: 0 },
];

export const AddLessonPlan: React.FC = () => {
  const [plans, setPlans] = useState<LessonPlanRecord[]>(INITIAL_MOCK_LESSON_PLANS);

  const [searchId, setSearchId] = useState('');
  const [searchTopic, setSearchTopic] = useState('');
  const [searchSubject, setSearchSubject] = useState('');
  const [searchClass, setSearchClass] = useState('');
  const [searchWorksheets, setSearchWorksheets] = useState('');
  const [searchObjectives, setSearchObjectives] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlanRecord | null>(null);

  // Modal Form State
  const [videoLink, setVideoLink] = useState('');
  const [lessonPlanText, setLessonPlanText] = useState('');
  const [objectivesList, setObjectivesList] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState('');

  // Filter logic
  const filteredPlans = plans.filter(plan => {
    return (
      (searchId === '' || plan.id.toString().includes(searchId)) &&
      (searchTopic === '' || plan.topic.toLowerCase().includes(searchTopic.toLowerCase())) &&
      (searchSubject === '' || plan.subjectName.toLowerCase().includes(searchSubject.toLowerCase())) &&
      (searchClass === '' || plan.className.toLowerCase().includes(searchClass.toLowerCase())) &&
      (searchWorksheets === '' || plan.worksheets.toString().includes(searchWorksheets)) &&
      (searchObjectives === '' || plan.objectives.toString().includes(searchObjectives))
    );
  });

  const handleReset = () => {
    setSearchId('');
    setSearchTopic('');
    setSearchSubject('');
    setSearchClass('');
    setSearchWorksheets('');
    setSearchObjectives('');
  };

  const handleOpenModal = (plan: LessonPlanRecord) => {
    setSelectedPlan(plan);
    setVideoLink('TEST LINK'); // from screenshot
    setLessonPlanText('TEST FOR LESSON PLAN NOW AND GO OOON'); // from screenshot
    // generate some mock objectives based on the current count
    const mockObjectives = Array.from({ length: plan.objectives }, (_, i) => `Objective ${i + 1}`);
    setObjectivesList(mockObjectives.length ? mockObjectives : ['o1', 'new']); // default some to show the UI
    setIsModalOpen(true);
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectivesList([...objectivesList, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    setObjectivesList(objectivesList.filter((_, i) => i !== index));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const updatedList = [...objectivesList];
    updatedList[index] = value;
    setObjectivesList(updatedList);
  };

  const handleSubmitLessonPlan = () => {
    if (selectedPlan) {
      setPlans(prev => prev.map(p => 
        p.id === selectedPlan.id ? { ...p, objectives: objectivesList.length } : p
      ));
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">Lesson Plans</h2>
          <p className="text-slate-500 font-medium">Manage topics, subjects, and lesson plan content.</p>
        </div>
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
        <div className="space-y-2 flex-1 min-w-[150px]">
          <label className="text-xs font-bold text-slate-500 uppercase">Objectives</label>
          <input 
            type="text" 
            placeholder="Count..." 
            value={searchObjectives}
            onChange={(e) => setSearchObjectives(e.target.value)}
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
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-center">Objectives</th>
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
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-sm font-bold">
                      {plan.objectives}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleOpenModal(plan)}
                      className="px-5 py-2.5 bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white transition-all font-bold rounded-xl border border-brand-100 hover:border-brand-500 hover:shadow-lg hover:shadow-brand-200 hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                    >
                      <FileText size={16} />
                      Lesson Plan
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

      {/* Lesson Plan Modal */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800">Lesson Plan</h3>
                <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  {selectedPlan.className} / {selectedPlan.subjectName} / {selectedPlan.topic}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto space-y-8 flex-1 bg-slate-50/50">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600">Video Link</label>
                <input 
                  type="text" 
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 shadow-sm"
                  placeholder="Paste video link here..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600">Lesson Plan</label>
                <textarea 
                  value={lessonPlanText}
                  onChange={(e) => setLessonPlanText(e.target.value)}
                  rows={3}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-slate-700 shadow-sm resize-none"
                  placeholder="Enter lesson plan details..."
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-600">Objectives</label>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  {objectivesList.map((obj, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group">
                      <input 
                        type="text" 
                        value={obj}
                        onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                        className="flex-1 px-4 py-3 bg-transparent border border-slate-200 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-medium text-slate-600 transition-all"
                      />
                      <button 
                        onClick={() => handleRemoveObjective(idx)}
                        className="w-12 h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-sm shadow-rose-200 shrink-0"
                      >
                        <X size={20} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Add New Objective Row */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50/50">
                    <input 
                      type="text" 
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddObjective()}
                      placeholder="Topic Objective"
                      className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium text-slate-600 transition-all shadow-sm"
                    />
                    <button 
                      onClick={handleAddObjective}
                      disabled={!newObjective.trim()}
                      className="w-12 h-12 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-400 text-white flex items-center justify-center transition-colors shadow-sm shadow-amber-200 shrink-0"
                    >
                      <Plus size={24} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm font-bold text-slate-400">Selected Files</p>
                <div className="w-6 h-6 rounded-md bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                  4
                </div>
                <button className="px-4 py-2 ml-2 rounded-lg border-2 border-amber-200 text-amber-500 font-bold text-sm hover:bg-amber-50 transition-colors flex items-center gap-2">
                  <Paperclip size={16} />
                  Attach Files
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitLessonPlan}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
