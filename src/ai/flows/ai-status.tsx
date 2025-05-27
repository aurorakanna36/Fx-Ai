// components/ai-status.tsx - React component untuk menampilkan status AI
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Bot,
  Eye,
  EyeOff,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIConfig {
  provider: string;
  aiModelName: string;
  aiPersona: string;
  hasApiKey: boolean;
  isConfigured: boolean;
  updatedAt: string | null;
  apiKeyMask: string | null;
}

interface AIStatusProps {
  onConfigureClick?: () => void;
}

const PROVIDER_NAMES = {
  openai: "OpenAI",
  gemini: "Google Gemini",
  deepseek: "DeepSeek",
  claude: "Anthropic Claude",
};

const PROVIDER_COLORS = {
  openai: "bg-green-500",
  gemini: "bg-blue-500",
  deepseek: "bg-purple-500",
  claude: "bg-orange-500",
};

export function AIStatus({ onConfigureClick }: AIStatusProps) {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPersona, setShowPersona] = useState(false);

  const fetchConfig = async () => {
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
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Memuat konfigurasi AI...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConfig}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Coba Lagi
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!config) {
    return (
      <Alert>
        <XCircle className="h-4 w-4" />
        <AlertDescription>Konfigurasi AI tidak ditemukan</AlertDescription>
      </Alert>
    );
  }

  const providerName =
    PROVIDER_NAMES[config.provider as keyof typeof PROVIDER_NAMES] ||
    config.provider;
  const providerColor =
    PROVIDER_COLORS[config.provider as keyof typeof PROVIDER_COLORS] ||
    "bg-gray-500";

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Status AI Provider
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConfig}
            className="h-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {onConfigureClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onConfigureClick}
              className="h-8"
            >
              <Settings className="h-4 w-4 mr-1" />
              Configure
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.isConfigured ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">
              {config.isConfigured ? "Terkonfigurasi" : "Belum Dikonfigurasi"}
            </span>
          </div>
          <Badge className={`${providerColor} text-white`} variant="secondary">
            {providerName}
          </Badge>
        </div>

        {/* Configuration Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Provider
              </label>
              <p className="text-sm">{providerName}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Model
              </label>
              <p className="text-sm font-mono">{config.aiModelName}</p>
            </div>
          </div>

          {/* API Key Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              API Key
            </label>
            <div className="flex items-center gap-2">
              {config.hasApiKey ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Tersimpan</span>
                  {config.apiKeyMask && (
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {config.apiKeyMask}
                    </code>
                  )}
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Tidak ada</span>
                </>
              )}
            </div>
          </div>

          {/* AI Persona */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                Persona AI
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPersona(!showPersona)}
                className="h-6 px-2"
              >
                {showPersona ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
            </div>
            {showPersona && (
              <div className="text-xs bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                {config.aiPersona || "Menggunakan persona default"}
              </div>
            )}
          </div>

          {/* Last Updated */}
          {config.updatedAt && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Terakhir Diperbarui
              </label>
              <p className="text-xs text-muted-foreground">
                {new Date(config.updatedAt).toLocaleString("id-ID")}
              </p>
            </div>
          )}
        </div>

        {/* Warning jika belum dikonfigurasi */}
        {!config.isConfigured && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              AI provider belum dikonfigurasi dengan benar. Fitur analisis chart
              tidak akan berfungsi hingga API key valid ditambahkan.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
