'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Clock, Upload, TrendingUp, Loader2 } from 'lucide-react';

function DashboardContent() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [docs, setDocs] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!authLoading) {
      Promise.all([
        api.getDocuments().catch(() => []),
        api.getChatHistory().catch(() => []),
      ]).then(([documents, chatHistory]) => {
        setDocs(documents);
        setChats(chatHistory);
        setLoading(false);
      });
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-medical-500" />
      </div>
    );
  }

  const stats = [
    { label: 'Documents', value: user?._count.documents ?? docs.length, icon: FileText, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Total Chats', value: user?._count.chats ?? chats.length, icon: MessageSquare, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: 'Recent Activity', value: 'Today', icon: TrendingUp, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Here&apos;s your medical dashboard overview</p>
        </div>
        <Link href="/documents">
          <Button>
            <Upload className="h-4 w-4 mr-2" /> Upload Document
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Documents</h2>
          {docs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No documents uploaded yet</p>
              <Link href="/documents">
                <Button variant="outline" size="sm" className="mt-3">Upload your first document</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {docs.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-medical-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{doc.filename}</span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Chats</h2>
          {chats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No conversations yet</p>
              <Link href="/chat">
                <Button variant="outline" size="sm" className="mt-3">Start a new chat</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {chats.slice(0, 5).map((chat) => (
                <Link key={chat.id} href={`/chat?id=${chat.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-medical-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{chat.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{chat._count.messages} msgs</span>
                      <Clock className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <Navbar />
      <DashboardContent />
    </AuthProvider>
  );
}
