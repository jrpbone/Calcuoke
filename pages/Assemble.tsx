
import React, { useState, useMemo } from 'react';
import { Category, ComponentItem, KaraokeProject } from '../data/types';
import AssembleHeader from '../components/assemble/AssembleHeader';
import CategoryCard from '../components/assemble/CategoryCard';
import ImagePreviewModal from '../components/assemble/ImagePreviewModal';
import SaleRegistrationModal from '../components/assemble/SaleRegistrationModal';
import TotalCostCard from '../components/assemble/TotalCostCard';

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
      <AssembleHeader onOpenModal={() => setIsModalOpen(true)} />

      <TotalCostCard totalCost={totalCost} />

      <div className="flex items-center gap-3 mt-4">
        <div className="size-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
          <span className="material-symbols-outlined text-xl">grid_view</span>
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">Component Categories</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <CategoryCard
            key={category.cat}
            category={category}
            components={components}
            selectedId={selectedOptions[category.cat]}
            onSelect={(value) => setSelectedOptions(prev => ({ ...prev, [category.cat]: value }))}
            onNavigateToComponents={onNavigateToComponents}
            onPreviewImage={(image) => setSelectedPhoto(image)}
          />
        ))}
      </div>

      {/* Sale Registration Modal */}
      {isModalOpen && (
        <SaleRegistrationModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFinalizeBuild}
          buyerName={buyerName}
          onBuyerNameChange={setBuyerName}
          dateSold={dateSold}
          longDateLabel={formatToLongDate(dateSold)}
          onDateSoldChange={setDateSold}
          invoiceType={invoiceType}
          onInvoiceTypeChange={setInvoiceType}
          invoiceNum={invoiceNum}
          onInvoiceNumChange={setInvoiceNum}
          buyerAddress={buyerAddress}
          onBuyerAddressChange={setBuyerAddress}
          photos={photos}
          onPhotoUpload={handlePhotoUpload}
          onPhotoRemove={removePhoto}
          onSelectPhoto={(photo) => setSelectedPhoto(photo)}
          sortedSummaryItems={sortedSummaryItems}
          totalCost={totalCost}
        />
      )}

      {/* Lightbox / Image Preview Modal */}
      {selectedPhoto && (
        <ImagePreviewModal
          src={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
};

export default Assemble;
