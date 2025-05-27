"use client";

import type React from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { ArrowLeft, Cpu } from "lucide-react";

interface RecommendationDisplayProps {
  imageDataUri: string; // Can now be the original or annotated image URI
  recommendation: "Buy" | "Sell" | "Wait" | string;
  reasoning: string;
  onBack: () => void;
  usedTextModel?: string; // Tambahkan prop ini
  confidence?: string;
}

const RecommendationBadge: React.FC<{
  recommendation: RecommendationDisplayProps["recommendation"];
}> = ({ recommendation }) => {
  const recLower =
    typeof recommendation === "string" ? recommendation.toLowerCase() : "";
  switch (recLower) {
    case "buy":
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white text-lg px-4 py-2">
          BELI
        </Badge>
      );
    case "sell":
      return (
        <Badge variant="destructive" className="text-lg px-4 py-2">
          JUAL
        </Badge>
      );
    case "wait":
      return (
        <Badge variant="secondary" className="text-lg px-4 py-2">
          TUNGGU
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-lg px-4 py-2">
          {recommendation.toUpperCase()}
        </Badge>
      );
  }
};

export default function RecommendationDisplay({
  imageDataUri,
  recommendation,
  reasoning,
  onBack,
  usedTextModel,
  confidence, // Terima prop ini
}: RecommendationDisplayProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Hasil Analisis AI
        </CardTitle>
        {usedTextModel && (
          <CardDescription className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Cpu className="h-3 w-3" /> Menggunakan: {usedTextModel}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative border rounded-lg overflow-hidden shadow-md">
          <Image
            src={imageDataUri}
            alt="Grafik yang Dianalisis (kemungkinan dengan anotasi AI)"
            width={800}
            height={500}
            className="object-contain w-full max-h-[400px]"
            data-ai-hint="analisis grafik forex anotasi"
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Rekomendasi:</p>
          <RecommendationBadge recommendation={recommendation} />
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2 text-foreground">
            Alasan:
          </h3>
          <Card className="bg-muted/50 p-4 max-h-60 overflow-y-auto">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {reasoning}
            </p>
          </Card>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Analisis Grafik Lain
        </Button>
      </CardFooter>
    </Card>
  );
}
