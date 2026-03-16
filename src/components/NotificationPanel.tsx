import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Clock,
  BookOpen,
  CreditCard,
  Calendar
} from 'lucide-react';
import { cn } from '../types';
import { Button } from './ui/Button';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  category: 'library' | 'finance' | 'attendance' | 'general';
}

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Book Overdue',
    message: '"The Great Gatsby" was due yesterday. Please return it to avoid further fines.',
    type: 'error',
    time: '2 hours ago',
    category: 'library'
  },
  {
    id: '2',
    title: 'Fee Reminder',
    message: 'Monthly tuition fee for March is due in 3 days.',
    type: 'warning',
    time: '5 hours ago',
    category: 'finance'
  },
  {
    id: '3',
    title: 'Attendance Alert',
    message: 'Ali Zubair was marked absent today.',
    type: 'info',
    time: '1 day ago',
    category: 'attendance'
  },
  {
    id: '4',
    title: 'New Syllabus Added',
    message: 'Grade 10 Physics syllabus has been updated.',
    type: 'success',
    time: '2 days ago',
    category: 'general'
  }
];

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
          >
            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Notifications</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-bold mt-1">Stay updated with school activities</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 sm:p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-600"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>


            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {NOTIFICATIONS.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative p-5 rounded-[2rem] bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all border border-transparent hover:border-slate-100 cursor-pointer"
                >
                  <div className="flex gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                      notif.type === 'success' ? "bg-emerald-100 text-emerald-600" :
                      notif.type === 'error' ? "bg-rose-100 text-rose-600" :
                      notif.type === 'warning' ? "bg-amber-100 text-amber-600" :
                      "bg-blue-100 text-blue-600"
                    )}>
                      {notif.category === 'library' ? <BookOpen size={24} /> :
                       notif.category === 'finance' ? <CreditCard size={24} /> :
                       notif.category === 'attendance' ? <Calendar size={24} /> :
                       <Bell size={24} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-base font-black text-slate-800">{notif.title}</h4>
                        <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                          <Clock size={10} />
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100">
              <Button variant="outline" className="w-full bg-white">
                Mark all as read
              </Button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
