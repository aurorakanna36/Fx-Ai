// hooks/use-ai-config.ts - React hook untuk mengelola konfigurasi AI
"use client";

import { useState, useEffect, useCallback } from "react";

export interface AIConfig {
  provider: "openai" | "gemini" | "deepseek" | "claude";
  aiModelName: string;
  aiPersona: string;
  hasApiKey: boolean;
  isConfigured: boolean;
  updatedAt: string | null;
  apiKeyMask: string | null;
}

export interface AIConfigUpdate {
  provider: string;
  apiKey: string;
  aiModelName?: string;
  aiPersona?: string;
}

interface UseAIConfigReturn {
  config: AIConfig | null;
  loading: boolean;
  error: string | null;
  fetchConfig: () => Promise<void>;
  updateConfig: (update: AIConfigUpdate) => Promise<boolean>;
  testConnection: (
    provider: string,
    apiKey: string,
    aiModelName?: string
  ) => Promise<boolean>;
  migrateConfig: () => Promise<boolean>;
}

export function useAIConfig(): UseAIConfigReturn {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/get-ai-config");
      const data = await response.json();

      if (data.success) {
        setConfig(data.config);
      } else {
        setError(data.error || "Gagal memuat konfigurasi");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memuat konfigurasi");
      console.error("Error fetching AI config:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(
    async (update: AIConfigUpdate): Promise<boolean> => {
      try {
        setError(null);

        const response = await fetch("/api/set-ai-config", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(update),
        });

        const data = await response.json();

        if (data.success) {
          // Refresh config after update
          await fetchConfig();
          return true;
        } else {
          setError(data.error || "Gagal menyimpan konfigurasi");
          return false;
        }
      } catch (err) {
        setError("Terjadi kesalahan saat menyimpan konfigurasi");
        console.error("Error updating AI config:", err);
        return false;
      }
    },
    [fetchConfig]
  );

  const testConnection = useCallback(
    async (
      provider: string,
      apiKey: string,
      aiModelName?: string
    ): Promise<boolean> => {
      try {
        setError(null);

        const response = await fetch("/api/test-ai-connection", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            provider,
            apiKey,
            aiModelName: aiModelName || getDefaultModel(provider),
          }),
        });

        const data = await response.json();

        if (!data.success) {
          setError(data.error || "Test koneksi gagal");
          return false;
        }

        return true;
      } catch (err) {
        setError("Terjadi kesalahan saat test koneksi");
        console.error("Error testing AI connection:", err);
        return false;
      }
    },
    []
  );

  const migrateConfig = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch("/api/migrate-ai-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        if (data.migrated) {
          // Refresh config after migration
          await fetchConfig();
        }
        return true;
      } else {
        setError(data.error || "Migrasi gagal");
        return false;
      }
    } catch (err) {
      setError("Terjadi kesalahan saat migrasi");
      console.error("Error migrating AI config:", err);
      return false;
    }
  }, [fetchConfig]);

  // Auto-load config on mount
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    loading,
    error,
    fetchConfig,
    updateConfig,
    testConnection,
    migrateConfig,
  };
}

// Helper function
function getDefaultModel(provider: string): string {
  const defaultModels = {
    openai: "gpt-4-vision-preview",
    gemini: "gemini-1.5-flash",
    deepseek: "deepseek-chat",
    claude: "claude-3-sonnet-20240229",
  };

  return (
    defaultModels[provider as keyof typeof defaultModels] || "gemini-1.5-flash"
  );
}

// Provider validation helpers
export function validateApiKeyFormat(
  apiKey: string,
  provider: string
): boolean {
  const patterns = {
    openai: /^sk-[A-Za-z0-9]{32,}$/,
    gemini: /^AIza[A-Za-z0-9_-]{35}$/,
    deepseek: /^sk-[A-Za-z0-9]{32,}$/,
    claude: /^sk-ant-[A-Za-z0-9_-]{95,}$/,
  };

  const pattern = patterns[provider as keyof typeof patterns];
  if (!pattern) return false;

  switch (provider) {
    case "deepseek":
      return (
        apiKey.includes("deepseek") ||
        (apiKey.startsWith("sk-") && pattern.test(apiKey))
      );
    case "claude":
      return apiKey.startsWith("sk-ant-");
    case "openai":
      return (
        apiKey.startsWith("sk-") &&
        !apiKey.includes("deepseek") &&
        !apiKey.startsWith("sk-ant-")
      );
    case "gemini":
      return pattern.test(apiKey);
    default:
      return false;
  }
}

export function getProviderDisplayName(provider: string): string {
  const displayNames = {
    openai: "OpenAI",
    gemini: "Google Gemini",
    deepseek: "DeepSeek",
    claude: "Anthropic Claude",
  };

  return displayNames[provider as keyof typeof displayNames] || provider;
}
