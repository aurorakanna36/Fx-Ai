import { AIConfig } from "../../app/api/get-ai-config";

export const analyzeWithOpenAI = async (config: AIConfig, chartData: any) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      aiModelName: config.aiModelName,
      messages: [
        {
          role: "system",
          content: "You are a financial chart analysis assistant.",
        },
        {
          role: "user",
          content: `Analyze this chart: ${JSON.stringify(chartData)}`,
        },
      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
};
