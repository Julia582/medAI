'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Trash2, File, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

function DocumentsContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!authLoading) fetchDocs();
  }, [authLoading, isAuthenticated, router, fetchDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF, DOCX, and TXT files are supported');
      return;
    }

    setUploading(true);
    try {
      await api.uploadDocument(file);
      toast.success('Document uploaded successfully');
      fetchDocs();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await api.deleteDocument(id);
      toast.success('Document deleted');
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (authLoading || (loading && documents.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-medical-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medical Documents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Upload and manage your medical records</p>
        </div>
        <div>
          <Button disabled={uploading} className="relative" onClick={() => fileInputRef.current?.click()}>
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No documents yet</h3>
          <p className="text-gray-500 mb-6">Upload your first medical document to get started</p>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" /> Upload Document
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-medical-500/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-medical-100 dark:bg-medical-900/30">
                  <File className="h-6 w-6 text-medical-600 dark:text-medical-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{doc.filename}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>{formatSize(doc.fileSize)}</span>
                    <span>•</span>
                    <span>{doc.fileType?.toUpperCase()}</span>
                    <span>•</span>
                    <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{doc._count.embeddings} chunks</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <AuthProvider>
      <Navbar />
      <DocumentsContent />
    </AuthProvider>
  );
}
