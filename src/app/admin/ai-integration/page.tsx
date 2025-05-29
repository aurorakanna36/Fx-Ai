"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Settings,
  UserCog,
  Cpu,
  Info,
  MessageCircleQuestion,
  KeyRound,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ✅ Validasi hanya untuk apiKey (wajib)
const AiIntegrationFormSchema = z.object({
  apiKey: z.string().min(1, "API Key tidak boleh kosong"),
  aiModelName: z.string().optional(),
  aiPersona: z.string().optional(),
});

type AiIntegrationFormValues = z.infer<typeof AiIntegrationFormSchema>;

const DEFAULT_AI_PERSONA =
  "Anda adalah seorang analis perdagangan Forex ahli. Analisis gambar grafik Forex yang diberikan.\n" +
  "Berikan rekomendasi perdagangan (BUY, SELL, atau WAIT) dan penjelasan rinci mengenai alasan Anda.\n" +
  "Fokus pada wawasan yang jelas dan dapat ditindaklanjuti.";

const DEFAULT_TEXT_MODEL_NAME = "deepseek/deepseek-prover-v2:free";

export default function AiIntegrationPage() {
  const { toast } = useToast();

  const form = useForm<AiIntegrationFormValues>({
    resolver: zodResolver(AiIntegrationFormSchema),
    defaultValues: {
      apiKey: "",
      aiModelName: "",
      aiPersona: DEFAULT_AI_PERSONA,
    },
  });

  const onSubmit: SubmitHandler<AiIntegrationFormValues> = async (data) => {
    try {
      const res = await fetch("/api/set-ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: data.apiKey.trim(),
          aiModelName: data.aiModelName?.trim() || DEFAULT_TEXT_MODEL_NAME,
          aiPersona: data.aiPersona?.trim() || DEFAULT_AI_PERSONA,
        }),
      });
      const result = await res.json();
      console.log("res: ", result);
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Gagal menyimpan konfigurasi AI");
      }

      toast({
        title: "Berhasil",
        description: "Konfigurasi AI berhasil disimpan ke Firebase.",
      });
    } catch (e) {
      toast({
        title: "Gagal Menyimpan",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <Alert
        variant="default"
        className="max-w-3xl mx-auto bg-primary/10 border-primary/30"
      >
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary">Integrasi AI Global</AlertTitle>
        <AlertDescription>
          Admin dapat mengatur API Key, model AI, dan persona untuk analisis
          grafik. Konfigurasi ini akan digunakan oleh sistem untuk semua
          analisis.
        </AlertDescription>
      </Alert>

      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Pengaturan AI</CardTitle>
          </div>
          <CardDescription>
            Sistem akan menggunakan konfigurasi ini untuk semua analisis grafik.
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
                      API Key
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Masukkan API Key dari penyedia AI"
                        {...field}
                        className="text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aiModelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Cpu className="h-4 w-4" />
                      Nama Model AI
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: deepseek/deepseek-prover-v2:free"
                        {...field}
                        className="text-sm"
                      />
                    </FormControl>
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
                      Persona AI
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Instruksi khusus untuk AI dalam menganalisis chart"
                        {...field}
                        className="text-sm min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2 text-xs text-muted-foreground">
                <Label className="flex items-center gap-1">
                  <MessageCircleQuestion className="h-4 w-4" />
                  Catatan:
                </Label>
                <p>
                  Simpan API Key dan model yang valid dari penyedia seperti
                  OpenRouter, DeepSeek, Gemini, Claude, dll.
                </p>
                <p>
                  Jika model kosong, sistem akan menggunakan default:{" "}
                  <code>{DEFAULT_TEXT_MODEL_NAME}</code>
                </p>
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit">Simpan Konfigurasi</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
