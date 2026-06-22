import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class ChatService {
  constructor(
    private readonly db: DatabaseService,
    private readonly httpService: HttpService,
  ) {}

  async createChat(userId: string, documentId?: string, title?: string) {
    const chat = await this.db.queryOne(
      `INSERT INTO chats (user_id, document_id, title)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, documentId || null, title || 'New Chat'],
    );
    return chat;
  }

  async getUserChats(userId: string) {
    const rows = await this.db.query<any>(
      `SELECT c.*,
        (SELECT COUNT(*) FROM messages WHERE chat_id = c.id)::text as msg_count
       FROM chats c WHERE c.user_id = $1
       ORDER BY c.updated_at DESC`,
      [userId],
    );
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      saved: row.saved,
      documentId: row.document_id,
      _count: { messages: parseInt(row.msg_count) },
    }));
  }

  async getChat(chatId: string, userId: string) {
    const chat = await this.db.queryOne(
      'SELECT * FROM chats WHERE id = $1 AND user_id = $2',
      [chatId, userId],
    );
    if (!chat) throw new NotFoundException('Chat not found');

    const messages = await this.db.query(
      'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
      [chatId],
    );

    const document = chat.document_id
      ? await this.db.queryOne<{ id: string; filename: string }>(
          'SELECT id, filename FROM documents WHERE id = $1',
          [chat.document_id],
        )
      : null;

    return { ...chat, messages, document };
  }

  async sendMessage(
    userId: string,
    chatId: string,
    content: string,
    documentId?: string,
  ) {
    const chat = await this.db.queryOne<{ id: string; title: string }>(
      'SELECT id, title FROM chats WHERE id = $1 AND user_id = $2',
      [chatId, userId],
    );
    if (!chat) throw new NotFoundException('Chat not found');

    await this.db.execute(
      'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
      [chatId, 'user', content],
    );

    const history = await this.db.query(
      'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC LIMIT 20',
      [chatId],
    );

    const aiResponse = await this.queryAiService(content, history, documentId);

    const assistantMsg = await this.db.queryOne<{ id: string }>(
      'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3) RETURNING id',
      [chatId, 'assistant', JSON.stringify(aiResponse)],
    );

    if (chat.title === 'New Chat') {
      await this.db.execute(
        'UPDATE chats SET title = $1 WHERE id = $2',
        [content.slice(0, 50), chatId],
      );
    }

    return { ...aiResponse, messageId: assistantMsg!.id };
  }

  async toggleSave(chatId: string, userId: string) {
    const chat = await this.db.queryOne<{ id: string; saved: boolean }>(
      'SELECT id, saved FROM chats WHERE id = $1 AND user_id = $2',
      [chatId, userId],
    );
    if (!chat) throw new NotFoundException('Chat not found');

    const updated = await this.db.queryOne(
      'UPDATE chats SET saved = $1 WHERE id = $2 RETURNING *',
      [!chat.saved, chatId],
    );
    return updated;
  }

  private async queryAiService(
    content: string,
    history: any[],
    documentId?: string,
  ) {
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    try {
      const { data } = await firstValueFrom<AxiosResponse>(
        this.httpService.post(`${aiUrl}/api/query`, {
          query: content,
          document_id: documentId,
          history: history.map((m: any) => ({
            role: m.role,
            content: typeof m.content === 'string' ? m.content : JSON.parse(m.content).answer || m.content,
          })),
        }),
      );
      return data;
    } catch {
      return {
        answer: 'I apologize, but I encountered an error processing your request. Please try again.',
        sources: [],
      };
    }
  }
}
