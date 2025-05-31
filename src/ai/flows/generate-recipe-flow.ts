'use server';
/**
 * @fileOverview A Genkit flow to generate recipes for school meals.
 *
 * - generateRecipe - A function that handles the recipe generation process.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
