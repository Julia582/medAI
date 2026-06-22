'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, Plus, Trash2, Loader2, Bookmark, BookmarkCheck, Bot, User } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

function ChatContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatIdFromUrl = searchParams.get('id');

  const [chats, setChats] = useState<any[]>([]);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [messages, setMessages] = useState<Array<{ id: string; role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages]);

  const loadChats = useCallback(async () => {
    try {
      const history = await api.getChatHistory();
      setChats(history);
    } catch { /* ignore */ }
  }, []);

  const loadChat = useCallback(async (chatId: string) => {
    try {
      const chat = await api.getChat(chatId);
      setCurrentChat(chat);
      setMessages(chat.messages || []);
    } catch (err: any) {
      toast.error('Failed to load chat');
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!authLoading) {
      loadChats().then(() => setLoading(false));
    }
  }, [authLoading, isAuthenticated, router, loadChats]);

  useEffect(() => {
    if (chatIdFromUrl && chats.length > 0) {
      loadChat(chatIdFromUrl);
    }
  }, [chatIdFromUrl, chats, loadChat]);

  const createNewChat = async () => {
    setCurrentChat(null);
    setMessages([]);
    router.push('/chat');
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    let chatId = currentChat?.id;
    if (!chatId) {
      try {
        const newChat = await api.createChat({ title: input.slice(0, 50) });
        chatId = newChat.id;
        setCurrentChat(newChat);
        router.push(`/chat?id=${chatId}`);
      } catch (err: any) {
        toast.error('Failed to create chat');
        return;
      }
    }

    const userMsg = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const result = await api.sendMessage(chatId, { content: userMsg.content });
      const responseContent = typeof result.answer === 'string'
        ? result.answer
        : JSON.stringify(result.answer);

      const sources = result.sources
        ?.filter((s: any) => s.chunk_text)
        .map((s: any) => `> 📄 ${s.source}: ${s.chunk_text}`)
        .join('\n\n');

      const fullResponse = sources
        ? `${responseContent}\n\n---\n\n**Sources:**\n${sources}`
        : responseContent;

      setMessages((prev) => [
        ...prev,
        { id: result.messageId, role: 'assistant', content: fullResponse },
      ]);
      loadChats();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSave = async (chatId: string) => {
    try {
      const result = await api.toggleSaveChat(chatId);
      toast.success(result.saved ? 'Chat saved' : 'Chat unsaved');
      loadChats();
      if (currentChat?.id === chatId) {
        setCurrentChat((prev: any) => ({ ...prev, saved: result.saved }));
      }
    } catch {
      toast.error('Failed to toggle save');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-medical-500" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all overflow-hidden lg:w-80`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Button onClick={createNewChat} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> New Chat
          </Button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)] p-2 space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                currentChat?.id === chat.id
                  ? 'bg-medical-50 dark:bg-medical-900/20 text-medical-700 dark:text-medical-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => {
                loadChat(chat.id);
                router.push(`/chat?id=${chat.id}`);
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="text-sm truncate">{chat.title}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleSave(chat.id); }}
                className="shrink-0"
              >
                {chat.saved ? (
                  <BookmarkCheck className="h-4 w-4 text-medical-500" />
                ) : (
                  <Bookmark className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
        {messages.length === 0 && !currentChat ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <Bot className="h-16 w-16 mx-auto mb-4 text-medical-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Medical AI Assistant
              </h2>
              <p className="text-gray-500 mb-6">
                Ask questions about your medical documents. For example:
              </p>
              <div className="space-y-2 text-left">
                {[
                  'Explain this blood report.',
                  'Summarize this medical document.',
                  'What medications are mentioned?',
                  'What are the key findings?',
                ].map((q) => (
                  <button
                    key={q}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400 hover:border-medical-500 hover:text-medical-600 dark:hover:text-medical-400 transition-colors"
                    onClick={() => setInput(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-medical-100 dark:bg-medical-900/30 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-medical-600 dark:text-medical-400" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-medical-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-medical-100 dark:bg-medical-900/30 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-medical-600 dark:text-medical-400" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-medical-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your medical documents..."
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-medical-500 focus:border-transparent resize-none"
            />
            <Button onClick={handleSend} disabled={!input.trim() || sending} size="icon" className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <AuthProvider>
      <Navbar />
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-medical-500" /></div>}>
        <ChatContent />
      </Suspense>
    </AuthProvider>
  );
}
