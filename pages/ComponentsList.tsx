import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Category, ComponentItem } from '../data/types';

interface ComponentsListProps {
  components: ComponentItem[];
  onAddComponent: (comp: ComponentItem) => void;
  onUpdateComponent: (comp: ComponentItem) => void;
  onDeleteComponent: (id: string, silent?: boolean) => void;
  onNotify: (type: 'success' | 'error', message: string) => void;
  autoOpenModal?: boolean;
  initialCategory?: Category;
  onModalOpened?: () => void;
  onCancel?: () => void;
}

type SortKey = 'name' | 'brand' | 'category' | 'price';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const ComponentsList: React.FC<ComponentsListProps> = ({
  components,
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent,
  onNotify,
  autoOpenModal,
  initialCategory,
  onModalOpened,
  onCancel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<ComponentItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ComponentItem | null>(null);

  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: Category.MIC,
    brand: '',
    price: '',
    image: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoOpenModal) {
      handleOpenAddModal(initialCategory);
      onModalOpened?.();
    }
  }, [autoOpenModal]);

  const filterButtons = ['All', 'Mic', 'Player', 'Chassis', 'TV', 'Amplifier'];

  const processedComponents = useMemo(() => {
    // 1. Filtering
    let result = components.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = activeCategory === 'All' ||
        (activeCategory === 'Chassis' ? c.category === Category.CHASSIS : c.category.toLowerCase() === activeCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });

    // 2. Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA === undefined || valB === undefined) return 0;

        if (typeof valA === 'string' && typeof valB === 'string') {
          const comparison = valA.localeCompare(valB);
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }

        return 0;
      });
    }

    return result;
  }, [components, searchTerm, activeCategory, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = (cat?: Category) => {
    setEditingItem(null);
    setFormData({
      name: '',
      sku: '',
      category: cat || Category.MIC,
      brand: cat === Category.PLAYER ? 'PLATINUM' : '',
      price: '',
      image: ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    if (onCancel) {
      onCancel();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Error handling: Duplicate SKU check
    const isDuplicateSku = components.some(c =>
      c.sku.trim().toLowerCase() === formData.sku.trim().toLowerCase() &&
      c.id !== editingItem?.id
    );

    if (isDuplicateSku) {
      onNotify('error', `Entry Failed: Serial/SKU "${formData.sku}" is already registered in the system.`);
      return;
    }

    const itemData: ComponentItem = {
      id: editingItem?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name,
      sku: formData.sku.trim(),
      category: formData.category,
      brand: formData.brand,
      price: parseFloat(formData.price) || 0,
      image: formData.image || undefined
    };

    if (editingItem) {
      onUpdateComponent(itemData);
    } else {
      onAddComponent(itemData);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const openEditModal = (item: ComponentItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      brand: item.brand,
      price: item.price.toString(),
      image: item.image || ''
    });
    setIsModalOpen(true);
  };

  const triggerDelete = (item: ComponentItem) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingItem) {
      onDeleteComponent(deletingItem.id);
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
    }
  };

  const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig.key !== columnKey) return <span className="material-symbols-outlined text-[14px] opacity-20 ml-1">unfold_more</span>;
    return (
      <span className="material-symbols-outlined text-[14px] text-cyan-400 ml-1">
        {sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
      </span>
    );
  };

  const playerOptions = ['JUNIOR 2', 'K-BOX 3SD', 'REYNA 3', 'REYNA SE', 'REYNA 3C', 'REYNA 4', 'PIANO XL | SD'];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-8 animate-in">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5 pb-6 border-b border-white/5">
          <div className="flex flex-col gap-1">
            <h1 className="heading-gradient text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-300 to-violet-400 text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase">COMPONENTS</h1>
            <p className="text-slate-400 text-sm">Manage hardware, inventory identifiers, and pricing.</p>
          </div>
          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-[0_10px_26px_rgba(79,70,229,0.22)] hover:-translate-y-0.5 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            ADD NEW COMPONENT
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex gap-1.5 bg-[#0a0e17]/80 p-2 rounded-2xl border border-white/[0.07] overflow-x-auto custom-scrollbar no-scrollbar w-full lg:w-auto">
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
              className="w-full pl-14 pr-6 py-4 bg-[#0a0e17]/80 border border-white/[0.07] rounded-2xl text-sm text-white focus:border-cyan-500/50 focus:ring-0 outline-none transition-all"
              placeholder="Search by SKU or name…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-[#0f121d]/90 border border-white/[0.07] rounded-3xl md:rounded-[32px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left table-fixed border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th
                    className="w-[30%] p-6 text-[11px] uppercase font-black text-slate-500 tracking-[0.2em] cursor-pointer hover:text-slate-300 transition-colors group/header"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center">
                      Metadata
                      <SortIndicator columnKey="name" />
                    </div>
                  </th>
                  <th
                    className="w-[20%] p-6 text-[11px] uppercase font-black text-slate-500 tracking-[0.2em] cursor-pointer hover:text-slate-300 transition-colors group/header"
                    onClick={() => requestSort('brand')}
                  >
                    <div className="flex items-center">
                      Brand
                      <SortIndicator columnKey="brand" />
                    </div>
                  </th>
                  <th
                    className="w-[20%] p-6 text-[11px] uppercase font-black text-slate-500 tracking-[0.2em] cursor-pointer hover:text-slate-300 transition-colors group/header"
                    onClick={() => requestSort('category')}
                  >
                    <div className="flex items-center">
                      Category
                      <SortIndicator columnKey="category" />
                    </div>
                  </th>
                  <th
                    className="w-[15%] p-6 text-[11px] uppercase font-black text-slate-500 tracking-[0.2em] cursor-pointer hover:text-slate-300 transition-colors group/header"
                    onClick={() => requestSort('price')}
                  >
                    <div className="flex items-center">
                      Price
                      <SortIndicator columnKey="price" />
                    </div>
                  </th>
                  <th className="w-[15%] p-6 text-[11px] uppercase font-black text-slate-500 tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {processedComponents.map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.01] group transition-all">
                    <td className="p-6">
                      <div className="flex items-center gap-5">
                        <div className="size-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} className="size-full object-cover" alt={item.name} />
                          ) : (
                            <span className="material-symbols-outlined text-slate-700 text-2xl">box</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-[15px] truncate">{item.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">{item.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-sm font-semibold text-slate-300">{item.brand}</span>
                    </td>
                    <td className="p-6">
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className="font-mono text-white font-bold text-base">₱{item.price.toLocaleString()}</span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEditModal(item)}
                          className="size-10 rounded-xl bg-white/5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 border border-white/5 flex items-center justify-center transition-all group/btn"
                          title="Edit Component"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => triggerDelete(item)}
                          className="size-10 rounded-xl bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-white/5 flex items-center justify-center transition-all"
                          title="Delete Component"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {processedComponents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-24 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-20">
                        <span className="material-symbols-outlined text-7xl">inventory_2</span>
                        <p className="text-white font-black uppercase tracking-[0.3em]">Vault Empty</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative bg-[#0f121d] max-w-md w-full p-6 sm:p-10 rounded-3xl sm:rounded-[40px] border border-white/10 shadow-2xl animate-in text-center">
            <div className="size-20 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
              <span className="material-symbols-outlined text-4xl font-variation-FILL">warning</span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase mb-3 tracking-tight">Confirm Deletion</h2>
            <p className="text-slate-400 text-sm mb-10 leading-relaxed">
              Are you sure you want to permanently remove <span className="text-white font-bold">{deletingItem?.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-4 rounded-2xl bg-rose-600 text-white font-black uppercase tracking-widest text-xs hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/20">Delete Record</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-4 rounded-2xl bg-white/5 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-white transition-colors">Go Back</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-[#05070a]/90 backdrop-blur-xl" onClick={handleCloseModal}></div>
          <form
            onSubmit={handleSubmit}
            className="relative bg-[#0f121d] max-w-2xl w-full max-h-[94vh] p-5 sm:p-8 md:p-10 rounded-3xl sm:rounded-[40px] border border-white/10 flex flex-col gap-6 sm:gap-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in overflow-y-auto custom-scrollbar"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

            <div className="flex flex-col items-center gap-2">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter text-center">
                {editingItem ? 'Component Profile' : 'Catalog New Item'}
              </h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em]">Karaoke Component System</p>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Component Visual</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-44 sm:h-64 rounded-2xl sm:rounded-[32px] bg-black/40 border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden cursor-pointer group hover:border-cyan-500/50 transition-all relative"
              >
                {formData.image ? (
                  <>
                    <img src={formData.image} className="size-full object-cover transition-transform group-hover:scale-105" alt="Preview" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-black uppercase tracking-widest">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="size-16 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:bg-cyan-400/10 transition-all">
                      <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold text-sm">Upload Reference Image</p>
                      <p className="text-slate-500 text-[10px] uppercase mt-1">PNG, JPG or WEBP supported</p>
                    </div>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hardware Category</label>
              <div className="relative">
                <select
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm text-white outline-none focus:border-cyan-500 appearance-none cursor-pointer transition-all pr-10 bg-none"
                  value={formData.category}
                  onChange={e => {
                    const newCat = e.target.value as Category;
                    let newBrand = formData.brand;
                    // Auto-brand PLATINUM for Players
                    if (newCat === Category.PLAYER) {
                      newBrand = 'PLATINUM';
                    } else if (formData.category === Category.PLAYER) {
                      newBrand = ''; // Clear if switching away from Player
                    }
                    setFormData({ ...formData, category: newCat, brand: newBrand, name: '' });
                  }}
                >
                  {Object.values(Category).map(cat => <option key={cat} value={cat} className="bg-[#0f121d]">{cat}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <span className="material-symbols-outlined text-lg">expand_more</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Component Name</label>
                {formData.category === Category.PLAYER ? (
                  <div className="relative">
                    <select
                      required
                      className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm text-white outline-none focus:border-cyan-500 appearance-none cursor-pointer transition-all pr-10 bg-none"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                  <input required placeholder="e.g. Dynamic Microphone" className="bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-cyan-500 transition-all text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Manufacturer / Brand</label>
                <input
                  required
                  readOnly={formData.category === Category.PLAYER}
                  placeholder={formData.category === Category.PLAYER ? "PLATINUM" : "e.g. Shure"}
                  className={`bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-cyan-500 transition-all text-sm ${formData.category === Category.PLAYER ? 'opacity-60 cursor-not-allowed' : ''}`}
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Inventory SKU / Serial</label>
                <input required placeholder="MC-XXXX" className="bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-cyan-500 transition-all font-mono uppercase text-sm" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Market Price (₱)</label>
                <input required type="number" placeholder="0.00" className="bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-cyan-500 transition-all font-mono text-sm" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              </div>
            </div>

            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 py-5 rounded-3xl bg-white/5 text-slate-400 font-black uppercase tracking-widest text-[11px] hover:text-white transition-all"
              >
                Discard
              </button>
              <button
                type="submit"
                className="flex-[2] py-5 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-black uppercase rounded-3xl tracking-[0.25em] text-[11px] shadow-[0_10px_26px_rgba(79,70,229,0.2)] active:scale-95 transition-all"
              >
                {editingItem ? 'Update Asset' : 'Commit to Database'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ComponentsList;
