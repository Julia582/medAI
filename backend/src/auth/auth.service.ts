import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../common/database.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.db.queryOne<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [dto.email],
    );
    if (existing) {
      throw new UnauthorizedException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.db.queryOne<{ id: string; email: string }>(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email',
      [dto.name, dto.email, passwordHash],
    );

    return this.generateTokens(user!.id, user!.email);
  }

  async login(dto: LoginDto) {
    const user = await this.db.queryOne<{ id: string; email: string; password_hash: string }>(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [dto.email],
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      return this.generateTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.db.queryOne<{
      id: string; name: string; email: string; created_at: Date;
      doc_count: string; chat_count: string;
    }>(
      `SELECT u.id, u.name, u.email, u.created_at,
        (SELECT COUNT(*) FROM documents WHERE user_id = u.id)::text as doc_count,
        (SELECT COUNT(*) FROM chats WHERE user_id = u.id)::text as chat_count
       FROM users u WHERE u.id = $1`,
      [userId],
    );
    if (!user) throw new UnauthorizedException('User not found');

    const recentChats = await this.db.query<{
      id: string; title: string; created_at: Date; updated_at: Date;
      msg_count: string;
    }>(
      `SELECT c.id, c.title, c.created_at, c.updated_at,
        (SELECT COUNT(*) FROM messages WHERE chat_id = c.id)::text as msg_count
       FROM chats c WHERE c.user_id = $1
       ORDER BY c.updated_at DESC LIMIT 5`,
      [userId],
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at,
      _count: { documents: parseInt(user.doc_count), chats: parseInt(user.chat_count) },
      recentChats: recentChats.map(c => ({
        id: c.id,
        title: c.title,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        _count: { messages: parseInt(c.msg_count) },
      })),
    };
  }

  private generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    };
  }
}
