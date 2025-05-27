import * as functions from "firebase-functions";
import { getDatabase } from "firebase-admin/database";
import { initializeApp } from "firebase-admin/app";
import { getAIConfig } from "./get-ai-config";

initializeApp();

export const migrateAiConfig = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const db = getDatabase();
    const snapshot = await db.ref("/ai_config").once("value");
    const currentConfig = await getAIConfig();

    const { aiModelName, apiKey, aiPersona } = currentConfig;

    // Jika sudah dalam format baru (punya aiApiKey), tidak perlu migrasi
    if (snapshot.exists() && snapshot.val().aiApiKey) {
      res.status(200).json({
        success: true,
        message: "Konfigurasi sudah dalam format baru",
        migrated: false,
      });
    }

    const migratedConfig = {
      aiApiKey: apiKey,
      aiModelName: aiModelName || getDefaultModel(),
      aiPersona: aiPersona || getDefaultPersona(),
      updatedAt: new Date().toISOString(),
      migratedFrom: "legacy",
    };

    await db.ref("/ai_config").set(migratedConfig);

    res.status(200).json({
      success: true,
      message: "Konfigurasi berhasil dimigrasi ke format baru",
      migrated: true,
      config: {
        aiModelName: migratedConfig.aiModelName,
        hasApiKey: !!migratedConfig.aiApiKey,
      },
    });

    console.log(
      `✅ Konfigurasi dimigrasi ke model: ${migratedConfig.aiModelName}`
    );
  } catch (error) {
    console.error("❌ Migration error:", error);
    res.status(500).json({
      success: false,
      error: "Gagal melakukan migrasi konfigurasi",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

function getDefaultModel(): string {
  return "gemini-1.5-flash";
}

function getDefaultPersona(): string {
  return (
    "Anda adalah seorang analis perdagangan Forex ahli. " +
    "Analisis gambar grafik Forex yang diberikan. " +
    "Berikan rekomendasi perdagangan (BUY, SELL, atau WAIT) dan penjelasan rinci. " +
    "Fokus pada pola teknikal, tren, support/resistance, dan risk/reward ratio."
  );
}
