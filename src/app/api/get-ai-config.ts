import { database } from "@/lib/firebase-admin";

export interface AIConfig {
  apiKey: string;
  aiModelName: string;
  aiPersona?: string;
}

export const getAIConfig = async (): Promise<AIConfig> => {
  const snapshot = await database.ref("/ai_config").once("value");
  const data = snapshot.val();
  console.log("🔥 Snapshot dari /ai_config:", data);
  if (!data || !data.aiApiKey) {
    return {
      apiKey: process.env.DEFAULT_AI_KEY || "",
      aiModelName: "gemini-1.5-flash",
      aiPersona: getDefaultPersona(),
    };
  }

  return {
    apiKey: data.aiApiKey,
    aiModelName: data.aiModelName || "gemini-1.5-flash",
    aiPersona: data.aiPersona || getDefaultPersona(),
  };
};

function getDefaultPersona(): string {
  return (
    "Anda adalah seorang analis perdagangan Forex ahli. " +
    "Analisis gambar grafik Forex yang diberikan. " +
    "Berikan rekomendasi perdagangan (BUY, SELL, atau WAIT) dan penjelasan rinci. " +
    "Fokus pada pola teknikal, tren, support/resistance, dan risk/reward ratio."
  );
}
