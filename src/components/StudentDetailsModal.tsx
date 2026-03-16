import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  History,
  Users,
  ExternalLink,
  ChevronRight,
  Heart
} from 'lucide-react';
import { StudentData } from '../types/api/student';
import { cn } from '../types';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentData | null;
  isLoading?: boolean;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  student, 
  isLoading 
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]"

        >
          {/* Header Section */}
          <div className="relative p-8 pb-12 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-500/10 to-transparent -z-10" />
            <div className="absolute top-0 right-0 p-4 sm:p-8">
              <button 
                onClick={onClose}
                className="p-2 sm:p-3 bg-white/50 backdrop-blur-md hover:bg-white rounded-xl sm:rounded-2xl transition-all shadow-sm group"
              >
                <X size={18} className="text-slate-400 group-hover:text-slate-600" />
              </button>
            </div>


            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-[2.5rem] bg-brand-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-2xl shadow-brand-500/20">
                  {student?.photo ? (
                    <img src={student.photo} alt={student.name} className="w-full h-full object-cover rounded-2xl sm:rounded-[2.5rem]" />
                  ) : (
                    student?.name?.charAt(0) || 'S'
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white shadow-xl flex items-center justify-center text-brand-500 border border-slate-50">
                  <GraduationCap size={16} />
                </div>
              </div>

              
              <div className="text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 mb-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{student?.name || 'Loading...'}</h2>
                  <span className="px-2 sm:px-3 py-1 rounded-full bg-brand-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                    {student?.admission_no || 'Pending'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-bold text-sm">
                  <span className="flex items-center gap-1.5 capitalize">
                    <User size={16} /> {student?.gender}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={16} /> ADM Date: {student?.admission_date || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Student
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-0 custom-scrollbar">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal & Academic */}
              <div className="space-y-8">
                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <GraduationCap size={14} /> Academic Profile
                  </h3>
                  <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Current Class</p>
                        <p className="text-sm font-bold text-slate-800">{student?.class?.name || 'Not Assigned'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Section</p>
                        <p className="text-sm font-bold text-slate-800">{student?.section?.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Studying</p>
                      <p className="text-sm font-bold text-slate-800">{student?.currently_studying || 'Not Specified'}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <MapPin size={14} /> Contact & Origin
                  </h3>
                  <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Home Address</p>
                        <p className="text-sm font-bold text-slate-800 leading-relaxed">{student?.address || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Nationality</p>
                        <p className="text-sm font-bold text-slate-800">{student?.nationality || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Contact</p>
                        <p className="text-sm font-bold text-slate-800">{student?.home_contact || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Family & Health */}
              <div className="space-y-8">
                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Users size={14} /> Family Details
                  </h3>
                  <div className="bg-brand-50/30 rounded-3xl p-6 border border-brand-100/50 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-500 shadow-sm">
                        <Users size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Father's Name</p>
                        <p className="text-sm font-bold text-brand-600">{student?.parent?.father_name || 'N/A'}</p>
                      </div>
                    </div>
                    {student?.siblings && student.siblings.length > 0 && (
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Siblings at Rills</p>
                        <div className="space-y-2">
                          {student.siblings.map(sib => (
                            <div key={sib.id} className="flex items-center justify-between p-3 bg-white rounded-xl text-xs font-bold text-slate-600 border border-slate-50">
                              <span>{sib.name}</span>
                              <span className="text-[10px] text-slate-400">{sib.class?.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Heart size={14} /> Health & Medical
                  </h3>
                  <div className="bg-rose-50/50 rounded-3xl p-6 border border-rose-100 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {student?.health_issues && student.health_issues.length > 0 ? (
                        student.health_issues.map((issue, idx) => (
                          <span key={idx} className="px-3 py-1 bg-rose-100 text-rose-600 rounded-lg text-[10px] font-black uppercase">
                            {issue}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm font-bold text-slate-400 italic">No health issues reported</span>
                      )}
                    </div>
                    {student?.health_details && (
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Medical Notes</p>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed italic">"{student.health_details}"</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-3">
               <History size={16} className="text-slate-400" />
               <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">
                 Registered on: {new Date(student?.created_at || '').toLocaleDateString()}
               </p>
             </div>
             <button 
               onClick={onClose}
               className="w-full sm:w-auto px-8 py-3 bg-slate-800 text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
             >
               Close Profile
             </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
