import { z } from "zod";
import { getDatabase } from "firebase-admin/database";
import { initializeApp } from "firebase-admin/app";
import { callAI } from "../../lib/universal-ai-provider";
import { getAIConfig } from "./get-ai-config";

initializeApp();

function getDefaultPersona(): string {
  return (
    "Anda adalah analis teknikal profesional. Berikan penjelasan logis dan ringkas " +
    "mengapa suatu rekomendasi trading dibuat berdasarkan analisis chart yang diberikan."
  );
}

export const ExplainTradingRecommendationInputSchema = z.object({
  chartDataUri: z
    .string()
    .describe(
      "A chart image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  recommendation: z
    .enum(["BUY", "SELL", "WAIT"])
    .describe("The trading recommendation (BUY, SELL, or WAIT)."),
});

export type ExplainTradingRecommendationInput = z.infer<
  typeof ExplainTradingRecommendationInputSchema
>;

export const ExplainTradingRecommendationOutputSchema = z.object({
  explanation: z
    .string()
    .describe("The explanation for the trading recommendation."),
  provider: z.string().optional().describe("AI provider used"),
  model: z.string().optional().describe("AI model used"),
});

export type ExplainTradingRecommendationOutput = z.infer<
  typeof ExplainTradingRecommendationOutputSchema
>;

export async function explainTradingRecommendation(
  input: ExplainTradingRecommendationInput
): Promise<ExplainTradingRecommendationOutput> {
  ExplainTradingRecommendationInputSchema.parse(input);

  try {
    const db = getDatabase();
    const snapshot = await db.ref("/ai_config").once("value");
    const config = await getAIConfig();

    const { aiModelName, apiKey: aiApiKey, aiPersona } = config;

    if (!aiApiKey) {
      throw new Error("Konfigurasi AI tidak ditemukan atau API Key tidak ada.");
    }

    const modelToUse = aiModelName;
    const personaToUse = aiPersona || getDefaultPersona();

    const userPrompt = `
Berdasarkan chart yang saya berikan, saya telah menerima rekomendasi untuk "${input.recommendation}".

Mohon jelaskan mengapa rekomendasi "${input.recommendation}" ini masuk akal berdasarkan:
1. Pola teknikal yang terlihat
2. Level support dan resistance
3. Indikator momentum
4. Trend yang sedang berlangsung
5. Risk/Reward ratio

Berikan penjelasan yang profesional namun mudah dipahami dalam bahasa Indonesia.`;

    const explanation = await callAI({
      apiKey: aiApiKey,
      model: modelToUse,
      persona: personaToUse,
      userPrompt,
    });

    return {
      explanation,
      provider: detectProviderFromApiKey(aiApiKey),
      model: modelToUse,
    };
  } catch (error) {
    console.error("Error explaining trading recommendation:", error);
    throw new Error(
      `Gagal menjelaskan rekomendasi: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

function detectProviderFromApiKey(
  apiKey: string
): "openrouter" | "gemini" | "openai" | "claude" | "llama" | "unknown" {
  if (apiKey.startsWith("sk-or-")) return "openrouter";
  if (apiKey.startsWith("AIza")) return "gemini";
  if (apiKey.startsWith("sk-")) return "openai";
  if (apiKey.startsWith("claude-")) return "claude";
  if (apiKey.startsWith("llama-")) return "llama";
  return "unknown";
}
