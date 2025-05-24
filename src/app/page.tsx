
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

// Definisikan tipe untuk entri riwayat agar konsisten dengan HistoryPage
// Ini bisa diimpor dari tipe bersama jika proyek berkembang
interface HistoryEntry {
  id: string;
  date: string;
  chartImageUrl: string; // Gambar asli dari pengguna
  recommendation: "Buy" | "Sell" | "Wait" | string;
  reasoning: string;
  // Akurasi dan hasil pasar tidak akan ada saat disimpan dari sini
  accuracy?: "Correct" | "Incorrect" | "Pending";
  marketOutcome?: "Up" | "Down" | "Neutral";
}


export default function ScanChartPage() {
  const [chartDataUri, setChartDataUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeForexChartOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Effect to clear error when chartDataUri changes (new upload attempt)
  useEffect(() => {
    if (chartDataUri) {
      setError(null); // Clear previous errors when a new image is selected
    }
  }, [chartDataUri]);

  const handleFileChange = (dataUri: string, _file: File) => {
    setChartDataUri(dataUri);
    setAnalysisResult(null); // Reset previous analysis
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
      const input: AnalyzeForexChartInput = { chartDataUri };
      const result = await analyzeForexChart(input);
      setAnalysisResult(result);
      toast({
        title: "Analisis Selesai",
        description: `Rekomendasi: ${result.recommendation}`,
      });

      // Simpan ke riwayat di localStorage
      if (chartDataUri) { // Pastikan chartDataUri ada
        const newHistoryEntry: HistoryEntry = {
          id: `analysis-${Date.now()}`, // ID unik sederhana
          date: new Date().toISOString(),
          chartImageUrl: chartDataUri, // Gambar asli yang diunggah pengguna
          recommendation: result.recommendation,
          reasoning: result.reasoning,
          accuracy: "Pending", // Default akurasi ke Pending
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
        imageDataUri={analysisResult.annotatedChartDataUri || chartDataUri} // Gunakan gambar beranotasi jika ada
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
