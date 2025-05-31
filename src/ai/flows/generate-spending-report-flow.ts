
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
Você é um analista financeiro e consultor de gestão experiente, especializado em custos de merenda escolar e otimização de recursos.
Sua tarefa é gerar um relatório de gastos detalhado, perspicaz e acionável, com base nos dados de consumo e estoque fornecidos.

Dados de Consumo (filtrados por data, se aplicável):
{{{consumptionRecords}}}

Dados de Estoque (para referência de custos atuais e análise de inventário):
{{{stockItems}}}

Período do Relatório (se fornecido):
Início: {{{startDate}}}
Fim: {{{endDate}}}

**Análise Detalhada Requerida:**
1.  **Análise de Consumo e Custos:**
    *   Calcule o gasto total no período.
    *   Identifique os 5-10 itens mais consumidos em quantidade.
    *   Identifique os 5-10 itens que geraram o maior custo total.
    *   Calcule o custo médio por refeição/aluno (se o número de alunos estiver implícito ou puder ser inferido do consumo, caso contrário, mencione essa limitação).
2.  **Padrões e Tendências:**
    *   Destaque quaisquer padrões de consumo sazonais ou tendências de aumento/diminuição de custos para itens específicos.
    *   Identifique anomalias: gastos inesperadamente altos, consumo muito baixo de itens comprados em grande quantidade, etc.
    *   Analise a relação entre o custo unitário dos itens em estoque e seu volume de consumo. Existem itens caros com alto consumo que poderiam ser revistos?
3.  **Análise de Estoque (se relevante para os custos):**
    *   Comente brevemente se os níveis de estoque atuais parecem adequados em relação ao consumo, focando em itens de alto custo ou alto volume.
    *   Existem sinais de possível desperdício por vencimento (itens com muita quantidade e próxima validade, se essa info estiver disponível implicitamente nos dados de estoque e consumo)?

**Formato do Relatório (Markdown):**
O relatório deve ser claro, bem estruturado, fácil de entender e formatado em markdown.

**Seções Mandatórias:**

I.  **Resumo Executivo dos Gastos**
    *   Período Analisado: [dd/mm/aaaa] a [dd/mm/aaaa] (ou "Todos os Dados Disponíveis")
    *   Gasto Total no Período: R$ [Total]
    *   Número de Registros de Consumo Considerados: [Contagem]
    *   Custo Médio por Registro de Consumo: R$ [Média] (se aplicável)
    *   Principais Destaques: (2-3 pontos chave da análise)

II. **Análise Detalhada de Custos e Consumo**
    *   **Itens de Maior Impacto Financeiro (Top 5-10)**: Lista com Nome do Item, Custo Total Gerado, Quantidade Consumida.
    *   **Itens Mais Consumidos em Volume (Top 5-10)**: Lista com Nome do Item, Quantidade Total Consumida, Custo Unitário Médio (se disponível).
    *   **Observações sobre Padrões de Consumo**: Análise de tendências, sazonalidade, etc.

III. **Observações e Recomendações Práticas**
    *   Análise crítica sobre os padrões de gastos.
    *   **Sugestões de Otimização de Custos**: Recomendações específicas e acionáveis. Por exemplo:
        *   "Considerar negociação com fornecedores para os itens X e Y devido ao alto volume de compra e custo."
        *   "Avaliar a substituição do item Z por uma alternativa mais econômica e nutricionalmente similar, como W."
        *   "Analisar o consumo do item A, que parece baixo em relação ao estoque, para evitar perdas."
    *   **Áreas para Investigação Adicional**: Pontos que merecem uma análise mais aprofundada pela gestão.

IV. **Conclusão Geral**
    *   Breve fechamento sobre a saúde financeira da merenda no período.

**Notas Importantes:**
*   Se não houver dados de consumo para o período, informe isso claramente no início do relatório.
*   Seja específico em suas análises e recomendações. Evite generalidades.
*   Use os dados fornecidos para embasar todas as suas conclusões.
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
      return { reportText: "Erro: Não foi possível processar os dados de consumo. Verifique o formato do JSON." };
    }

    let filteredConsumptionRecords = consumptionRecords;
    if (input.startDate || input.endDate) {
      filteredConsumptionRecords = consumptionRecords.filter(record => {
        try {
            const recordDate = new Date(record.date);
            // Adjust dates to ignore time and timezone issues for simple day comparison
            const recordDateOnly = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());

            if (input.startDate) {
                const startDateOnly = new Date(new Date(input.startDate).getFullYear(), new Date(input.startDate).getMonth(), new Date(input.startDate).getDate());
                if (recordDateOnly < startDateOnly) return false;
            }
            if (input.endDate) {
                const endDateOnly = new Date(new Date(input.endDate).getFullYear(), new Date(input.endDate).getMonth(), new Date(input.endDate).getDate());
                if (recordDateOnly > endDateOnly) return false; // end date is inclusive
            }
            return true;
        } catch (dateError) {
            console.warn("Skipping record due to invalid date format:", record.date, dateError);
            return false;
        }
      });
    }
    
    if (filteredConsumptionRecords.length === 0 && (input.startDate || input.endDate)) {
        return { reportText: "Nenhum dado de consumo encontrado para o período selecionado." };
    }
    if (consumptionRecords.length === 0 && !(input.startDate || input.endDate)) {
        return { reportText: "Nenhum dado de consumo disponível para gerar o relatório." };
    }


    const llmResponse = await ai.generate({
      prompt: promptTemplate,
      // model: 'googleai/gemini-1.5-flash-latest', // Model is defined in genkit.ts
      params: {
        consumptionRecords: JSON.stringify(filteredConsumptionRecords, null, 2),
        stockItems: input.stockItemsJSON,
        startDate: input.startDate ? new Date(input.startDate).toLocaleDateString('pt-BR') : "N/A",
        endDate: input.endDate ? new Date(input.endDate).toLocaleDateString('pt-BR') : "N/A",
      },
      config: {
        temperature: 0.5, // Slightly lower for more factual report
        // maxOutputTokens: 1500, // Increased for potentially longer reports
      },
    });

    return { reportText: llmResponse.text };
  }
);
