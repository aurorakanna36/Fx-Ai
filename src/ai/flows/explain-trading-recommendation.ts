// 'use server'
'use server';

/**
 * @fileOverview Explains the reasoning behind a trading recommendation.
 *
 * - explainTradingRecommendation - A function that explains the trading recommendation.
 * - ExplainTradingRecommendationInput - The input type for the explainTradingRecommendation function.
 * - ExplainTradingRecommendationOutput - The return type for the explainTradingRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainTradingRecommendationInputSchema = z.object({
  chartDataUri: z
    .string()
    .describe(
      "A chart image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  recommendation: z
    .enum(['BUY', 'SELL', 'WAIT'])
    .describe('The trading recommendation (BUY, SELL, or WAIT).'),
});
export type ExplainTradingRecommendationInput = z.infer<
  typeof ExplainTradingRecommendationInputSchema
>;

const ExplainTradingRecommendationOutputSchema = z.object({
  explanation: z
    .string()
    .describe('The explanation for the trading recommendation.'),
});
export type ExplainTradingRecommendationOutput = z.infer<
  typeof ExplainTradingRecommendationOutputSchema
>;

export async function explainTradingRecommendation(
  input: ExplainTradingRecommendationInput
): Promise<ExplainTradingRecommendationOutput> {
  return explainTradingRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainTradingRecommendationPrompt',
  input: {schema: ExplainTradingRecommendationInputSchema},
  output: {schema: ExplainTradingRecommendationOutputSchema},
  prompt: `You are an AI assistant that analyzes forex charts and provides trading recommendations and explanations.

  Based on the provided chart and your recommendation, explain the reasoning behind your recommendation.

  Chart: {{media url=chartDataUri}}
  Recommendation: {{{recommendation}}}
  Explanation: `,
});

const explainTradingRecommendationFlow = ai.defineFlow(
  {
    name: 'explainTradingRecommendationFlow',
    inputSchema: ExplainTradingRecommendationInputSchema,
    outputSchema: ExplainTradingRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
