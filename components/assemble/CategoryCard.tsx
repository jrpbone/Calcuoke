import React from 'react';
import { Category, ComponentItem } from '../../data/types';

interface CategoryDefinition {
  title: string;
  subtitle: string;
  cat: Category;
  icon: string;
  allowNone: boolean;
}

interface CategoryCardProps {
  category: CategoryDefinition;
  components: ComponentItem[];
  selectedId: string;
  onSelect: (value: string) => void;
  onNavigateToComponents: (category?: Category) => void;
  onPreviewImage: (image: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  components,
  selectedId,
  onSelect,
  onNavigateToComponents,
  onPreviewImage
}) => {
  const filteredOptions = components.filter(c => c.category === category.cat);
  const selectedItem = selectedId === 'none' ? null : components.find(c => c.id === selectedId && c.category === category.cat);
  const hasComponents = filteredOptions.length > 0;

  return (
    <div className="flex flex-col gap-4 bg-[#0d101d] border border-white/5 p-6 rounded-[24px] hover:border-white/10 transition-all shadow-xl group">
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
          onClick={() => selectedItem?.image && onPreviewImage(selectedItem.image)}
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
            {selectedItem ? `\u20B1${selectedItem.price.toLocaleString()}` : '--'}
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
            value={selectedId} 
            onChange={e => onSelect(e.target.value)}
            disabled={!hasComponents && !category.allowNone}
          >
            {category.allowNone && <option value="none" className="bg-[#0f121d]">None</option>}
            {filteredOptions.map(opt => (
              <option key={opt.id} value={opt.id} className="bg-[#0f121d]">
                {opt.name} - {'\u20B1'}{opt.price.toLocaleString()} {category.cat === Category.PLAYER ? `[${opt.sku}]` : ''}
              </option>
            ))}
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
};

export default CategoryCard;
