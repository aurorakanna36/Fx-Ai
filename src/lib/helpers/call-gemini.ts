export async function callGemini({
  apiKey,
  aiModelName,
  imageDataUri,
  prompt,
}: {
  apiKey: string;
  aiModelName: string;
  imageDataUri: string;
  prompt: string;
}) {
  const base64Image = imageDataUri.split(",")[1];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${aiModelName}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return {
    recommendation: "Tunggu",
    explanation: text,
    confidence: "Sedang",
  };
}
