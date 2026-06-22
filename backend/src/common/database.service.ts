import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      ssl: { rejectUnauthorized: false },
    });
  }

  async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<T[]> {
    const result = await this.pool.query<T>(text, params);
    return result.rows;
  }

  async queryOne<T extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows[0] || null;
  }

  async execute(text: string, params?: any[]): Promise<number> {
    const result = await this.pool.query(text, params);
    return result.rowCount ?? 0;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
