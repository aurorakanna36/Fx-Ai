
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Settings } from 'lucide-react';

export default function AiIntegrationPage() {
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // PENTING: Dalam aplikasi nyata, jangan pernah mengirim Kunci API seperti ini dari klien.
    // Kunci API harus dikelola dengan aman di backend atau melalui variabel lingkungan.
    // Ini hanya untuk simulasi formulir.
    console.log("Kunci API yang dimasukkan:", apiKey);
    toast({
      title: "Pengaturan Disimpan (Simulasi)",
      description: "Kunci API telah berhasil 'disimpan'. (Ini hanya simulasi)",
    });
    // Di sini Anda bisa menambahkan logika untuk mengirim apiKey ke backend yang aman jika diperlukan.
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Pengaturan Integrasi AI</CardTitle>
          </div>
          <CardDescription>
            Kelola konfigurasi untuk layanan AI Anda, seperti Kunci API.
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
                type="password" // Gunakan type="password" untuk menyembunyikan input
                placeholder="Masukkan Kunci API Anda"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Kunci API Anda akan disimpan dengan aman. Untuk prototipe ini, penyimpanan hanya disimulasikan.
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
