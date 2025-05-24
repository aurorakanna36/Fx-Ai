
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
  aiModelName: z.string().optional().describe("Nama model AI untuk analisis teks, mis: googleai/gemini-1.5-flash"),
  aiPersona: z.string().optional(),
});

type AiIntegrationFormValues = z.infer<typeof AiIntegrationFormSchema>;

const DEFAULT_AI_PERSONA = "Anda adalah seorang analis perdagangan Forex ahli. Analisis gambar grafik Forex yang diberikan.\nBerikan rekomendasi perdagangan (Beli, Jual, atau Tunggu) dan penjelasan rinci mengenai alasan Anda.\nFokus pada wawasan yang jelas dan dapat ditindaklanjuti.";
const DEFAULT_TEXT_MODEL_NAME = "googleai/gemini-2.0-flash";
const GEMINI_IMAGE_MODEL_NAME = "googleai/gemini-2.0-flash-exp"; // Model untuk anotasi gambar tetap

export default function AiIntegrationPage() {
  const { toast } = useToast();

  const form = useForm<AiIntegrationFormValues>({
    resolver: zodResolver(AiIntegrationFormSchema),
    defaultValues: {
      aiModelName: DEFAULT_TEXT_MODEL_NAME,
      aiPersona: DEFAULT_AI_PERSONA,
    },
  });

  useEffect(() => {
    // Muat nilai dari localStorage saat komponen dimuat
    const storedAiModelName = localStorage.getItem('aiModelNamePreference');
    const storedAiPersona = localStorage.getItem('aiCustomPersona');
    
    form.reset({
      aiModelName: storedAiModelName || DEFAULT_TEXT_MODEL_NAME,
      aiPersona: storedAiPersona || DEFAULT_AI_PERSONA,
    });
  }, [form]);

  const onSubmit: SubmitHandler<AiIntegrationFormValues> = (data) => {
    if (data.aiModelName && data.aiModelName.trim() !== "") {
      localStorage.setItem('aiModelNamePreference', data.aiModelName);
    } else {
      localStorage.setItem('aiModelNamePreference', DEFAULT_TEXT_MODEL_NAME); 
    }

    if (data.aiPersona && data.aiPersona.trim() !== "") {
      localStorage.setItem('aiCustomPersona', data.aiPersona);
    } else {
      localStorage.setItem('aiCustomPersona', ""); // Kosongkan jika input kosong, agar default dari kode digunakan
    }

    toast({
      title: "Pengaturan Disimpan",
      description: (
        <div>
          <p>Pengaturan AI telah berhasil disimpan ke penyimpanan lokal browser Anda.</p>
          <p className="font-semibold mt-2">Catatan Penting Kunci API & Model:</p>
          <p className="text-xs">
            Nama model AI yang Anda masukkan akan dicoba untuk digunakan untuk analisis teks.
            Pastikan Kunci API yang sesuai (misalnya, GOOGLE_API_KEY untuk model Google) 
            telah dikonfigurasi dengan benar di variabel lingkungan sisi server agar pilihan ini berfungsi.
            Jika model tidak valid atau Kunci API tidak ada, sistem akan mencoba fallback ke model default.
            Anotasi gambar saat ini tetap menggunakan model Gemini ({GEMINI_IMAGE_MODEL_NAME}).
          </p>
        </div>
      ),
      duration: 9000, 
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <Alert variant="default" className="max-w-3xl mx-auto bg-primary/10 border-primary/30">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary">Informasi Konfigurasi AI</AlertTitle>
        <AlertDescription>
          Halaman ini memungkinkan Anda menyesuaikan model AI untuk analisis teks dan persona AI.
          Pengelolaan Kunci API yang sebenarnya dilakukan di sisi server melalui variabel lingkungan.
        </AlertDescription>
      </Alert>

      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Pengaturan Integrasi AI</CardTitle>
          </div>
          <CardDescription>
            Kelola nama model AI untuk analisis teks dan persona kustom.
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
                      Nama Model AI untuk Analisis Teks
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="mis: googleai/gemini-1.5-flash"
                        {...field}
                        className="text-sm"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Masukkan nama model lengkap (misalnya, googleai/gemini-1.5-flash, googleai/gemini-2.0-flash).
                      Pastikan Kunci API yang relevan (mis. GOOGLE_API_KEY) sudah diatur di server.
                      Jika kosong atau tidak valid, akan digunakan {DEFAULT_TEXT_MODEL_NAME}.
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
                      Kosongkan untuk menggunakan persona default.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-3">
                  <Label className="flex items-center gap-1">
                      <MessageCircleQuestion className="h-4 w-4" />
                      Informasi Model AI
                  </Label>
                  <div className="text-sm p-3 bg-muted/50 rounded-md space-y-2 border">
                      <div>
                        <p>Model Default untuk Analisis Teks (jika input kosong/tidak valid): <span className="font-mono text-xs">{DEFAULT_TEXT_MODEL_NAME}</span></p>
                        <p>Model untuk Anotasi Gambar (tetap): <span className="font-mono text-xs">{GEMINI_IMAGE_MODEL_NAME}</span></p>
                      </div>
                  </div>
                   <p className="text-xs text-muted-foreground">
                      Model spesifik yang digunakan dapat bervariasi tergantung input Anda, ketersediaan, dan konfigurasi backend.
                      Pastikan Kunci API (misalnya GOOGLE_API_KEY) telah diatur di server.
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
