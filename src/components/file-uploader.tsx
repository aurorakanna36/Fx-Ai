
"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Camera, Trash2 } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FileUploaderProps {
  onFileChange: (dataUri: string, file: File) => void;
  onFileReset: () => void;
  currentImagePreview: string | null;
}

export default function FileUploader({ onFileChange, currentImagePreview, onFileReset }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Ukuran file melebihi batas 5MB.");
        onFileReset(); // Reset if there was a previous image
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Jenis file tidak valid. Silakan unggah gambar.");
        onFileReset();
        return;
      }
      
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        onFileChange(e.target?.result as string, file);
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value to allow uploading the same file again
    event.target.value = "";
  };

  const handleReset = () => {
    setError(null);
    onFileReset();
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Unggah atau Pindai Grafik</CardTitle>
        <CardDescription>Pilih gambar dari galeri Anda atau gunakan kamera.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentImagePreview && (
          <div className="mt-4 relative group">
            <Image
              src={currentImagePreview}
              alt="Pratinjau Grafik"
              width={600}
              height={400}
              className="rounded-md object-contain max-h-[300px] w-full border"
              data-ai-hint="grafik forex"
            />
            <Button
              variant="destructive"
              size="icon"
              onClick={handleReset}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Hapus gambar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!currentImagePreview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                variant="outline"
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                Unggah dari Galeri
              </Button>
            </div>
            <div>
              <Input
                id="camera-upload"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                ref={cameraInputRef}
                className="hidden"
              />
              <Button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full"
                variant="outline"
              >
                <Camera className="mr-2 h-4 w-4" />
                Pindai dengan Kamera
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
