
// src/ai/flows/analyze-forex-chart.ts
'use server';

/**
 * @fileOverview Analyzes a Forex chart image, provides a trading recommendation, reasoning, and an annotated chart image.
 *
 * - analyzeForexChart - A function that handles the Forex chart analysis process.
 * - AnalyzeForexChartInput - The input type for the analyzeForexChart function.
 * - AnalyzeForexChartOutput - The return type for the analyzeForexChart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeForexChartInputSchema = z.object({
  chartDataUri: z
    .string()
    .describe(
      "A Forex chart image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  aiPersona: z.string().optional().describe('Deskripsi persona kustom untuk AI analisis teks.'),
  aiModelName: z.string().optional().describe('Nama model AI spesifik yang akan digunakan untuk analisis teks, mis: googleai/gemini-1.5-flash.'),
  isLikelyChart: z.boolean().optional().describe('Apakah gambar kemungkinan adalah chart (output dari pra-validasi).'),
});
export type AnalyzeForexChartInput = z.infer<typeof AnalyzeForexChartInputSchema>;

const AnalyzeForexChartOutputSchema = z.object({
  recommendation: z
    .enum(['Buy', 'Sell', 'Wait'])
    .describe('The trading recommendation: Buy, Sell, or Wait.'),
  reasoning: z.string().describe('The AI reasoning behind the recommendation.'),
  annotatedChartDataUri: z
    .string()
    .describe(
      'The chart image with AI analysis annotations (or original if annotation skipped), as a data URI.'
    ),
  isLikelyChart: z.boolean().optional().describe('Apakah gambar kemungkinan adalah chart.'),
  usedTextModel: z.string().optional().describe('Model AI yang digunakan untuk analisis teks.'),
});
export type AnalyzeForexChartOutput = z.infer<typeof AnalyzeForexChartOutputSchema>;

const ImageValidationInputSchema = z.object({
  chartDataUri: z.string(),
});
const ImageValidationOutputSchema = z.object({
  isLikelyChart: z.boolean().describe("Apakah gambar yang diberikan kemungkinan besar adalah grafik/chart keuangan atau trading."),
  briefReasoning: z.string().describe("Alasan singkat mengapa gambar dianggap (atau tidak dianggap) sebagai chart."),
});

const imageValidationPrompt = ai.definePrompt({
  name: 'validateChartImagePrompt',
  input: { schema: ImageValidationInputSchema },
  output: { schema: ImageValidationOutputSchema },
  model: 'googleai/gemini-2.0-flash', // Using a fast model for validation
  prompt: `Anda adalah AI yang bertugas memvalidasi gambar.
Gambar yang diberikan: {{media url=chartDataUri}}
Apakah gambar ini kemungkinan besar adalah sebuah grafik/chart keuangan atau trading (seperti grafik candlestick, line chart harga saham/forex)?
Berikan jawaban dalam format JSON dengan field 'isLikelyChart' (boolean) dan 'briefReasoning' (string).
Contoh: { "isLikelyChart": true, "briefReasoning": "Gambar menampilkan grafik candlestick dengan indikator harga." }
Contoh: { "isLikelyChart": false, "briefReasoning": "Gambar menampilkan pemandangan alam, bukan chart." }
`,
});

const TextAnalysisOutputSchema = z.object({
  recommendation: z
    .enum(['Buy', 'Sell', 'Wait'])
    .describe('Rekomendasi trading: Buy, Sell, atau Wait.'),
  reasoning: z.string().describe('Alasan AI di balik rekomendasi tersebut.'),
});

export async function analyzeForexChart(
  input: AnalyzeForexChartInput
): Promise<AnalyzeForexChartOutput> {
  return analyzeForexChartFlow(input);
}

const DEFAULT_GOOGLE_TEXT_MODEL = 'googleai/gemini-2.0-flash';
const IMAGE_ANNOTATION_MODEL = 'googleai/gemini-2.0-flash-exp'; // Specific Gemini model for image editing

const analyzeForexChartFlow = ai.defineFlow(
  {
    name: 'analyzeForexChartFlow',
    inputSchema: AnalyzeForexChartInputSchema,
    outputSchema: AnalyzeForexChartOutputSchema,
  },
  async (input: AnalyzeForexChartInput): Promise<AnalyzeForexChartOutput> => {
    let isLikelyChart = input.isLikelyChart;
    if (isLikelyChart === undefined) {
        if (!process.env.GOOGLE_API_KEY) {
            console.warn("Validasi gambar AI dilewati karena GOOGLE_API_KEY tidak ada. Mengasumsikan gambar adalah chart.");
            isLikelyChart = true;
        } else {
            try {
                const validationResponse = await imageValidationPrompt({ chartDataUri: input.chartDataUri });
                if (validationResponse.output) {
                    isLikelyChart = validationResponse.output.isLikelyChart;
                    console.log("Validasi gambar oleh AI:", validationResponse.output.briefReasoning);
                } else {
                    console.warn("AI tidak dapat memvalidasi gambar, mengasumsikan itu adalah chart.");
                    isLikelyChart = true;
                }
            } catch(validationError) {
                console.error("Error saat validasi gambar oleh AI:", validationError);
                isLikelyChart = true; 
            }
        }
    }

    let chosenTextModel = DEFAULT_GOOGLE_TEXT_MODEL;
    let usedTextModelForOutput = chosenTextModel;
    let performImageAnnotation = false;

    if (input.aiModelName && input.aiModelName.trim().startsWith('googleai/')) {
      if (!process.env.GOOGLE_API_KEY) {
        console.error(`Model Google (${input.aiModelName}) dipilih, tetapi GOOGLE_API_KEY tidak ditemukan di lingkungan server.`);
        throw new Error(`Kunci API Google tidak tersedia. Model (${input.aiModelName}) tidak dapat digunakan.`);
      }
      chosenTextModel = input.aiModelName.trim();
      usedTextModelForOutput = chosenTextModel;
      performImageAnnotation = true;
      console.log(`Menggunakan model Google ${chosenTextModel} untuk analisis teks.`);
    } else if (input.aiModelName && input.aiModelName.trim() !== "") {
      // Jika nama model diberikan tetapi bukan Google, default ke Google dan beri tahu
      console.warn(`Model yang dimasukkan "${input.aiModelName}" tidak dikenal sebagai model Google. Fallback ke default Google: ${DEFAULT_GOOGLE_TEXT_MODEL}.`);
      if (!process.env.GOOGLE_API_KEY) {
        console.error(`Model default Google (${DEFAULT_GOOGLE_TEXT_MODEL}) akan digunakan, tetapi GOOGLE_API_KEY tidak ditemukan.`);
        throw new Error(`Kunci API Google tidak tersedia. Model default (${DEFAULT_GOOGLE_TEXT_MODEL}) juga tidak dapat digunakan.`);
      }
      chosenTextModel = DEFAULT_GOOGLE_TEXT_MODEL;
      usedTextModelForOutput = `${input.aiModelName} (Fallback ke ${chosenTextModel})`;
      performImageAnnotation = true;
    } else {
      // Jika tidak ada nama model, gunakan default Google
      if (!process.env.GOOGLE_API_KEY) {
        console.error(`Model default Google (${DEFAULT_GOOGLE_TEXT_MODEL}) akan digunakan, tetapi GOOGLE_API_KEY tidak ditemukan.`);
        throw new Error(`Kunci API Google tidak tersedia. Model default (${DEFAULT_GOOGLE_TEXT_MODEL}) juga tidak dapat digunakan.`);
      }
      chosenTextModel = DEFAULT_GOOGLE_TEXT_MODEL;
      usedTextModelForOutput = chosenTextModel;
      performImageAnnotation = true;
      console.log(`Menggunakan model default Google ${chosenTextModel} untuk analisis teks.`);
    }
    
    const textAnalysisPrompt = ai.definePrompt({
      name: 'analyzeForexChartTextFlexiblePrompt',
      input: { schema: z.object({ chartDataUri: z.string(), aiPersona: z.string().optional() }) }, 
      output: { schema: TextAnalysisOutputSchema },
      model: chosenTextModel as any, // Cast to any because model can be from different providers
      prompt: `{{#if aiPersona}}
{{{aiPersona}}}
{{else}}
Anda adalah seorang analis perdagangan Forex ahli. Analisis gambar grafik Forex yang diberikan.
Berikan rekomendasi perdagangan (Beli, Jual, atau Tunggu) dan penjelasan rinci mengenai alasan Anda.
Fokus pada wawasan yang jelas dan dapat ditindaklanjuti.
{{/if}}

Gambar Grafik: {{media url=chartDataUri}}

Berikan output dalam format JSON untuk rekomendasi dan alasan.
`,
    });

    const textResponse = await textAnalysisPrompt({
        chartDataUri: input.chartDataUri,
        aiPersona: input.aiPersona,
    });

    if (!textResponse.output) {
      throw new Error(`Gagal mendapatkan analisis teks dari AI menggunakan model ${chosenTextModel}.`);
    }
    const { recommendation, reasoning } = textResponse.output;

    let annotatedChartDataUri = input.chartDataUri; 

    if (performImageAnnotation && process.env.GOOGLE_API_KEY) {
      const annotationPromptText = `
Anda adalah asisten pengeditan gambar AI. Tugas Anda adalah menganotasi secara visual gambar grafik Forex yang diberikan berdasarkan analisis yang ada.
JANGAN membuat grafik baru. MODIFIKASI gambar grafik yang diberikan dengan anotasi.

Grafik yang Diberikan: [Disediakan melalui input media]
Detail Analisis:
- Rekomendasi: ${recommendation}
- Alasan Utama: ${reasoning}

Instruksi Anotasi:
1. Identifikasi elemen kunci dari 'Alasan Utama' yang dapat direpresentasikan secara visual pada grafik.
2. Timpakan elemen visual ini langsung pada gambar grafik asli yang diberikan (garis tren, level support/resistance, sorot pola).
3. Gunakan anotasi yang sederhana dan jelas.
4. Kembalikan gambar yang telah diberi anotasi.
`;
      try {
        const imageGenResponse = await ai.generate({
          model: IMAGE_ANNOTATION_MODEL, 
          prompt: [
            {media: {url: input.chartDataUri}},
            {text: annotationPromptText},
          ],
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });

        if (imageGenResponse.media?.url) {
          annotatedChartDataUri = imageGenResponse.media.url;
          console.log("Gambar beranotasi berhasil dibuat oleh AI (Gemini).");
        } else {
          console.warn(
            `AI (${IMAGE_ANNOTATION_MODEL}) tidak mengembalikan gambar beranotasi. Menggunakan gambar asli untuk ditampilkan.`
          );
        }
      } catch (err) {
        console.error(`Kesalahan saat membuat gambar beranotasi dengan ${IMAGE_ANNOTATION_MODEL}:`, err);
      }
    } else if (performImageAnnotation && !process.env.GOOGLE_API_KEY) {
        console.log("Anotasi gambar AI dilewati karena Kunci API Google tidak ada. Menggunakan gambar asli.");
    } else {
        console.log("Anotasi gambar AI tidak dilakukan. Menggunakan gambar asli.");
    }


    return {
      recommendation,
      reasoning,
      annotatedChartDataUri,
      isLikelyChart,
      usedTextModel: usedTextModelForOutput,
    };
  }
);
import { onRequest } from "firebase-functions/v2/https";
import { getDatabase } from "firebase-admin/database";
import { initializeApp } from "firebase-admin/app";
import { Request, Response } from "express";

// Inisialisasi Firebase Admin SDK
initializeApp();

export const analyze_chart = onRequest(async (req: Request, res: Response) => {
  try {
    const { chartData } = req.body;
    if (!chartData) {
      res.status(400).send("chartData diperlukan.");
      return;
    }

    // 1. Ambil konfigurasi AI dari Realtime Database
    const db = getDatabase();
    const snapshot = await db.ref("/ai_config").once("value");
    const config = snapshot.val();

    if (!config || !config.aiModelName || !config.aiApiKey) {
      res.status(500).send("Konfigurasi AI tidak ditemukan.");
      return;
    }

    const { aiModelName, aiApiKey, aiPersona } = config;

    // 2. Lakukan pemanggilan ke AI provider (misal OpenAI)
    // Contoh untuk OpenAI (gunakan SDK resmi atau fetch manual)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiApiKey}`,
      },
      body: JSON.stringify({
        model: aiModelName,
        messages: [
          {
            role: "system",
            content: aiPersona || "Anda adalah analis teknikal profesional.",
          },
          {
            role: "user",
            content: `Analisis chart berikut: ${JSON.stringify(chartData)}`,
          },
        ],
      }),
    });

    const result = await response.json();

    res.status(200).send({
      result: result.choices?.[0]?.message?.content ?? "Tidak ada jawaban",
    });
  } catch (error) {
    console.error("Gagal menganalisis chart:", error);
    res.status(500).send("Gagal menganalisis chart.");
  }
});
