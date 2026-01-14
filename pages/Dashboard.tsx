import React, { useState, useRef, useMemo } from 'react';
import { KaraokeProject, Category, ComponentItem, SwapRecord } from '../data/types';

interface DashboardProps {
  projects: KaraokeProject[];
  components: ComponentItem[];
  onNewBuild: () => void;
  onUpdateProject: (project: KaraokeProject) => void;
  onAddComponent: (component: ComponentItem) => void;
  onDeleteComponent: (id: string, silent?: boolean) => void;
  onNotify?: (type: 'success' | 'error', message: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, components, onNewBuild, onUpdateProject, onAddComponent, onDeleteComponent, onNotify }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingProject, setViewingProject] = useState<KaraokeProject | null>(null);
  const [warrantyToView, setWarrantyToView] = useState<KaraokeProject | null>(null);
  const [swappingIndex, setSwappingIndex] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  // Swap states
  const [swapModalView, setSwapModalView] = useState<'options' | 'select-unit' | 'select-alt' | 'register'>('options');
  const [newCompData, setNewCompData] = useState({ name: '', sku: '', brand: '', price: '' });
  const [pendingSwapItem, setPendingSwapItem] = useState<ComponentItem | null>(null);
  const [isConfirmingSwap, setIsConfirmingSwap] = useState(false);
  const [altFilter, setAltFilter] = useState('All');

  const warrantyDocRef = useRef<HTMLDivElement>(null);
  const playerOptions = ['JUNIOR 2', 'K-BOX 3SD', 'REYNA 3', 'REYNA SE', 'REYNA 3C', 'REYNA 4', 'PIANO XL | SD'];

  const filteredProjects = projects.filter(p => 
    (p.buyerName || p.name).toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const oldItem = useMemo(() => {
    if (viewingProject && swappingIndex !== null) return viewingProject.components[swappingIndex];
    return null;
  }, [viewingProject, swappingIndex]);

  const sameModelInstances = useMemo(() => {
    if (!oldItem) return [];
    return components.filter(c => c.name === oldItem.name && c.id !== oldItem.id);
  }, [oldItem, components]);

  const alternativeInstances = useMemo(() => {
    if (!oldItem) return [];
    let list = components.filter(c => c.category === oldItem.category && c.name !== oldItem.name);
    
    if (altFilter !== 'All') {
      const filterKey = oldItem.category === Category.PLAYER ? 'name' : 'brand';
      list = list.filter(c => c[filterKey] === altFilter);
    }
    
    return list;
  }, [oldItem, components, altFilter]);

  const availableAltFilters = useMemo(() => {
    if (!oldItem) return ['All'];
    const list = components.filter(c => c.category === oldItem.category && c.name !== oldItem.name);
    const filterKey = oldItem.category === Category.PLAYER ? 'name' : 'brand';
    const values = list.map(c => c[filterKey]);
    return ['All', ...Array.from(new Set(values))];
  }, [oldItem, components]);

  const isTemplateCategory = (cat: Category) => 
    [Category.TV, Category.AMPLIFIER, Category.MIC].includes(cat);

  const isWithinSevenDays = (dateStr: string) => {
    if (!dateStr) return false;
    let pDate: Date;
    if (dateStr.includes('-')) {
      const [y, m, d] = dateStr.split('-');
      pDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    } else {
      const [m, d, y] = dateStr.split('/');
      pDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    pDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - pDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const initiateSwap = (newItem: ComponentItem) => {
    setPendingSwapItem(newItem);
    setIsConfirmingSwap(true);
  };

  const executeSwap = async () => {
    if (viewingProject && swappingIndex !== null && oldItem && pendingSwapItem) {
      try {
        const updatedComponents = [...viewingProject.components];
        updatedComponents[swappingIndex] = pendingSwapItem;
        
        const swapEntry: SwapRecord = {
          category: oldItem.category,
          replacedItemName: oldItem.name,
          replacedItemSku: oldItem.sku,
          newItemName: pendingSwapItem.name,
          newItemSku: pendingSwapItem.sku,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          customerName: viewingProject.buyerName || viewingProject.name
        };
        
        const updatedProject: KaraokeProject = {
          ...viewingProject,
          components: updatedComponents,
          swapHistory: [...(viewingProject.swapHistory || []), swapEntry]
        };
        
        if (pendingSwapItem.category === Category.PLAYER) {
          onDeleteComponent(pendingSwapItem.id, true);
        }

        onUpdateProject(updatedProject);
        setViewingProject(updatedProject);
        
        onNotify?.('success', `HARDWARE SWAP VERIFIED: ${pendingSwapItem.name} successfully deployed to customer record.`);
        
        resetSwap();
      } catch (error) {
        onNotify?.('error', 'SWAP FAILED: An internal error occurred while processing the asset swap.');
        setIsConfirmingSwap(false);
      }
    }
  };

  const handleCreateAndSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldItem) return;

    const finalSku = isTemplateCategory(oldItem.category) ? oldItem.sku : newCompData.sku.trim();

    if (!isTemplateCategory(oldItem.category) && components.some(c => c.sku.toLowerCase() === finalSku.toLowerCase())) {
      onNotify?.('error', `Entry Failed: Serial/SKU "${finalSku}" is already registered in the system.`);
      return;
    }

    const newItem: ComponentItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCompData.name,
      sku: finalSku,
      category: oldItem.category,
      brand: newCompData.brand,
      price: parseFloat(newCompData.price) || 0,
    };
    
    initiateSwap(newItem);
  };

  const resetSwap = () => {
    setSwappingIndex(null);
    setSwapModalView('options');
    setNewCompData({ name: '', sku: '', brand: '', price: '' });
    setPendingSwapItem(null);
    setIsConfirmingSwap(false);
    setAltFilter('All');
  };

  const handleDownloadWarranty = () => {
    if (!warrantyDocRef.current || !warrantyToView) return;
    const buyerName = warrantyToView.buyerName || 'Valued Client';
    const opt = {
      margin: 0,
      filename: `Warranty_${buyerName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all' }
    };
    if ((window as any).html2pdf) (window as any).html2pdf().set(opt).from(warrantyDocRef.current).save();
  };

  const handlePrintWarranty = () => {
    if (!warrantyDocRef.current || !warrantyToView) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Warranty Certificate - ${warrantyToView.buyerName}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @page { size: letter; margin: 0; }
              body { 
                font-family: 'Space Grotesk', sans-serif; 
                background: white; 
                margin: 0; 
                padding: 0; 
                -webkit-print-color-adjust: exact;
              }
              .print-container {
                width: 8.5in;
                height: 11in;
                padding: 0.3in;
                box-sizing: border-box;
                overflow: hidden;
                position: relative;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
                .print-container { overflow: hidden; height: 11in; }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${warrantyDocRef.current.innerHTML}
            </div>
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const formatLongDate = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
        const [y, m, d] = dateStr.split('-');
        const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
    }
    const [m, d, y] = dateStr.split('/');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  };

  const handleSwapCloseClick = () => {
    if (swapModalView === 'options') {
      resetSwap();
    } else {
      setSwapModalView('options');
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00f3ff] to-[#bc13fe] text-3xl md:text-4xl font-black leading-tight tracking-tight drop-shadow-sm uppercase">KARAOKE RECORD</h1>
          <p className="text-slate-400 text-sm font-medium">Overview of active sales and hardware swaps.</p>
        </div>
        <button 
          onClick={onNewBuild} 
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl text-white font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:scale-105 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          NEW BUILD
        </button>
      </header>

      <section className="w-full">
        <div className="relative max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4">
            <span className="material-symbols-outlined text-slate-500 text-[20px]">search</span>
          </span>
          <input className="w-full pl-11 pr-6 py-3 bg-[#0a0e17] border border-[#1f2f57] rounded-full text-xs text-white focus:outline-none focus:border-cyan-500/50 font-medium placeholder:text-slate-600 shadow-inner" placeholder="Search transactions.." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => {
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
                        {project.swapHistory?.map((swap, sIdx) => (
                          <div key={sIdx} className="text-[9px] text-slate-400 font-bold italic truncate max-w-xl">
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
                  <div className="flex flex-col gap-0.5 min-w-[100px]"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Components</span><span className="text-white text-sm font-black uppercase tracking-tight">{project.components.length} Items</span></div>
                  <div className="flex flex-col gap-0.5 min-w-[150px]">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      Sale Amount
                    </span>
                    <span className="text-2xl font-black font-mono text-cyan-400">₱{project.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <button onClick={() => setViewingProject(project)} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all font-black uppercase text-[10px] tracking-widest">
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

      {viewingProject && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setViewingProject(null)}></div>
          <div className="relative bg-[#0d101d] max-w-5xl w-full max-h-[90vh] rounded-[40px] border border-white/10 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in overflow-hidden">
            <div className="px-10 py-10 flex justify-between items-start shrink-0 border-b border-white/5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Transaction Details</span>
                <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-none">{viewingProject.buyerName || viewingProject.name}</h2>
                <p className="text-slate-500 text-sm font-bold mt-1">Invoice: {viewingProject.invoiceNumber}</p>
              </div>
              <button onClick={() => setViewingProject(null)} className="size-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/10">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col gap-6">
                  <div className="p-6 rounded-3xl bg-[#161b2e]/40 border border-white/5 flex flex-col gap-1 shadow-inner">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Customer Address</span>
                    <p className="text-white text-lg font-bold mt-1">{viewingProject.buyerAddress || 'Address not provided'}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-[#161b2e]/40 border border-white/5 flex flex-col gap-1 shadow-inner">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sale Date</span>
                    <p className="text-white text-lg font-bold mt-1">{formatLongDate(viewingProject.dateSold || viewingProject.createdDate)}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-[#161b2e]/40 border border-white/5 flex flex-col gap-1 shadow-inner">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Machine Grade</span>
                    <p className="text-cyan-400 text-lg font-black uppercase tracking-tight mt-1">{viewingProject.grade}</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Attachments & Record Photos</span>
                    <div className="flex gap-4 flex-wrap">
                      {viewingProject.photos && viewingProject.photos.length > 0 ? (
                        viewingProject.photos.map((p, i) => (
                          <div key={i} onClick={() => setSelectedPhoto(p)} className="size-24 rounded-2xl border border-white/10 overflow-hidden bg-black/40 cursor-pointer hover:scale-105 transition-transform shadow-xl shrink-0">
                            <img src={p} className="size-full object-cover" />
                          </div>
                        ))
                      ) : (
                        <div className="w-full py-10 rounded-2xl border border-white/5 border-dashed flex flex-col items-center justify-center text-slate-700 gap-2">
                          <span className="material-symbols-outlined text-4xl">photo_library</span>
                          <span className="text-[10px] font-black uppercase">No photos uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Bill of Materials</span>
                  <div className="flex flex-col gap-3">
                    {viewingProject.components
                      .map((item, originalIdx) => ({ item, originalIdx }))
                      .sort((a, b) => {
                        const purchaseDate = viewingProject.dateSold || viewingProject.createdDate;
                        const aIsPlayer = a.item.category === Category.PLAYER;
                        const bIsPlayer = b.item.category === Category.PLAYER;
                        const aCanSwap = ! (a.item.category === Category.CHASSIS) && (aIsPlayer || isWithinSevenDays(purchaseDate));
                        const bCanSwap = ! (b.item.category === Category.CHASSIS) && (bIsPlayer || isWithinSevenDays(purchaseDate));
                        
                        if (aCanSwap && !bCanSwap) return -1;
                        if (!aCanSwap && bCanSwap) return 1;
                        return 0;
                      })
                      .map(({ item, originalIdx }) => {
                        const originalItem = viewingProject.originalComponents?.[originalIdx];
                        const swapInfo = viewingProject.swapHistory?.find(s => s.category === item.category && s.newItemSku === item.sku);
                        const isPlayer = item.category === Category.PLAYER;
                        const isChassis = item.category === Category.CHASSIS;
                        const isWithinWindow = isWithinSevenDays(viewingProject.dateSold || viewingProject.createdDate);
                        const canSwap = !isChassis && (isPlayer || isWithinWindow);
                        
                        return (
                          <div key={originalIdx} className="flex flex-col p-5 rounded-2xl bg-[#080b14] border border-white/5 group/row hover:border-white/10 transition-all shadow-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col min-w-0 pr-4">
                                <div className="flex items-center gap-2">
                                   <span className="text-[15px] font-black text-white truncate leading-tight uppercase tracking-tight">{item.name}</span>
                                   {swapInfo && (
                                     <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[7px] font-black text-amber-500 uppercase tracking-widest shadow-sm">Replacement</span>
                                   )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5"><span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{item.category} / {item.brand}</span></div>
                                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider mt-1">SN: {item.sku}</span>
                                
                                {swapInfo && (
                                  <div className="mt-2 text-[9px] text-slate-500 font-bold italic bg-black/40 p-2 rounded border border-white/5 leading-relaxed">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[8px] uppercase not-italic text-slate-600">Original:</span>
                                      <span className="text-slate-400">{swapInfo.replacedItemName} ({swapInfo.replacedItemSku})</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <span className="text-[8px] uppercase not-italic text-cyan-600">Current:</span>
                                      <span className="text-cyan-400/80">{swapInfo.newItemName} ({swapInfo.newItemSku})</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {swapInfo ? (
                                  <>
                                    <span className="text-slate-600 text-[13px] font-black font-mono line-through">₱{originalItem?.price.toLocaleString()}</span>
                                    <span className="text-cyan-400 text-[11px] font-black uppercase tracking-widest">₱0.00</span>
                                  </>
                                ) : (
                                  <span className="text-cyan-400 text-[13px] font-black font-mono">₱{item.price.toLocaleString()}</span>
                                )}
                                {canSwap && (
                                  <button onClick={() => { setSwappingIndex(originalIdx); setSwapModalView('options'); }} className="size-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-cyan-400 transition-all group-hover/row:bg-white/10 shadow-inner mt-2"><span className="material-symbols-outlined text-[18px]">published_with_changes</span></button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-10 py-10 bg-black/40 border-t border-white/5 flex items-center justify-between shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 group/tip relative">
                  Total Transaction
                  <span className="material-symbols-outlined text-[14px] text-slate-600 cursor-help">info</span>
                  <span className="absolute bottom-full left-0 mb-2 hidden group-hover/tip:block bg-black border border-white/10 text-white text-[9px] px-3 py-1.5 rounded-lg whitespace-nowrap shadow-2xl z-50 uppercase tracking-widest font-black">Original Price</span>
                </span>
                <p className="text-4xl font-black text-cyan-400 font-mono mt-1 leading-none tracking-tighter">₱{viewingProject.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <button onClick={() => { setWarrantyToView(viewingProject); setViewingProject(null); }} className="flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full text-white font-black uppercase text-xs tracking-[0.2em] shadow-[0_15px_35px_rgba(0,243,255,0.25)] hover:scale-[1.03] active:scale-95 transition-all"><span className="material-symbols-outlined text-[22px] font-variation-FILL">visibility</span><span>View Warranty</span></button>
            </div>
          </div>
        </div>
      )}

      {/* SWAPPING MODAL */}
      {swappingIndex !== null && viewingProject && oldItem && (
        <div className="fixed inset-0 z-[800] flex justify-center items-start pt-20 p-6">
          <div className="absolute inset-0 bg-[#05070a]/98 backdrop-blur-xl" onClick={resetSwap}></div>
          <div className="relative bg-[#0d0e14] max-w-xl w-full rounded-[40px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] animate-in overflow-hidden transition-all duration-300 ease-out">
            
            <div className="p-10 border-b border-white/5 flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Hardware Swap System</span>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight mt-1 leading-none">Replacing Component</h2>
              </div>
              <button onClick={handleSwapCloseClick} className="size-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
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
                    <button onClick={() => setSwapModalView('select-unit')} className="flex items-center gap-6 p-6 rounded-3xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all text-left group">
                      <div className="size-14 rounded-2xl bg-purple-400/20 flex items-center justify-center text-purple-400"><span className="material-symbols-outlined text-3xl font-variation-FILL">content_copy</span></div>
                      <div className="flex flex-col"><span className="text-white font-black text-lg uppercase tracking-tight leading-none">REPLACE SAME MODEL</span><p className="text-slate-500 text-[11px] mt-1.5 font-bold uppercase tracking-wider">Found {sameModelInstances.length} available units</p></div>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 shadow-lg">
                      <div className="flex flex-col"><span className="text-amber-500 font-black text-[10px] uppercase tracking-widest">Out of Stock</span><p className="text-slate-500 text-[11px] font-bold">No {oldItem.name} units available.</p></div>
                      <button onClick={() => { setNewCompData({ name: oldItem.name, sku: '', brand: 'PLATINUM', price: '' }); setSwapModalView('register'); }} className="px-5 py-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black text-[10px] uppercase tracking-widest">Register New</button>
                    </div>
                  )
                )}
                {isTemplateCategory(oldItem.category) && (
                  <button onClick={() => initiateSwap({ id: Math.random().toString(36).substr(2, 9), name: oldItem.name, sku: oldItem.sku, category: oldItem.category, brand: oldItem.brand, price: oldItem.price })} className="flex items-center gap-6 p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left group">
                    <div className="size-14 rounded-2xl bg-emerald-400/20 flex items-center justify-center text-emerald-400"><span className="material-symbols-outlined text-3xl font-variation-FILL">autorenew</span></div>
                    <div className="flex flex-col"><span className="text-white font-black text-lg uppercase tracking-tight leading-none">SAME MODEL SWAP</span><p className="text-slate-500 text-[11px] mt-1.5 font-bold uppercase tracking-wider">Substitution with same specs</p></div>
                  </button>
                )}
                <button onClick={() => setSwapModalView('select-alt')} className="flex items-center gap-6 p-6 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all text-left group">
                  <div className="size-14 rounded-2xl bg-cyan-400/20 flex items-center justify-center text-cyan-400"><span className="material-symbols-outlined text-3xl font-variation-FILL">sync_alt</span></div>
                  <div className="flex flex-col"><span className="text-white font-black text-lg uppercase tracking-tight leading-none">Select Alternative</span><p className="text-slate-500 text-[11px] mt-1.5 font-bold uppercase tracking-wider">Browse compatible models</p></div>
                </button>
              </div>
            )}
            
            {swapModalView === 'select-unit' && (
              <div className="p-10 flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  {sameModelInstances.map(unit => (
                    <button key={unit.id} onClick={() => initiateSwap(unit)} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-purple-500/10 transition-all text-left flex justify-between">
                      <div><span className="text-white font-bold font-mono">{unit.sku}</span></div>
                      <div><span className="text-white font-black text-sm">₱{unit.price.toLocaleString()}</span></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {swapModalView === 'select-alt' && (
              <div className="p-10 flex flex-col gap-6 transition-all duration-300 overflow-hidden">
                <div className="flex flex-wrap gap-2 pb-2">
                  {availableAltFilters.map(filterVal => (
                    <button
                      key={filterVal}
                      onClick={() => setAltFilter(filterVal)}
                      className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${altFilter === filterVal ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-white/5 text-slate-500 border-white/10 hover:border-white/20 hover:text-slate-300'}`}
                    >
                      {filterVal}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                  {alternativeInstances.length > 0 ? (
                    alternativeInstances.map(unit => (
                      <button key={unit.id} onClick={() => initiateSwap(unit)} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-cyan-500/10 transition-all text-left flex justify-between group/unit">
                        <div className="min-w-0 flex-1">
                          <span className="text-white font-black uppercase tracking-tight group-hover/unit:text-cyan-400 transition-colors">{unit.name}</span>
                          <div className="mt-1 flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{unit.brand}</span>
                            <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded border border-white/5 inline-block w-fit group-hover/unit:text-cyan-400/80">SN: {unit.sku}</span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1 shrink-0">
                          <span className="text-cyan-400 font-black font-mono">₱{unit.price.toLocaleString()}</span>
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
                        <button onClick={() => { setNewCompData({ name: '', sku: '', brand: 'PLATINUM', price: '' }); setSwapModalView('register'); }} className="mt-2 text-cyan-400 font-black text-[10px] uppercase tracking-widest hover:text-cyan-300 transition-colors underline underline-offset-4">Register New Hardware Model</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {swapModalView === 'register' && (
              <form onSubmit={handleCreateAndSwap} className="p-10 flex flex-col gap-8">
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hardware Model</label>
                    {oldItem.category === Category.PLAYER ? (
                      <div className="relative">
                        <select 
                          required
                          className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm text-white outline-none focus:border-cyan-400 appearance-none cursor-pointer transition-all pr-10 bg-none"
                          value={newCompData.name}
                          onChange={e => setNewCompData({...newCompData, name: e.target.value})}
                        >
                          <option value="" disabled className="bg-[#0f121d]">Select Player Model</option>
                          {playerOptions.map(opt => (
                            <option key={opt} value={opt} className="bg-[#0f121d]">{opt}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                          <span className="material-symbols-outlined text-lg">expand_more</span>
                        </div>
                      </div>
                    ) : (
                      <input required className="bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-sm outline-none focus:border-cyan-400 uppercase font-black" value={newCompData.name} onChange={e => setNewCompData({...newCompData, name: e.target.value})} />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Serial / SKU</label>
                    <input required className="bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-sm outline-none font-mono uppercase" value={newCompData.sku} onChange={e => setNewCompData({...newCompData, sku: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Price (₱)</label>
                    <input required type="number" className="bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-sm outline-none" value={newCompData.price} onChange={e => setNewCompData({...newCompData, price: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full py-6 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-black uppercase text-xs tracking-[0.3em] rounded-3xl">Finalize</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SWAP CONFIRMATION */}
      {isConfirmingSwap && oldItem && pendingSwapItem && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsConfirmingSwap(false)}></div>
          <div className="relative bg-[#0f121d] max-w-lg w-full p-10 rounded-[48px] border border-white/10 shadow-2xl animate-in text-center flex flex-col gap-8">
             <div className="size-20 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20"><span className="material-symbols-outlined text-4xl font-variation-FILL">published_with_changes</span></div>
             <div><h2 className="text-2xl font-black text-white uppercase tracking-tight">Confirm Asset Swap</h2></div>
             <div className="flex flex-col gap-3">
               <button onClick={executeSwap} className="w-full py-5 rounded-[24px] bg-amber-500 text-white font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] transition-all shadow-lg shadow-amber-500/20">Finalize Swap</button>
               <button onClick={() => setIsConfirmingSwap(false)} className="w-full py-5 rounded-[24px] bg-white/5 text-slate-400 font-black uppercase tracking-[0.2em] text-[11px] hover:text-white transition-all">Abort</button>
             </div>
          </div>
        </div>
      )}

      {/* WARRANTY VIEWER */}
      {warrantyToView && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-xl" onClick={() => setWarrantyToView(null)}></div>
          <div className="relative w-full max-w-4xl h-full flex flex-col gap-4">
            <div className="flex justify-between items-center bg-[#1a1b2e] p-5 rounded-[24px] border border-white/10 shadow-2xl shrink-0">
               <div className="flex flex-col"><span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.3em]">Official Registry</span><h2 className="text-lg font-black text-white uppercase tracking-tight">{warrantyToView.buyerName}'s Certificate</h2></div>
               <div className="flex gap-3">
                 <button onClick={handlePrintWarranty} className="px-6 py-3 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 shadow-lg"><span className="material-symbols-outlined text-[18px]">print</span> Print</button>
                 <button onClick={handleDownloadWarranty} className="px-8 py-3 bg-cyan-400 text-black font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-cyan-300 transition-all flex items-center gap-2 shadow-lg shadow-cyan-400/20"><span className="material-symbols-outlined text-[18px]">download</span> Save PDF</button>
                 <button onClick={() => setWarrantyToView(null)} className="size-11 bg-white/5 text-slate-400 rounded-xl flex items-center justify-center hover:bg-white/10 hover:text-white transition-all border border-white/10"><span className="material-symbols-outlined">close</span></button>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-gray-200/50 p-8 rounded-[32px] flex justify-center shadow-inner custom-scrollbar">
               <div ref={warrantyDocRef} className="bg-white w-full max-w-[816px] p-10 flex flex-col text-black shadow-2xl font-sans relative" style={{ color: '#000000', height: '10in', overflow: 'hidden' }}>
                  
                  <div className="absolute top-0 left-0 w-full h-2 bg-black"></div>

                  <div className="text-center mb-6 pt-2">
                    <h1 className="text-3xl font-black uppercase tracking-[-0.04em] leading-none m-0 p-0" style={{ color: '#000' }}>WARRANTY CERTIFICATE</h1>
                    <div className="flex items-center justify-center gap-3 mt-2">
                       <div className="h-[1.5px] bg-black/20 w-10"></div>
                       <p className="text-[9px] font-black tracking-[0.4em] uppercase" style={{ color: '#000' }}>AUTHORIZED SYSTEM RECORD &bull; OFFICIAL REGISTRY</p>
                       <div className="h-[1.5px] bg-black/20 w-10"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div className="flex flex-col gap-0.5 border-l-[4px] border-black pl-4">
                      <h3 className="text-[8.5px] font-black uppercase opacity-60 tracking-widest mb-1.5">CLIENT IDENTITY</h3>
                      <div className="text-2xl font-black leading-tight tracking-tighter" style={{ color: '#000' }}>{warrantyToView.buyerName}</div>
                      <div className="text-[10px] font-bold leading-relaxed opacity-85 truncate max-w-[340px]" style={{ color: '#000' }}>{warrantyToView.buyerAddress}</div>
                    </div>
                    <div className="text-right flex flex-col justify-between items-end">
                      <div className="flex flex-col items-end">
                        <h3 className="text-[8.5px] font-black uppercase opacity-60 tracking-widest mb-1">RECORD IDENTIFIER</h3>
                        <div className="text-lg font-black font-mono tracking-tighter" style={{ color: '#000' }}>#{warrantyToView.invoiceNumber}</div>
                      </div>
                      <div className="text-[10px] font-black uppercase bg-black text-white px-3 py-1.5 rounded tracking-[0.1em]">
                        ISSUED: {formatLongDate(warrantyToView.createdDate)}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Policy Section */}
                  <div className="border-[2px] border-black p-5 rounded-2xl mb-6 bg-gray-50/60">
                    <h4 className="text-[12px] font-black uppercase mb-3 flex items-center gap-2 tracking-[0.1em]">
                       <span className="w-1.5 h-3.5 bg-black"></span>
                       General Coverage & Liability Policy
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                       <p className="text-[9.5px] leading-snug font-bold" style={{ color: '#000' }}>
                         <strong>7-DAY REPLACEMENT WINDOW:</strong> Electronic system components, specifically the <strong>Karaoke Player, Digital Amplifier, and LED TV</strong>, are eligible for a strict one-time factory defect exchange within seven (7) days of issuance. Units must be returned in pristine physical condition with original packaging.
                       </p>
                       <p className="text-[9.5px] leading-snug font-bold" style={{ color: '#000' }}>
                         <strong>3-MONTH LIMITED SERVICE:</strong> Following the initial replacement period, eligible units are covered by a <strong>Service Warranty</strong> for three (3) months. This covers internal circuit failure and firmware issues. Service labor is included, however, specialized part replacements after 7 days may incur costs.
                       </p>
                       <p className="text-[9.5px] leading-snug font-bold" style={{ color: '#000' }}>
                         <strong>EXCLUSIONS & VOIDS:</strong> The <strong>Videoke Chassis</strong> (housing/cabinet) and peripheral accessories (cables, remotes) are sold <strong>AS-IS</strong> with no warranty. Coverage is immediately VOIDED by evidence of: physical impact, moisture exposure, power surge damage, or unauthorized seal tampering.
                       </p>
                       <p className="text-[9.5px] leading-snug font-bold" style={{ color: '#000' }}>
                         <strong>OPERATIONAL GUIDELINES:</strong> Damage resulting from improper ventilation, excessive heat, or neglect during transport is not covered. Claims must be filed by the original client named above and presented with this official certificate.
                       </p>
                    </div>
                  </div>

                  <div className="flex-grow overflow-hidden">
                    <div className="flex items-center gap-2 mb-2 ml-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: '#000' }}>Serialized Asset Ledger</span>
                    </div>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-y-[2px] border-black">
                          <th className="text-left py-2 px-1 text-[9px] font-black uppercase tracking-widest" style={{ color: '#000' }}>Hardware Description</th>
                          <th className="text-center py-2 px-1 text-[9px] font-black uppercase tracking-widest" style={{ color: '#000' }}>Serial / Identifier</th>
                          <th className="text-right py-2 px-1 text-[9px] font-black uppercase tracking-widest" style={{ color: '#000' }}>Warranty Term</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...(warrantyToView.originalComponents || warrantyToView.components)].sort((a, b) => {
                          const getP = (cat: Category) => {
                            if ([Category.PLAYER, Category.AMPLIFIER, Category.TV].includes(cat)) return 1;
                            if (cat === Category.MIC) return 2;
                            if (cat === Category.CHASSIS) return 3;
                            return 4;
                          };
                          return getP(a.category) - getP(b.category);
                        }).map((item, idx) => {
                          const hasTechWarranty = [Category.PLAYER, Category.AMPLIFIER, Category.TV].includes(item.category);
                          const isChassis = item.category === Category.CHASSIS;
                          let termLabel = hasTechWarranty ? "90 Days Service" : "7 Days Exchange";
                          if (isChassis) termLabel = "No Warranty";

                          return (
                            <tr key={idx} className="border-b border-black/10">
                              <td className="py-2.5 px-1">
                                <div className="font-black text-[12px] leading-none uppercase tracking-tight" style={{ color: '#000' }}>{item.name}</div>
                                <div className="text-[9px] font-bold opacity-60 uppercase mt-1" style={{ color: '#000' }}>{item.category} &bull; {item.brand}</div>
                              </td>
                              <td className="py-2.5 px-1 text-center font-mono text-[10px] font-black uppercase tracking-widest" style={{ color: '#000' }}>{item.sku}</td>
                              <td className="py-2.5 px-1 text-right font-black text-[10px] uppercase opacity-80" style={{ color: '#000' }}>{termLabel}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* FIXED PDF FOOTER */}
                  <div className="mt-auto pt-10">
                    <div className="flex justify-between items-end mb-6 px-4">
                      <div className="w-72 text-center">
                        <div className="border-b-[2px] border-black pb-1.5 mb-2 h-8">
                           {/* Signatory line empty as requested */}
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-70" style={{ color: '#000' }}>AUTHORIZED SYSTEM SIGNATORY</p>
                      </div>

                      {/* Middle icon removed as requested */}

                      <div className="w-72 text-center">
                        <div className="border-b-[2px] border-black pb-1.5 mb-2 h-8 flex items-center justify-center">
                           <span className="text-[22px] font-black uppercase tracking-tighter opacity-100" style={{ color: '#000' }}>{warrantyToView.buyerName}</span>
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-70" style={{ color: '#000' }}>CLIENT SIGNATURE</p>
                      </div>
                    </div>
                    
                    <div className="border-t-[1px] border-black/15 pt-4 text-center">
                      <div className="flex justify-center items-center gap-8 opacity-35 grayscale">
                        <span className="text-[8.5px] font-black uppercase tracking-[0.5em]" style={{ color: '#000' }}>NON-TRANSFERABLE</span>
                        <span className="text-[8.5px] font-black uppercase tracking-[0.5em]" style={{ color: '#000' }}>&bull;</span>
                        <span className="text-[8.5px] font-black uppercase tracking-[0.5em]" style={{ color: '#000' }}>VOID IF TAMPERED</span>
                        <span className="text-[8.5px] font-black uppercase tracking-[0.5em]" style={{ color: '#000' }}>&bull;</span>
                        <span className="text-[8.5px] font-black uppercase tracking-[0.5em]" style={{ color: '#000' }}>RECORD v5.0 GENUINE</span>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO PREVIEW */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-12">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedPhoto(null)}></div>
          <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center gap-6 animate-in">
             <button onClick={() => setSelectedPhoto(null)} className="absolute top-0 right-0 size-14 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all shadow-xl"><span className="material-symbols-outlined text-2xl">close</span></button>
             <img src={selectedPhoto} className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border border-white/10" />
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">System Record Image</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;