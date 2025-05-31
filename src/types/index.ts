
import { z } from 'genkit'; // Adicionado para Zod Schemas

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

// Para Geração de Receitas IA
export const GenerateRecipeInputSchema = z.object({
  mainIngredients: z.string().min(3, "Descreva os ingredientes principais (ex: frango, batata doce).").describe('Main ingredients available or desired for the recipe.'),
  dietaryRestrictions: z.string().optional().describe('Any dietary restrictions (e.g., gluten-free, vegetarian, no nuts).'),
  numberOfStudents: z.coerce.number().int().positive("Número de alunos deve ser positivo.").describe('Number of students the recipe should serve.'),
  mealType: z.enum(["breakfast", "lunch", "snack"]).optional().describe("Type of meal (e.g., breakfast, lunch, snack)."),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

export const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  description: z.string().optional().describe('A brief description of the recipe.'),
  ingredients: z.array(z.object({ name: z.string(), quantity: z.string() })).describe('List of ingredients with quantities.'),
  instructions: z.string().describe('Step-by-step preparation instructions, formatted in markdown.'),
  preparationTime: z.string().optional().describe('Estimated preparation time.'),
  cookingTime: z.string().optional().describe('Estimated cooking time.'),
  nutritionalNotes: z.string().optional().describe('Brief nutritional notes or tips.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;
