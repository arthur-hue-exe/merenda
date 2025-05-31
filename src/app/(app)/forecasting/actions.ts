
"use server";
// import { suggestDemandAdjustments, type SuggestDemandAdjustmentsInput, type SuggestDemandAdjustmentsOutput } from '@/ai/flows/suggest-demand-adjustments'; // Removido
import { generalChat, type GeneralChatInput, type GeneralChatOutput } from '@/ai/flows/general-chat-flow';
import type { ChatMessage } from '@/types';

// getDemandAdjustmentSuggestions removido

export async function getChatResponse(userInput: string, chatHistory?: ChatMessage[]): Promise<GeneralChatOutput | { error: string }> {
  try {
    const input: GeneralChatInput = { userInput, chatHistory };
    const result = await generalChat(input);
    return result;
  } catch (error) {
    console.error("Error in AI chat response:", error);
    return { error: "Falha ao obter resposta do assistente. Tente novamente mais tarde." };
  }
}
