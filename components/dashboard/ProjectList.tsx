import React from 'react';
import { KaraokeProject } from '../../data/types';

interface ProjectListProps {
  projects: KaraokeProject[];
  onManage: (project: KaraokeProject) => void;
  onNewBuild: () => void;
  formatLongDate: (dateStr: string) => string;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onManage, onNewBuild, formatLongDate }) => (
  <section className="flex flex-col gap-4">
    {projects.length > 0 ? (
      projects.map((project) => {
        const isSwapped = (project.swapHistory?.length || 0) > 0;
        return (
          <div key={project.id} className="group flex flex-col xl:flex-row items-stretch xl:items-center justify-between p-5 md:p-6 rounded-3xl border border-white/[0.07] bg-[#0f1527]/80 hover:bg-[#151c35] hover:border-cyan-400/10 hover:-translate-y-0.5 transition-all relative overflow-hidden shadow-lg">
            <div className="flex items-start sm:items-center gap-4 md:gap-6 flex-1 min-w-0">
              <div className="size-16 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                {project.photos?.[0] ? <img src={project.photos[0]} className="size-full object-cover" /> : <span className="material-symbols-outlined text-slate-700 text-[32px]">photo_library</span>}
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Customer</span>
                  <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">#{project.invoiceNumber || 'NO-REF'}</span>
                  {isSwapped && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500 uppercase tracking-widest shadow-sm">
                      <span className="material-symbols-outlined text-[10px]">published_with_changes</span>
                      Swapped
                    </span>
                  )}
                </div>
                <h3 className="text-white text-lg md:text-xl font-black uppercase tracking-tight leading-tight break-words">{project.buyerName || project.name}</h3>

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
            <div className="grid grid-cols-2 sm:flex items-center gap-5 md:gap-10 xl:gap-12 mt-6 xl:mt-0 pt-5 xl:pt-0 border-t xl:border-t-0 border-white/5">
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
              <button onClick={() => onManage(project)} className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 hover:border-cyan-400/20 transition-all font-black uppercase text-[10px] tracking-widest">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                <span>Manage Record</span>
              </button>
            </div>
          </div>
        );
      })
    ) : (
      <div className="flex flex-col items-center justify-center py-16 md:py-24 px-6 rounded-[32px] border border-white/[0.07] bg-[#0f1527]/40 gap-6 animate-in text-center">
        <div className="size-20 rounded-3xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center border border-cyan-400/15 shadow-[0_14px_32px_rgba(79,70,229,0.10)]">
          <span className="material-symbols-outlined text-[42px] font-variation-FILL">receipt_long</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-white text-xl font-black tracking-tight">No sales records yet</h3>
          <p className="text-slate-400 text-sm font-medium max-w-sm">Create your first karaoke build to start tracking sales, warranties, and replacements.</p>
        </div>
        <button onClick={onNewBuild} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-400 text-slate-950 font-black uppercase tracking-widest text-[10px] hover:bg-cyan-300 transition-colors">
          <span className="material-symbols-outlined text-[17px]">add</span>
          Create first build
        </button>
      </div>
    )}
  </section>
);

export default ProjectList;
