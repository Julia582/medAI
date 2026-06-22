import { IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsString()
  title?: string;
}
