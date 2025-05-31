
'use server';
/**
 * @fileOverview A general purpose AI chat flow.
 *
 * - generalChat - A function that handles general chat interactions.
 * - GeneralChatInput - The input type for the generalChat function.
 * - GeneralChatOutput - The return type for the generalChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {ChatMessage} from '@/types'; // Import ChatMessage type

const GeneralChatInputSchema = z.object({
  userInput: z.string().describe('The latest message from the user.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string(),
  })).optional().describe('The history of the conversation so far.'),
});
export type GeneralChatInput = z.infer<typeof GeneralChatInputSchema>;

const GeneralChatOutputSchema = z.object({
  modelResponse: z.string().describe('The AI model\'s response to the user.'),
});
export type GeneralChatOutput = z.infer<typeof GeneralChatOutputSchema>;

export async function generalChat(input: GeneralChatInput): Promise<GeneralChatOutput> {
  return generalChatFlow(input);
}

const systemPrompt = `Você é MerendaBot, um assistente de IA amigável e prestativo para o sistema "Merenda Inteligente".
Seu objetivo é ajudar os usuários com informações sobre o sistema, responder a perguntas gerais e auxiliar em tarefas relacionadas à gestão de merenda escolar.
Mantenha suas respostas concisas e úteis. Você pode usar informações de um histórico de chat fornecido.
Se uma pergunta for muito complexa ou fora do seu escopo, informe educadamente.
Não invente informações. Se não souber a resposta, diga que não sabe.
`;

const generalChatFlow = ai.defineFlow(
  {
    name: 'generalChatFlow',
    inputSchema: GeneralChatInputSchema,
    outputSchema: GeneralChatOutputSchema,
  },
  async (input) => {
    let promptSegments = [systemPrompt];

    if (input.chatHistory && input.chatHistory.length > 0) {
      promptSegments.push("\nHistórico da Conversa Anterior:");
      input.chatHistory.forEach(msg => {
        promptSegments.push(`${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.text}`);
      });
    }
    promptSegments.push(`\nUsuário: ${input.userInput}`);
    promptSegments.push(`Assistente:`);
    
    const fullPrompt = promptSegments.join('\n');

    const llmResponse = await ai.generate({
      prompt: fullPrompt,
      // model: 'googleai/gemini-1.5-flash-latest', // Ou o modelo configurado em genkit.ts
      config: {
        // temperature: 0.7, // Ajuste conforme necessário
        // maxOutputTokens: 500,
      }
    });

    return { modelResponse: llmResponse.text };
  }
);
