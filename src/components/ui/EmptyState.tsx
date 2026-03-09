import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200"
    >
      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-6 shadow-sm">
        <Icon size={40} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};
