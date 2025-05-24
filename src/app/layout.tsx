
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import AppContainer from '@/components/layout/app-container';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import type React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ChartSight AI',
  description: 'Analisis Grafik Forex Berbasis AI',
};

// Komponen untuk menangani logika pengalihan
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!currentUser && pathname !== '/login' && pathname !== '/create-account') {
        router.push('/login');
      } else if (currentUser && (pathname === '/login' || pathname === '/create-account')) {
        router.push('/'); // Jika sudah login, jangan biarkan akses halaman login/create
      }
    }
  }, [currentUser, loading, pathname, router]);

  if (loading && pathname !== '/login' && pathname !== '/create-account') {
    return <div className="flex justify-center items-center h-screen">Memuat Aplikasi...</div>;
  }
  
  // Jangan tampilkan AppContainer untuk halaman login & create account
  if (pathname === '/login' || pathname === '/create-account') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppContainer>{children}</AppContainer>
    </SidebarProvider>
  );
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ProtectedLayout>{children}</ProtectedLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
