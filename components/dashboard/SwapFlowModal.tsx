import React from 'react';
import { Category, ComponentItem } from '../../data/types';

export type SwapModalView = 'options' | 'select-unit' | 'select-alt' | 'register';

export interface NewComponentData {
  name: string;
  sku: string;
  brand: string;
  price: string;
}

interface SwapFlowModalProps {
  oldItem: ComponentItem;
  swapModalView: SwapModalView;
  sameModelInstances: ComponentItem[];
  alternativeInstances: ComponentItem[];
  availableAltFilters: string[];
  altFilter: string;
  newCompData: NewComponentData;
  playerOptions: string[];
  onAltFilterChange: (value: string) => void;
  onSwapViewChange: (view: SwapModalView) => void;
  onNewCompDataChange: React.Dispatch<React.SetStateAction<NewComponentData>>;
  onInitiateSwap: (item: ComponentItem) => void;
  onBackdropClose: () => void;
  onClose: () => void;
  onCreateAndSwap: (event: React.FormEvent) => void;
  isTemplateCategory: (category: Category) => boolean;
}

const SwapFlowModal: React.FC<SwapFlowModalProps> = ({
  oldItem,
  swapModalView,
  sameModelInstances,
  alternativeInstances,
  availableAltFilters,
  altFilter,
  newCompData,
  playerOptions,
  onAltFilterChange,
  onSwapViewChange,
  onNewCompDataChange,
  onInitiateSwap,
  onBackdropClose,
  onClose,
  onCreateAndSwap,
  isTemplateCategory
}) => (
  <div className="fixed inset-0 z-[800] flex justify-center items-start pt-20 p-6">
    <div className="absolute inset-0 bg-[#05070a]/98 backdrop-blur-xl" onClick={onBackdropClose}></div>
    <div className="relative bg-[#0d0e14] max-w-xl w-full rounded-[40px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] animate-in overflow-hidden transition-all duration-300 ease-out">
      <div className="p-10 border-b border-white/5 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Hardware Swap System</span>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mt-1 leading-none">Replacing Component</h2>
        </div>
        <button onClick={onClose} className="size-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="px-10 py-6 bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-5">
          <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 shadow-inner">
            <span className="material-symbols-outlined text-3xl font-variation-FILL">settings_backup_restore</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Originally Installed Hardware</span>
            <h3 className="text-white font-black text-lg uppercase tracking-tight leading-none">{oldItem.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-black text-cyan-400 uppercase tracking-widest">Serial: {oldItem.sku}</span>
            </div>
          </div>
        </div>
      </div>

      {swapModalView === 'options' && (
        <div className="p-10 flex flex-col gap-5">
          {oldItem.category === Category.PLAYER && (
            sameModelInstances.length > 0 ? (
              <button onClick={() => onSwapViewChange('select-unit')} className="flex items-center gap-6 p-6 rounded-3xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all text-left group">
                <div className="size-14 rounded-2xl bg-purple-400/20 flex items-center justify-center text-purple-400">
                  <span className="material-symbols-outlined text-3xl font-variation-FILL">content_copy</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-lg uppercase tracking-tight leading-none">REPLACE SAME MODEL</span>
                  <p className="text-slate-500 text-[11px] mt-1.5 font-bold uppercase tracking-wider">Found {sameModelInstances.length} available units</p>
                </div>
              </button>
            ) : (
              <div className="flex items-center justify-between p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 shadow-lg">
                <div className="flex flex-col">
                  <span className="text-amber-500 font-black text-[10px] uppercase tracking-widest">Out of Stock</span>
                  <p className="text-slate-500 text-[11px] font-bold">No {oldItem.name} units available.</p>
                </div>
                <button
                  onClick={() => {
                    onNewCompDataChange({ name: oldItem.name, sku: '', brand: 'PLATINUM', price: '' });
                    onSwapViewChange('register');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black text-[10px] uppercase tracking-widest"
                >
                  Register New
                </button>
              </div>
            )
          )}
          {isTemplateCategory(oldItem.category) && (
            <button
              onClick={() =>
                onInitiateSwap({
                  id: Math.random().toString(36).substr(2, 9),
                  name: oldItem.name,
                  sku: oldItem.sku,
                  category: oldItem.category,
                  brand: oldItem.brand,
                  price: oldItem.price
                })
              }
              className="flex items-center gap-6 p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left group"
            >
              <div className="size-14 rounded-2xl bg-emerald-400/20 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-3xl font-variation-FILL">autorenew</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-lg uppercase tracking-tight leading-none">SAME MODEL SWAP</span>
                <p className="text-slate-500 text-[11px] mt-1.5 font-bold uppercase tracking-wider">Substitution with same specs</p>
              </div>
            </button>
          )}
          <button onClick={() => onSwapViewChange('select-alt')} className="flex items-center gap-6 p-6 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all text-left group">
            <div className="size-14 rounded-2xl bg-cyan-400/20 flex items-center justify-center text-cyan-400">
              <span className="material-symbols-outlined text-3xl font-variation-FILL">sync_alt</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-lg uppercase tracking-tight leading-none">Select Alternative</span>
              <p className="text-slate-500 text-[11px] mt-1.5 font-bold uppercase tracking-wider">Browse compatible models</p>
            </div>
          </button>
        </div>
      )}

      {swapModalView === 'select-unit' && (
        <div className="p-10 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {sameModelInstances.map((unit) => (
              <button key={unit.id} onClick={() => onInitiateSwap(unit)} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-purple-500/10 transition-all text-left flex justify-between">
                <div><span className="text-white font-bold font-mono">{unit.sku}</span></div>
                <div><span className="text-white font-black text-sm">&#8369;{unit.price.toLocaleString()}</span></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {swapModalView === 'select-alt' && (
        <div className="p-10 flex flex-col gap-6 transition-all duration-300 overflow-hidden">
          <div className="flex flex-wrap gap-2 pb-2">
            {availableAltFilters.map((filterVal) => (
              <button
                key={filterVal}
                onClick={() => onAltFilterChange(filterVal)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${altFilter === filterVal ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-white/5 text-slate-500 border-white/10 hover:border-white/20 hover:text-slate-300'}`}
              >
                {filterVal}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
            {alternativeInstances.length > 0 ? (
              alternativeInstances.map((unit) => (
                <button key={unit.id} onClick={() => onInitiateSwap(unit)} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-cyan-500/10 transition-all text-left flex justify-between group/unit">
                  <div className="min-w-0 flex-1">
                    <span className="text-white font-black uppercase tracking-tight group-hover/unit:text-cyan-400 transition-colors">{unit.name}</span>
                    <div className="mt-1 flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{unit.brand}</span>
                      <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded border border-white/5 inline-block w-fit group-hover/unit:text-cyan-400/80">SN: {unit.sku}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1 shrink-0">
                    <span className="text-cyan-400 font-black font-mono">&#8369;{unit.price.toLocaleString()}</span>
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest group-hover/unit:text-cyan-500/50">AVAILABLE</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-12 text-center flex flex-col items-center gap-6">
                <div className="size-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5 opacity-40">
                  <span className="material-symbols-outlined text-3xl">inventory_2</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No matching alternatives found</p>
                  <button
                    onClick={() => {
                      onNewCompDataChange({ name: '', sku: '', brand: 'PLATINUM', price: '' });
                      onSwapViewChange('register');
                    }}
                    className="mt-2 text-cyan-400 font-black text-[10px] uppercase tracking-widest hover:text-cyan-300 transition-colors underline underline-offset-4"
                  >
                    Register New Hardware Model
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {swapModalView === 'register' && (
        <form onSubmit={onCreateAndSwap} className="p-10 flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hardware Model</label>
              {oldItem.category === Category.PLAYER ? (
                <div className="relative">
                  <select
                    required
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm text-white outline-none focus:border-cyan-400 appearance-none cursor-pointer transition-all pr-10 bg-none"
                    value={newCompData.name}
                    onChange={(event) => onNewCompDataChange({ ...newCompData, name: event.target.value })}
                  >
                    <option value="" disabled className="bg-[#0f121d]">Select Player Model</option>
                    {playerOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#0f121d]">{opt}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <span className="material-symbols-outlined text-lg">expand_more</span>
                  </div>
                </div>
              ) : (
                <input
                  required
                  className="bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-sm outline-none focus:border-cyan-400 uppercase font-black"
                  value={newCompData.name}
                  onChange={(event) => onNewCompDataChange({ ...newCompData, name: event.target.value })}
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Serial / SKU</label>
              <input
                required
                className="bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-sm outline-none font-mono uppercase"
                value={newCompData.sku}
                onChange={(event) => onNewCompDataChange({ ...newCompData, sku: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Price (&#8369;)</label>
              <input
                required
                type="number"
                className="bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-sm outline-none"
                value={newCompData.price}
                onChange={(event) => onNewCompDataChange({ ...newCompData, price: event.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="w-full py-6 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-black uppercase text-xs tracking-[0.3em] rounded-3xl">Finalize</button>
        </form>
      )}
    </div>
  </div>
);

export default SwapFlowModal;
