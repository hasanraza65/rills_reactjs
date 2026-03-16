import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  Download,
  Eye,
  Settings,
  Building2,
  Mail,
  Phone,
  Calendar,
  X,
  ChevronRight,
  User
} from 'lucide-react';


import { 
  Staff, 
  STAFF_DATA, 
  PAYSLIPS, 
  SALARY_STRUCTURES, 
  BRANCHES, 
  cn,
  STUDENTS
} from '../types';
import { StatCard } from './StatCard';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { EmptyState } from './ui/EmptyState';

interface StaffManagementProps {
  role: string;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({ role }) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'payroll' | 'dashboard'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);

  // Stats for Dashboard
  const totalStaff = STAFF_DATA.length;
  const totalPayroll = PAYSLIPS.reduce((acc, p) => acc + p.netSalary, 0);
  const paidCount = PAYSLIPS.filter(p => p.status === 'PAID').length;
  const pendingCount = PAYSLIPS.filter(p => p.status === 'PENDING').length;

  const filteredStaff = STAFF_DATA.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Staff & Payroll</h2>
          <p className="text-slate-500 font-medium mt-1">Manage your team and salary disbursements</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowStaffForm(true)}
            leftIcon={<UserPlus size={18} />}
          >
            Add Staff
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-[1.25rem] w-full sm:w-fit overflow-x-auto no-scrollbar whitespace-nowrap">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
          { id: 'directory', label: 'Staff Directory', icon: User },
          { id: 'payroll', label: 'Payroll', icon: CreditCard },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0",
              activeTab === tab.id 
                ? "bg-white text-brand-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>


      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Staff"
                value={totalStaff.toString()}
                icon={User}
                color="indigo"
                trend={{ value: 2, isPositive: true }}
              />
              <StatCard
                title="Monthly Payroll"
                value={`Rs. ${totalPayroll.toLocaleString()}`}
                icon={CreditCard}
                color="emerald"
              />
              <StatCard
                title="Paid Salaries"
                value={paidCount.toString()}
                icon={CheckCircle2}
                color="blue"
              />
              <StatCard
                title="Pending Payments"
                value={pendingCount.toString()}
                icon={Clock}
                color="amber"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity / Payroll Summary */}
              <Card>
                <h3 className="text-xl font-bold text-slate-800 mb-6">Payroll Status (Feb 2024)</h3>
                <div className="space-y-4">
                  {PAYSLIPS.map((payslip) => {
                    const staff = STAFF_DATA.find(s => s.id === payslip.staffId);
                    return (
                      <div key={payslip.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all group">
                        <div className="flex items-center gap-4">
                          <img src={staff?.avatar} alt="" className="w-12 h-12 rounded-xl border-2 border-white shadow-sm" />
                          <div>
                            <p className="font-bold text-slate-800">{staff?.name}</p>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{staff?.designation}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-slate-900">Rs. {payslip.netSalary.toLocaleString()}</p>
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider",
                            payslip.status === 'PAID' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          )}>
                            {payslip.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Quick Actions / Staff Distribution */}
              <Card>
                <h3 className="text-xl font-bold text-slate-800 mb-6">Staff Distribution</h3>
                <div className="space-y-6">
                  {BRANCHES.map(branch => {
                    const count = STAFF_DATA.filter(s => s.branchId === branch.id).length;
                    const percentage = (count / STAFF_DATA.length) * 100;
                    return (
                      <div key={branch.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-brand-500" />
                            <span className="text-sm font-bold text-slate-700">{branch.name}</span>
                          </div>
                          <span className="text-sm font-extrabold text-slate-900">{count} Members</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-brand-500 transition-all duration-1000" 
                            style={{ width: `${percentage}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'directory' && (
          <motion.div
            key="directory"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff by name or designation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="saas-input pl-11"
                />
              </div>
              <Button variant="outline" leftIcon={<Filter size={18} />}>
                Filters
              </Button>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState 
                    icon={User}
                    title="No Staff Found"
                    description="We couldn't find any staff members matching your search."
                    actionLabel="Clear Search"
                    onAction={() => setSearchQuery('')}
                  />
                </div>
              ) : (
                filteredStaff.map((staff) => (
                  <Card
                    key={staff.id}
                    padding="none"
                    hover
                    onClick={() => setSelectedStaff(staff)}
                    className="p-6 cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-5 h-5 text-slate-400" />
                    </div>

                    
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="relative">
                        <img 
                          src={staff.avatar} 
                          alt={staff.name} 
                          className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-xl flex items-center justify-center border-2 border-white shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xl font-bold text-slate-900">{staff.name}</h4>
                        <p className="text-sm text-brand-600 font-bold uppercase tracking-wider">{staff.designation}</p>
                      </div>

                      <div className="w-full pt-4 border-t border-slate-50 flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span>{BRANCHES.find(b => b.id === staff.branchId)?.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>{staff.email}</span>
                        </div>
                      </div>

                      <Button variant="ghost" className="w-full">
                        View Profile
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'payroll' && (
          <motion.div
            key="payroll"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card padding="none" className="overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Salary Disbursements</h3>
                  <p className="text-sm text-slate-500 font-medium">February 2024 Payroll Cycle</p>
                </div>
                <Button variant="outline" size="sm" leftIcon={<Download size={16} />} className="shrink-0">
                  <span className="hidden sm:inline">Export Report</span>
                  <span className="sm:hidden">Export</span>
                </Button>

              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[150px] sm:w-auto">Staff Member</th>
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[120px] sm:w-auto">Basic Salary</th>
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[100px] sm:w-auto">Allowances</th>
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[100px] sm:w-auto">Deductions</th>
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[120px] sm:w-auto">Net Salary</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Status</th>
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right w-[100px] sm:w-auto">Actions</th>
                    </tr>

                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {PAYSLIPS.map((payslip) => {
                      const staff = STAFF_DATA.find(s => s.id === payslip.staffId);
                      return (
                        <tr key={payslip.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <img src={staff?.avatar} alt="" className="w-10 h-10 rounded-xl border border-slate-100 shadow-sm" />
                              <div>
                                <p className="text-sm font-bold text-slate-800">{staff?.name}</p>
                                <p className="text-xs text-slate-500 font-medium">{staff?.designation}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm font-bold text-slate-600">Rs. {payslip.basicSalary.toLocaleString()}</td>
                          <td className="px-8 py-5 text-sm font-bold text-emerald-600">+{payslip.totalAllowances.toLocaleString()}</td>
                          <td className="px-8 py-5 text-sm font-bold text-rose-600">-{payslip.totalDeductions.toLocaleString()}</td>
                          <td className="px-8 py-5 text-sm font-extrabold text-slate-900">Rs. {payslip.netSalary.toLocaleString()}</td>
                          <td className="px-8 py-5 hidden lg:table-cell">
                            <span className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                              payslip.status === 'PAID' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            )}>
                              {payslip.status}
                            </span>
                          </td>

                          <td className="px-4 sm:px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                              <button 
                                onClick={() => setShowPayslipModal(true)}
                                className="p-2 text-slate-400 sm:text-slate-300 hover:text-brand-500 transition-colors"
                              >
                                <Eye size={18} />
                              </button>
                              <button className="p-2 text-slate-400 sm:text-slate-300 hover:text-brand-500 transition-colors">
                                <Settings size={18} />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff Profile Modal */}
      <AnimatePresence>
        {selectedStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="relative h-32 bg-indigo-600">
                <button 
                  onClick={() => setSelectedStaff(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              
              <div className="px-8 pb-8">
                <div className="relative -mt-12 mb-6">
                  <img 
                    src={selectedStaff.avatar} 
                    alt="" 
                    className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-900">{selectedStaff.name}</h3>
                    <p className="text-brand-600 font-bold uppercase tracking-wider">{selectedStaff.designation}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Button size="sm" className="sm:inline-flex">
                      Edit Profile
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSalaryModal(true)}
                    >
                      Salary
                    </Button>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Personal Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{selectedStaff.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{selectedStaff.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm">CNIC: {selectedStaff.cnic}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Joined: {selectedStaff.joiningDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Linked Children</h4>
                    {selectedStaff.linkedChildrenIds && selectedStaff.linkedChildrenIds.length > 0 ? (
                      <div className="space-y-3">
                        {selectedStaff.linkedChildrenIds.map(childId => {
                          const child = STUDENTS.find(s => s.id === childId);
                          return (
                            <div key={childId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                  {child?.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{child?.name}</p>
                                  <p className="text-xs text-gray-500">Roll: {child?.rollNumber}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No linked children found.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payslip Preview Modal */}
      <AnimatePresence>
        {showPayslipModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl">E</div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">EduFlow Systems</h2>
                      <p className="text-xs text-gray-500">Official Salary Payslip</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">#PAY-2024-02-001</p>
                    <p className="text-xs text-gray-500">Date: Feb 28, 2024</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Employee Details</h4>
                    <p className="text-sm font-bold text-gray-900">Sarah Johnson</p>
                    <p className="text-xs text-gray-500">Senior Math Teacher</p>
                    <p className="text-xs text-gray-500">CNIC: 35201-1234567-3</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Info</h4>
                    <p className="text-sm font-bold text-gray-900">February 2024</p>
                    <p className="text-xs text-gray-500">Bank Transfer</p>
                    <p className="text-xs text-gray-500">Status: <span className="text-emerald-600 font-bold">PAID</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-8">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-4 pb-2 border-b">Earnings</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Basic Salary</span>
                        <span className="font-medium">Rs. 45,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">House Rent</span>
                        <span className="font-medium">Rs. 5,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Conveyance</span>
                        <span className="font-medium">Rs. 3,000</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-4 pb-2 border-b">Deductions</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Income Tax</span>
                        <span className="font-medium text-rose-600">-Rs. 1,200</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Insurance</span>
                        <span className="font-medium text-rose-600">-Rs. 800</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-indigo-600 rounded-2xl flex justify-between items-center text-white">
                  <div>
                    <p className="text-xs opacity-80 uppercase tracking-widest font-bold">Net Payable Salary</p>
                    <p className="text-3xl font-black">Rs. 51,000</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] opacity-80 italic">Fifty One Thousand Rupees Only</p>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <Button 
                    variant="ghost"
                    onClick={() => setShowPayslipModal(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    leftIcon={<Download size={18} />}
                    className="shadow-xl shadow-brand-200"
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Salary Structure Modal */}
      <AnimatePresence>
        {showSalaryModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Define Salary Structure</h3>
                <button onClick={() => setShowSalaryModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Plus className="w-5 h-5 rotate-45 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Basic Salary</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Rs.</span>
                    <input 
                      type="number" 
                      defaultValue={45000}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">Allowances</h4>
                    <button className="text-xs text-indigo-600 font-bold hover:underline">+ Add New</button>
                  </div>
                  <div className="space-y-2">
                    {['House Rent', 'Conveyance'].map(item => (
                      <div key={item} className="flex items-center gap-3">
                        <input type="text" defaultValue={item} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                        <input type="number" defaultValue={item === 'House Rent' ? 5000 : 3000} className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                        <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Plus className="w-4 h-4 rotate-45" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">Deductions</h4>
                    <button className="text-xs text-indigo-600 font-bold hover:underline">+ Add New</button>
                  </div>
                  <div className="space-y-2">
                    {['Income Tax', 'Insurance'].map(item => (
                      <div key={item} className="flex items-center gap-3">
                        <input type="text" defaultValue={item} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                        <input type="number" defaultValue={item === 'Income Tax' ? 1200 : 800} className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                        <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Plus className="w-4 h-4 rotate-45" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button 
                  variant="ghost"
                  onClick={() => setShowSalaryModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="shadow-xl shadow-brand-200"
                  onClick={() => {
                    setShowSalaryModal(false);
                  }}
                >
                  Save Structure
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Staff Form Modal */}
      <AnimatePresence>
        {showStaffForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Add New Staff Member</h3>
                <button onClick={() => setShowStaffForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 overflow-y-auto max-h-[60vh]">

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Full Name</label>
                  <input type="text" placeholder="e.g. John Doe" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Email Address</label>
                  <input type="email" placeholder="john@example.com" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">CNIC Number</label>
                  <input type="text" placeholder="00000-0000000-0" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Phone Number</label>
                  <input type="text" placeholder="0300-0000000" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Role</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none">
                    <option>TEACHER</option>
                    <option>ADMIN</option>
                    <option>SUPPORT</option>
                    <option>GATE_KEEPER</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Branch</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none">
                    {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button 
                  variant="ghost"
                  onClick={() => setShowStaffForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="shadow-xl shadow-brand-200"
                  onClick={() => {
                    setShowStaffForm(false);
                  }}
                >
                  Register Staff
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
