import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Shield, Globe, Save, Info } from 'lucide-react';
import { PricingConfig as PricingType } from '../../types';

export const PricingConfig: React.FC = () => {
  const [config, setConfig] = useState<PricingType>({
    freeBranchLimit: 1,
    paidBranchMonthlyCost: 5000,
    currency: 'PKR'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <CreditCard size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Pricing Configuration</h3>
            <p className="text-slate-500 font-medium">Set global limits and costs for school branches</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Free Branch Limit</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="number"
                  value={config.freeBranchLimit}
                  onChange={(e) => setConfig({ ...config, freeBranchLimit: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
              </div>
              <p className="mt-2 text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Info size={12} />
                Maximum number of branches a school can have on the Free plan.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Monthly Cost per Paid Branch</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{config.currency}</span>
                <input
                  type="number"
                  value={config.paidBranchMonthlyCost}
                  onChange={(e) => setConfig({ ...config, paidBranchMonthlyCost: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-16 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
              </div>
              <p className="mt-2 text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Info size={12} />
                Amount charged per branch per month for the Paid plan.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-4">Summary Preview</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">Free Branches</span>
                  <span className="text-xs font-bold text-slate-800">Up to {config.freeBranchLimit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">Paid Branch Cost</span>
                  <span className="text-xs font-bold text-slate-800">{config.currency} {config.paidBranchMonthlyCost.toLocaleString()}/mo</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">Currency</span>
                  <span className="text-xs font-bold text-slate-800">{config.currency}</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-8 py-4 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
              <Save size={18} />
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
