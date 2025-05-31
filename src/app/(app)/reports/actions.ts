
"use server";
import { generateSpendingReport, type GenerateSpendingReportInput, type GenerateSpendingReportOutput } from '@/ai/flows/generate-spending-report-flow';
import type { ConsumptionRecord, StockItem } from '@/types';

export async function getSpendingReport(
    consumptionRecords: ConsumptionRecord[], 
    stockItems: StockItem[], 
    startDate?: string, 
    endDate?: string
): Promise<GenerateSpendingReportOutput | { error: string }> {
  try {
    const input: GenerateSpendingReportInput = { 
      consumptionRecordsJSON: JSON.stringify(consumptionRecords),
      stockItemsJSON: JSON.stringify(stockItems),
      startDate, 
      endDate 
    };
    const result = await generateSpendingReport(input);
    return result;
  } catch (error) {
    console.error("Error in AI spending report generation:", error);
    return { error: "Falha ao gerar relatório de gastos com IA. Tente novamente mais tarde." };
  }
}
