import { getDatabase } from "firebase-admin/database";
import { initializeApp } from "firebase-admin/app";
import { callAI, getDefaultModel } from "../lib/universal-ai-provider";
import type { AIMessage } from "../lib/universal-ai-provider";
initializeApp();

import * as functions from "firebase-functions";
export const analyzise = functions.https.onRequest(async (req, res) => {
  try {
    const { chartData, chartImageUri } = req.body;

    if (!chartData && !chartImageUri) {
      res
        .status(400)
        .json({ error: "chartData atau chartImageUri diperlukan." });
      return;
    }

    const db = getDatabase();
    const snapshot = await db.ref("/ai_config").once("value");
    const config = snapshot.val();

    if (!config || !config.aiApiKey) {
      res.status(500).json({
        error: "Konfigurasi AI tidak ditemukan atau API Key tidak ada.",
      });
      return;
    }

    const { aiModelName, aiApiKey, aiPersona } = config;
    const modelToUse = aiModelName || getDefaultModel(aiApiKey);

    const systemPrompt =
      aiPersona ||
      "Anda adalah seorang analis perdagangan Forex ahli. Analisis gambar grafik Forex yang diberikan. " +
        "Berikan rekomendasi perdagangan (BUY, SELL, atau WAIT) dan penjelasan rinci mengenai alasan Anda. " +
        "Fokus pada wawasan yang jelas dan dapat ditindaklanjuti. " +
        "Format respons Anda sebagai JSON dengan struktur: " +
        '{"recommendation": "BUY/SELL/WAIT", "explanation": "penjelasan detail", "confidence": "tinggi/sedang/rendah"}';

    let userPrompt = "";
    if (chartImageUri) {
      userPrompt =
        "Analisis chart Forex dalam gambar ini dan berikan rekomendasi trading.";
    } else if (chartData) {
      userPrompt = `Analisis data chart Forex berikut dan berikan rekomendasi trading: ${JSON.stringify(
        chartData
      )}`;
    }

    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];
    const aiResponse = await callAI(
      aiApiKey,
      modelToUse,
      messages,
      chartImageUri
    );

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      const recommendation = extractRecommendation(aiResponse);
      parsedResponse = {
        recommendation,
        explanation: aiResponse,
        confidence: "sedang",
      };
    }

    res.status(200).json({
      success: true,
      result: parsedResponse,
      provider: detectProviderName(aiApiKey),
      model: modelToUse,
    });
  } catch (error) {
    console.error("Gagal menganalisis chart:", error);
    res.status(500).json({
      error: "Gagal menganalisis chart.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

function extractRecommendation(text: string): "BUY" | "SELL" | "WAIT" {
  const upperText = text.toUpperCase();
  if (upperText.includes("BUY") || upperText.includes("BELI")) return "BUY";
  if (upperText.includes("SELL") || upperText.includes("JUAL")) return "SELL";
  return "WAIT";
}

function detectProviderName(apiKey: string): string {
  if (
    apiKey.startsWith("sk-") &&
    !apiKey.includes("deepseek") &&
    !apiKey.startsWith("sk-ant-")
  )
    return "OpenAI";
  if (apiKey.startsWith("AIza")) return "Google Gemini";
  if (apiKey.startsWith("sk-") && apiKey.includes("deepseek"))
    return "DeepSeek";
  if (apiKey.startsWith("sk-ant-")) return "Anthropic Claude";
  return "Unknown";
}
