import React from 'react';

interface TotalCostCardProps {
  totalCost: number;
}

const TotalCostCard: React.FC<TotalCostCardProps> = ({ totalCost }) => (
  <section className="dashboard-card relative p-10 rounded-3xl bg-gradient-to-br from-[#101424] to-[#070912] border border-white/5 shadow-2xl overflow-hidden group">
    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
    <div className="relative flex items-center gap-8">
      <div className="size-20 rounded-full bg-[#05070a] border border-white/10 flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
        <div className="size-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <span className="material-symbols-outlined text-3xl">payments</span>
        </div>
      </div>
      <div className="flex flex-col">
        <p className="text-cyan-400 text-xs font-black uppercase tracking-[0.2em]">Total Machine Cost</p>
        <p className="text-white text-6xl font-black font-mono mt-1">
          {'\u20B1'}{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  </section>
);

export default TotalCostCard;
