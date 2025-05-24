
"use client";

import type React from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

interface RecommendationDisplayProps {
  imageDataUri: string;
  recommendation: "Buy" | "Sell" | "Wait" | string; // Receives English value
  reasoning: string;
  onBack: () => void;
}

const RecommendationBadge: React.FC<{ recommendation: RecommendationDisplayProps["recommendation"] }> = ({ recommendation }) => {
  switch (recommendation.toLowerCase()) {
    case "buy":
      return <Badge className="bg-green-500 hover:bg-green-600 text-white text-lg px-4 py-2">BELI</Badge>;
    case "sell":
      return <Badge variant="destructive" className="text-lg px-4 py-2">JUAL</Badge>;
    case "wait":
      return <Badge variant="secondary" className="text-lg px-4 py-2">TUNGGU</Badge>;
    default:
      // Fallback for any unexpected values, display as is or a generic term
      return <Badge variant="outline" className="text-lg px-4 py-2">{recommendation.toUpperCase()}</Badge>;
  }
};

export default function RecommendationDisplay({
  imageDataUri,
  recommendation,
  reasoning,
  onBack,
}: RecommendationDisplayProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Hasil Analisis AI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative border rounded-lg overflow-hidden shadow-md">
          <Image
            src={imageDataUri}
            alt="Grafik yang Dianalisis"
            width={800}
            height={500}
            className="object-contain w-full max-h-[400px]"
            data-ai-hint="analisis grafik forex"
          />
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Rekomendasi:</p>
          <RecommendationBadge recommendation={recommendation} />
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2 text-foreground">Alasan:</h3>
          <Card className="bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reasoning}</p>
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
