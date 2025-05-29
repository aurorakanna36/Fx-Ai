// src/app/api/set-ai-config/route.ts
import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, aiModelName, aiPersona } = body;
    console.log("daata", body);
    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { success: false, error: "API key wajib diisi" },
        { status: 400 }
      );
    }

    const config = {
      aiApiKey: apiKey,
      aiModelName: aiModelName || "gemini-1.5-flash",
      aiPersona: aiPersona || getDefaultPersona(),
      updatedAt: new Date().toISOString(),
    };

    await database.ref("/ai_config").set(config);

    return NextResponse.json({ success: true, config });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

function getDefaultPersona(): string {
  return (
    "Anda adalah seorang analis perdagangan Forex ahli. " +
    "Analisis gambar grafik Forex yang diberikan. " +
    "Berikan rekomendasi perdagangan (BUY, SELL, atau WAIT) dan penjelasan rinci. " +
    "Fokus pada pola teknikal, tren, support/resistance, dan risk/reward ratio."
  );
}
