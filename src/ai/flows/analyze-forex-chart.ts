// src/ai/flows/analyze-forex-chart.ts
'use server';

/**
 * @fileOverview Analyzes a Forex chart image and provides a trading recommendation (Buy, Sell, or Wait) with reasoning.
 *
 * - analyzeForexChart - A function that handles the Forex chart analysis process.
 * - AnalyzeForexChartInput - The input type for the analyzeForexChart function.
 * - AnalyzeForexChartOutput - The return type for the analyzeForexChart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeForexChartInputSchema = z.object({
  chartDataUri: z
    .string()
    .describe(
      "A Forex chart image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeForexChartInput = z.infer<typeof AnalyzeForexChartInputSchema>;

const AnalyzeForexChartOutputSchema = z.object({
  recommendation: z
    .enum(['Buy', 'Sell', 'Wait'])
    .describe('The trading recommendation: Buy, Sell, or Wait.'),
  reasoning: z.string().describe('The AI reasoning behind the recommendation.'),
});
export type AnalyzeForexChartOutput = z.infer<typeof AnalyzeForexChartOutputSchema>;

export async function analyzeForexChart(
  input: AnalyzeForexChartInput
): Promise<AnalyzeForexChartOutput> {
  return analyzeForexChartFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeForexChartPrompt',
  input: {schema: AnalyzeForexChartInputSchema},
  output: {schema: AnalyzeForexChartOutputSchema},
  prompt: `You are an expert Forex trading analyst. Analyze the provided Forex chart image and provide a trading recommendation (Buy, Sell, or Wait) along with a detailed explanation of your reasoning.

Chart Image: {{media url=chartDataUri}}

Provide the output in JSON format.
`,
});

const analyzeForexChartFlow = ai.defineFlow(
  {
    name: 'analyzeForexChartFlow',
    inputSchema: AnalyzeForexChartInputSchema,
    outputSchema: AnalyzeForexChartOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
