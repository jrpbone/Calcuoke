export enum Category {
  MIC = 'Mic',
  PLAYER = 'Player',
  AMPLIFIER = 'Amplifier',
  CHASSIS = 'Videoke Chassis',
  TV = 'TV'
}

export interface ComponentItem {
  id: string;
  name: string;
  sku: string;
  category: Category;
  brand: string;
  price: number;
  image?: string;
}

export interface SwapRecord {
  category: Category;
  replacedItemName: string;
  replacedItemSku: string;
  newItemName: string;
  newItemSku: string;
  date: string;
  customerName?: string;
}

export interface KaraokeProject {
  id: string;
  name: string;
  grade: string;
  createdDate: string;
  components: ComponentItem[];
  originalComponents?: ComponentItem[];
  totalCost: number;
  // Extended fields for sales tracking
  invoiceNumber?: string;
  buyerName?: string;
  buyerAddress?: string;
  dateSold?: string;
  photos?: string[];
  swapHistory?: SwapRecord[];
}

export type ViewType = 'dashboard' | 'assemble' | 'components' | 'replacements';
