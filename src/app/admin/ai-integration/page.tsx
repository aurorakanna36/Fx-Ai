
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Settings, UserCog, Cpu } from 'lucide-react';

// Model yang digunakan (bisa diambil dari konfigurasi jika lebih dinamis nantinya)
const TEXT_MODEL_NAME = "googleai/gemini-2.0-flash";
const IMAGE_MODEL_NAME = "googleai/gemini-2.0-flash-exp";
const DEFAULT_AI_PERSONA = "Anda adalah seorang analis perdagangan Forex ahli. Analisis gambar grafik Forex yang diberikan.\nBerikan rekomendasi perdagangan (Beli, Jual, atau Tunggu) dan penjelasan rinci mengenai alasan Anda.\nFokus pada wawasan yang jelas dan dapat ditindaklanjuti.";


export default function AiIntegrationPage() {
  const [apiKey, setApiKey] = useState('');
  const [aiPersona, setAiPersona] = useState(DEFAULT_AI_PERSONA);
  const { toast } = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem('aiApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    const storedAiPersona = localStorage.getItem('aiCustomPersona');
    if (storedAiPersona) {
      setAiPersona(storedAiPersona);
    } else {
      setAiPersona(DEFAULT_AI_PERSONA); // Set default jika tidak ada di localStorage
    }
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // PENTING: Dalam aplikasi nyata, jangan pernah mengirim Kunci API seperti ini dari klien.
    // Ini hanya untuk simulasi formulir.
    localStorage.setItem('aiApiKey', apiKey);
    localStorage.setItem('aiCustomPersona', aiPersona);

    console.log("Kunci API yang dimasukkan:", apiKey);
    console.log("Persona AI Kustom:", aiPersona);
    toast({
      title: "Pengaturan Disimpan",
      description: "Kunci API dan Persona AI telah berhasil disimpan (disimulasikan ke localStorage).",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
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
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-1">
                <KeyRound className="h-4 w-4" />
                Kunci API AI (mis. Google AI Studio)
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Masukkan Kunci API Anda"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Kunci API Anda akan disimpan di localStorage peramban ini.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiPersona" className="flex items-center gap-1">
                <UserCog className="h-4 w-4" />
                Persona AI Kustom untuk Analisis Teks
              </Label>
              <Textarea
                id="aiPersona"
                placeholder="Jelaskan bagaimana AI harus berperilaku atau fokus..."
                value={aiPersona}
                onChange={(e) => setAiPersona(e.target.value)}
                className="text-sm min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Deskripsi ini akan digunakan sebagai instruksi sistem untuk AI analisis chart.
                Kosongkan untuk menggunakan persona default.
              </p>
            </div>
            
            <div className="space-y-2">
                <Label className="flex items-center gap-1">
                    <Cpu className="h-4 w-4" />
                    Model AI yang Digunakan (Informasi)
                </Label>
                <div className="text-sm p-3 bg-muted/50 rounded-md space-y-1">
                    <p>Model Analisis Teks: <span className="font-semibold">{TEXT_MODEL_NAME}</span></p>
                    <p>Model Anotasi Gambar: <span className="font-semibold">{IMAGE_MODEL_NAME}</span></p>
                </div>
                 <p className="text-xs text-muted-foreground">
                    Saat ini model tidak dapat diubah dari antarmuka ini.
                 </p>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit">Simpan Pengaturan</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
