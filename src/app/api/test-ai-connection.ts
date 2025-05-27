import * as functions from "firebase-functions";
import { callAI } from "../../lib/universal-ai-provider";

export const testAiConnection = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { apiKey, aiModelName } = req.body;

  if (!apiKey || !aiModelName) {
    res.status(400).json({ error: "API key dan model diperlukan." });
    return;
  }

  try {
    const response = await Promise.race([
      callAI({
        apiKey,
        model: aiModelName,
        persona: "You are a helpful AI assistant.",
        userPrompt: "Ketik: Test berhasil.",
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 10000)
      ),
    ]);

    res.status(200).json({
      success: true,
      message: "Koneksi berhasil ✅",
      testResponse: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
