import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../types';
import { Card } from './ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'indigo' | 'brand';
  delay?: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorMap = {
  blue: 'text-blue-600 bg-blue-50',
  emerald: 'text-emerald-600 bg-emerald-50',
  amber: 'text-amber-600 bg-amber-50',
  rose: 'text-rose-600 bg-rose-50',
  purple: 'text-purple-600 bg-purple-50',
  indigo: 'text-indigo-600 bg-indigo-50',
  brand: 'text-brand-600 bg-brand-50',
};

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  isPositive, 
  icon: Icon, 
  color, 
  delay = 0,
  trend 
}) => {
  const displayTrend = trend || (change ? { value: parseFloat(change), isPositive: !!isPositive } : null);

  return (
    <Card
      hover
      className="relative overflow-hidden group"
    >
      <div className="flex items-start justify-between mb-6">
        <div className={cn(
          "p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-sm", 
          colorMap[color] || colorMap.brand
        )}>
          <Icon size={24} />
        </div>
        {displayTrend && (
          <div className={cn(
            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm",
            displayTrend.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {displayTrend.isPositive ? '↑' : '↓'} {displayTrend.value}%
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1.5">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
      </div>
      
      {/* Decorative Background Element */}
      <div className={cn(
        "absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] transition-all duration-700 group-hover:scale-150",
        colorMap[color] || colorMap.brand
      )} />
    </Card>
  );
};
