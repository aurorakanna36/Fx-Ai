
"use client";

import type React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppContainer from '@/components/layout/app-container';

const ClientLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!currentUser && pathname !== '/login' && pathname !== '/create-account') {
        router.push('/login');
      } else if (currentUser && (pathname === '/login' || pathname === '/create-account')) {
        router.push('/');
      }
    }
  }, [currentUser, loading, pathname, router]);

  if (loading && pathname !== '/login' && pathname !== '/create-account') {
    return <div className="flex justify-center items-center h-screen">Memuat Aplikasi...</div>;
  }

  if (pathname === '/login' || pathname === '/create-account') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppContainer>{children}</AppContainer>
    </SidebarProvider>
  );
};

export default ClientLayoutWrapper;
