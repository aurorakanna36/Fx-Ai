// src/app/token/page.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Ticket, CreditCard, QrCode, Landmark, Banknote, KeyRound, UserCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  priceInfo: string; // Placeholder for price, e.g. "Rp 50.000"
  icon: React.ElementType;
}

const tokenPackages: TokenPackage[] = [
  { id: "paket_a", name: "Paket A", tokens: 100, priceInfo: "Rp 100.000 (Estimasi)", icon: Ticket },
  { id: "paket_b", name: "Paket B", tokens: 75, priceInfo: "Rp 75.000 (Estimasi)", icon: Ticket },
  { id: "paket_c", name: "Paket C", tokens: 30, priceInfo: "Rp 30.000 (Estimasi)", icon: Ticket },
];

type PaymentMethod = "qris" | "bank" | "ewallet" | "";
type BankOption = "bca" | "mandiri" | "bni" | "";
type EwalletOption = "dana" | "gopay" | "paypal" | "";

export default function TokenPage() {
  const { currentUser, addTokens, isPaymentModalOpen, openPaymentModal, closePaymentModal } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");
  const [selectedBank, setSelectedBank] = useState<BankOption>("");
  const [selectedEwallet, setSelectedEwallet] = useState<EwalletOption>("");
  const [paymentKey, setPaymentKey] = useState(""); // Dummy key
  const { toast } = useToast();


  const handlePackageSelect = (pkg: TokenPackage) => {
    setSelectedPackage(pkg);
    setPaymentMethod(""); // Reset payment method
    setSelectedBank("");
    setSelectedEwallet("");
    setPaymentKey("");
    openPaymentModal();
  };

  const handleConfirmPayment = async () => {
    if (!selectedPackage || !currentUser) return;
    if (!paymentMethod) {
      toast({ title: "Error", description: "Silakan pilih metode pembayaran.", variant: "destructive"});
      return;
    }
    if (paymentMethod === 'bank' && !selectedBank) {
      toast({ title: "Error", description: "Silakan pilih bank.", variant: "destructive"});
      return;
    }
    if (paymentMethod === 'ewallet' && !selectedEwallet) {
      toast({ title: "Error", description: "Silakan pilih e-wallet.", variant: "destructive"});
      return;
    }
    // In a real app, process payment here. For prototype, just add tokens.
    await addTokens(selectedPackage.tokens);
    toast({ title: "Pembayaran Berhasil (Simulasi)", description: `${selectedPackage.tokens} token telah ditambahkan ke akun ${currentUser.username}.`});
    closePaymentModal();
  };

  if (!currentUser) {
    return <div className="container mx-auto py-8 px-4 text-center">Harap login untuk melihat halaman ini.</div>;
  }
  if (currentUser.role === 'admin') {
    return <div className="container mx-auto py-8 px-4 text-center">Admin tidak memerlukan manajemen token.</div>;
  }


  return (
    <div className="container mx-auto py-8 px-4 space-y-10">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <CreditCard className="h-12 w-12 mx-auto text-primary mb-3" />
          <CardTitle className="text-3xl font-bold">Manajemen Token Saya</CardTitle>
          <CardDescription className="text-lg">
            Token Anda saat ini: <span className="font-bold text-primary text-2xl">{currentUser?.tokens ?? 0}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-center text-muted-foreground">
            Setiap analisis grafik menggunakan 1 token. Beli lebih banyak token untuk melanjutkan penggunaan layanan.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h2 className="text-2xl font-semibold mb-6 text-center text-foreground">Pilih Paket Token</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {tokenPackages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-lg transition-shadow duration-200 flex flex-col">
              <CardHeader className="items-center text-center">
                <pkg.icon className="h-10 w-10 mb-2 text-accent" />
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription>{pkg.priceInfo}</CardDescription>
              </CardHeader>
              <CardContent className="text-center flex-grow">
                <p className="text-4xl font-bold text-primary">{pkg.tokens}</p>
                <p className="text-muted-foreground">Token</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handlePackageSelect(pkg)}>
                  Pilih Paket Ini
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      <Separator />

      <Card>
        <CardHeader>
            <CardTitle className="text-xl">Informasi Harga</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">Harga per token (satuan) adalah <span className="font-semibold text-primary">Rp 1.000</span> (Estimasi).</p>
            <p className="text-xs mt-1">*Harga dapat berubah sewaktu-waktu. Pembelian paket mungkin memberikan harga yang lebih baik.</p>
        </CardContent>
      </Card>


      {selectedPackage && (
        <AlertDialog open={isPaymentModalOpen} onOpenChange={open => !open && closePaymentModal()}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">Konfirmasi Pembelian: {selectedPackage.name}</AlertDialogTitle>
              <AlertDialogDescription>
                Anda akan membeli {selectedPackage.tokens} token. Silakan lengkapi detail pembayaran.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-4 my-4">
              <div>
                <Label htmlFor="usernameDisplay" className="flex items-center gap-1"><UserCircle className="h-4 w-4" />Username</Label>
                <Input id="usernameDisplay" value={currentUser?.username || ''} readOnly className="mt-1 bg-muted" />
              </div>
              <div>
                <Label htmlFor="paymentKey" className="flex items-center gap-1"><KeyRound className="h-4 w-4" />Kunci Pembayaran (Dummy)</Label>
                <Input 
                    id="paymentKey" 
                    type="text" 
                    value={paymentKey} 
                    onChange={(e) => setPaymentKey(e.target.value)} 
                    placeholder="Masukkan kunci dummy (mis: 12345)" 
                    className="mt-1"
                />
                 <p className="text-xs text-muted-foreground mt-1">Ini adalah field dummy untuk simulasi.</p>
              </div>

              <div>
                <Label htmlFor="paymentMethod" className="flex items-center gap-1"><CreditCard className="h-4 w-4" />Metode Pembayaran</Label>
                <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qris"><div className="flex items-center gap-2"><QrCode className="h-4 w-4"/>QRIS</div></SelectItem>
                    <SelectItem value="bank"><div className="flex items-center gap-2"><Landmark className="h-4 w-4"/>Transfer Bank</div></SelectItem>
                    <SelectItem value="ewallet"><div className="flex items-center gap-2"><Banknote className="h-4 w-4"/>E-Wallet</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === 'qris' && (
                <div className="text-center p-4 border rounded-md bg-muted/50">
                  <p className="mb-2 font-semibold">Pindai QRIS Berikut:</p>
                  <Image src="https://placehold.co/200x200.png" alt="QRIS Dummy" width={150} height={150} className="mx-auto rounded-md" data-ai-hint="kode qr pembayaran"/>
                  <p className="text-xs mt-2 text-muted-foreground">(Ini adalah gambar QRIS dummy untuk simulasi)</p>
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div>
                  <Label htmlFor="bankOption">Pilih Bank</Label>
                  <Select value={selectedBank} onValueChange={(value) => setSelectedBank(value as BankOption)}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Pilih bank tujuan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bca">Bank BCA</SelectItem>
                      <SelectItem value="mandiri">Bank Mandiri</SelectItem>
                      <SelectItem value="bni">Bank BNI</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedBank && <p className="text-xs mt-2 text-muted-foreground">Silakan transfer ke rekening {selectedBank.toUpperCase()} (detail dummy akan muncul di sini).</p>}
                </div>
              )}

              {paymentMethod === 'ewallet' && (
                <div>
                  <Label htmlFor="ewalletOption">Pilih E-Wallet</Label>
                  <Select value={selectedEwallet} onValueChange={(value) => setSelectedEwallet(value as EwalletOption)}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Pilih e-wallet tujuan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dana">DANA</SelectItem>
                      <SelectItem value="gopay">GoPay</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedEwallet && <p className="text-xs mt-2 text-muted-foreground">Instruksi pembayaran untuk {selectedEwallet} akan muncul di sini (dummy).</p>}
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={closePaymentModal}>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmPayment} disabled={!paymentKey || !paymentMethod || (paymentMethod === 'bank' && !selectedBank) || (paymentMethod === 'ewallet' && !selectedEwallet)}>
                Konfirmasi Pembayaran
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
