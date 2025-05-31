// src/ai/flows/suggest-demand-adjustments.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to analyze historical consumption and delivery data
 * and suggest adjustments to the demand forecast.
 *
 * - suggestDemandAdjustments - A function that triggers the demand adjustment suggestions.
 * - SuggestDemandAdjustmentsInput - The input type for the suggestDemandAdjustments function.
 * - SuggestDemandAdjustmentsOutput - The return type for the suggestDemandAdjustments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDemandAdjustmentsInputSchema = z.object({
  consumptionHistory: z
    .string()
    .describe(
      'Historical consumption data, formatted as a string (e.g., JSON array of objects with date and quantity fields).'
    ),
  deliveryHistory: z
    .string()
    .describe(
      'Historical delivery data, formatted as a string (e.g., JSON array of objects with date, item, and quantity fields).'
    ),
  studentCount: z.number().describe('The current number of students.'),
});
export type SuggestDemandAdjustmentsInput = z.infer<typeof SuggestDemandAdjustmentsInputSchema>;

const SuggestDemandAdjustmentsOutputSchema = z.object({
  suggestedAdjustments: z
    .string()
    .describe(
      'A string containing the suggested adjustments to the demand forecast, with reasoning.'
    ),
});
export type SuggestDemandAdjustmentsOutput = z.infer<typeof SuggestDemandAdjustmentsOutputSchema>;

export async function suggestDemandAdjustments(
  input: SuggestDemandAdjustmentsInput
): Promise<SuggestDemandAdjustmentsOutput> {
  return suggestDemandAdjustmentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDemandAdjustmentsPrompt',
  input: {schema: SuggestDemandAdjustmentsInputSchema},
  output: {schema: SuggestDemandAdjustmentsOutputSchema},
  prompt: `You are an AI assistant that analyzes school food consumption and delivery data to suggest adjustments to demand forecasts.

Analyze the following data to identify patterns, seasonal variations, and potential issues (like overstocking or shortages).
Consider the number of students when making your suggestions.

Consumption History: {{{consumptionHistory}}}
Delivery History: {{{deliveryHistory}}}
Number of Students: {{{studentCount}}}

Based on this analysis, suggest concrete adjustments to the demand forecast, explaining your reasoning.
Focus on quantities of ingredients to order.

Format your response as a concise paragraph.
`, // Ensure prompt is well-formatted and clear
});

const suggestDemandAdjustmentsFlow = ai.defineFlow(
  {
    name: 'suggestDemandAdjustmentsFlow',
    inputSchema: SuggestDemandAdjustmentsInputSchema,
    outputSchema: SuggestDemandAdjustmentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
