
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Terminal, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

type AiIntegrationFormValues = z.infer<typeof aiIntegrationFormSchema>;

// This can be exported to a config file
const defaultValues: Partial<AiIntegrationFormValues> = {
  aiProviderName: "Gemini AI (Default)",
  apiKey: "",
  apiPrompt: `Anda adalah seorang analis perdagangan Forex ahli. Analisis gambar grafik Forex yang diberikan dan berikan rekomendasi perdagangan (Beli, Jual, atau Tunggu) beserta penjelasan rinci mengenai alasan Anda.

Gambar Grafik: {{media url=chartDataUri}}

Berikan output dalam format JSON.
`,
};

export default function AiIntegrationPage() {
  const { toast } = useToast();
  const [isDefaultAi, setIsDefaultAi] = useState(true); // Assuming Gemini is default

  const form = useForm<AiIntegrationFormValues>({
    resolver: zodResolver(aiIntegrationFormSchema),
    defaultValues,
    mode: "onChange", // or "onBlur", "onSubmit"
  });

  function onSubmit(data: AiIntegrationFormValues) {
    // In a real application, you would save these settings securely on the server.
    // For this mock, we'll just show a toast.
    console.log("Data Integrasi AI Dikirim:", data);
    toast({
      title: "Pengaturan AI Diperbarui (Tiruan)",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="aiProviderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Penyedia AI</FormLabel>
                    <FormControl>
                      <Input placeholder="mis., Gemini, OpenAI GPT-4" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nama penyedia layanan AI yang saat ini digunakan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kunci API {isDefaultAi && "(Opsional untuk AI Default)"}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Masukkan Kunci API untuk AI kustom" {...field} />
                    </FormControl>
                    <FormDescription>
                      Masukkan kunci API untuk penyedia AI yang dipilih. Biarkan kosong jika menggunakan AI terintegrasi default.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt API AI</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Masukkan prompt sistem untuk model AI..."
                        className="min-h-[200px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Prompt sistem yang digunakan untuk menginstruksikan model AI untuk analisis grafik.
                      Gunakan `{{media url=chartDataUri}}` sebagai placeholder untuk gambar grafik.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <KeyRound className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Simpan Konfigurasi
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
