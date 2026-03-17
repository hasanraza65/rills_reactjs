import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book as BookIcon, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  X,
  User,
  Calendar,
  Hash,
  BookOpen,
  Library as LibraryIcon,
  RotateCcw,
  DollarSign
} from 'lucide-react';
import { cn, Book, IssuedBook, BOOKS_DATA, ISSUED_BOOKS_DATA, STUDENTS } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';

export const LibraryManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'books' | 'issued'>('books');
  const [books, setBooks] = useState<Book[]>(BOOKS_DATA);
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>(ISSUED_BOOKS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBook, setShowAddBook] = useState(false);
  const [showIssueBook, setShowIssueBook] = useState(false);

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.isbn.includes(searchQuery)
  );

  const getStudentName = (id: string) => STUDENTS.find(s => s.id === id)?.name || 'Unknown Student';
  const getBookTitle = (id: string) => books.find(b => b.id === id)?.title || 'Unknown Book';

  const calculateFine = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    if (today > due) {
      const diffTime = Math.abs(today.getTime() - due.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * 10; // 10 units per day
    }
    return 0;
  };

  const handleReturn = (id: string) => {
    setIssuedBooks(prev => prev.map(ib => {
      if (ib.id === id) {
        const fine = calculateFine(ib.dueDate);
        return { ...ib, status: 'RETURNED', returnDate: new Date().toISOString().split('T')[0], fineAmount: fine };
      }
      return ib;
    }));
    
    // Update book availability
    const issued = issuedBooks.find(ib => ib.id === id);
    if (issued) {
      setBooks(prev => prev.map(b => 
        b.id === issued.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b
      ));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Library Management</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">Manage your school's collection and track issued books.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setShowIssueBook(true)}
            leftIcon={<BookOpen size={18} />}
            className="w-full sm:w-auto justify-center"
          >
            Issue Book
          </Button>
          <Button 
            onClick={() => setShowAddBook(true)}
            leftIcon={<Plus size={18} />}
            className="w-full sm:w-auto justify-center"
          >
            Add New Book
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total Books', value: books.reduce((acc, b) => acc + b.totalCopies, 0), icon: LibraryIcon, color: 'blue' },
          { label: 'Available', value: books.reduce((acc, b) => acc + b.availableCopies, 0), icon: CheckCircle2, color: 'emerald' },
          { label: 'Issued', value: issuedBooks.filter(ib => ib.status === 'ISSUED' || ib.status === 'OVERDUE').length, icon: BookOpen, color: 'purple' },
          { label: 'Overdue', value: issuedBooks.filter(ib => ib.status === 'OVERDUE').length, icon: AlertCircle, color: 'rose' },
        ].map((stat, i) => (
          <Card key={i} padding="none" className="p-4 sm:p-6 overflow-hidden relative group">
            <div className={cn(
              "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-transform group-hover:scale-110 duration-300",
              stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
              stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
              stat.color === 'purple' ? "bg-purple-50 text-purple-600" :
              "bg-rose-50 text-rose-600"
            )}>
              <stat.icon size={20} sm:size={24} />
            </div>
            <p className="text-slate-500 text-[10px] sm:text-sm font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl sm:text-3xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={40} sm:size={80} className="sm:block hidden" />
              <stat.icon size={30} className="sm:hidden block" />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-8 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('books')}
                className={cn(
                  "flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap",
                  activeTab === 'books' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Collection
              </button>
              <button
                onClick={() => setActiveTab('issued')}
                className={cn(
                  "flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap",
                  activeTab === 'issued' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Issued History
              </button>
            </div>

            <div className="relative flex-1 w-full lg:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'books' && filteredBooks.length === 0 ? (
            <div className="p-12">
              <EmptyState 
                icon={BookIcon}
                title="No Books Found"
                description="We couldn't find any books matching your search criteria."
                actionLabel="Clear Search"
                onAction={() => setSearchQuery('')}
              />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      {activeTab === 'books' ? (
                        <>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Book Details</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Availability</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </>
                      ) : (
                        <>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student & Book</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issue/Due Date</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fine</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {activeTab === 'books' ? (
                      filteredBooks.map((book) => (
                        <tr key={book.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-16 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                                <BookIcon size={24} />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{book.title}</p>
                                <p className="text-sm text-slate-500 font-medium">{book.author}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">ISBN: {book.isbn}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                              {book.category}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                                <span className="text-slate-400">Available</span>
                                <span className="text-slate-800">{book.availableCopies}/{book.totalCopies}</span>
                              </div>
                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className={cn(
                                    "h-full transition-all duration-500",
                                    (book.availableCopies / book.totalCopies) < 0.2 ? "bg-rose-500" : "bg-emerald-500"
                                  )}
                                  style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm text-slate-600 font-bold">{book.location || 'N/A'}</p>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button className="p-2 text-slate-300 hover:text-brand-500 transition-colors">
                              <ArrowUpRight size={20} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      issuedBooks.map((ib) => (
                        <tr key={ib.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div>
                              <p className="font-bold text-slate-800">{getStudentName(ib.studentId)}</p>
                              <p className="text-sm text-slate-500 font-medium">{getBookTitle(ib.bookId)}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <Calendar size={12} />
                                <span>Issued: {ib.issueDate}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                <Clock size={12} />
                                <span>Due: {ib.dueDate}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                              ib.status === 'ISSUED' ? "bg-blue-50 text-blue-600" :
                              ib.status === 'RETURNED' ? "bg-emerald-50 text-emerald-600" :
                              "bg-rose-50 text-rose-600"
                            )}>
                              {ib.status}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <p className={cn(
                              "font-extrabold text-sm",
                              ib.fineAmount > 0 ? "text-rose-600" : "text-slate-300"
                            )}>
                              Rs. {ib.fineAmount}
                            </p>
                          </td>
                          <td className="px-8 py-6 text-right">
                            {ib.status !== 'RETURNED' && (
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => handleReturn(ib.id)}
                                leftIcon={<RotateCcw size={14} />}
                              >
                                Return
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-slate-100">
                {activeTab === 'books' ? (
                  filteredBooks.map((book) => (
                    <div key={book.id} className="p-5 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-20 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 border border-slate-100 flex-shrink-0">
                          <BookIcon size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                             <div>
                               <p className="font-extrabold text-slate-800 text-sm truncate">{book.title}</p>
                               <p className="text-xs text-slate-500 font-bold mb-1">{book.author}</p>
                             </div>
                             <button className="p-2 text-slate-300 hover:text-brand-500">
                               <ArrowUpRight size={18} />
                             </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                             <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-wider">
                               {book.category}
                             </span>
                             <p className="text-[9px] text-slate-400 font-black uppercase tracking-tight">ISBN: {book.isbn}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Availability</p>
                           <div className="flex items-end justify-between mb-1.5">
                              <span className="text-xs font-black text-slate-800">{book.availableCopies}</span>
                              <span className="text-[10px] text-slate-400 font-bold">/ {book.totalCopies}</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full transition-all duration-500",
                                  (book.availableCopies / book.totalCopies) < 0.2 ? "bg-rose-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}
                              />
                           </div>
                        </div>
                        <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</p>
                           <p className="text-xs font-black text-slate-700">{book.location || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  issuedBooks.map((ib) => (
                    <div key={ib.id} className="p-5 space-y-4 hover:bg-slate-50/50 transition-colors">
                       <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                                <User size={18} />
                             </div>
                             <div>
                                <p className="text-sm font-extrabold text-slate-800">{getStudentName(ib.studentId)}</p>
                                <p className="text-xs text-slate-500 font-bold line-clamp-1">{getBookTitle(ib.bookId)}</p>
                             </div>
                          </div>
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider",
                            ib.status === 'ISSUED' ? "bg-blue-50 text-blue-600" :
                            ib.status === 'RETURNED' ? "bg-emerald-50 text-emerald-600" :
                            "bg-rose-50 text-rose-600"
                          )}>
                            {ib.status}
                          </span>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                             <p className="text-xs font-bold text-slate-700">{ib.issueDate}</p>
                          </div>
                          <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                             <p className="text-xs font-bold text-slate-700">{ib.dueDate}</p>
                          </div>
                       </div>

                       <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1.5">
                             <DollarSign size={14} className={ib.fineAmount > 0 ? "text-rose-500" : "text-slate-300"} />
                             <p className={cn(
                               "text-sm font-black",
                               ib.fineAmount > 0 ? "text-rose-600" : "text-slate-400"
                             )}>
                               Fine: Rs. {ib.fineAmount}
                             </p>
                          </div>
                          {ib.status !== 'RETURNED' && (
                             <Button 
                               variant="outline"
                               size="sm"
                               onClick={() => handleReturn(ib.id)}
                               className="h-8 py-0 px-3 text-[10px]"
                             >
                               Return Book
                             </Button>
                          )}
                       </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Modals */}
      <AnimatePresence>
        {showAddBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddBook(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">Add New Book</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Enter book details to add to collection.</p>
                </div>
                <button onClick={() => setShowAddBook(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 sm:p-8 space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Book Title</label>
                    <div className="relative">
                      <BookIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500" placeholder="e.g. Physics Vol 1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Author</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500" placeholder="e.g. Stephen Hawking" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">ISBN</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500" placeholder="978-..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 appearance-none">
                      <option>Fiction</option>
                      <option>Science</option>
                      <option>Mathematics</option>
                      <option>History</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Total Copies</label>
                    <input type="number" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500" placeholder="10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Shelf Location</label>
                    <input type="text" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500" placeholder="e.g. A-12" />
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8 bg-slate-50 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button onClick={() => setShowAddBook(false)} className="w-full sm:w-auto px-6 py-3 text-slate-600 font-bold hover:text-slate-800 transition-all">Cancel</button>
                <button className="w-full sm:w-auto px-8 py-3 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 shadow-lg shadow-brand-200 transition-all">Add Book</button>
              </div>
            </motion.div>
          </div>
        )}

        {showIssueBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIssueBook(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">Issue Book</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Record a new book issuance to a student.</p>
                </div>
                <button onClick={() => setShowIssueBook(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 sm:p-8 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Select Student</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 appearance-none">
                    {STUDENTS.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Select Book</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 appearance-none">
                    {books.filter(b => b.availableCopies > 0).map(b => (
                      <option key={b.id} value={b.id}>{b.title} - {b.author}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Issue Date</label>
                    <input type="date" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Due Date</label>
                    <input type="date" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500" />
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8 bg-slate-50 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button onClick={() => setShowIssueBook(false)} className="w-full sm:w-auto px-6 py-3 text-slate-600 font-bold hover:text-slate-800 transition-all">Cancel</button>
                <button className="w-full sm:w-auto px-8 py-3 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 shadow-lg shadow-brand-200 transition-all">Confirm Issue</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
