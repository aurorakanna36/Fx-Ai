// src/app/api/analyze-chart/route.ts
import { getAIConfig } from "../get-ai-config";
import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/universal-ai-provider";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { chartImageUri, chartData } = body;

  if (!chartImageUri && !chartData) {
    return NextResponse.json(
      { error: "chartImageUri atau chartData diperlukan" },
      { status: 400 }
    );
  }

  try {
    const config = await getAIConfig();
    const modelToUse = config.aiModelName;
    const apiKey = config.apiKey;
    const systemPrompt = config.aiPersona || getDefaultPersona();

    const userPrompt = chartImageUri
      ? "Tolong analisis gambar chart ini dan berikan rekomendasi perdagangan."
      : `Tolong analisis data chart berikut: ${JSON.stringify(chartData)}`;

    const rawResponse = await callAI({
      apiKey,
      model: modelToUse,
      persona: systemPrompt,
      userPrompt,
    });

    let parsed;
    try {
      parsed = JSON.parse(rawResponse);
    } catch {
      parsed = {
        recommendation: extractRecommendation(rawResponse),
        explanation: rawResponse,
        confidence: "sedang",
      };
    }

    return NextResponse.json({
      success: true,
      result: parsed,
      aiModelName: modelToUse,
    });
  } catch (error) {
    console.error("❌ Error analyzing chart:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat menganalisis chart",
        detail: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

function extractRecommendation(text: string): "BUY" | "SELL" | "WAIT" {
  const upper = text.toUpperCase();
  if (upper.includes("BUY") || upper.includes("BELI")) return "BUY";
  if (upper.includes("SELL") || upper.includes("JUAL")) return "SELL";
  return "WAIT";
}

function getDefaultPersona(): string {
  return (
    "Anda adalah seorang analis perdagangan Forex ahli. " +
    "Analisis gambar grafik Forex yang diberikan. " +
    "Berikan rekomendasi perdagangan (BUY, SELL, atau WAIT) dan penjelasan rinci. " +
    "Fokus pada pola teknikal, tren, support/resistance, dan risk/reward ratio."
  );
}
