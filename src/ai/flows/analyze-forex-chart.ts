
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
  preferredAiProvider: z.enum(['gemini', 'openai']).optional().describe('Penyedia model AI yang dipilih.'),
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

const analyzeForexChartFlow = ai.defineFlow(
  {
    name: 'analyzeForexChartFlow',
    inputSchema: AnalyzeForexChartInputSchema,
    outputSchema: AnalyzeForexChartOutputSchema,
  },
  async (input: AnalyzeForexChartInput): Promise<AnalyzeForexChartOutput> => {
    let isLikelyChart = input.isLikelyChart;
    if (isLikelyChart === undefined) {
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

    let actualTextModel = 'googleai/gemini-2.0-flash'; // Default to Gemini
    let usedTextModelForOutput = actualTextModel;
    let textModelProvider = 'gemini'; // Default provider

    if (input.preferredAiProvider === 'openai') {
      // OpenAI package is not installed, so we cannot use OpenAI models.
      // Log a warning and default to Gemini.
      console.warn(
        "Preferensi OpenAI dipilih, tetapi plugin OpenAI tidak tersedia/dihapus. Fallback ke Gemini."
      );
      // Ensure we use Gemini if GOOGLE_API_KEY is available
      if (!process.env.GOOGLE_API_KEY) {
        throw new Error("Tidak ada GOOGLE_API_KEY yang ditemukan di lingkungan server. Analisis tidak dapat dilanjutkan karena OpenAI tidak tersedia.");
      }
      console.log(`Menggunakan model Gemini (${actualTextModel}) untuk analisis teks (fallback dari preferensi OpenAI).`);
    } else {
        // Default to Gemini if GOOGLE_API_KEY is available
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error("Tidak ada GOOGLE_API_KEY yang ditemukan di lingkungan server. Analisis tidak dapat dilanjutkan.");
        }
        console.log(`Menggunakan model Gemini (${actualTextModel}) untuk analisis teks.`);
    }
    
    const textAnalysisPrompt = ai.definePrompt({
      name: 'analyzeForexChartTextFlexiblePrompt',
      input: { schema: AnalyzeForexChartInputSchema }, // Pass the full input
      output: { schema: TextAnalysisOutputSchema },
      model: actualTextModel, 
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
        aiPersona: input.aiPersona // Pass aiPersona here
        // preferredAiProvider and isLikelyChart are not needed by this specific prompt's template
    });
    if (!textResponse.output) {
      throw new Error('Gagal mendapatkan analisis teks dari AI.');
    }
    const { recommendation, reasoning } = textResponse.output;

    let annotatedChartDataUri = input.chartDataUri; 

    // Image annotation is currently only supported by Gemini and if GOOGLE_API_KEY is present
    if (textModelProvider === 'gemini' && process.env.GOOGLE_API_KEY) {
      const annotationPromptText = `
Anda adalah asisten pengeditan gambar AI. Tugas Anda adalah menganotasi secara visual gambar grafik Forex yang diberikan berdasarkan analisis yang ada.
JANGAN membuat grafik baru. MODIFIKASI gambar grafik yang diberikan dengan anotasi.

Grafik yang Diberikan: [Disediakan melalui input media]
Detail Analisis:
- Rekomendasi: ${recommendation}
- Alasan Utama: ${reasoning}

Instruksi Anotasi:
1. Identifikasi elemen kunci dari 'Alasan Utama' yang dapat direpresentasikan secara visual pada grafik. Ini mungkin termasuk:
    - Garis tren (gambarkan)
    - Level support dan resistance (gambarkan garis horizontal)
    - Pola grafik spesifik (misalnya, head and shoulders, segitiga - garis bawahi atau sorot)
    - Pola candlestick yang disebutkan (misalnya, lingkari atau tunjuk)
    - Sinyal indikator jika dijelaskan (misalnya, panah pada divergensi RSI)
2. Timpakan elemen visual ini langsung pada gambar grafik asli yang diberikan.
3. Gunakan anotasi yang sederhana dan jelas: garis tipis, panah, lingkaran, atau sorotan halus.
4. Jika menambahkan label teks, buatlah sangat pendek dan letakkan tanpa mengaburkan data grafik utama.
5. Tujuannya adalah membuat alasan AI lebih mudah dipahami dengan menunjukkan fitur secara visual pada grafik.
6. Kembalikan gambar yang telah diberi anotasi.
`;
      try {
        const imageGenResponse = await ai.generate({
          model: 'googleai/gemini-2.0-flash-exp', 
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
            'AI (Gemini) tidak mengembalikan gambar beranotasi. Menggunakan gambar asli untuk ditampilkan.'
          );
        }
      } catch (err) {
        console.error('Kesalahan saat membuat gambar beranotasi dengan Gemini:', err);
      }
    } else {
      // This covers the case where OpenAI was preferred but unavailable, or any other non-Gemini scenario
      console.log("Anotasi gambar AI dilewati. Menggunakan gambar asli.");
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
