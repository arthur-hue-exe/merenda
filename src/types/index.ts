export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string; // e.g., kg, L, un
  expiryDate: string; // ISO string
  supplier: string;
  cost?: number; // Custo unitário do item
}

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

export interface HistoricalData {
  consumption: ConsumptionRecord[];
}

// Para Chat IA
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Para Relatório de Gastos IA (mantido para consistência com o fluxo existente)
export interface GenerateSpendingReportInput {
  consumptionRecordsJSON: string; // JSON stringified
  stockItemsJSON: string; // JSON stringified
  startDate?: string;
  endDate?: string;
}

export interface GenerateSpendingReportOutput {
  reportText: string;
}

// Para Geração de Receitas IA (já definido no Zod schema, mas pode ser útil ter aqui)
// As definições de GenerateRecipeInput e GenerateRecipeOutput são exportadas de
// src/ai/flows/generate-recipe-flow.ts, não precisam ser duplicadas aqui
// a menos que haja uma necessidade específica de desacoplamento ou variação.
// Para este caso, vamos assumir que os tipos exportados pelo Zod são suficientes.

// export interface GenerateRecipeInput { ... }
// export interface GenerateRecipeOutput { ... }
