import * as functions from "firebase-functions";
import { getDatabase } from "firebase-admin/database";
import { initializeApp } from "firebase-admin/app";

initializeApp();

export const analyzise = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { apiKey, aiModelName, aiPersona } = req.body;

    if (!apiKey || typeof apiKey !== "string") {
      res.status(400).json({
        success: false,
        error: "API key diperlukan dan harus berupa string.",
      });
      return;
    }

    const db = getDatabase();
    const config = {
      aiApiKey: apiKey,
      aiModelName: aiModelName?.trim() || "gemini-1.5-flash",
      aiPersona: aiPersona?.trim() || getDefaultPersona(),
      updatedAt: new Date().toISOString(),
      updatedBy: req.ip || "unknown",
    };

    await db.ref("/ai_config").set(config);

    res.status(200).json({
      success: true,
      message: "Konfigurasi AI berhasil disimpan",
      config,
    });

    console.log(`✅ AI config updated: ${config.aiModelName}`);
  } catch (error) {
    console.error("❌ Error saving AI config:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menyimpan konfigurasi AI",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

function getDefaultPersona(): string {
  return (
    "Anda adalah seorang analis perdagangan Forex ahli. " +
    "Analisis gambar grafik Forex yang diberikan. " +
    "Berikan rekomendasi perdagangan (BUY, SELL, atau WAIT) dan penjelasan rinci. " +
    "Fokus pada pola teknikal, tren, support/resistance, dan risk/reward ratio."
  );
}
