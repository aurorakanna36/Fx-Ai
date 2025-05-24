
"use client";

import { useState } from "react";
import * as z from "zod"; // Masih diimpor jika kita akan menambahkannya kembali
import { Button } from "@/components/ui/button";
// Komponen Form tidak digunakan secara aktif sekarang, tapi impor dipertahankan
import {
  // Form,
  // FormControl,
  // FormDescription,
  // FormField,
  // FormItem,
  // FormLabel,
  // FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// useToast dihapus sementara
import { KeyRound, Terminal, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Skema masih didefinisikan untuk referensi di masa mendatang
const aiIntegrationFormSchema = z.object({
  aiProviderName: z.string().min(2, {
    message: "Nama Penyedia AI minimal harus 2 karakter.",
  }).default("Gemini AI (Default)"),
  apiKey: z.string().min(10, {
    message: "Kunci API sepertinya terlalu pendek.",
  }).optional().or(z.literal('')),
  apiPrompt: z.string().min(20, {
    message: "Prompt API minimal harus 20 karakter.",
  }).optional().or(z.literal('')),
});
// Tipe masih didefinisikan
type AiIntegrationFormValues = z.infer<typeof aiIntegrationFormSchema>;

// defaultValues dan useForm hook dihapus sementara
// onSubmit function dihapus sementara

export default function AiIntegrationPage() {
  const [isDefaultAi, setIsDefaultAi] = useState(true); // State sederhana dipertahankan

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Pengaturan Integrasi AI</CardTitle>
          </div>
          <CardDescription>
            Konfigurasikan penyedia AI dan pengaturan API. Bagian ini hanya untuk administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Catatan Pengembang</AlertTitle>
            <AlertDescription>
              Ini adalah antarmuka tiruan. Kunci API dan prompt tidak disimpan atau digunakan dalam demo ini.
              Di lingkungan produksi, tangani kunci API dengan aman di sisi server.
            </AlertDescription>
          </Alert>
          
          {/* Placeholder untuk elemen form yang disederhanakan, tanpa react-hook-form */}
          <div className="space-y-8 mt-4">
            <div>
                <label htmlFor="aiProviderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Penyedia AI</label>
                <Input id="aiProviderName" placeholder="mis., Gemini, OpenAI GPT-4" defaultValue="Gemini AI (Default)" />
                <p className="mt-2 text-sm text-muted-foreground">Nama penyedia layanan AI yang saat ini digunakan.</p>
            </div>
            
            <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kunci API {isDefaultAi && "(Opsional untuk AI Default)"}
                </label>
                <Input id="apiKey" type="password" placeholder="Masukkan Kunci API untuk AI kustom" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Masukkan kunci API untuk penyedia AI yang dipilih. Biarkan kosong jika menggunakan AI terintegrasi default.
                </p>
            </div>
             
            <div>
                <label htmlFor="apiPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt API AI</label>
                <Textarea
                    id="apiPrompt"
                    placeholder="Masukkan prompt sistem untuk model AI..."
                    className="min-h-[200px] resize-y"
                    defaultValue={`Anda adalah seorang analis perdagangan Forex ahli. Analisis gambar grafik Forex yang diberikan dan berikan rekomendasi perdagangan (Beli, Jual, atau Tunggu) beserta penjelasan rinci mengenai alasan Anda.\n\nGambar Grafik: {{media url=chartDataUri}}\n\nBerikan output dalam format JSON.`}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                    Prompt sistem yang digunakan untuk menginstruksikan model AI untuk analisis grafik.
                    Gunakan '{{media url=chartDataUri}}' sebagai placeholder untuk gambar grafik.
                </p>
            </div>
            
            <Button type="button" className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" /> Simpan Konfigurasi (Non-fungsional)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
