import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  createChat(@Body() dto: CreateChatDto, @Req() req: Request) {
    const user = req.user as any;
    return this.chatService.createChat(user.sub, dto.documentId, dto.title);
  }

  @Get('history')
  getHistory(@Req() req: Request) {
    const user = req.user as any;
    return this.chatService.getUserChats(user.sub);
  }

  @Get(':id')
  getChat(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.chatService.getChat(id, user.sub);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.chatService.sendMessage(user.sub, id, dto.content, dto.documentId);
  }

  @Patch(':id/save')
  toggleSave(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.chatService.toggleSave(id, user.sub);
  }
}
