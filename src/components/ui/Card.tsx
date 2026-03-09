import React from 'react';
import { cn } from '../../types';
import { motion } from 'motion/react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  hover = false,
}) => {
  const variants = {
    default: 'bg-white border border-slate-100 shadow-sm',
    outline: 'bg-transparent border border-slate-200',
    ghost: 'bg-slate-50/50 border-transparent',
    glass: 'bg-white/70 backdrop-blur-md border border-white/20 shadow-xl shadow-slate-200/50',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4 rounded-2xl',
    md: 'p-8 rounded-3xl',
    lg: 'p-12 rounded-[2.5rem]',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' } : {}}
      className={cn(
        'transition-all duration-300',
        variants[variant],
        paddings[padding],
        className
      )}
    >
      {children}
    </motion.div>
  );
};
