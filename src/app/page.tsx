"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FileUploader from "@/components/file-uploader";
import RecommendationDisplay from "@/components/recommendation-display";
import { Button } from "@/components/ui/button";
import { Loader2, Terminal, Ticket, AlertCircle } from "lucide-react";
import {
  analyzeForexChart,
  type AnalyzeForexChartInput,
  type AnalyzeForexChartOutput,
} from "@/ai/flows/analyze-forex-chart";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

interface HistoryEntry {
  id: string;
  date: string;
  chartImageUrl: string;
  recommendation: "Buy" | "Sell" | "Wait" | string;
  reasoning: string;
  accuracy?: "Correct" | "Incorrect" | "Pending";
  marketOutcome?: "Up" | "Down" | "Neutral";
  isLikelyChart?: boolean;
  usedTextModel?: string;
}

// Perluas AnalyzeForexChartOutput untuk menyertakan usedTextModel dari alur jika ada
interface ExtendedAnalyzeForexChartOutput extends AnalyzeForexChartOutput {
  isLikelyChart?: boolean;
  usedTextModel?: string;
}

export default function ScanChartPage() {
  const [chartDataUri, setChartDataUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<ExtendedAnalyzeForexChartOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNotAChartWarning, setShowNotAChartWarning] = useState(false);

  const { toast } = useToast();
  const { currentUser, deductToken } = useAuth();

  useEffect(() => {
    if (chartDataUri) {
      setError(null);
      setShowNotAChartWarning(false);
    }
  }, [chartDataUri]);

  const handleFileChange = (dataUri: string, _file: File) => {
    setChartDataUri(dataUri);
    setAnalysisResult(null);
    setError(null);
    setShowNotAChartWarning(false);
  };

  const handleFileReset = () => {
    setChartDataUri(null);
    setAnalysisResult(null);
    setIsLoading(false);
    setError(null);
    setShowNotAChartWarning(false);
  };

  const handleAnalyzeChart = async () => {
    if (!chartDataUri) {
      toast({
        title: "Tidak Ada Grafik Terpilih",
        description: "Silakan unggah atau pindai grafik terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    if (
      currentUser &&
      currentUser.role !== "admin" &&
      currentUser.tokens <= 0
    ) {
      toast({
        title: "Token Tidak Cukup",
        description:
          "Anda tidak memiliki token yang cukup untuk melakukan analisis. Silakan isi ulang token Anda.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setShowNotAChartWarning(false);

    try {
      let aiPersona: string | undefined = undefined;
      let aiModelName: string | undefined = undefined;

      if (typeof window !== "undefined") {
        aiPersona = localStorage.getItem("aiCustomPersona") || undefined;
        if (!aiPersona || aiPersona.trim() === "") {
          aiPersona = undefined;
        }
        aiModelName =
          localStorage.getItem("aiModelNamePreference") || undefined;
        if (!aiModelName || aiModelName.trim() === "") {
          aiModelName = undefined;
        }
      }

      const input: AnalyzeForexChartInput = {
        chartDataUri,
        aiPersona,
        aiModelName,
      };

      const result = (await analyzeForexChart(
        input
      )) as ExtendedAnalyzeForexChartOutput;

      let tokenDeductedSuccessfully = true;
      if (currentUser && currentUser.role !== "admin") {
        const tokenDeducted = await deductToken();
        if (!tokenDeducted) {
          setIsLoading(false);
          tokenDeductedSuccessfully = false;
          // Pesan error token tidak cukup sudah ditangani di deductToken
          return;
        }
      }

      setAnalysisResult(result);
      if (result.isLikelyChart === false) {
        setShowNotAChartWarning(true);
      }
      toast({
        title: "Analisis Selesai",
        description: `Rekomendasi: ${result.recommendation}. Model Teks: ${
          result.usedTextModel || "Tidak diketahui"
        }`,
      });

      if (
        currentUser &&
        currentUser.role === "admin" &&
        chartDataUri &&
        tokenDeductedSuccessfully
      ) {
        const newHistoryEntry: HistoryEntry = {
          id: `analysis-${Date.now()}`,
          date: new Date().toISOString(),
          chartImageUrl: chartDataUri,
          recommendation: result.recommendation,
          reasoning: result.reasoning,
          isLikelyChart: result.isLikelyChart,
          usedTextModel: result.usedTextModel,
          accuracy: "Pending",
        };

        try {
          const existingHistoryString = localStorage.getItem(
            "chartAnalysesHistory"
          );
          const existingHistory: HistoryEntry[] = existingHistoryString
            ? JSON.parse(existingHistoryString)
            : [];

          const filteredHistory = existingHistory.filter(
            (entry) => entry.id !== newHistoryEntry.id
          );
          const updatedHistory = [newHistoryEntry, ...filteredHistory];

          localStorage.setItem(
            "chartAnalysesHistory",
            JSON.stringify(updatedHistory)
          );
        } catch (e) {
          console.error("Gagal menyimpan riwayat ke localStorage:", e);
          toast({
            title: "Gagal Menyimpan Riwayat",
            description:
              "Tidak dapat menyimpan hasil analisis ke riwayat lokal.",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error("Kesalahan Analisis AI:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan yang tidak diketahui saat analisis.";
      setError(`Gagal menganalisis grafik: ${errorMessage}`);
      toast({
        title: "Analisis Gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        Memuat data pengguna...
      </div>
    );
  }

  if (analysisResult && chartDataUri) {
    return (
      <div className="space-y-6">
        {showNotAChartWarning && (
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Peringatan Gambar</AlertTitle>
            <AlertDescription>
              AI mendeteksi bahwa gambar yang Anda unggah kemungkinan bukan
              merupakan grafik/chart. Hasil analisis mungkin tidak akurat.
            </AlertDescription>
          </Alert>
        )}
        <RecommendationDisplay
          imageDataUri={analysisResult.annotatedChartDataUri || chartDataUri}
          recommendation={analysisResult.recommendation}
          reasoning={analysisResult.reasoning}
          onBack={handleFileReset}
          usedTextModel={analysisResult.usedTextModel}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center space-y-8">
      {currentUser &&
        currentUser.role !== "admin" &&
        currentUser.tokens > 0 &&
        currentUser.tokens <= 5 && (
          <Alert variant="destructive" className="w-full max-w-md text-sm py-3">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">
              Peringatan: Token Menipis!
            </AlertTitle>
            <AlertDescription>
              Sisa token Anda: {currentUser.tokens}. Segera{" "}
              <Link
                href="/token"
                className="font-bold underline hover:text-destructive-foreground/90"
              >
                isi ulang
              </Link>{" "}
              untuk melanjutkan analisis tanpa gangguan.
            </AlertDescription>
          </Alert>
        )}

      {currentUser && currentUser.role !== "admin" && (
        <Card className="w-full max-w-md bg-primary/10 border-primary/30">
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Ticket className="h-6 w-6" />
              <p className="text-lg">
                Token Anda Saat Ini:{" "}
                <span className="font-bold text-2xl">{currentUser.tokens}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <FileUploader
        onFileChange={handleFileChange}
        currentImagePreview={chartDataUri}
        onFileReset={handleFileReset}
      />

      {chartDataUri && !isLoading && (
        <Button
          onClick={handleAnalyzeChart}
          size="lg"
          className="w-full max-w-md"
          disabled={currentUser.role !== "admin" && currentUser.tokens <= 0}
        >
          Analisis Grafik
          {currentUser.role !== "admin" &&
            currentUser.tokens > 0 &&
            "(Gunakan 1 Token)"}
          {currentUser.role !== "admin" &&
            currentUser.tokens <= 0 &&
            "(Token Habis)"}
        </Button>
      )}

      {currentUser.role !== "admin" &&
        currentUser.tokens <= 0 &&
        chartDataUri &&
        !isLoading && (
          <Alert variant="destructive" className="w-full max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Token Habis</AlertTitle>
            <AlertDescription>
              Token Anda tidak cukup untuk melakukan analisis. Silakan{" "}
              <Link
                href="/token"
                className="font-bold underline hover:text-destructive-foreground/90"
              >
                isi ulang
              </Link>
              .
            </AlertDescription>
          </Alert>
        )}

      {isLoading && (
        <div className="flex flex-col items-center space-y-2 p-4 rounded-md">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">
            AI sedang menganalisis grafik Anda...
          </p>
          {currentUser && currentUser.role !== "admin" && (
            <p className="text-xs text-primary">(Menggunakan 1 token)</p>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="w-full max-w-lg">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Kesalahan</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!chartDataUri && !isLoading && (
        <Alert className="w-full max-w-lg mt-8">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Selamat Datang di ChartSight AI</AlertTitle>
          <AlertDescription>
            Unggah gambar grafik Forex atau pindai menggunakan kamera Anda untuk
            mendapatkan wawasan perdagangan berbasis AI. AI akan memberikan
            rekomendasi Beli, Jual, atau Tunggu beserta alasannya, dan mencoba
            memberikan anotasi visual pada grafik Anda (jika menggunakan model
            Google AI).
            {currentUser.role !== "admin" &&
              " Setiap analisis menggunakan 1 token."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
