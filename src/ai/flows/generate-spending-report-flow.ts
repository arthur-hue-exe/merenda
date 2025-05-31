
'use server';
/**
 * @fileOverview Generates a spending report based on consumption and stock data.
 *
 * - generateSpendingReport - A function that triggers the spending report generation.
 * - GenerateSpendingReportInput - The input type for the function.
 * - GenerateSpendingReportOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ConsumptionRecord, StockItem } from '@/types'; // Assuming types are defined

const GenerateSpendingReportInputSchema = z.object({
  consumptionRecordsJSON: z
    .string()
    .describe(
      'A JSON string of consumption records. Each record should include items with costAtTimeOfConsumption and a totalCost for the record.'
    ),
  stockItemsJSON: z
    .string()
    .describe(
      'A JSON string of stock items. Each item should include its current cost.'
    ),
  startDate: z.string().optional().describe('Optional start date for filtering consumption data (YYYY-MM-DD).'),
  endDate: z.string().optional().describe('Optional end date for filtering consumption data (YYYY-MM-DD).'),
});
export type GenerateSpendingReportInput = z.infer<typeof GenerateSpendingReportInputSchema>;

const GenerateSpendingReportOutputSchema = z.object({
  reportText: z.string().describe('The generated spending report text.'),
});
export type GenerateSpendingReportOutput = z.infer<typeof GenerateSpendingReportOutputSchema>;

export async function generateSpendingReport(
  input: GenerateSpendingReportInput
): Promise<GenerateSpendingReportOutput> {
  return generateSpendingReportFlow(input);
}

const promptTemplate = `
Você é um analista financeiro especializado em custos de merenda escolar.
Sua tarefa é gerar um relatório de gastos conciso e informativo com base nos dados de consumo e estoque fornecidos.

Dados de Consumo (filtrados por data, se aplicável):
{{{consumptionRecords}}}

Dados de Estoque (para referência de custos atuais, se necessário):
{{{stockItems}}}

Período do Relatório (se fornecido):
Início: {{{startDate}}}
Fim: {{{endDate}}}

Analise os dados de consumo. Calcule o gasto total no período.
Identifique os itens mais consumidos e os itens de maior custo.
Destaque quaisquer padrões interessantes ou anomalias nos gastos.
Forneça um resumo dos gastos.

O relatório deve ser claro, fácil de entender e formatado em markdown.
Inclua:
1.  **Resumo Geral dos Gastos**:
    *   Gasto Total no Período: R$ [Total]
    *   Número de Registros de Consumo: [Contagem]
    *   Custo Médio por Registro de Consumo: R$ [Média] (se aplicável)
2.  **Itens Mais Relevantes**:
    *   Liste os 5 itens mais consumidos (por quantidade total).
    *   Liste os 5 itens que geraram maior custo total.
3.  **Análise e Observações**:
    *   Breve análise sobre os padrões de gastos.
    *   Quaisquer observações ou sugestões (opcional, se os dados permitirem).

Se não houver dados de consumo para o período, informe isso claramente.
`;

const generateSpendingReportFlow = ai.defineFlow(
  {
    name: 'generateSpendingReportFlow',
    inputSchema: GenerateSpendingReportInputSchema,
    outputSchema: GenerateSpendingReportOutputSchema,
  },
  async (input) => {
    let consumptionRecords: ConsumptionRecord[] = [];
    try {
      consumptionRecords = JSON.parse(input.consumptionRecordsJSON);
    } catch (e) {
      console.error("Error parsing consumptionRecordsJSON:", e);
      return { reportText: "Erro: Não foi possível processar os dados de consumo." };
    }

    let filteredConsumptionRecords = consumptionRecords;
    if (input.startDate || input.endDate) {
      filteredConsumptionRecords = consumptionRecords.filter(record => {
        const recordDate = new Date(record.date);
        const start = input.startDate ? new Date(input.startDate) : null;
        const end = input.endDate ? new Date(input.endDate) : null;
        if (start && recordDate < start) return false;
        if (end) {
            const dayAfterEnd = new Date(end); // end date is inclusive
            dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);
            if (recordDate >= dayAfterEnd) return false;
        }
        return true;
      });
    }
    
    if (filteredConsumptionRecords.length === 0) {
        return { reportText: "Nenhum dado de consumo encontrado para o período selecionado." };
    }

    const llmResponse = await ai.generate({
      prompt: promptTemplate,
      // model: 'googleai/gemini-1.5-flash-latest',
      params: {
        consumptionRecords: JSON.stringify(filteredConsumptionRecords, null, 2),
        stockItems: input.stockItemsJSON, // Passar como string mesmo que não seja usado diretamente no template, pode ser útil para o modelo
        startDate: input.startDate || "N/A",
        endDate: input.endDate || "N/A",
      },
      config: {
        // temperature: 0.3,
      },
    });

    return { reportText: llmResponse.text };
  }
);
