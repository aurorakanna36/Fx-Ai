// src/contexts/AuthContext.tsx
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { db } from '@/lib/firebase'; // Import db
import { ref, set, get, update, child, push } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

interface User {
  uid: string;
  username: string;
  role: 'admin' | 'guest'; // Simplified roles
  tokens: number;
  // password field is not stored in context for security
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (usernameInput: string, passwordInput: string) => Promise<boolean>;
  logout: () => void;
  createAccount: (usernameInput: string, passwordInput: string) => Promise<boolean>;
  deductToken: () => Promise<boolean>;
  addTokens: (amount: number) => Promise<boolean>;
  isPaymentModalOpen: boolean;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to find user by username in RTDB
async function findUserByUsername(username: string): Promise<(User & { password?: string }) | null> {
  if (!db) return null;
  try {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const usersData = snapshot.val();
      for (const uid in usersData) {
        if (usersData[uid].username === username) {
          return { ...usersData[uid], uid };
        }
      }
    }
  } catch (error) {
    console.error("Error finding user by username:", error);
  }
  return null;
}

// Function to create initial users if they don't exist (for admin/guest)
// THIS IS A SIMPLIFIED SETUP FOR PROTOTYPE - In production, use secure user management.
async function ensureDefaultUsers() {
    if (!db) {
        console.warn("Firebase DB not available, cannot ensure default users.");
        return;
    }
    try {
        const adminUser = await findUserByUsername("admin");
        if (!adminUser) {
            const newAdminUid = push(child(ref(db), 'users')).key;
            if (newAdminUid) {
                 await set(ref(db, `users/${newAdminUid}`), {
                    username: "admin",
                    password: "admin", // Store plaintext for prototype ONLY. DO NOT DO THIS IN PRODUCTION.
                    role: "admin",
                    tokens: 10000, // Admins get many tokens
                });
                console.log("Admin user created in RTDB.");
            }
        }

        const guestUser = await findUserByUsername("guest");
        if (!guestUser) {
            const newGuestUid = push(child(ref(db), 'users')).key;
            if (newGuestUid) {
                await set(ref(db, `users/${newGuestUid}`), {
                    username: "guest",
                    password: "guest", // Store plaintext for prototype ONLY.
                    role: "guest",
                    tokens: 10, // Guests start with some tokens
                });
                console.log("Guest user created in RTDB.");
            }
        }
    } catch (error) {
        console.error("Error ensuring default users:", error);
    }
}


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);


  useEffect(() => {
    // Try to load user from localStorage on initial load
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);

    // Ensure default users exist in RTDB on first load if db is available
    if (typeof window !== 'undefined' && !localStorage.getItem('defaultUsersEnsured')) {
        ensureDefaultUsers().then(() => {
            localStorage.setItem('defaultUsersEnsured', 'true');
        });
    }
  }, []);

  useEffect(() => {
    if (!loading && !currentUser && pathname !== '/login' && pathname !== '/create-account') {
      router.push('/login');
    }
  }, [currentUser, loading, pathname, router]);

  const login = useCallback(async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    setLoading(true);
    let userFound: (User & { password?: string }) | null = null;

    if (db) {
      userFound = await findUserByUsername(usernameInput);
    }

    // Fallback for admin/guest if not in DB or DB not available
    if (!userFound && (usernameInput === "admin" || usernameInput === "guest")) {
      if (usernameInput === "admin" && passwordInput === "admin") {
        userFound = { uid: 'admin-local', username: "admin", password: "admin", role: "admin", tokens: 10000 };
      } else if (usernameInput === "guest" && passwordInput === "guest") {
        userFound = { uid: 'guest-local', username: "guest", password: "guest", role: "guest", tokens: 10 };
      }
    }
    
    if (userFound && userFound.password === passwordInput) {
      const userData: User = {
        uid: userFound.uid,
        username: userFound.username,
        role: userFound.role,
        tokens: userFound.tokens,
      };
      setCurrentUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      toast({ title: "Login Berhasil", description: `Selamat datang kembali, ${userData.username}!` });
      setLoading(false);
      router.push('/');
      return true;
    }

    toast({ title: "Login Gagal", description: "Username atau password salah.", variant: "destructive" });
    setLoading(false);
    return false;
  }, [router, toast]);

  const createAccount = useCallback(async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    if (!db) {
      toast({ title: "Registrasi Gagal", description: "Koneksi ke database tidak tersedia. Silakan coba lagi nanti atau hubungi administrator.", variant: "destructive" });
      return false;
    }
    setLoading(true);
    const existingUser = await findUserByUsername(usernameInput);
    if (existingUser) {
      toast({ title: "Registrasi Gagal", description: "Username sudah digunakan.", variant: "destructive" });
      setLoading(false);
      return false;
    }

    try {
      const newUid = push(child(ref(db), 'users')).key;
      if (!newUid) throw new Error("Gagal mendapatkan UID baru.");

      const newUserForDb = {
        username: usernameInput,
        password: passwordInput, // Store plaintext for prototype ONLY. DO NOT DO THIS IN PRODUCTION.
        role: 'guest' as 'guest',
        tokens: 10, // Default tokens for new users
      };
      await set(ref(db, `users/${newUid}`), newUserForDb);
      
      const newUser: User = {
        uid: newUid,
        username: usernameInput,
        role: 'guest',
        tokens: 10,
      };
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      toast({ title: "Registrasi Berhasil", description: `Selamat datang, ${newUser.username}! Anda mendapatkan 10 token awal.` });
      setLoading(false);
      router.push('/');
      return true;
    } catch (error) {
      console.error("Error creating account:", error);
      toast({ title: "Registrasi Gagal", description: "Terjadi kesalahan saat membuat akun.", variant: "destructive" });
      setLoading(false);
      return false;
    }
  }, [router, toast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
    toast({ title: "Logout Berhasil" });
  }, [router, toast]);

  const deductToken = useCallback(async (): Promise<boolean> => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true; // Admins have infinite tokens effectively

    const newTokens = currentUser.tokens - 1;
    if (newTokens < 0) {
      toast({ title: "Token Tidak Cukup", description: "Anda tidak memiliki cukup token untuk melakukan analisis.", variant: "destructive" });
      return false;
    }

    if (db && !currentUser.uid.endsWith('-local')) { // Don't update RTDB for local fallback users
      try {
        await update(ref(db, `users/${currentUser.uid}`), { tokens: newTokens });
      } catch (error) {
        console.error("Error deducting token from RTDB:", error);
        toast({ title: "Kesalahan Server", description: "Gagal mengurangi token di server.", variant: "destructive" });
        // Optionally revert UI change or handle differently
        return false;
      }
    }
    
    const updatedUser = { ...currentUser, tokens: newTokens };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return true;
  }, [currentUser, toast]);

  const addTokens = useCallback(async (amount: number): Promise<boolean> => {
    if (!currentUser) return false;

    const newTokens = currentUser.tokens + amount;
    if (db && !currentUser.uid.endsWith('-local')) { // Don't update RTDB for local fallback users
      try {
        await update(ref(db, `users/${currentUser.uid}`), { tokens: newTokens });
      } catch (error) {
        console.error("Error adding tokens to RTDB:", error);
        toast({ title: "Kesalahan Server", description: "Gagal menambah token di server.", variant: "destructive" });
        return false;
      }
    }

    const updatedUser = { ...currentUser, tokens: newTokens };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    toast({ title: "Top Up Berhasil", description: `${amount} token telah ditambahkan ke akun Anda.` });
    return true;
  }, [currentUser, toast]);

  const openPaymentModal = () => setIsPaymentModalOpen(true);
  const closePaymentModal = () => setIsPaymentModalOpen(false);

  if (loading && (pathname === '/login' || pathname === '/create-account')) {
     // Don't show loading spinner on login/create pages, allow them to render
  } else if (loading) {
    return <div className="flex justify-center items-center h-screen">Memuat...</div>; // Or a spinner component
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, createAccount, deductToken, addTokens, isPaymentModalOpen, openPaymentModal, closePaymentModal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
