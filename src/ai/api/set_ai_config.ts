import { onRequest } from "firebase-functions/v2/https";
import { getDatabase } from "firebase-admin/database";
import { initializeApp } from "firebase-admin/app";

// Inisialisasi Firebase Admin SDK jika belum
initializeApp();

export const set_ai_config = onRequest(async (req, res) => {
  const { aiModelName, aiApiKey, aiPersona } = req.body;

  if (!aiModelName || !aiApiKey) {
    res.status(400).send("Model dan API Key diperlukan");
    return;
  }

  const db = getDatabase();
  await db.ref("/ai_config").set({
    aiModelName,
    aiApiKey,
    aiPersona,
  });

  res.status(200).send("AI config disimpan.");
});
