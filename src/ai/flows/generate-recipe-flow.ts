
'use server';
/**
 * @fileOverview A Genkit flow to generate recipes for school meals.
 *
 * - generateRecipe - A function that handles the recipe generation process.
 */

import {ai} from '@/ai/genkit';
import { GenerateRecipeInputSchema, type GenerateRecipeInput, GenerateRecipeOutputSchema, type GenerateRecipeOutput } from '@/types'; // Importado de @/types

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  prompt: `Você é um chef de cozinha e nutricionista especializado em criar receitas para merenda escolar. Sua missão é elaborar receitas que sejam nutritivas, econômicas, fáceis de preparar em grande quantidade e, acima de tudo, saborosas para crianças e adolescentes.

Por favor, crie uma receita detalhada com base nas seguintes informações:

Ingredientes Principais: {{{mainIngredients}}}
Restrições Alimentares (se houver): {{#if dietaryRestrictions}}{{{dietaryRestrictions}}}{{else}}Nenhuma{{/if}}
Número de Alunos a Servir: {{{numberOfStudents}}}
{{#if mealType}}Tipo de Refeição: {{{mealType}}}{{/if}}

A receita deve incluir:
1.  **Nome da Receita**: Um nome criativo e apetitoso.
2.  **Descrição Curta**: Uma frase ou duas sobre o prato.
3.  **Lista de Ingredientes**: Com quantidades ajustadas para o número de alunos especificado. Apresente como uma lista de objetos, cada um com "name" e "quantity" (ex: { name: "Arroz branco", quantity: "5 kg" }).
4.  **Instruções de Preparo**: Um passo a passo claro e conciso, formatado em markdown para fácil leitura (use cabeçalhos, listas, negrito).
5.  **Tempo de Preparo Estimado**: (Opcional, se relevante)
6.  **Tempo de Cozimento Estimado**: (Opcional, se relevante)
7.  **Notas Nutricionais/Dicas**: (Opcional) Comente brevemente sobre os benefícios nutricionais ou dê dicas para variações ou aproveitamento de ingredientes.

Priorize ingredientes comuns e de baixo custo.
Evite ingredientes ultraprocessados sempre que possível.
Se for mencionada alguma restrição alimentar, garanta que a receita a cumpra rigorosamente.
Seja criativo e pense no paladar infantil!
`,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate recipe from AI model.');
    }
    return output;
  }
);
