
"use client";

import { useEffect } from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Settings, UserCog, Cpu, Info, MessageCircleQuestion } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Skema validasi untuk form
const AiIntegrationFormSchema = z.object({
  aiModelName: z.string().optional().describe("Nama model Google AI untuk analisis teks, mis: googleai/gemini-1.5-flash. Biarkan kosong untuk default."),
  aiPersona: z.string().optional().describe("Persona kustom untuk AI analisis teks. Biarkan kosong untuk default."),
});

type AiIntegrationFormValues = z.infer<typeof AiIntegrationFormSchema>;

const DEFAULT_AI_PERSONA = "Anda adalah seorang analis perdagangan Forex ahli. Analisis gambar grafik Forex yang diberikan.\nBerikan rekomendasi perdagangan (Beli, Jual, atau Tunggu) dan penjelasan rinci mengenai alasan Anda.\nFokus pada wawasan yang jelas dan dapat ditindaklanjuti.";
const DEFAULT_TEXT_MODEL_NAME = "googleai/gemini-2.0-flash"; // Default model teks dari Google
const GEMINI_IMAGE_MODEL_NAME = "googleai/gemini-2.0-flash-exp"; // Model untuk anotasi gambar tetap dari Google

export default function AiIntegrationPage() {
  const { toast } = useToast();

  const form = useForm<AiIntegrationFormValues>({
    resolver: zodResolver(AiIntegrationFormSchema),
    defaultValues: {
      aiModelName: "", // Akan diisi dari localStorage atau default
      aiPersona: "",   // Akan diisi dari localStorage atau default
    },
  });

  useEffect(() => {
    const storedAiModelName = localStorage.getItem('aiModelNamePreference');
    const storedAiPersona = localStorage.getItem('aiCustomPersona');
    
    form.reset({
      aiModelName: storedAiModelName || "", // Jangan set default di sini, biarkan flow AI yang fallback jika kosong
      aiPersona: storedAiPersona || DEFAULT_AI_PERSONA,
    });
  }, [form]);

  const onSubmit: SubmitHandler<AiIntegrationFormValues> = (data) => {
    // Simpan nama model Google AI
    if (data.aiModelName && data.aiModelName.trim() !== "") {
      localStorage.setItem('aiModelNamePreference', data.aiModelName.trim());
    } else {
      // Jika kosong, biarkan kosong di localStorage agar flow AI menggunakan defaultnya
      localStorage.setItem('aiModelNamePreference', ""); 
    }

    // Simpan persona AI kustom
    if (data.aiPersona && data.aiPersona.trim() !== "") {
      localStorage.setItem('aiCustomPersona', data.aiPersona.trim());
    } else {
      // Jika persona kosong, simpan string kosong agar default dari kode alur AI digunakan
      localStorage.setItem('aiCustomPersona', ""); 
    }

    toast({
      title: "Pengaturan Disimpan",
      description: (
        <div>
          <p>Preferensi model AI dan persona telah disimpan ke penyimpanan lokal browser Anda.</p>
          <p className="font-semibold mt-2">Catatan Penting:</p>
          <ul className="list-disc list-inside text-xs space-y-1 mt-1">
            <li>Aplikasi ini menggunakan model AI dari Google (Gemini).</li>
            <li>Agar model Google AI berfungsi, pastikan variabel lingkungan `GOOGLE_API_KEY` telah dikonfigurasi dengan benar di sisi server.</li>
            <li>Jika "Nama Model Google AI" yang Anda masukkan tidak valid atau `GOOGLE_API_KEY` tidak ada, sistem akan mencoba fallback ke model Google default ({DEFAULT_TEXT_MODEL_NAME}).</li>
            <li>Anotasi gambar saat ini tetap menggunakan model Google ({GEMINI_IMAGE_MODEL_NAME}).</li>
            <li>Menggunakan API dari penyedia lain (misalnya DeepSeek, OpenAI) saat ini tidak didukung secara langsung melalui UI ini karena memerlukan perubahan backend (plugin Genkit & konfigurasi Kunci API server).</li>
          </ul>
        </div>
      ),
      duration: 15000, 
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <Alert variant="default" className="max-w-3xl mx-auto bg-primary/10 border-primary/30">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary">Konfigurasi Model & Persona AI</AlertTitle>
        <AlertDescription>
          Halaman ini memungkinkan Anda menyesuaikan preferensi model Google AI untuk analisis teks dan persona AI.
          Fungsionalitas AI bergantung pada konfigurasi `GOOGLE_API_KEY` yang benar di variabel lingkungan sisi server.
          Integrasi dengan penyedia AI lain memerlukan modifikasi backend.
        </AlertDescription>
      </Alert>

      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Pengaturan Integrasi AI (Google AI)</CardTitle>
          </div>
          <CardDescription>
            Kelola nama model Google AI untuk analisis teks dan persona kustom.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="aiModelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Cpu className="h-4 w-4" />
                      Nama Model Google AI untuk Analisis Teks
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`mis: googleai/gemini-1.5-flash (kosongkan untuk default: ${DEFAULT_TEXT_MODEL_NAME})`}
                        {...field}
                        className="text-sm"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Masukkan identifier model Google AI yang valid (misalnya, `googleai/gemini-1.5-flash`).
                      Pastikan `GOOGLE_API_KEY` sudah diatur di server.
                      Jika kosong, akan digunakan model default: `{DEFAULT_TEXT_MODEL_NAME}`.
                      Jika model yang dimasukkan tidak valid atau bukan model Google, sistem akan fallback ke default Google.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aiPersona"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <UserCog className="h-4 w-4" />
                      Persona AI Kustom untuk Analisis Teks
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Jelaskan bagaimana AI harus berperilaku... Kosongkan untuk default."
                        {...field}
                        className="text-sm min-h-[120px]"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Deskripsi ini akan digunakan sebagai instruksi sistem untuk AI analisis chart.
                      Kosongkan untuk menggunakan persona default (didefinisikan di kode alur AI).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-3">
                  <Label className="flex items-center gap-1">
                      <MessageCircleQuestion className="h-4 w-4" />
                      Informasi Model AI Sistem
                  </Label>
                  <div className="text-sm p-3 bg-muted/50 rounded-md space-y-2 border">
                      <div>
                        <p>Analisis Teks (Google AI): Jika input model di atas kosong atau tidak valid, akan digunakan <span className="font-mono text-xs">{DEFAULT_TEXT_MODEL_NAME}</span> (membutuhkan `GOOGLE_API_KEY`).</p>
                        <p>Anotasi Gambar (Google AI): Tetap menggunakan <span className="font-mono text-xs">{GEMINI_IMAGE_MODEL_NAME}</span> (membutuhkan `GOOGLE_API_KEY`).</p>
                      </div>
                  </div>
                   <p className="text-xs text-muted-foreground">
                      Model spesifik yang digunakan untuk analisis teks bergantung pada input Anda dan ketersediaan `GOOGLE_API_KEY` di server.
                   </p>
              </div>

            </CardContent>
            <CardFooter>
              <Button type="submit">Simpan Pengaturan</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
    
