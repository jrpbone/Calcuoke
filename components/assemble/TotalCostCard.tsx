import React from 'react';

interface TotalCostCardProps {
  totalCost: number;
}

const TotalCostCard: React.FC<TotalCostCardProps> = ({ totalCost }) => (
  <section className="dashboard-card relative p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#101424] to-[#070912] border border-white/[0.07] shadow-2xl overflow-hidden group">
    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_12px_rgba(129,140,248,0.4)]"></div>
    <div className="relative flex items-center gap-4 sm:gap-8 min-w-0">
      <div className="size-14 sm:size-20 rounded-2xl sm:rounded-full bg-[#05070a] border border-white/10 flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] flex-shrink-0">
        <div className="size-9 sm:size-12 rounded-xl sm:rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <span className="material-symbols-outlined text-2xl sm:text-3xl">payments</span>
        </div>
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-cyan-400 text-[9px] sm:text-xs font-black uppercase tracking-[0.16em] sm:tracking-[0.2em]">Current build total</p>
        <p className="text-white text-3xl sm:text-5xl md:text-6xl font-black font-mono mt-1 truncate">
          {'\u20B1'}{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  </section>
);

export default TotalCostCard;
