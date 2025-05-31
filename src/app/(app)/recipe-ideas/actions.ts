
"use server";
// Copiado de /src/app/(app)/forecasting/actions.ts
// Este arquivo usará o generalChatFlow para o chat de ideias de receitas.

import { generalChat, type GeneralChatInput, type GeneralChatOutput } from '@/ai/flows/general-chat-flow';
import type { ChatMessage } from '@/types';

export async function getRecipeChatResponse(userInput: string, chatHistory?: ChatMessage[]): Promise<GeneralChatOutput | { error: string }> {
  try {
    // O prompt do sistema no generalChatFlow é genérico o suficiente.
    // Se uma especialização maior for necessária, um novo fluxo pode ser criado,
    // mas por enquanto, o usuário pode guiar a conversa para receitas.
    const input: GeneralChatInput = { 
      userInput: `Gostaria de ideias de receitas. ${userInput}`, // Adicionando contexto ao input do usuário
      chatHistory 
    };
    const result = await generalChat(input);
    return result;
  } catch (error) {
    console.error("Error in AI recipe idea chat response:", error);
    return { error: "Falha ao obter resposta do assistente culinário. Tente novamente mais tarde." };
  }
}
