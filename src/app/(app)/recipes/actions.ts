'use server';

import { generateRecipe, type GenerateRecipeInput, type GenerateRecipeOutput } from '@/ai/flows/generate-recipe-flow';

export async function getAiRecipe(
  input: GenerateRecipeInput
): Promise<GenerateRecipeOutput | { error: string }> {
  try {
    const result = await generateRecipe(input);
    return result;
  } catch (error) {
    console.error("Error in AI recipe generation:", error);
    let errorMessage = "Falha ao gerar receita com IA. Tente novamente mais tarde.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { error: errorMessage };
  }
}
