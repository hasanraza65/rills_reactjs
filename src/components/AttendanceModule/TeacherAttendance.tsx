import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  Users,
  Search,
  Save,
  CheckSquare,
  MinusSquare,
  FileText,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { useBranchStore } from '../../store/use-branch-store';
import { useSections } from '../../hooks/use-section';
import {
  useStudentSectionView,
  useMarkStudentAttendance,
} from '../../hooks/use-attendance';
import { AttendanceStatusCode } from '../../types/api/attendance';

const STATUS_ICONS: Record<AttendanceStatusCode, React.ElementType> = {
  P: CheckCircle2,
  A: XCircle,
  L: FileText,
  H: Clock,
};

const STATUS_COLORS: Record<AttendanceStatusCode, { active: string; hover: string }> = {
  P: { active: 'bg-emerald-500 text-white shadow-lg shadow-emerald-100', hover: 'bg-white text-slate-300 hover:bg-emerald-50 hover:text-emerald-500' },
  A: { active: 'bg-rose-500 text-white shadow-lg shadow-rose-100', hover: 'bg-white text-slate-300 hover:bg-rose-50 hover:text-rose-500' },
  L: { active: 'bg-slate-600 text-white shadow-lg shadow-slate-100', hover: 'bg-white text-slate-300 hover:bg-slate-100 hover:text-slate-600' },
  H: { active: 'bg-blue-500 text-white shadow-lg shadow-blue-100', hover: 'bg-white text-slate-300 hover:bg-blue-50 hover:text-blue-500' },
};

const STATUS_LABELS: Record<AttendanceStatusCode, string> = {
  P: 'Present', A: 'Absent', L: 'Leave', H: 'Half',
};

