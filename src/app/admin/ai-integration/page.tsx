
"use client";

import { useEffect } from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Settings, UserCog, Cpu, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Skema validasi untuk form
const AiIntegrationFormSchema = z.object({
  apiKey: z.string().optional(), // API Key bersifat opsional di form ini karena hanya simulasi
  aiPersona: z.string().optional(),
});

type AiIntegrationFormValues = z.infer<typeof AiIntegrationFormSchema>;

// Model yang digunakan (bisa diambil dari konfigurasi jika lebih dinamis nantinya)
const TEXT_MODEL_NAME = "googleai/gemini-2.0-flash"; // Sesuai dengan src/ai/genkit.ts
const IMAGE_MODEL_NAME = "googleai/gemini-2.0-flash-exp"; // Sesuai dengan alur analyze-forex-chart.ts
const DEFAULT_AI_PERSONA = "Anda adalah seorang analis perdagangan Forex ahli. Analisis gambar grafik Forex yang diberikan.\nBerikan rekomendasi perdagangan (Beli, Jual, atau Tunggu) dan penjelasan rinci mengenai alasan Anda.\nFokus pada wawasan yang jelas dan dapat ditindaklanjuti.";

export default function AiIntegrationPage() {
  const { toast } = useToast();

  const form = useForm<AiIntegrationFormValues>({
    resolver: zodResolver(AiIntegrationFormSchema),
    defaultValues: {
      apiKey: '',
      aiPersona: DEFAULT_AI_PERSONA,
    },
  });

  useEffect(() => {
    // Muat nilai dari localStorage saat komponen dimuat
    const storedApiKey = localStorage.getItem('aiApiKey_simulated');
    const storedAiPersona = localStorage.getItem('aiCustomPersona');
    
    form.reset({
      apiKey: storedApiKey || '',
      aiPersona: storedAiPersona || DEFAULT_AI_PERSONA,
    });
  }, [form]);

  const onSubmit: SubmitHandler<AiIntegrationFormValues> = (data) => {
    if (data.apiKey) {
      localStorage.setItem('aiApiKey_simulated', data.apiKey);
    } else {
      localStorage.removeItem('aiApiKey_simulated');
    }
    
    if (data.aiPersona && data.aiPersona.trim() !== "") {
      localStorage.setItem('aiCustomPersona', data.aiPersona);
    } else {
      // Jika kosong, kita bisa menyimpan string kosong atau menghapusnya
      // agar default dari kode digunakan.
      localStorage.setItem('aiCustomPersona', ""); // Menyimpan string kosong agar bisa dibaca di page.tsx
    }

    toast({
      title: "Pengaturan Disimpan",
      description: (
        <div>
          <p>Pengaturan AI telah berhasil disimpan ke penyimpanan lokal browser Anda.</p>
          <p className="font-semibold mt-2">Catatan Penting Kunci API:</p>
          <p className="text-xs">Kunci API yang Anda masukkan di sini hanya disimpan secara lokal di browser Anda untuk tujuan simulasi UI ini. Ini TIDAK akan mengubah kunci API yang sebenarnya digunakan oleh layanan AI di backend. Kunci API untuk Genkit dikonfigurasi melalui variabel lingkungan di sisi server.</p>
        </div>
      ),
      duration: 7000, // Tampilkan toast lebih lama agar pesan penting terbaca
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <Alert variant="default" className="max-w-2xl mx-auto bg-primary/10 border-primary/30">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary">Informasi Konfigurasi AI</AlertTitle>
        <AlertDescription>
          Halaman ini memungkinkan Anda menyesuaikan beberapa aspek perilaku AI.
          Perlu diingat bahwa pengelolaan Kunci API yang sebenarnya dilakukan di sisi server.
        </AlertDescription>
      </Alert>

      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Pengaturan Integrasi AI</CardTitle>
          </div>
          <CardDescription>
            Kelola konfigurasi untuk layanan dan metode analisis AI Anda.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <KeyRound className="h-4 w-4" />
                      Kunci API AI (Simulasi)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Masukkan Kunci API Anda (simulasi)"
                        {...field}
                        className="text-sm"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Simulasi penyimpanan Kunci API. Disimpan di localStorage browser ini.
                      Ini TIDAK akan mengubah kunci yang digunakan oleh backend AI.
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
                        placeholder="Jelaskan bagaimana AI harus berperilaku atau fokus... Kosongkan untuk menggunakan persona default."
                        {...field}
                        className="text-sm min-h-[120px]"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Deskripsi ini akan digunakan sebagai instruksi sistem untuk AI analisis chart.
                      Kosongkan untuk menggunakan persona default yang ada di kode.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                      <Cpu className="h-4 w-4" />
                      Model AI yang Digunakan (Informasi)
                  </Label>
                  <div className="text-sm p-3 bg-muted/50 rounded-md space-y-1 border">
                      <p>Model Analisis Teks & Rekomendasi: <span className="font-semibold">{TEXT_MODEL_NAME}</span></p>
                      <p>Model Anotasi Gambar: <span className="font-semibold">{IMAGE_MODEL_NAME}</span></p>
                  </div>
                   <p className="text-xs text-muted-foreground">
                      Saat ini model tidak dapat diubah dari antarmuka ini dan diatur dalam kode.
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
