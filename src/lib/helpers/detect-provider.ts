// src/utils/detect-provider.ts

export function detectProviderFromApiKey(apiKey: string): string {
  if (apiKey.includes("deepseek")) return "deepseek";
  if (apiKey.includes("openrouter")) return "openrouter";
  if (apiKey.startsWith("sk-ant-")) return "claude";
  if (apiKey.startsWith("AIza")) return "gemini";
  if (apiKey.startsWith("sk-")) return "openai";
  return "unknown";
}

export const defaultModelsByProvider: Record<string, string> = {
  openai: "gpt-4-vision-preview",
  gemini: "gemini-1.5-flash",
  claude: "claude-3-sonnet-20240229",
  deepseek: "deepseek/deepseek-prover-v2:free",
  openrouter: "mistralai/mistral-7b-instruct",
};
