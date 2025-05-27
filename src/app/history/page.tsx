"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  PauseCircle,
  CheckCircle,
  XCircle,
  Info,
  Trash2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

interface AnalysisHistoryEntry {
  id: string;
  date: string;
  chartImageUrl: string;
  recommendation: "Buy" | "Sell" | "Wait" | string;
  reasoning: string;
  accuracy?: "Correct" | "Incorrect" | "Pending";
  marketOutcome?: "Up" | "Down" | "Neutral";
}

const initialMockAnalyses: AnalysisHistoryEntry[] = [
  {
    id: "mock-1",
    date: "2024-07-28T10:30:00.000Z",
    chartImageUrl: "https://placehold.co/300x200.png",
    recommendation: "Buy",
    reasoning:
      "Divergensi bullish yang kuat teramati pada RSI, MACD crossover akan segera terjadi dan volume meningkat mendukung potensi kenaikan harga lebih lanjut. Pola double bottom juga terlihat pada timeframe H4.",
    accuracy: "Correct",
    marketOutcome: "Up",
  },
  {
    id: "mock-2",
    date: "2024-07-27T14:15:00.000Z",
    chartImageUrl: "https://placehold.co/300x200.png",
    recommendation: "Sell",
    reasoning:
      "Harga menembus di bawah level support utama di 1.0800, pola bearish engulfing terbentuk pada grafik harian, mengindikasikan tekanan jual yang kuat. RSI juga menunjukkan kondisi overbought sebelumnya.",
    accuracy: "Incorrect",
    marketOutcome: "Up",
  },
];

const RecommendationIcon = ({
  recommendation,
}: {
  recommendation: AnalysisHistoryEntry["recommendation"];
}) => {
  const recLower =
    typeof recommendation === "string" ? recommendation.toLowerCase() : "wait";
  if (recLower === "buy")
    return <TrendingUp className="h-5 w-5 text-green-500" />;
  if (recLower === "sell")
    return <TrendingDown className="h-5 w-5 text-red-500" />;
  return <PauseCircle className="h-5 w-5 text-gray-500" />;
};

const AccuracyIcon = ({
  accuracy,
}: {
  accuracy?: AnalysisHistoryEntry["accuracy"];
}) => {
  if (accuracy === "Correct")
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  if (accuracy === "Incorrect")
    return <XCircle className="h-5 w-5 text-red-500" />;
  return null;
};

const translateRecommendation = (
  recommendation: AnalysisHistoryEntry["recommendation"]
): string => {
  const recLower =
    typeof recommendation === "string" ? recommendation.toLowerCase() : "wait";
  switch (recLower) {
    case "buy":
      return "Beli";
    case "sell":
      return "Jual";
    case "wait":
      return "Tunggu";
    default:
      return recommendation;
  }
};

const translateAccuracy = (
  accuracy?: AnalysisHistoryEntry["accuracy"]
): string => {
  if (!accuracy) return "";
  switch (accuracy) {
    case "Correct":
      return "Benar";
    case "Incorrect":
      return "Salah";
    case "Pending":
      return "Tertunda";
    default:
      return accuracy;
  }
};

const translateMarketOutcome = (
  outcome?: AnalysisHistoryEntry["marketOutcome"]
): string => {
  if (!outcome) return "";
  switch (outcome) {
    case "Up":
      return "Naik";
    case "Down":
      return "Turun";
    case "Neutral":
      return "Netral";
    default:
      return outcome;
  }
};

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisHistoryEntry[]>([]);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [performanceStatus, setPerformanceStatus] = useState<
    "Good" | "Declining" | "Critical" | "NoData"
  >("NoData");

  useEffect(() => {
    let loadedAnalyses: AnalysisHistoryEntry[] = [];
    const storedHistoryString = localStorage.getItem("chartAnalysesHistory");

    if (storedHistoryString) {
      try {
        const storedAnalysesFromStorage: AnalysisHistoryEntry[] =
          JSON.parse(storedHistoryString);
        loadedAnalyses = storedAnalysesFromStorage;
      } catch (e) {
        console.error("Error parsing history from localStorage", e);
      }
    }

    const combinedAnalyses = [...loadedAnalyses];
    const loadedIds = new Set(loadedAnalyses.map((a) => a.id));
    initialMockAnalyses.forEach((mock) => {
      if (!loadedIds.has(mock.id)) {
        combinedAnalyses.push(mock);
      }
    });

    combinedAnalyses.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const limitedAnalyses = combinedAnalyses.slice(0, 30);
    setAnalyses(limitedAnalyses);
  }, []);

  useEffect(() => {
    try {
      const trimmed = analyses.slice(0, 30);
      localStorage.setItem("chartAnalysesHistory", JSON.stringify(trimmed));
    } catch (err) {
      console.warn("Gagal menyimpan ke localStorage:", err);
    }
  }, [analyses]);

  useEffect(() => {
    const ratedAnalyses = analyses.filter(
      (a) => a.accuracy === "Correct" || a.accuracy === "Incorrect"
    );
    if (ratedAnalyses.length === 0) {
      setOverallAccuracy(0);
      setPerformanceStatus("NoData");
      return;
    }

    const correctAnalyses = ratedAnalyses.filter(
      (a) => a.accuracy === "Correct"
    ).length;
    const accuracy = (correctAnalyses / ratedAnalyses.length) * 100;
    setOverallAccuracy(accuracy);

    if (accuracy < 50) setPerformanceStatus("Critical");
    else if (accuracy < 70) setPerformanceStatus("Declining");
    else setPerformanceStatus("Good");
  }, [analyses]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem("chartAnalysesHistory");
    setAnalyses([]);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                Gambaran Umum Kinerja AI
              </CardTitle>
              <CardDescription>
                Ringkasan akurasi analisis AI historis.
              </CardDescription>
            </div>
            {analyses.length > 0 && (
              <Button
                variant="ghost"
                onClick={handleClearHistory}
                title="Hapus semua riwayat"
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5 mr-1" /> Hapus Riwayat
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">{/* ... */}</CardContent>
      </Card>
      {/* ... */}
    </div>
  );
}

function isAdminUser() {
  return true;
}
