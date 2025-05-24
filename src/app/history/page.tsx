
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { AlertCircle, TrendingUp, TrendingDown, PauseCircle, CheckCircle, XCircle, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';


interface AnalysisHistoryEntry {
  id: string;
  date: string; // ISO string format is good for sorting
  chartImageUrl: string; // User's original chart image
  recommendation: "Buy" | "Sell" | "Wait" | string; // Allow string for flexibility if AI returns other values
  reasoning: string; // Full reasoning
  accuracy?: "Correct" | "Incorrect" | "Pending";
  marketOutcome?: "Up" | "Down" | "Neutral";
}

// Data contoh awal, bisa dikosongkan jika hanya mengandalkan localStorage
const initialMockAnalyses: AnalysisHistoryEntry[] = [
  {
    id: "mock-1",
    date: "2024-07-28T10:30:00.000Z",
    chartImageUrl: "https://placehold.co/300x200.png",
    recommendation: "Buy",
    reasoning: "Divergensi bullish yang kuat teramati pada RSI, MACD crossover akan segera terjadi dan volume meningkat mendukung potensi kenaikan harga lebih lanjut. Pola double bottom juga terlihat pada timeframe H4.",
    accuracy: "Correct",
    marketOutcome: "Up",
  },
  {
    id: "mock-2",
    date: "2024-07-27T14:15:00.000Z",
    chartImageUrl: "https://placehold.co/300x200.png",
    recommendation: "Sell",
    reasoning: "Harga menembus di bawah level support utama di 1.0800, pola bearish engulfing terbentuk pada grafik harian, mengindikasikan tekanan jual yang kuat. RSI juga menunjukkan kondisi overbought sebelumnya.",
    accuracy: "Incorrect",
    marketOutcome: "Up",
  },
];

const RecommendationIcon = ({ recommendation }: { recommendation: AnalysisHistoryEntry["recommendation"] }) => {
  const recLower = typeof recommendation === 'string' ? recommendation.toLowerCase() : 'wait';
  if (recLower === "buy") return <TrendingUp className="h-5 w-5 text-green-500" />;
  if (recLower === "sell") return <TrendingDown className="h-5 w-5 text-red-500" />;
  return <PauseCircle className="h-5 w-5 text-gray-500" />;
};

const AccuracyIcon = ({ accuracy }: { accuracy?: AnalysisHistoryEntry["accuracy"] }) => {
  if (accuracy === "Correct") return <CheckCircle className="h-5 w-5 text-green-500" />;
  if (accuracy === "Incorrect") return <XCircle className="h-5 w-5 text-red-500" />;
  return null;
};

const translateRecommendation = (recommendation: AnalysisHistoryEntry["recommendation"]): string => {
  const recLower = typeof recommendation === 'string' ? recommendation.toLowerCase() : 'wait';
  switch (recLower) {
    case "buy": return "Beli";
    case "sell": return "Jual";
    case "wait": return "Tunggu";
    default: return recommendation;
  }
};

const translateAccuracy = (accuracy?: AnalysisHistoryEntry["accuracy"]): string => {
  if (!accuracy) return "";
  switch (accuracy) {
    case "Correct": return "Benar";
    case "Incorrect": return "Salah";
    case "Pending": return "Tertunda";
    default: return accuracy;
  }
};

const translateMarketOutcome = (outcome?: AnalysisHistoryEntry["marketOutcome"]): string => {
  if (!outcome) return "";
  switch (outcome) {
    case "Up": return "Naik";
    case "Down": return "Turun";
    case "Neutral": return "Netral";
    default: return outcome;
  }
};

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisHistoryEntry[]>([]);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [performanceStatus, setPerformanceStatus] = useState<"Good" | "Declining" | "Critical" | "NoData">("NoData");

  useEffect(() => {
    let loadedAnalyses: AnalysisHistoryEntry[] = [];
    const storedHistoryString = localStorage.getItem('chartAnalysesHistory');

    if (storedHistoryString) {
      try {
        const storedAnalysesFromStorage: AnalysisHistoryEntry[] = JSON.parse(storedHistoryString);
        loadedAnalyses = storedAnalysesFromStorage;
      } catch (e) {
        console.error("Error parsing history from localStorage", e);
        // Jika parsing gagal, kita bisa fallback ke data contoh awal atau array kosong
        // Untuk sekarang, mari gabungkan dengan data contoh jika ada kesalahan.
      }
    }
    
    // Gabungkan data dari localStorage dengan data contoh awal, hindari duplikasi berdasarkan ID
    const combinedAnalyses = [...loadedAnalyses];
    const loadedIds = new Set(loadedAnalyses.map(a => a.id));
    initialMockAnalyses.forEach(mock => {
      if (!loadedIds.has(mock.id)) {
        combinedAnalyses.push(mock);
      }
    });

    // Urutkan berdasarkan tanggal, yang terbaru duluan
    combinedAnalyses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setAnalyses(combinedAnalyses);
  }, []);

  useEffect(() => {
    const ratedAnalyses = analyses.filter(a => a.accuracy === "Correct" || a.accuracy === "Incorrect");
    if (ratedAnalyses.length === 0) {
      setOverallAccuracy(0);
      setPerformanceStatus("NoData");
      return;
    }

    const correctAnalyses = ratedAnalyses.filter(a => a.accuracy === "Correct").length;
    const accuracy = (correctAnalyses / ratedAnalyses.length) * 100;
    setOverallAccuracy(accuracy);

    if (accuracy < 50) setPerformanceStatus("Critical");
    else if (accuracy < 70) setPerformanceStatus("Declining");
    else setPerformanceStatus("Good");
  }, [analyses]);
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString; // fallback jika format tidak valid
    }
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Gambaran Umum Kinerja AI</CardTitle>
          <CardDescription>Ringkasan akurasi analisis AI historis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {performanceStatus === "NoData" ? (
            <div className="p-3 rounded-md flex items-center text-sm bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
              <Info className="h-5 w-5 mr-2 shrink-0" />
              <span>Belum ada data akurasi yang dapat dievaluasi. Analisis baru dengan status 'Tertunda' tidak dihitung.</span>
            </div>
          ) : (
            <>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-foreground">Akurasi Keseluruhan</span>
                  <span className={`text-lg font-semibold ${
                    performanceStatus === "Good" ? "text-green-600" : 
                    performanceStatus === "Declining" ? "text-yellow-500" : "text-red-600"
                  }`}>
                    {overallAccuracy.toFixed(1)}%
                  </span>
                </div>
                <Progress value={overallAccuracy} aria-label="Akurasi AI Keseluruhan" className={
                  performanceStatus === "Good" ? "[&>div]:bg-green-500" :
                  performanceStatus === "Declining" ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500"
                } />
              </div>
              {performanceStatus !== "Good" && (
                <div className={`mt-4 p-3 rounded-md flex items-center text-sm ${
                  performanceStatus === "Declining" ? "bg-yellow-100 text-yellow-700 border border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300" : 
                  "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-300"
                }`}>
                  <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
                  <span>
                    Kinerja AI {performanceStatus === "Declining" ? "menurun" : "kritis"}. {performanceStatus === "Critical" ? "Pemeliharaan mungkin diperlukan." : "Pantau dengan cermat."}
                    {isAdminUser() && " Admin diberi tahu."}
                  </span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      <Separator className="my-6" />

      <h2 className="text-xl font-semibold mb-6 text-foreground">Riwayat Analisis</h2>
      {analyses.length === 0 ? (
         <Card className="text-center p-8">
            <CardContent>
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold text-muted-foreground">Belum Ada Riwayat</p>
                <p className="text-sm text-muted-foreground mt-2">Mulai analisis grafik baru untuk melihat riwayatnya di sini.</p>
                <Button onClick={() => window.location.href='/'} className="mt-6">
                    Pindai Grafik Sekarang
                </Button>
            </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {analyses.map((analysis) => (
            <Card key={analysis.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg">Analisis: {formatDate(analysis.date)}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">{analysis.id}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <RecommendationIcon recommendation={analysis.recommendation} />
                  <Badge 
                    className={
                      (analysis.recommendation.toString().toLowerCase() === "buy" ? "bg-green-500 hover:bg-green-600 text-white" : 
                      (analysis.recommendation.toString().toLowerCase() === "sell" ? "bg-red-500 hover:bg-red-600 text-destructive-foreground" : ""))
                    }
                    variant={
                      analysis.recommendation.toString().toLowerCase() === "buy" ? "default" : 
                      analysis.recommendation.toString().toLowerCase() === "sell" ? "destructive" : "secondary"
                    }
                  >
                    {translateRecommendation(analysis.recommendation)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Image
                      src={analysis.chartImageUrl}
                      alt={`Grafik untuk analisis pada ${formatDate(analysis.date)}`}
                      width={300}
                      height={200}
                      className="rounded-md object-cover w-full h-auto border"
                      data-ai-hint="riwayat grafik forex"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline py-2">Lihat Alasan AI</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap pt-2">
                          {analysis.reasoning}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    {analysis.accuracy && (
                      <div className="flex items-center text-sm pt-2">
                        <span className="font-medium mr-2">Status:</span> 
                        {analysis.accuracy === "Pending" ? (
                          <Badge variant="outline" className="border-blue-500 text-blue-500">Tertunda</Badge>
                        ) : (
                          <>
                            <AccuracyIcon accuracy={analysis.accuracy} />
                            <span className={`ml-1 ${analysis.accuracy === "Correct" ? "text-green-600" : "text-red-600"}`}>{translateAccuracy(analysis.accuracy)}</span>
                          </>
                        )}
                        {analysis.marketOutcome && analysis.accuracy !== "Pending" && <span className="ml-2 text-xs text-muted-foreground">(Pasar: {translateMarketOutcome(analysis.marketOutcome)})</span>}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Placeholder function for admin user check
function isAdminUser() {
  // In a real app, this would check authentication and roles
  return true; 
}
