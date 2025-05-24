
// src/app/admin/user-data/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface UserDisplayData {
  uid: string;
  username: string;
  role: 'admin' | 'guest';
  tokens: number;
}

const USERS_PER_PAGE = 10;

export default function UserDataPage() {
  const [allUsers, setAllUsers] = useState<UserDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/'); // Redirect non-admins
    }
  }, [currentUser, router]);

  const fetchUsers = useCallback(async () => {
    if (!db) {
      setError("Koneksi ke Firebase Realtime Database tidak tersedia.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const loadedUsers: UserDisplayData[] = Object.keys(usersData).map(uid => ({
          uid,
          username: usersData[uid].username,
          role: usersData[uid].role,
          tokens: usersData[uid].tokens,
        }));
        setAllUsers(loadedUsers);
      } else {
        setAllUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Gagal mengambil data pengguna dari database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  // Pagination logic
  const indexOfLastUser = currentPage * USERS_PER_PAGE;
  const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
  const currentUsers = allUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(allUsers.length / USERS_PER_PAGE);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat data pengguna...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive">Terjadi Kesalahan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-destructive">
            <AlertCircle className="mr-2 h-5 w-5" />
            <p>{error}</p>
          </div>
          <Button onClick={fetchUsers} className="mt-4">Coba Lagi</Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="text-center p-8">Anda tidak diizinkan mengakses halaman ini.</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Data Pengguna Terdaftar</CardTitle>
          </div>
          <CardDescription>
            Daftar semua pengguna yang telah membuat akun di sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Belum ada pengguna yang terdaftar.</p>
          ) : (
            <>
              <Table>
                <TableCaption>Total Pengguna: {allUsers.length}. Menampilkan halaman {currentPage} dari {totalPages}.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Peran</TableHead>
                    <TableHead className="text-right">Token</TableHead>
                    <TableHead className="text-center">UID (Database)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.role === 'admin' ? 'Admin' : 'Guest'}</TableCell>
                      <TableCell className="text-right">{user.tokens}</TableCell>
                      <TableCell className="text-xs text-muted-foreground text-center">{user.uid}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4 mt-6">
                  <Button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Halaman {currentPage} / {totalPages}
                  </span>
                  <Button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    Berikutnya
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
