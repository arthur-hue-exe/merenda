
"use server";
import { suggestDemandAdjustments, type SuggestDemandAdjustmentsInput, type SuggestDemandAdjustmentsOutput } from '@/ai/flows/suggest-demand-adjustments';

export async function getDemandAdjustmentSuggestions(input: SuggestDemandAdjustmentsInput): Promise<SuggestDemandAdjustmentsOutput | { error: string }> {
  try {
    const result = await suggestDemandAdjustments(input);
    return result;
  } catch (error) {
    console.error("Error in AI demand forecasting:", error);
    return { error: "Falha ao obter sugestões de previsão de demanda. Tente novamente mais tarde." };
  }
}
