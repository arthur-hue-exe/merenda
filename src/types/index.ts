export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string; // e.g., kg, L, un
  expiryDate: string; // ISO string
  supplier: string;
}

export interface DeliveryItem {
  itemId: string; // Corresponds to StockItem id
  itemName: string;
  quantity: number;
  unit: string;
}

export interface Delivery {
  id: string;
  date: string; // ISO string
  supplier: string;
  items: DeliveryItem[];
  notes?: string;
}

export interface ConsumptionItem {
  itemId: string; // Corresponds to StockItem id
  itemName: string;
  quantityConsumed: number;
  unit: string;
}

export interface ConsumptionRecord {
  id: string;
  date: string; // ISO string
  classOrStudent: string; // Identifier for class or student group
  items: ConsumptionItem[];
  notes?: string;
}

// For AI forecasting input
export interface HistoricalData {
  consumption: ConsumptionRecord[];
  deliveries: Delivery[];
}