export const TeacherAttendance: React.FC = () => {
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId ?? 1;

  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusMap, setStatusMap] = useState<Record<number, AttendanceStatusCode>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: sections, isLoading: sectionsLoading } = useSections(branchId);
  const { data: sectionView, isLoading: studentsLoading } = useStudentSectionView(
    selectedSectionId,
    selectedDate
  );
  const markMutation = useMarkStudentAttendance();

  // Auto-select first section
  useEffect(() => {
    if (sections && sections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections]);

  // When section view loads, seed statusMap with existing or default P
  useEffect(() => {
    if (!sectionView) return;
    const initial: Record<number, AttendanceStatusCode> = {};
    sectionView.students.forEach((s) => {
      initial[s.id] = (s.attendance?.status as AttendanceStatusCode) ?? 'P';
    });
    setStatusMap(initial);
  }, [sectionView]);

  const filteredStudents = useMemo(() => {
    if (!sectionView) return [];
    const q = searchQuery.toLowerCase();
    return sectionView.students.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.admission_no ?? '').toLowerCase().includes(q)
    );
  }, [sectionView, searchQuery]);

  const stats = useMemo(() => {
    const vals = Object.values(statusMap) as AttendanceStatusCode[];
    return {
      P: vals.filter((v) => v === 'P').length,
      A: vals.filter((v) => v === 'A').length,
      L: vals.filter((v) => v === 'L').length,
      H: vals.filter((v) => v === 'H').length,
      total: vals.length,
    };
  }, [statusMap]);

  const handleStatusChange = (studentId: number, status: AttendanceStatusCode) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
    setSaveError(null);
  };

  const bulkMark = (status: AttendanceStatusCode) => {
    const updated = { ...statusMap };
    filteredStudents.forEach((s) => { updated[s.id] = status; });
    setStatusMap(updated);
    setSaveError(null);
  };

  const handleSave = () => {
    if (!selectedSectionId || !sectionView) return;
    setSaveError(null);

    const records = sectionView.students.map((s) => ({
      student_id: s.id,
      status: statusMap[s.id] ?? 'P',
      remarks: null,
    }));

    markMutation.mutate(
      { branch_id: branchId, section_id: selectedSectionId, date: selectedDate, records },
      { onError: (err: any) => setSaveError(err?.response?.data?.message ?? 'Failed to save.') }
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Daily Attendance</h3>
          <p className="text-slate-500 font-bold mt-1">Mark attendance for your section</p>
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

          <Button
            onClick={handleSave}
            disabled={markMutation.isPending || !sectionView}
            icon={markMutation.isPending ? Loader2 : Save}
            className="bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-100"
          >
            {markMutation.isPending ? 'Saving…' : markMutation.isSuccess ? 'Saved ✓' : 'Save'}
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="flex items-center gap-3 px-5 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium">
          <AlertTriangle size={16} className="shrink-0" />
          {saveError}
          <button onClick={() => setSaveError(null)} className="ml-auto text-rose-400 hover:text-rose-600 font-bold">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sections Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Sections</h4>

          {sectionsLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : (
            <div className="space-y-3">
              {(sections ?? []).map((section) => (
                <button
                  key={section.id}
                  onClick={() => { setSelectedSectionId(section.id); setSearchQuery(''); }}
                  className={cn(
                    'w-full flex items-center gap-4 px-5 py-5 rounded-[2rem] text-left transition-all border-2',
                    selectedSectionId === section.id
                      ? 'bg-brand-500 border-brand-500 text-white shadow-xl shadow-brand-100'
                      : 'bg-white border-transparent text-slate-600 hover:border-slate-100 shadow-sm'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm',
                    selectedSectionId === section.id ? 'bg-white/20' : 'bg-slate-50 text-slate-400'
                  )}>
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-base font-black">{section.school_class?.name}</p>
                    <p className={cn(
                      'text-[10px] font-black uppercase tracking-widest',
                      selectedSectionId === section.id ? 'text-brand-100' : 'text-slate-400'
                    )}>Section {section.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Summary Card */}
          <Card className="p-8 space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Today's Summary</h4>
            {[
              { key: 'P', label: 'Present', cls: 'bg-emerald-50 text-emerald-700' },
              { key: 'A', label: 'Absent',  cls: 'bg-rose-50 text-rose-700' },
              { key: 'L', label: 'On Leave', cls: 'bg-slate-50 text-slate-600' },
              { key: 'H', label: 'Half-day', cls: 'bg-blue-50 text-blue-700' },
            ].map(({ key, label, cls }) => (
              <div key={key} className={cn('flex items-center justify-between p-4 rounded-2xl shadow-sm', cls)}>
                <span className="text-xs font-black uppercase tracking-wider">{label}</span>
                <span className="text-2xl font-black">{stats[key as AttendanceStatusCode]}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Students Panel */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or admission no…"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => bulkMark('P')}
                  className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                  icon={CheckSquare}
                >
                  All Present
                </Button>
                <Button
                  variant="outline"
                  onClick={() => bulkMark('A')}
                  className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                  icon={MinusSquare}
                >
                  All Absent
                </Button>
              </div>
            </div>

            {studentsLoading ? (
              <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-sm font-bold uppercase tracking-widest">Loading students…</p>
              </div>
            ) : !selectedSectionId ? (
              <EmptyState icon={Users} title="Select a Section" description="Choose a section from the sidebar to mark attendance." />
            ) : filteredStudents.length === 0 && searchQuery ? (
              <EmptyState icon={Search} title="No students found" description="Try a different search query." />
            ) : filteredStudents.length === 0 ? (
              <EmptyState icon={Users} title="No students" description="This section has no students enrolled." />
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredStudents.map((student, index) => {
                    const current = statusMap[student.id] ?? 'P';
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.02 }}
                        key={student.id}
                        className="flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 border-2 border-transparent hover:border-slate-100 transition-all"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center font-black text-slate-400 shadow-sm text-lg">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-800">{student.name}</p>
                            <p className="text-xs text-slate-400 font-bold">
                              {student.admission_no ? `No: ${student.admission_no}` : `ID: ${student.id}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {(['P', 'A', 'L', 'H'] as AttendanceStatusCode[]).map((status) => {
                            const Icon = STATUS_ICONS[status];
                            const colors = STATUS_COLORS[status];
                            return (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(student.id, status)}
                                title={STATUS_LABELS[status]}
                                className={cn(
                                  'w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm',
                                  current === status ? colors.active : colors.hover
                                )}
                              >
                                <Icon size={24} />
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
