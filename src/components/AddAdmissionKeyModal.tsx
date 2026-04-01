import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, Loader2, X, Phone } from 'lucide-react';
import { Button } from './ui/Button';

interface AddAdmissionKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phoneNumber: string) => void;
  isLoading?: boolean;
  initialValue?: string;
  mode?: 'create' | 'edit';
}

export const AddAdmissionKeyModal: React.FC<AddAdmissionKeyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  initialValue = '',
  mode = 'create'
}) => {
  const [phoneNumber, setPhoneNumber] = useState(initialValue);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }
    // Basic phone number validation (adjust as needed for specific formats)
    if (phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    onConfirm(phoneNumber);
  };

  // Reset state when modal state changes
  React.useEffect(() => {
    if (isOpen) {
      setPhoneNumber(initialValue);
      setError('');
    } else {
      setPhoneNumber('');
      setError('');
    }
  }, [isOpen, initialValue]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-100 p-8 relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Key size={32} />
            </div>
            
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
              {mode === 'edit' ? 'Edit Admission Key' : 'Generate New Key'}
            </h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              {mode === 'edit' 
                ? 'Update the phone number for this admission key.' 
                : 'Enter the phone number to generate a unique admission key.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="e.g. 03403877126"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (error) setError('');
                    }}
                    className={`w-full bg-slate-50 border-2 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all ${
                      error ? 'border-rose-100 focus:border-rose-500 bg-rose-50/30' : 'border-transparent focus:border-brand-500 focus:bg-white'
                    }`}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-bold text-rose-500 ml-1"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
              
              <div className="flex gap-4 pt-2">
                <Button 
                  type="button"
                  variant="outline" 
                  className="flex-1 py-4 rounded-2xl font-bold"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <button 
                  type="submit"
                  disabled={isLoading || !phoneNumber}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-brand-100 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Key size={18} />
                      {mode === 'edit' ? 'Save Changes' : 'Generate Key'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
