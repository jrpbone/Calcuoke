import React, { useState, useMemo } from 'react';
import { KaraokeProject, SwapRecord, Category } from '../data/types';

interface ReplacementsProps {
  projects: KaraokeProject[];
}

type SortKey = 'customerName' | 'replacedItemName' | 'newItemName' | 'date';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const Replacements: React.FC<ReplacementsProps> = ({ projects }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });

  const filterButtons = ['All', 'Mic', 'Player', 'Amplifier', 'TV'];

  // Aggregate all swap records from all projects
  const allReplacementsRaw: (SwapRecord & { customerName: string })[] = useMemo(() => {
    return projects.reduce((acc: (SwapRecord & { customerName: string })[], project) => {
      if (project.swapHistory && project.swapHistory.length > 0) {
        const historyWithCustomer = project.swapHistory.map(swap => ({
          ...swap,
          customerName: project.buyerName || project.name
        }));
        return [...acc, ...historyWithCustomer];
      }
      return acc;
    }, []);
  }, [projects]);

  const processedReplacements = useMemo(() => {
    // 1. Filtering
    let result = allReplacementsRaw.filter(swap => {
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = (
        swap.customerName.toLowerCase().includes(search) ||
        swap.replacedItemName.toLowerCase().includes(search) ||
        swap.replacedItemSku.toLowerCase().includes(search) ||
        swap.newItemName.toLowerCase().includes(search) ||
        swap.newItemSku.toLowerCase().includes(search) ||
        swap.category.toLowerCase().includes(search)
      );

      const matchesCategory = activeCategory === 'All' || 
        swap.category.toLowerCase() === activeCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });

    // 2. Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA: string = a[sortConfig.key] || '';
        let valB: string = b[sortConfig.key] || '';

        if (sortConfig.key === 'date') {
          const dateA = new Date(valA).getTime();
          const dateB = new Date(valB).getTime();
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        const comparison = valA.localeCompare(valB);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [allReplacementsRaw, searchTerm, activeCategory, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig.key !== columnKey) return <span className="material-symbols-outlined text-[14px] opacity-20 ml-1">unfold_more</span>;
    return (
      <span className="material-symbols-outlined text-[14px] text-amber-500 ml-1">
        {sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-8 animate-in pb-20">
      <header className="flex flex-col gap-1 pb-6 border-b border-white/5">
        <h1 className="heading-gradient text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00f3ff] to-[#bc13fe] text-3xl md:text-4xl font-black leading-tight tracking-tight drop-shadow-sm uppercase">REPLACEMENTS</h1>
        <p className="text-slate-400 text-sm font-medium">Registry of defective and swapped hardware assets.</p>
      </header>

      {/* Filters and Search Bar Section */}
      <section className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="flex gap-1.5 bg-[#0a0e17] p-2 rounded-[24px] border border-white/5 overflow-x-auto custom-scrollbar no-scrollbar w-full lg:w-auto">
          {filterButtons.map(btn => (
            <button
              key={btn}
              onClick={() => setActiveCategory(btn)}
              className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === btn ? 'filter-active shadow-xl' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              {btn}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-80">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-xl">search</span>
          <input 
            className="w-full pl-14 pr-6 py-4 bg-[#0a0e17] border border-white/5 rounded-[24px] text-sm text-white focus:border-amber-500/50 focus:ring-0 outline-none transition-all font-mono"
            placeholder="Search records..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <div className="bg-[#0f121d] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th 
                  className="w-[20%] p-6 text-[11px] uppercase font-black text-slate-500 tracking-[0.2em] cursor-pointer hover:text-slate-300 transition-colors"
                  onClick={() => requestSort('customerName')}
                >
                  <div className="flex items-center">
                    Customer Name
                    <SortIndicator columnKey="customerName" />
                  </div>
                </th>
                <th 
                  className="w-[25%] p-6 text-[11px] uppercase font-black text-slate-500 tracking-[0.2em] cursor-pointer hover:text-slate-300 transition-colors"
                  onClick={() => requestSort('replacedItemName')}
                >
                  <div className="flex items-center">
                    Original Item
                    <SortIndicator columnKey="replacedItemName" />
                  </div>
                </th>
                <th 
                  className="w-[25%] p-6 text-[11px] uppercase font-black text-slate-500 tracking-[0.2em] cursor-pointer hover:text-slate-300 transition-colors"
                  onClick={() => requestSort('newItemName')}
                >
                  <div className="flex items-center">
                    Replacement Item
                    <SortIndicator columnKey="newItemName" />
                  </div>
                </th>
                <th 
                  className="w-[15%] p-6 text-[11px] uppercase font-black text-slate-500 tracking-[0.2em] cursor-pointer hover:text-slate-300 transition-colors"
                  onClick={() => requestSort('date')}
                >
                  <div className="flex items-center">
                    Swap Date
                    <SortIndicator columnKey="date" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {processedReplacements.map((swap, index) => (
                <tr key={index} className="hover:bg-white/[0.01] group transition-all">
                  <td className="p-6">
                    <span className="text-sm font-black text-white uppercase tracking-tight">{swap.customerName}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-300">{swap.replacedItemName}</span>
                        <span className="text-[8px] font-black text-rose-500/50 uppercase tracking-widest border border-rose-500/20 px-1.5 py-0.5 rounded">DEFECTIVE</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase mt-1">SN: {swap.replacedItemSku}</span>
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-0.5">{swap.category}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-cyan-400">{swap.newItemName}</span>
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20 px-1.5 py-0.5 rounded">NEW</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-cyan-500/50 uppercase mt-1">SN: {swap.newItemSku}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-medium text-slate-500">{swap.date}</span>
                  </td>
                </tr>
              ))}
              {processedReplacements.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <span className="material-symbols-outlined text-7xl">history_edu</span>
                      <p className="text-white font-black uppercase tracking-[0.3em]">No Swaps Recorded</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Replacements;
