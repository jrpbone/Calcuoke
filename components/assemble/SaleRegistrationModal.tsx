import React, { useRef } from 'react';
import { Category, ComponentItem } from '../../data/types';

interface SaleRegistrationModalProps {
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  buyerName: string;
  onBuyerNameChange: (value: string) => void;
  dateSold: string;
  longDateLabel: string;
  onDateSoldChange: (value: string) => void;
  invoiceType: string;
  onInvoiceTypeChange: (value: string) => void;
  invoiceNum: string;
  onInvoiceNumChange: (value: string) => void;
  buyerAddress: string;
  onBuyerAddressChange: (value: string) => void;
  photos: string[];
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoRemove: (index: number) => void;
  onSelectPhoto: (photo: string) => void;
  sortedSummaryItems: ComponentItem[];
  totalCost: number;
}

const SaleRegistrationModal: React.FC<SaleRegistrationModalProps> = ({
  onClose,
  onSubmit,
  buyerName,
  onBuyerNameChange,
  dateSold,
  longDateLabel,
  onDateSoldChange,
  invoiceType,
  onInvoiceTypeChange,
  invoiceNum,
  onInvoiceNumChange,
  buyerAddress,
  onBuyerAddressChange,
  photos,
  onPhotoUpload,
  onPhotoRemove,
  onSelectPhoto,
  sortedSummaryItems,
  totalCost
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      <form onSubmit={onSubmit} className="relative bg-[#0f121d] max-w-4xl w-full max-h-[94vh] p-0 rounded-3xl sm:rounded-[40px] border border-white/10 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.7)] animate-in overflow-hidden">
        
        <div className="p-5 sm:p-8 md:p-10 flex flex-col gap-6 sm:gap-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="size-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="material-symbols-outlined text-white text-3xl">receipt_long</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Sales Details</h2>
              <p className="text-slate-500 text-sm font-medium mt-1">Complete the following fields to record the transaction.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1">Buyer Name</label>
              <input 
                required 
                placeholder="Full Customer Name" 
                className="bg-[#1a1b2e]/40 border border-cyan-500/30 p-5 rounded-2xl text-white focus:border-cyan-500 outline-none transition-all text-sm placeholder:text-slate-600 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]" 
                value={buyerName} 
                onChange={e => onBuyerNameChange(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Date Sold</label>
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest opacity-80">
                  {longDateLabel}
                </p>
              </div>
              <div className="relative">
                <input 
                  type="date" 
                  className="w-full bg-[#1a1b2e]/40 border border-white/5 p-5 rounded-2xl text-white [color-scheme:dark] focus:border-cyan-500/50 outline-none transition-all text-sm font-medium" 
                  value={dateSold} 
                  onChange={e => onDateSoldChange(e.target.value)} 
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1">Receipt Details</label>
              <div className="flex gap-2">
                <div className="relative w-28 sm:w-32 shrink-0">
                  <select 
                    className="w-full bg-[#1a1b2e]/40 border border-white/5 p-5 rounded-2xl text-white text-xs font-bold outline-none appearance-none cursor-pointer pr-10 bg-none" 
                    value={invoiceType} 
                    onChange={e => {
                      const nextType = e.target.value;
                      onInvoiceTypeChange(nextType);
                      if (nextType === 'PAPER') onInvoiceNumChange('');
                    }}
                  >
                    <option value="ORD">ORD</option>
                    <option value="DLV">DLV</option>
                    <option value="SALES">SALES</option>
                    <option value="PAPER">PAPER</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg pointer-events-none">expand_more</span>
                </div>
                <input 
                  required={invoiceType !== 'PAPER'} 
                  disabled={invoiceType === 'PAPER'}
                  placeholder={invoiceType === 'PAPER' ? 'N/A' : 'Receipt #'} 
                  className={`flex-1 bg-[#1a1b2e]/40 border border-white/5 p-5 rounded-2xl text-white focus:border-cyan-500 outline-none font-mono text-sm placeholder:text-slate-600 ${invoiceType === 'PAPER' ? 'opacity-30 cursor-not-allowed' : ''}`} 
                  value={invoiceNum} 
                  onChange={e => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      onInvoiceNumChange(val);
                    }
                  }} 
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1">Address</label>
              <input 
                required 
                placeholder="Complete Customer Address" 
                className="bg-[#1a1b2e]/40 border border-white/5 p-5 rounded-2xl text-white focus:border-cyan-500 outline-none transition-all text-sm placeholder:text-slate-600" 
                value={buyerAddress} 
                onChange={e => onBuyerAddressChange(e.target.value)} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1">Transaction Photos (Optional)</label>
            <div className="flex gap-4 flex-wrap">
              {photos.map((p, i) => (
                <div key={i} className="group relative size-24 rounded-2xl border border-white/10 overflow-hidden bg-black/40 cursor-pointer">
                  <img src={p} className="size-full object-cover" onClick={() => onSelectPhoto(p)} />
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPhotoRemove(i);
                    }}
                    className="absolute top-1 right-1 size-6 bg-rose-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="size-24 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-all bg-black/20"
              >
                <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                <span className="text-[9px] font-black uppercase">Add</span>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onPhotoUpload} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1">Component Summary & Warranty</label>
            <div className="bg-black/30 border border-white/5 rounded-[24px] overflow-hidden">
              <div className="max-h-56 overflow-y-auto custom-scrollbar flex flex-col divide-y divide-white/5">
                {sortedSummaryItems.map((item, idx) => {
                  const isNoWarranty = item.category === Category.CHASSIS || item.category === Category.MIC;
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 hover:bg-white/[0.02] transition-colors group/row">
                      <div className="flex flex-col min-w-0 pr-4">
                        <span className="text-white text-[15px] font-black leading-tight uppercase tracking-tight">{item.name}</span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                           <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{item.category} / {item.brand}</span>
                           <span className="text-[9px] text-cyan-400 font-black uppercase tracking-widest bg-cyan-400/5 px-2 py-0.5 rounded border border-cyan-400/10">SN: {item.sku}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all shrink-0 ${isNoWarranty ? 'bg-slate-500/10 border-slate-500/20 text-slate-500' : 'bg-cyan-400/10 border-cyan-400/20 text-cyan-400 shadow-[0_8px_20px_rgba(79,70,229,0.08)]'}`}>
                        <span className="material-symbols-outlined text-[16px] font-variation-FILL">{isNoWarranty ? 'block' : 'verified'}</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.1em]">{isNoWarranty ? 'No Warranty' : '3 Months Warranty'}</span>
                      </div>
                    </div>
                  );
                })}
                {sortedSummaryItems.length === 0 && (
                  <div className="p-10 text-center text-slate-600 text-xs font-bold uppercase tracking-widest italic">No components configured</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:px-10 sm:py-6 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Transaction</p>
            <p className="text-cyan-400 text-3xl font-black font-mono mt-0.5">{'\u20B1'}{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full sm:w-auto">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 sm:px-8 py-4 rounded-2xl bg-white/5 text-slate-300 font-black uppercase text-[10px] sm:text-[11px] tracking-widest hover:text-white hover:bg-white/10 transition-all border border-white/5"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 sm:px-12 py-4 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-black uppercase rounded-2xl tracking-[0.18em] sm:tracking-[0.25em] text-[10px] sm:text-[11px] shadow-[0_10px_26px_rgba(79,70,229,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Confirm
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SaleRegistrationModal;
