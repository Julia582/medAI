'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, FileText, MessageSquare, Loader2 } from 'lucide-react';

function ProfileContent() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ documents: 0, chats: 0 });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      setStats({ documents: user._count.documents, chats: user._count.chats });
    }
  }, [authLoading, isAuthenticated, router, user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-medical-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Profile</h1>

      <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-medical-100 dark:bg-medical-900/30 flex items-center justify-center">
            <User className="h-8 w-8 text-medical-600 dark:text-medical-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-medical-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Documents</h3>
          </div>
          <p className="text-3xl font-bold text-medical-600">{stats.documents}</p>
        </div>
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="h-5 w-5 text-medical-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Chats</h3>
          </div>
          <p className="text-3xl font-bold text-medical-600">{stats.chats}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="destructive"
          onClick={() => { logout(); router.push('/'); }}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <Navbar />
      <ProfileContent />
    </AuthProvider>
  );
}
