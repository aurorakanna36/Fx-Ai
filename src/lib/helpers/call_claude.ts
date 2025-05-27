export async function callClaude({
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

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      aiModelName,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: base64Image,
              },
            },
          ],
        },
      ],
    }),
  });

  const data = await res.json();
  const text = data.content?.[0]?.text || "";

  return {
    recommendation: "Tunggu",
    explanation: text,
    confidence: "Sedang",
  };
}
