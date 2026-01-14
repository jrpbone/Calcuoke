
import React, { useState, useMemo, useRef } from 'react';
import { Category, ComponentItem, KaraokeProject } from '../data/types';

interface AssembleProps {
  components: ComponentItem[];
  onProjectCreated: (project: KaraokeProject) => void;
  onNavigateToComponents: (category?: Category) => void;
  onDeleteComponent: (id: string, silent?: boolean) => void;
}

// Format YYYY-MM-DD to MM/DD/YYYY (e.g., 2026-01-04 -> 01/04/2026)
const formatToMMDDYYYY = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  // Strictly Month/Day/Year as requested (01/04/2026 for Jan 4th)
  return `${month}/${day}/${year}`;
};

// Format YYYY-MM-DD to Short Month Day, Year (e.g., Jan 4, 2026)
const formatToLongDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = months[parseInt(month, 10) - 1];
  return `${monthName} ${parseInt(day, 10)}, ${year}`;
};

const getTodayString = () => {
  const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Singapore"}));
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Helper to compress image to prevent LocalStorage quota issues
const compressImage = (base64Str: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      // Quality reduced to 0.6 for higher capacity
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
  });
};

const Assemble: React.FC<AssembleProps> = ({ components, onProjectCreated, onNavigateToComponents, onDeleteComponent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceType, setInvoiceType] = useState('ORD');
  const [invoiceNum, setInvoiceNum] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [dateSold, setDateSold] = useState(getTodayString());
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({
    [Category.MIC]: '1',
    [Category.AMPLIFIER]: '3',
    [Category.PLAYER]: '2',
    [Category.CHASSIS]: '4',
    [Category.TV]: 'none', // Fixed: Default to 'none' instead of incorrect id '5'
  });

  const categories = [
    { title: 'Microphone', subtitle: 'Input Source', cat: Category.MIC, icon: 'mic', allowNone: true },
    { title: 'Amplifier', subtitle: 'Sound Processing', cat: Category.AMPLIFIER, icon: 'tune', allowNone: true },
    { title: 'Player', subtitle: 'Media Source', cat: Category.PLAYER, icon: 'album', allowNone: true },
    { title: 'Karaoke Chassis', subtitle: 'Control Unit & Housing', cat: Category.CHASSIS, icon: 'dns', allowNone: false },
    { title: 'TV Size & Brand', subtitle: 'Visual Output', cat: Category.TV, icon: 'tv', allowNone: true },
  ];

  const selectedItems = useMemo(() => {
    // Corrected derivation: Ensure selected item matches the required category for the slot
    return categories.map(catDef => {
      const id = selectedOptions[catDef.cat];
      if (id === 'none') return null;
      const item = components.find(c => c.id === id);
      // Safety check: ensure item category matches the slot category to prevent UI bugs
      return (item && item.category === catDef.cat) ? item : null;
    }).filter((c): c is ComponentItem => Boolean(c));
  }, [selectedOptions, components, categories]);

  // Sort summary: Items with no warranty (Mic, Chassis) go to the bottom
  const sortedSummaryItems = useMemo(() => {
    return [...selectedItems].sort((a, b) => {
      const aNoWarranty = a.category === Category.CHASSIS || a.category === Category.MIC;
      const bNoWarranty = b.category === Category.CHASSIS || b.category === Category.MIC;
      if (aNoWarranty && !bNoWarranty) return 1;
      if (!aNoWarranty && bNoWarranty) return -1;
      return 0;
    });
  }, [selectedItems]);

  const totalCost = useMemo(() => selectedItems.reduce((acc, curr) => acc + curr.price, 0), [selectedItems]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setPhotos(prev => [...prev, compressed]);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalizeBuild = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = formatToMMDDYYYY(dateSold);
    const newProject: KaraokeProject = {
      id: Math.random().toString(36).substr(2, 9),
      name: buyerName || `Build ${formattedDate}`,
      grade: totalCost > 75000 ? 'Premium Setup' : 'Standard Commercial',
      createdDate: formattedDate,
      components: selectedItems,
      originalComponents: [...selectedItems],
      totalCost: totalCost,
      invoiceNumber: invoiceType === 'PAPER' ? 'PAPER-VOID' : `${invoiceType}-${invoiceNum}`,
      buyerName,
      buyerAddress,
      dateSold: formattedDate,
      photos: photos
    };

    // Deduct inventory: Remove the selected Player from the master list
    selectedItems.forEach(item => {
      if (item.category === Category.PLAYER) {
        // Pass 'true' to silence the individual component removal notification
        onDeleteComponent(item.id, true);
      }
    });

    onProjectCreated(newProject);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8 animate-in max-w-6xl mx-auto pb-20">
      <header className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00f3ff] to-[#bc13fe] text-3xl md:text-4xl font-black leading-tight tracking-tight drop-shadow-sm uppercase">ASSEMBLE</h1>
          <p className="text-slate-400 text-sm font-medium">Kareoke set assembly.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl text-white font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:scale-105 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">build</span>
          ASSEMBLE
        </button>
      </header>

      {/* Main Dashboard Card */}
      <section className="relative p-10 rounded-3xl bg-gradient-to-br from-[#101424] to-[#070912] border border-white/5 shadow-2xl overflow-hidden group">
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
              ₱{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3 mt-4">
        <div className="size-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
          <span className="material-symbols-outlined text-xl">grid_view</span>
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">Component Categories</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const selectedId = selectedOptions[category.cat];
          const filteredOptions = components.filter(c => c.category === category.cat);
          // Fixed: Verify the item's category matches the current slot's category
          const selectedItem = selectedId === 'none' ? null : components.find(c => c.id === selectedId && c.category === category.cat);
          const hasComponents = filteredOptions.length > 0;
          
          return (
            <div key={category.cat} className="flex flex-col gap-4 bg-[#0d101d] border border-white/5 p-6 rounded-[24px] hover:border-white/10 transition-all shadow-xl group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-black text-lg leading-tight uppercase tracking-tight">{category.title}</h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{category.subtitle}</p>
                </div>
                <div className="size-12 rounded-xl bg-[#070912] border border-white/5 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/5">
                  <span className="material-symbols-outlined text-2xl">{category.icon}</span>
                </div>
              </div>

              <div className={`bg-[#05070a] border border-white/5 rounded-2xl p-4 flex items-center gap-4 group-hover:bg-[#070912] transition-colors ${!selectedItem ? 'opacity-50' : ''}`}>
                <div 
                  onClick={() => selectedItem?.image && setSelectedPhoto(selectedItem.image)}
                  className={`size-14 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 ${selectedItem?.image ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                >
                  {selectedItem?.image ? (
                    <img src={selectedItem.image} className="size-full object-cover" alt={selectedItem.name} />
                  ) : (
                    <span className="material-symbols-outlined text-slate-700">{selectedId === 'none' ? 'block' : 'inventory_2'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-bold truncate">{selectedItem ? selectedItem.name : (selectedId === 'none' ? 'None Selected' : 'Not Set')}</p>
                  <p className="text-cyan-400 text-[10px] font-mono mt-0.5 font-bold">
                    {selectedItem ? `₱${selectedItem.price.toLocaleString()}` : '--'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Option</label>
                  {!hasComponents && (
                    <button 
                      onClick={() => onNavigateToComponents(category.cat)}
                      className="text-[9px] font-black text-purple-400 uppercase tracking-widest hover:text-purple-300 flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[12px]">add_circle</span>
                      Create New Component
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select 
                    className={`w-full bg-[#05070a] border border-white/10 text-white p-4 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer focus:border-cyan-500/50 transition-all hover:bg-black/60 pr-10 bg-none ${!hasComponents && category.allowNone ? 'opacity-50' : ''}`}
                    value={selectedOptions[category.cat]} 
                    onChange={e => setSelectedOptions(prev => ({ ...prev, [category.cat]: e.target.value }))}
                    disabled={!hasComponents && !category.allowNone}
                  >
                    {category.allowNone && <option value="none" className="bg-[#0f121d]">None</option>}
                    {filteredOptions.map(opt => (
                        <option key={opt.id} value={opt.id} className="bg-[#0f121d]">
                          {opt.name} - ₱{opt.price.toLocaleString()} {category.cat === Category.PLAYER ? `[${opt.sku}]` : ''}
                        </option>
                      ))
                    }
                    {!hasComponents && !category.allowNone && (
                      <option value="none" disabled className="bg-[#0f121d]">No inventory found</option>
                    )}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <span className="material-symbols-outlined text-lg">expand_more</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sale Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <form onSubmit={handleFinalizeBuild} className="relative bg-[#0f121d] max-w-4xl w-full p-0 rounded-[48px] border border-white/10 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.7)] animate-in overflow-hidden">
            
            <div className="p-10 flex flex-col gap-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
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
                    className="bg-[#1a1b2e]/40 border border-cyan-500/30 p-5 rounded-2xl text-white focus:border-cyan-500 outline-none transition-all text-sm placeholder:text-slate-600 shadow-[inset_0_2px_10_rgba(0,0,0,0.5)]" 
                    value={buyerName} 
                    onChange={e => setBuyerName(e.target.value)} 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Date Sold</label>
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest opacity-80">
                      {formatToLongDate(dateSold)}
                    </p>
                  </div>
                  <div className="relative">
                    <input 
                      type="date" 
                      className="w-full bg-[#1a1b2e]/40 border border-white/5 p-5 rounded-2xl text-white [color-scheme:dark] focus:border-cyan-500/50 outline-none transition-all text-sm font-medium" 
                      value={dateSold} 
                      onChange={e => setDateSold(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1">Receipt Details</label>
                  <div className="flex gap-2">
                    <div className="relative w-32 shrink-0">
                      <select 
                        className="w-full bg-[#1a1b2e]/40 border border-white/5 p-5 rounded-2xl text-white text-xs font-bold outline-none appearance-none cursor-pointer pr-10 bg-none" 
                        value={invoiceType} 
                        onChange={e => {
                          setInvoiceType(e.target.value);
                          if (e.target.value === 'PAPER') setInvoiceNum('');
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
                          setInvoiceNum(val);
                        }
                      }} 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1">Address</label>
                  <input required placeholder="Complete Customer Address" className="bg-[#1a1b2e]/40 border border-white/5 p-5 rounded-2xl text-white focus:border-cyan-500 outline-none transition-all text-sm placeholder:text-slate-600" value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1">Transaction Photos (Optional)</label>
                <div className="flex gap-4 flex-wrap">
                  {photos.map((p, i) => (
                    <div key={i} className="group relative size-24 rounded-2xl border border-white/10 overflow-hidden bg-black/40 cursor-pointer">
                      <img src={p} className="size-full object-cover" onClick={() => setSelectedPhoto(p)} />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(i);
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
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1">Component Summary & Warranty</label>
                <div className="bg-black/30 border border-white/5 rounded-[24px] overflow-hidden">
                  <div className="max-h-56 overflow-y-auto custom-scrollbar flex flex-col divide-y divide-white/5">
                    {sortedSummaryItems.map((item, idx) => {
                      const isNoWarranty = item.category === Category.CHASSIS || item.category === Category.MIC;
                      return (
                        <div key={idx} className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group/row">
                          <div className="flex flex-col min-w-0 pr-4">
                            <span className="text-white text-[15px] font-black leading-tight uppercase tracking-tight">{item.name}</span>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                               <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{item.category} / {item.brand}</span>
                               <span className="text-[9px] text-cyan-400 font-black uppercase tracking-widest bg-cyan-400/5 px-2 py-0.5 rounded border border-cyan-400/10">SN: {item.sku}</span>
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all shrink-0 ${isNoWarranty ? 'bg-slate-500/10 border-slate-500/20 text-slate-500' : 'bg-[#00f3ff]/10 border-[#00f3ff]/20 text-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.1)]'}`}>
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

            <div className="p-10 bg-black/40 border-t border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Transaction</p>
                <p className="text-cyan-400 text-3xl font-black font-mono mt-0.5">₱{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 rounded-2xl bg-white/5 text-slate-300 font-black uppercase text-[11px] tracking-widest hover:text-white hover:bg-white/10 transition-all border border-white/5"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-12 py-4 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-black uppercase rounded-2xl tracking-[0.25em] text-[11px] shadow-[0_10px_30px_rgba(34,211,238,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Lightbox / Image Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-12">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedPhoto(null)}></div>
          <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center gap-6 animate-in">
             <button onClick={() => setSelectedPhoto(null)} className="absolute top-0 right-0 size-14 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all shadow-xl z-[1010]"><span className="material-symbols-outlined text-2xl">close</span></button>
             <img src={selectedPhoto} className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border border-white/10" />
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">Image Preview</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assemble;
