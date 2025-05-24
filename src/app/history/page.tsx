
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { AlertCircle, TrendingUp, TrendingDown, PauseCircle, CheckCircle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from '@/components/ui/separator';

interface MockAnalysis {
  id: string;
  date: string;
  chartImageUrl: string;
  recommendation: "Buy" | "Sell" | "Wait";
  reasoningSnippet: string;
  accuracy?: "Correct" | "Incorrect" | "Pending"; // Mock accuracy
  marketOutcome?: "Up" | "Down" | "Neutral"; // Mock actual market outcome
}

const mockAnalyses: MockAnalysis[] = [
  {
    id: "1",
    date: "2024-07-28 10:30 AM",
    chartImageUrl: "https://placehold.co/300x200.png",
    recommendation: "Buy",
    reasoningSnippet: "Strong bullish divergence observed on RSI, MACD crossover imminent...",
    accuracy: "Correct",
    marketOutcome: "Up",
  },
  {
    id: "2",
    date: "2024-07-27 02:15 PM",
    chartImageUrl: "https://placehold.co/300x200.png",
    recommendation: "Sell",
    reasoningSnippet: "Price broke below key support level, bearish engulfing pattern formed...",
    accuracy: "Incorrect",
    marketOutcome: "Up",
  },
  {
    id: "3",
    date: "2024-07-26 09:00 AM",
    chartImageUrl: "https://placehold.co/300x200.png",
    recommendation: "Wait",
    reasoningSnippet: "Market is consolidating, awaiting clearer signals from major indicators...",
    accuracy: "Pending",
  },
  {
    id: "4",
    date: "2024-07-25 05:45 PM",
    chartImageUrl: "https://placehold.co/300x200.png",
    recommendation: "Buy",
    reasoningSnippet: "Golden cross formation on daily chart, positive news sentiment...",
    accuracy: "Correct",
    marketOutcome: "Up",
  },
];

const RecommendationIcon = ({ recommendation }: { recommendation: MockAnalysis["recommendation"] }) => {
  if (recommendation === "Buy") return <TrendingUp className="h-5 w-5 text-green-500" />;
  if (recommendation === "Sell") return <TrendingDown className="h-5 w-5 text-red-500" />;
  return <PauseCircle className="h-5 w-5 text-gray-500" />;
};

const AccuracyIcon = ({ accuracy }: { accuracy?: MockAnalysis["accuracy"] }) => {
  if (accuracy === "Correct") return <CheckCircle className="h-5 w-5 text-green-500" />;
  if (accuracy === "Incorrect") return <XCircle className="h-5 w-5 text-red-500" />;
  return null;
};

export default function HistoryPage() {
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [performanceStatus, setPerformanceStatus] = useState<"Good" | "Declining" | "Critical">("Good");

  useEffect(() => {
    const correctAnalyses = mockAnalyses.filter(a => a.accuracy === "Correct").length;
    const incorrectAnalyses = mockAnalyses.filter(a => a.accuracy === "Incorrect").length;
    const totalRated = correctAnalyses + incorrectAnalyses;
    const accuracy = totalRated > 0 ? (correctAnalyses / totalRated) * 100 : 0;
    setOverallAccuracy(accuracy);

    if (accuracy < 50) setPerformanceStatus("Critical");
    else if (accuracy < 70) setPerformanceStatus("Declining");
    else setPerformanceStatus("Good");
  }, []);


  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">AI Performance Overview</CardTitle>
          <CardDescription>Summary of historical AI analysis accuracy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-foreground">Overall Accuracy</span>
              <span className={`text-lg font-semibold ${
                performanceStatus === "Good" ? "text-green-600" : 
                performanceStatus === "Declining" ? "text-yellow-500" : "text-red-600"
              }`}>
                {overallAccuracy.toFixed(1)}%
              </span>
            </div>
            <Progress value={overallAccuracy} aria-label="Overall AI Accuracy" className={
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
                AI performance is {performanceStatus.toLowerCase()}. {performanceStatus === "Critical" ? "Maintenance may be required." : "Monitor closely."}
                {isAdminUser() && " Admin notified."} {/* Placeholder for admin logic */}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Separator className="my-6" />

      <h2 className="text-xl font-semibold mb-6 text-foreground">Analysis History</h2>
      {mockAnalyses.length === 0 ? (
        <p className="text-center text-muted-foreground">No analysis history available yet.</p>
      ) : (
        <div className="space-y-6">
          {mockAnalyses.map((analysis) => (
            <Card key={analysis.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg">Analysis: {analysis.date}</CardTitle>
                  <CardDescription className="text-xs">{analysis.id}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <RecommendationIcon recommendation={analysis.recommendation} />
                  <Badge variant={
                    analysis.recommendation === "Buy" ? "default" : 
                    analysis.recommendation === "Sell" ? "destructive" : "secondary"
                  } className={analysis.recommendation === "Buy" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                    {analysis.recommendation}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4 pt-0">
                <div className="md:col-span-1">
                  <Image
                    src={analysis.chartImageUrl}
                    alt={`Chart for analysis on ${analysis.date}`}
                    width={300}
                    height={200}
                    className="rounded-md object-cover w-full h-auto border"
                    data-ai-hint="forex chart history"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <p className="text-sm text-muted-foreground italic line-clamp-3">
                    &quot;{analysis.reasoningSnippet}&quot;
                  </p>
                   {analysis.accuracy && analysis.accuracy !== "Pending" && (
                     <div className="flex items-center text-sm">
                       <span className="font-medium mr-2">Accuracy:</span> 
                       <AccuracyIcon accuracy={analysis.accuracy} />
                       <span className={`ml-1 ${analysis.accuracy === "Correct" ? "text-green-600" : "text-red-600"}`}>{analysis.accuracy}</span>
                       {analysis.marketOutcome && <span className="ml-2 text-xs text-muted-foreground">(Market: {analysis.marketOutcome})</span>}
                     </div>
                   )}
                   {analysis.accuracy === "Pending" && (
                     <p className="text-sm text-blue-500">Accuracy pending market outcome.</p>
                   )}
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
