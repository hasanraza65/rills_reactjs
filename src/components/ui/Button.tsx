import React from 'react';
import { cn } from '../../types';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-100',
    secondary: 'bg-slate-800 text-white hover:bg-slate-900 shadow-lg shadow-slate-100',
    outline: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-100',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs rounded-xl',
    md: 'px-6 py-3 text-sm rounded-2xl',
    lg: 'px-8 py-4 text-base rounded-[1.25rem]',
    icon: 'p-3 rounded-xl',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};
