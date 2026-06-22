const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const AI_URL = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000/api';

class ApiClient {
  private accessToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }

  clearTokens() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const { data } = await res.json();
      this.setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useAi = false,
  ): Promise<T> {
    const base = useAi ? AI_URL : API_URL;
    const url = `${base}${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        res = await fetch(url, { ...options, headers });
      } else {
        this.clearTokens();
        window.location.href = '/auth/login';
        throw new Error('Session expired');
      }
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || error.detail || 'Request failed');
    }

    const json = await res.json();
    return useAi ? json : json.data;
  }

  // Auth
  register(data: { name: string; email: string; password: string }) {
    return this.request<{ accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  login(data: { email: string; password: string }) {
    return this.request<{ accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getProfile() {
    return this.request<{
      id: string;
      name: string;
      email: string;
      createdAt: string;
      _count: { documents: number; chats: number };
      recentChats: any[];
    }>('/auth/profile');
  }

  // Documents
  uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<{ id: string; filename: string }>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  getDocuments() {
    return this.request<Array<{
      id: string;
      filename: string;
      fileType: string;
      fileSize: number;
      uploadDate: string;
      _count: { embeddings: number };
    }>>('/documents');
  }

  deleteDocument(id: string) {
    return this.request<{ message: string }>(`/documents/${id}`, { method: 'DELETE' });
  }

  // Chat
  createChat(data?: { documentId?: string; title?: string }) {
    return this.request<{ id: string; title: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  getChatHistory() {
    return this.request<Array<{
      id: string;
      title: string;
      createdAt: string;
      saved: boolean;
      _count: { messages: number };
    }>>('/chat/history');
  }

  getChat(id: string) {
    return this.request<{
      id: string;
      title: string;
      messages: Array<{ id: string; role: string; content: string; createdAt: string }>;
      document: { id: string; filename: string } | null;
    }>(`/chat/${id}`);
  }

  sendMessage(chatId: string, data: { content: string; documentId?: string }) {
    return this.request<{
      answer: string;
      sources: Array<{ document_id: string; chunk_text: string; score: number; source: string }>;
      messageId: string;
    }>(`/chat/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  toggleSaveChat(chatId: string) {
    return this.request<{ id: string; saved: boolean }>(`/chat/${chatId}/save`, {
      method: 'PATCH',
    });
  }

  // AI Service
  aiQuery(data: { query: string; document_id?: string; history?: Array<{ role: string; content: string }> }) {
    return this.request<{ answer: string; sources: any[] }>('/query', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }
}

export const api = new ApiClient();
