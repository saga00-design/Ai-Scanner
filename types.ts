
export interface LiquidAnalysis {
  percentage: number;
  description: string;
}

export interface BottleSpecs {
  abv: string;
  volume: string;
  origin: string;
  type: string;
}

export interface TastingNotes {
  nose: string;
  palate: string;
  finish: string;
}

export interface Cocktail {
  name: string;
  ingredients: string[];
  instructions: string;
  visualPrompt: string; // Description for image generation
}

export interface ScanResult {
  productName: string;
  specs: BottleSpecs;
  barcode: string | null;
  liquidAnalysis: LiquidAnalysis;
  description: string; // Story of the bottle
  averagePrice: string; // Estimated price range
  tastingNotes: TastingNotes; // Or Product Features
  cocktails: Cocktail[]; // Or Usage/Recipes
  rawAnalysis?: string;
}

export interface ImageState {
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
}

export interface StockItem {
  id: string;
  productName: string;
  volume: string;
  percentage: number;
  timestamp: number;
  barcode: string | null;
  image: string; // Thumbnail
  quantity: number;
  cost: number;
}

export interface ReminderSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  time: string;
  lastTriggered: number;
}

export type ViewMode = 'scanner' | 'stock' | 'enhance';
