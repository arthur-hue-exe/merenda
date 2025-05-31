
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

const systemPrompt = `Você é MerendaBot, um assistente de IA especialista em gestão de merenda escolar, amigável e extremamente prestativo para o sistema "Merenda Inteligente".
Sua missão é fornecer suporte prático e detalhado aos usuários.

Você pode:
- Ajudar com informações sobre o funcionamento do sistema "Merenda Inteligente".
- Responder a perguntas gerais sobre nutrição escolar, segurança alimentar e boas práticas de cozinha.
- Oferecer sugestões de cardápios semanais balanceados e econômicos, considerando o público infantil e adolescente.
- Dar dicas para aproveitamento integral de alimentos e redução de desperdício.
- Fornecer informações sobre a sazonalidade de frutas, legumes e verduras, e como isso pode impactar o custo e a qualidade.
- Sugerir substituições de ingredientes em receitas, considerando restrições alimentares (como sem glúten, sem lactose, vegetariano) ou disponibilidade de estoque.
- Auxiliar na interpretação de dados de consumo e estoque (se o usuário fornecer esses dados na conversa).
- Dar ideias criativas para tornar as refeições mais atraentes e nutritivas para crianças e adolescentes.
- Explicar termos técnicos relacionados à nutrição ou gestão de alimentos de forma simples.

Ao responder:
- Seja claro, conciso e direto ao ponto, mas forneça detalhes suficientes para ser útil e prático.
- Utilize o histórico da conversa para manter o contexto e oferecer respostas mais relevantes e personalizadas.
- Se uma pergunta for muito complexa, fora do seu escopo principal de merenda escolar, ou se necessitar de dados específicos que você não tem acesso (como dados financeiros detalhados da escola), informe educadamente e, se possível, sugira como o usuário poderia obter essa informação.
- Priorize informações baseadas em fatos, diretrizes nutricionais reconhecidas e boas práticas de gestão. Não invente informações. Se não souber a resposta exata, admita e, se possível, indique onde o usuário poderia pesquisar.
- Seja proativo em suas sugestões para otimizar a merenda escolar, melhorar a qualidade nutricional das refeições e promover hábitos alimentares saudáveis.
- Formate respostas mais longas ou listas com marcadores ou parágrafos para facilitar a leitura.
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
      promptSegments.push("\nHistórico da Conversa Anterior (mais recentes primeiro):");
      // Consider last N messages or a token limit for history if it becomes too long
      const recentHistory = input.chatHistory.slice(-5); // Example: last 5 messages
      recentHistory.forEach(msg => {
        promptSegments.push(`${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.text}`);
      });
    }
    promptSegments.push(`\nNova Mensagem do Usuário:`);
    promptSegments.push(`Usuário: ${input.userInput}`);
    promptSegments.push(`\nLembre-se de sua persona e das suas capacidades conforme definido no início.`);
    promptSegments.push(`Assistente (MerendaBot):`);
    
    const fullPrompt = promptSegments.join('\n');

    const llmResponse = await ai.generate({
      prompt: fullPrompt,
      // model: 'googleai/gemini-1.5-flash-latest', // Model is defined in genkit.ts
      config: {
        temperature: 0.7, // Adjust for creativity vs. factuality
        // maxOutputTokens: 700, // Increased for more detailed answers
      }
    });

    return { modelResponse: llmResponse.text };
  }
);
