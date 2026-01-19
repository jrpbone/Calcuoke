import React, { useState, useRef, useMemo } from 'react';
import { KaraokeProject, Category, ComponentItem, SwapRecord } from '../data/types';
import ProjectSearch from '../components/dashboard/ProjectSearch';
import ProjectList from '../components/dashboard/ProjectList';
import PhotoPreviewModal from '../components/dashboard/PhotoPreviewModal';
import SwapFlowModal, { NewComponentData, SwapModalView } from '../components/dashboard/SwapFlowModal';
import SwapConfirmModal from '../components/dashboard/SwapConfirmModal';
import WarrantyViewer from '../components/dashboard/WarrantyViewer';

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
  const [swapModalView, setSwapModalView] = useState<SwapModalView>('options');
  const [newCompData, setNewCompData] = useState<NewComponentData>({ name: '', sku: '', brand: '', price: '' });
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
          <h1 className="heading-gradient text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00f3ff] to-[#bc13fe] text-3xl md:text-4xl font-black leading-tight tracking-tight drop-shadow-sm uppercase">KARAOKE RECORD</h1>
          <p className="text-slate-400 text-sm font-medium">Overview of active sales and hardware swaps.</p>
        </div>
        <button 
          onClick={onNewBuild} 
          className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 rounded-xl text-white font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:scale-105 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          NEW BUILD
        </button>
      </header>

      <ProjectSearch value={searchTerm} onChange={setSearchTerm} />

      <ProjectList
        projects={filteredProjects}
        onManage={setViewingProject}
        formatLongDate={formatLongDate}
      />

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
        <SwapFlowModal
          oldItem={oldItem}
          swapModalView={swapModalView}
          sameModelInstances={sameModelInstances}
          alternativeInstances={alternativeInstances}
          availableAltFilters={availableAltFilters}
          altFilter={altFilter}
          newCompData={newCompData}
          playerOptions={playerOptions}
          onAltFilterChange={setAltFilter}
          onSwapViewChange={setSwapModalView}
          onNewCompDataChange={setNewCompData}
          onInitiateSwap={initiateSwap}
          onBackdropClose={resetSwap}
          onClose={handleSwapCloseClick}
          onCreateAndSwap={handleCreateAndSwap}
          isTemplateCategory={isTemplateCategory}
        />
      )}

      {/* SWAP CONFIRMATION */}
      {isConfirmingSwap && oldItem && pendingSwapItem && (
        <SwapConfirmModal
          onConfirm={executeSwap}
          onCancel={() => setIsConfirmingSwap(false)}
        />
      )}

      {/* WARRANTY VIEWER */}
      {warrantyToView && (
        <WarrantyViewer
          project={warrantyToView}
          docRef={warrantyDocRef}
          onClose={() => setWarrantyToView(null)}
          onPrint={handlePrintWarranty}
          onDownload={handleDownloadWarranty}
          formatLongDate={formatLongDate}
        />
      )}

      {/* PHOTO PREVIEW */}
      {selectedPhoto && (
        <PhotoPreviewModal
          src={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
