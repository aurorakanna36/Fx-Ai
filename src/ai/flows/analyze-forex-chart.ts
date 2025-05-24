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
      'The chart image with AI analysis annotations, as a data URI.'
    ),
});
export type AnalyzeForexChartOutput = z.infer<typeof AnalyzeForexChartOutputSchema>;

export async function analyzeForexChart(
  input: AnalyzeForexChartInput
): Promise<AnalyzeForexChartOutput> {
  return analyzeForexChartFlow(input);
}

// Schema for the text-only analysis part
const TextAnalysisOutputSchema = z.object({
  recommendation: z
    .enum(['Buy', 'Sell', 'Wait'])
    .describe('The trading recommendation: Buy, Sell, or Wait.'),
  reasoning: z.string().describe('The AI reasoning behind the recommendation.'),
});

const textAnalysisPrompt = ai.definePrompt({
  name: 'analyzeForexChartTextPrompt',
  input: {schema: AnalyzeForexChartInputSchema},
  output: {schema: TextAnalysisOutputSchema},
  prompt: `Anda adalah seorang analis perdagangan Forex ahli. Analisis gambar grafik Forex yang diberikan.
Berikan rekomendasi perdagangan (Beli, Jual, atau Tunggu) dan penjelasan rinci mengenai alasan Anda.
Fokus pada wawasan yang jelas dan dapat ditindaklanjuti.

Gambar Grafik: {{media url=chartDataUri}}

Berikan output dalam format JSON untuk rekomendasi dan alasan.
`,
});

const analyzeForexChartFlow = ai.defineFlow(
  {
    name: 'analyzeForexChartFlow',
    inputSchema: AnalyzeForexChartInputSchema,
    outputSchema: AnalyzeForexChartOutputSchema,
  },
  async (input: AnalyzeForexChartInput): Promise<AnalyzeForexChartOutput> => {
    // Step 1: Get text-based analysis
    const textResponse = await textAnalysisPrompt(input);
    if (!textResponse.output) {
      throw new Error('Gagal mendapatkan analisis teks dari AI.');
    }
    const { recommendation, reasoning } = textResponse.output;

    // Step 2: Generate annotated image
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

    let annotatedChartDataUri = input.chartDataUri; // Default ke gambar asli jika anotasi gagal

    try {
      const imageGenResponse = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // Model khusus untuk generasi/manipulasi gambar
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
        console.log("Gambar beranotasi berhasil dibuat oleh AI.");
      } else {
        console.warn(
          'AI tidak mengembalikan gambar beranotasi. Menggunakan gambar asli untuk ditampilkan.'
        );
      }
    } catch (err) {
      console.error('Kesalahan saat membuat gambar beranotasi:', err);
      // Fallback ke URI gambar asli, error sudah dicatat.
    }

    return {
      recommendation,
      reasoning,
      annotatedChartDataUri,
    };
  }
);
