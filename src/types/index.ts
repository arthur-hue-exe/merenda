export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string; // e.g., kg, L, un
  expiryDate: string; // ISO string
  supplier: string;
  cost?: number; // Custo unitário do item
}

// DeliveryItem e Delivery foram removidas

export interface ConsumptionItem {
  itemId: string; // Corresponds to StockItem id
  itemName: string;
  quantityConsumed: number;
  unit: string;
  costAtTimeOfConsumption?: number; // Custo do item no momento do consumo
}

export interface ConsumptionRecord {
  id: string;
  date: string; // ISO string
  classOrStudent: string; // Identifier for class or student group
  numberOfStudents: number; // Quantidade de alunos que consumiram
  items: ConsumptionItem[];
  totalCost?: number; // Custo total do consumo
  notes?: string;
}

// HistoricalData não precisa mais de deliveries
export interface HistoricalData {
  consumption: ConsumptionRecord[];
  // deliveries: Delivery[]; // Removido
}

// Para Chat IA
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GeneralChatInput {
  userInput: string;
  chatHistory?: ChatMessage[];
}
export interface GeneralChatOutput {
  modelResponse: string;
}

// Para Relatório de Gastos IA
export interface GenerateSpendingReportInput {
  consumptionRecordsJSON: string; // JSON stringified
  stockItemsJSON: string; // JSON stringified
  startDate?: string;
  endDate?: string;
}

export interface GenerateSpendingReportOutput {
  reportText: string;
}
