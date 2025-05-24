
"use client";

import { useState, useEffect } from "react";
import FileUploader from "@/components/file-uploader";
import RecommendationDisplay from "@/components/recommendation-display";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { analyzeForexChart, type AnalyzeForexChartInput, type AnalyzeForexChartOutput } from "@/ai/flows/analyze-forex-chart";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface HistoryEntry {
  id: string;
  date: string;
  chartImageUrl: string; 
  recommendation: "Buy" | "Sell" | "Wait" | string;
  reasoning: string;
  accuracy?: "Correct" | "Incorrect" | "Pending";
  marketOutcome?: "Up" | "Down" | "Neutral";
}

const DEFAULT_AI_PERSONA_FALLBACK = "Anda adalah seorang analis perdagangan Forex ahli. Analisis gambar grafik Forex yang diberikan.\nBerikan rekomendasi perdagangan (Beli, Jual, atau Tunggu) dan penjelasan rinci mengenai alasan Anda.\nFokus pada wawasan yang jelas dan dapat ditindaklanjuti.";


export default function ScanChartPage() {
  const [chartDataUri, setChartDataUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeForexChartOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (chartDataUri) {
      setError(null); 
    }
  }, [chartDataUri]);

  const handleFileChange = (dataUri: string, _file: File) => {
    setChartDataUri(dataUri);
    setAnalysisResult(null); 
    setError(null);
  };

  const handleFileReset = () => {
    setChartDataUri(null);
    setAnalysisResult(null);
    setIsLoading(false);
    setError(null);
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

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      let aiPersona: string | undefined = undefined;
      if (typeof window !== "undefined") {
        aiPersona = localStorage.getItem('aiCustomPersona') || undefined;
        if (!aiPersona || aiPersona.trim() === "") {
            // Jika kosong atau tidak ada, pastikan kita mengirimkan undefined
            // agar prompt default di flow digunakan, atau Anda bisa set default di sini.
            // Untuk konsistensi, biarkan flow menangani default jika persona kosong/undefined.
            aiPersona = undefined; 
        }
      }

      const input: AnalyzeForexChartInput = { chartDataUri, aiPersona };
      const result = await analyzeForexChart(input);
      setAnalysisResult(result);
      toast({
        title: "Analisis Selesai",
        description: `Rekomendasi: ${result.recommendation}`,
      });

      if (chartDataUri) { 
        const newHistoryEntry: HistoryEntry = {
          id: `analysis-${Date.now()}`, 
          date: new Date().toISOString(),
          chartImageUrl: chartDataUri, 
          recommendation: result.recommendation,
          reasoning: result.reasoning,
          accuracy: "Pending", 
        };

        try {
          const existingHistoryString = localStorage.getItem('chartAnalysesHistory');
          const existingHistory: HistoryEntry[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];
          const updatedHistory = [newHistoryEntry, ...existingHistory];
          localStorage.setItem('chartAnalysesHistory', JSON.stringify(updatedHistory));
          toast({
            title: "Disimpan ke Riwayat",
            description: "Hasil analisis telah ditambahkan ke halaman Riwayat Anda.",
          });
        } catch (e) {
          console.error("Gagal menyimpan riwayat ke localStorage:", e);
          toast({
            title: "Gagal Menyimpan Riwayat",
            description: "Tidak dapat menyimpan hasil analisis ke riwayat lokal.",
            variant: "destructive",
          });
        }
      }

    } catch (err) {
      console.error("Kesalahan Analisis AI:", err);
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui saat analisis.";
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

  if (analysisResult && chartDataUri) {
    return (
      <RecommendationDisplay
        imageDataUri={analysisResult.annotatedChartDataUri || chartDataUri} 
        recommendation={analysisResult.recommendation}
        reasoning={analysisResult.reasoning}
        onBack={handleFileReset}
      />
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center space-y-8">
      <FileUploader onFileChange={handleFileChange} currentImagePreview={chartDataUri} onFileReset={handleFileReset} />

      {chartDataUri && !isLoading && (
        <Button onClick={handleAnalyzeChart} size="lg" className="w-full max-w-md">
          Analisis Grafik
        </Button>
      )}

      {isLoading && (
        <div className="flex flex-col items-center space-y-2 p-4 rounded-md">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">AI sedang menganalisis grafik Anda...</p>
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
            Unggah gambar grafik Forex atau pindai menggunakan kamera Anda untuk mendapatkan wawasan perdagangan berbasis AI.
            AI akan memberikan rekomendasi Beli, Jual, atau Tunggu beserta alasannya, dan mencoba memberikan anotasi visual pada grafik Anda.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
