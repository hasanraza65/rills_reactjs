import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Shield, 
  ArrowRight, 
  Smartphone, 
  CheckCircle2, 
  Timer,
  RefreshCw,
  ChevronLeft,
  School,
  Loader2
} from 'lucide-react';
import { cn } from '../../types';
import { loginSchema, LoginFormData } from '../../lib/validations/auth';
import { useLogin } from '../../hooks/use-auth';
import { User } from '../../types/models/user';

interface LoginProps {
  onLogin: (user: any) => void;
}

type LoginMode = 'ADMIN' | 'CNIC';
type LoginStep = 'INPUT' | 'OTP' | 'ROLE_SELECTION';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<LoginMode>('ADMIN');
  const [step, setStep] = useState<LoginStep>('INPUT');
  const [cnic, setCnic] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Mock multi-role user for demonstration if needed
  const multiRoleUser: any = {
    id: 'u2',
    name: 'Sarah Khan',
    cnic: '42101-1234567-1',
    role: 'TEACHER',
    roles: ['TEACHER', 'PARENT'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const onAdminSubmit = (data: LoginFormData) => {
    setApiError(null);
    loginMutation.mutate(data, {
      onSuccess: (user: User) => {
        // Map back to the expected type in App.tsx if necessary
        onLogin(user);
      },
      onError: (error: any) => {
        setApiError(error.response?.data?.message || 'Invalid email or password');
      },
    });
  };

  const handleCnicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cnic.length >= 13) {
      setStep('OTP');
      setTimer(60);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.every(v => v !== '')) {
      // Check if user has multiple roles
      if (multiRoleUser.roles && multiRoleUser.roles.length > 1) {
        setStep('ROLE_SELECTION');
      } else {
        onLogin(multiRoleUser);
      }
    }
  };

  const handleResendOtp = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setTimer(60);
    }, 1500);
  };

  const renderAdminForm = () => (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onAdminSubmit)} 
      className="space-y-6"
    >
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="email"
            {...register('email')}
            placeholder="superadmin@mail.com"
            className={cn(
              "w-full bg-slate-50 border rounded-2xl py-4 pl-12 pr-4 text-slate-700 outline-none transition-all text-lg",
              errors.email ? "border-rose-300 focus:ring-rose-500/5" : "border-slate-100 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5"
            )}
          />
        </div>
        {errors.email && <p className="text-rose-500 text-xs font-bold ml-1">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="password"
            {...register('password')}
            placeholder="••••••••"
            className={cn(
              "w-full bg-slate-50 border rounded-2xl py-4 pl-12 pr-4 text-slate-700 outline-none transition-all text-lg",
              errors.password ? "border-rose-300 focus:ring-rose-500/5" : "border-slate-100 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5"
            )}
          />
        </div>
        {errors.password && <p className="text-rose-500 text-xs font-bold ml-1">{errors.password.message}</p>}
      </div>
      
      {(apiError) && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold text-center"
        >
          {apiError}
        </motion.div>
      )}

      <button 
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full bg-brand-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-600 transition-all shadow-xl shadow-brand-100 flex items-center justify-center gap-2 group disabled:opacity-70"
      >
        {loginMutation.isPending ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            Sign In
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </>
        )}
      </button>
    </motion.form>
  );

  const renderCnicForm = () => (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleCnicSubmit} 
      className="space-y-6"
    >
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">CNIC Number</label>
        <div className="relative">
          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text"
            required
            value={cnic}
            onChange={(e) => setCnic(e.target.value)}
            placeholder="42101-XXXXXXX-X"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-700 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 transition-all text-lg"
          />
        </div>
        <p className="text-[10px] text-slate-400 font-medium px-1">We'll send a 6-digit OTP to your registered mobile and email.</p>
      </div>
      <button 
        type="submit"
        className="w-full bg-brand-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-600 transition-all shadow-xl shadow-brand-100 flex items-center justify-center gap-2 group"
      >
        Send OTP
        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
      </button>
    </motion.form>
  );

  const renderOtpForm = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Verify Identity</h3>
        <p className="text-slate-500 text-sm">Enter the 6-digit code sent to your phone</p>
      </div>

      <form onSubmit={handleOtpSubmit} className="space-y-8">
        <div className="flex justify-between gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              className="w-12 h-16 bg-slate-50 border border-slate-100 rounded-xl text-center text-2xl font-extrabold text-slate-800 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 transition-all"
            />
          ))}
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Timer size={16} />
            <span className="text-sm font-bold">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>
          </div>
          <button 
            type="button"
            disabled={timer > 0 || isResending}
            onClick={handleResendOtp}
            className={cn(
              "text-sm font-bold flex items-center gap-2 transition-all",
              timer > 0 ? "text-slate-300 cursor-not-allowed" : "text-brand-600 hover:text-brand-700"
            )}
          >
            <RefreshCw size={16} className={isResending ? "animate-spin" : ""} />
            Resend OTP
          </button>
        </div>

        <button 
          type="submit"
          disabled={otp.some(v => v === '')}
          className="w-full bg-brand-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-600 transition-all shadow-xl shadow-brand-100 disabled:opacity-50"
        >
          Verify & Login
        </button>

        <button 
          type="button"
          onClick={() => setStep('INPUT')}
          className="w-full text-slate-400 text-sm font-bold flex items-center justify-center gap-2 hover:text-slate-600 transition-all"
        >
          <ChevronLeft size={16} />
          Change CNIC
        </button>
      </form>
    </motion.div>
  );

  const renderRoleSelection = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield size={32} />
        </div>
        <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Select Your Role</h3>
        <p className="text-slate-500 text-sm">You have multiple roles associated with this account</p>
      </div>

      <div className="space-y-4">
        {multiRoleUser.roles?.map((role: any) => (
          <button
            key={role}
            onClick={() => onLogin({ ...multiRoleUser, role })}
            className="w-full p-6 rounded-3xl border border-slate-100 bg-white hover:border-brand-200 hover:bg-brand-50/30 transition-all text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                role === 'TEACHER' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              )}>
                {role === 'TEACHER' ? <School size={24} /> : <UserIcon size={24} />}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{role === 'TEACHER' ? 'Teacher' : 'Parent'}</p>
                <p className="text-xs text-slate-500">Access your {role.toLowerCase()} dashboard</p>
              </div>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" size={24} />
          </button>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-50 via-slate-50 to-white">
      <div className="w-full max-w-lg">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-brand-500 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-brand-200 rotate-3">
            <School size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">EduFlow</h1>
          <p className="text-slate-500 font-medium">Smart School Management System</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 'INPUT' && (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-10">
                  <button 
                    onClick={() => setMode('ADMIN')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                      mode === 'ADMIN' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Admin Login
                  </button>
                  <button 
                    onClick={() => setMode('CNIC')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                      mode === 'CNIC' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Teacher / Parent
                  </button>
                </div>

                {mode === 'ADMIN' ? renderAdminForm() : renderCnicForm()}
              </motion.div>
            )}

            {step === 'OTP' && (
              <div key="otp">
                {renderOtpForm()}
              </div>
            )}

            {step === 'ROLE_SELECTION' && (
              <div key="role">
                {renderRoleSelection()}
              </div>
            )}
          </AnimatePresence>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50 rounded-full -ml-16 -mb-16 blur-3xl opacity-50" />
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm font-medium">
            Don't have an account? <button className="text-brand-600 font-bold hover:underline">Contact School Admin</button>
          </p>
        </div>
      </div>
    </div>
  );
};
