// src/lib/universal-ai-provider.ts

export async function callAI({
  apiKey,
  model,
  persona,
  userPrompt,
}: {
  apiKey: string;
  model: string;
  persona: string;
  userPrompt: string;
}) {
  const provider = detectProvider(apiKey);

  switch (provider) {
    case "openrouter":
      return await callOpenRouter({ apiKey, model, persona, userPrompt });
    case "openai":
      return await callOpenAI({ apiKey, model, persona, userPrompt });
    case "gemini":
      return await callGemini({ apiKey, persona, userPrompt });
    case "claude":
      return await callClaude({ apiKey, model, persona, userPrompt });
    case "llama":
      return await callLlamaAPI({ apiKey, model, persona, userPrompt });
    default:
      throw new Error("Provider tidak dikenali. Periksa API Key.");
  }
}

function detectProvider(apiKey: string): string {
  if (apiKey.startsWith("sk-or-")) return "openrouter";
  if (apiKey.startsWith("sk-")) return "openai";
  if (apiKey.startsWith("AIza")) return "gemini";
  if (apiKey.startsWith("claude-")) return "claude";
  if (apiKey.startsWith("llama-")) return "llama";
  return "unknown";
}

export async function callOpenRouter({
  apiKey,
  model,
  persona,
  userPrompt,
}: any) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://your-site.com",
      "X-Title": "Fx AI Trader",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: persona },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || JSON.stringify(data));
  return data.choices?.[0]?.message?.content;
}

export async function callOpenAI({ apiKey, model, persona, userPrompt }: any) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: persona },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || JSON.stringify(data));
  return data.choices?.[0]?.message?.content;
}

export async function callGemini({ apiKey, persona, userPrompt }: any) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: persona + "\n" + userPrompt }],
          },
        ],
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Gagal panggil Gemini");
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Tidak ada respon dari Gemini");
  return text;
}

export async function callClaude({ apiKey, model, persona, userPrompt }: any) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{ role: "user", content: persona + "\n" + userPrompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || JSON.stringify(data));
  return data.content?.[0]?.text;
}

export async function callLlamaAPI({
  apiKey,
  model,
  persona,
  userPrompt,
}: any) {
  const res = await fetch("https://api.llama.meta.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: persona },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || JSON.stringify(data));
  return data.choices?.[0]?.message?.content;
}
