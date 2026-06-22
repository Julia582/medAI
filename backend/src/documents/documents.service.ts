import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DatabaseService } from '../common/database.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as FormData from 'form-data';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly httpService: HttpService,
  ) {}

  async upload(userId: string, file: Express.Multer.File) {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    const document = await this.db.queryOne<{
      id: string; user_id: string; filename: string;
      file_type: string; file_size: number; file_path: string; upload_date: Date;
    }>(
      `INSERT INTO documents (user_id, filename, file_type, file_size, file_path)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, file.originalname, ext.replace('.', ''), file.size, filePath],
    );

    try {
      const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const form = new FormData();
      form.append('file', file.buffer, { filename: file.originalname, contentType: file.mimetype });
      await firstValueFrom(
        this.httpService.post(`${aiUrl}/api/process-document`, form, {
          headers: form.getHeaders(),
          timeout: 30000,
        }),
      );
    } catch (e) {
      // AI processing is non-critical; don't fail the upload
    }

    return document;
  }

  async findAll(userId: string) {
    const rows = await this.db.query<any>(
      `SELECT d.* FROM documents d WHERE d.user_id = $1
       ORDER BY d.upload_date DESC`,
      [userId],
    );
    return rows.map((row: any) => ({
      id: row.id,
      filename: row.filename,
      fileType: row.file_type,
      fileSize: parseInt(row.file_size),
      uploadDate: row.upload_date,
      filePath: row.file_path,
      _count: { embeddings: 0 },
    }));
  }

  async findOne(id: string, userId: string) {
    const doc = await this.db.queryOne<any>(
      'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async remove(id: string, userId: string) {
    const doc = await this.findOne(id, userId);

    if (fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }

    await this.db.execute('DELETE FROM documents WHERE id = $1', [id]);
    return { message: 'Document deleted successfully' };
  }
}
