
"use client";

import { useEffect } from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, UserCog, Cpu, Info, MessageCircleQuestion } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Skema validasi untuk form
const AiIntegrationFormSchema = z.object({
  // Kunci API tidak lagi diinput di sini, hanya pemilihan provider
  aiPersona: z.string().optional(),
  preferredAiProvider: z.enum(['gemini', 'openai']).optional().default('gemini'),
});

type AiIntegrationFormValues = z.infer<typeof AiIntegrationFormSchema>;

const DEFAULT_AI_PERSONA = "Anda adalah seorang analis perdagangan Forex ahli. Analisis gambar grafik Forex yang diberikan.\nBerikan rekomendasi perdagangan (Beli, Jual, atau Tunggu) dan penjelasan rinci mengenai alasan Anda.\nFokus pada wawasan yang jelas dan dapat ditindaklanjuti.";
const GEMINI_TEXT_MODEL_NAME = "googleai/gemini-2.0-flash";
const GEMINI_IMAGE_MODEL_NAME = "googleai/gemini-2.0-flash-exp";
const OPENAI_TEXT_MODEL_NAME = "openai/gpt-4o"; // Contoh model OpenAI

export default function AiIntegrationPage() {
  const { toast } = useToast();

  const form = useForm<AiIntegrationFormValues>({
    resolver: zodResolver(AiIntegrationFormSchema),
    defaultValues: {
      aiPersona: DEFAULT_AI_PERSONA,
      preferredAiProvider: 'gemini',
    },
  });

  useEffect(() => {
    // Muat nilai dari localStorage saat komponen dimuat
    const storedAiPersona = localStorage.getItem('aiCustomPersona');
    const storedAiProvider = localStorage.getItem('aiProviderPreference') as 'gemini' | 'openai' | null;
    
    form.reset({
      aiPersona: storedAiPersona || DEFAULT_AI_PERSONA,
      preferredAiProvider: storedAiProvider || 'gemini',
    });
  }, [form]);

  const onSubmit: SubmitHandler<AiIntegrationFormValues> = (data) => {
    if (data.aiPersona && data.aiPersona.trim() !== "") {
      localStorage.setItem('aiCustomPersona', data.aiPersona);
    } else {
      localStorage.setItem('aiCustomPersona', ""); 
    }

    if (data.preferredAiProvider) {
      localStorage.setItem('aiProviderPreference', data.preferredAiProvider);
    } else {
      localStorage.removeItem('aiProviderPreference'); // Atau set ke default 'gemini'
    }

    toast({
      title: "Pengaturan Disimpan",
      description: (
        <div>
          <p>Pengaturan AI telah berhasil disimpan ke penyimpanan lokal browser Anda.</p>
          <p className="font-semibold mt-2">Catatan Penting Kunci API:</p>
          <p className="text-xs">
            Pemilihan penyedia AI di sini hanya mengatur preferensi model yang akan coba digunakan.
            Pastikan Kunci API yang sesuai (misalnya, GOOGLE_API_KEY untuk Gemini, OPENAI_API_KEY untuk OpenAI) 
            telah dikonfigurasi dengan benar di variabel lingkungan sisi server agar pilihan ini berfungsi.
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
          Halaman ini memungkinkan Anda menyesuaikan beberapa aspek perilaku AI.
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
            Kelola preferensi penyedia model AI dan persona kustom untuk analisis.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="preferredAiProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Cpu className="h-4 w-4" />
                      Pilih Penyedia Model AI Utama
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih penyedia AI" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gemini">Google Gemini (Default)</SelectItem>
                        <SelectItem value="openai">OpenAI GPT-4o (Eksperimental)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Memilih penyedia akan memengaruhi model yang digunakan untuk analisis teks.
                      Anostasi gambar saat ini hanya didukung oleh Gemini.
                      Pastikan Kunci API yang relevan sudah diatur di server.
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
                      Model AI yang Mungkin Digunakan (Informasi)
                  </Label>
                  <div className="text-sm p-3 bg-muted/50 rounded-md space-y-2 border">
                      <div>
                        <p className="font-semibold">Jika memilih Google Gemini:</p>
                        <p className="ml-2">Model Teks: <span className="font-mono text-xs">{GEMINI_TEXT_MODEL_NAME}</span></p>
                        <p className="ml-2">Model Anotasi Gambar: <span className="font-mono text-xs">{GEMINI_IMAGE_MODEL_NAME}</span></p>
                      </div>
                      <div>
                        <p className="font-semibold">Jika memilih OpenAI GPT-4o:</p>
                        <p className="ml-2">Model Teks: <span className="font-mono text-xs">{OPENAI_TEXT_MODEL_NAME}</span></p>
                        <p className="ml-2">Model Anotasi Gambar: <span className="italic">Tidak ada (gambar asli akan ditampilkan)</span></p>
                      </div>
                  </div>
                   <p className="text-xs text-muted-foreground">
                      Model spesifik yang digunakan dapat bervariasi tergantung ketersediaan dan konfigurasi backend.
                      Pastikan Kunci API (GOOGLE_API_KEY, OPENAI_API_KEY) telah diatur di server.
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
