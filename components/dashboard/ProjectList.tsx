import React from 'react';
import { KaraokeProject } from '../../data/types';

interface ProjectListProps {
  projects: KaraokeProject[];
  onManage: (project: KaraokeProject) => void;
  formatLongDate: (dateStr: string) => string;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onManage, formatLongDate }) => (
  <section className="flex flex-col gap-4">
    {projects.length > 0 ? (
      projects.map((project) => {
        const isSwapped = (project.swapHistory?.length || 0) > 0;
        return (
          <div key={project.id} className="group flex flex-col md:flex-row items-center justify-between p-6 rounded-[20px] border border-white/5 bg-[#0f1527] hover:bg-[#151c35] transition-all relative overflow-hidden">
            <div className="flex items-center gap-6 flex-1">
              <div className="size-16 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                {project.photos?.[0] ? <img src={project.photos[0]} className="size-full object-cover" /> : <span className="material-symbols-outlined text-slate-700 text-[32px]">photo_library</span>}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Customer</span>
                  <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">#{project.invoiceNumber || 'NO-REF'}</span>
                  {isSwapped && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500 uppercase tracking-widest shadow-sm">
                      <span className="material-symbols-outlined text-[10px]">published_with_changes</span>
                      Swapped
                    </span>
                  )}
                </div>
                <h3 className="text-white text-xl font-black uppercase tracking-tight leading-none">{project.buyerName || project.name}</h3>

                {isSwapped && (
                  <div className="flex flex-col gap-0.5 mt-2 bg-black/20 p-2 rounded-lg border border-white/5">
                    <span className="text-[8px] font-black text-amber-500/70 uppercase tracking-widest">Traceability Log</span>
                    {project.swapHistory?.map((swap, swapIndex) => (
                      <div key={swapIndex} className="text-[9px] text-slate-400 font-bold italic truncate max-w-xl">
                        &bull; Swap: {swap.replacedItemName} (<span className="text-rose-400/70">{swap.replacedItemSku}</span>) &rarr; {swap.newItemName} (<span className="text-cyan-400/70">{swap.newItemSku}</span>)
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-1">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-wider">{project.grade}</span>
                  <span className="text-[11px] font-medium text-slate-500">{formatLongDate(project.createdDate)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-16 mt-6 md:mt-0">
              <div className="flex flex-col gap-0.5 min-w-[100px]">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Components</span>
                <span className="text-white text-sm font-black uppercase tracking-tight">{project.components.length} Items</span>
              </div>
              <div className="flex flex-col gap-0.5 min-w-[150px]">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Sale Amount
                </span>
                <span className="text-2xl font-black font-mono text-cyan-400">&#8369;{project.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <button onClick={() => onManage(project)} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all font-black uppercase text-[10px] tracking-widest">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                <span>Manage Record</span>
              </button>
            </div>
          </div>
        );
      })
    ) : (
      <div className="flex flex-col items-center justify-center py-32 rounded-[32px] border border-white/5 bg-[#0f1527]/30 gap-6 animate-in">
        <div className="size-24 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
          <span className="material-symbols-outlined text-slate-700 text-[56px] opacity-40 font-variation-FILL">receipt_long</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-white text-xl font-black uppercase tracking-[0.2em] opacity-40">No Records Found</h3>
          <p className="text-slate-500 text-sm font-medium max-w-xs">No active sale records in database.</p>
        </div>
      </div>
    )}
  </section>
);

export default ProjectList;
