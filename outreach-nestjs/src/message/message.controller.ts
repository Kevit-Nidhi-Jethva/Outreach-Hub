// src/message/message.controller.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateMessageDto } from './dto/create.message.dto';
import { UpdateMessageDto } from './dto/update.message.dto';
import { Query } from '@nestjs/common';

@Controller('messages')
@UseGuards(AuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // Create a message
  @Post('create')
  async create(@Body() createMessageDto: CreateMessageDto, @Req() req) {
    return await this.messageService.create(createMessageDto, req.user);
  }

  // Get all messages for logged-in user
  // @Get('all')
  // async findAll(@Req() req) {
  //   return await this.messageService.findAll(req.user);
  // }
  @Get('all')
  async findAll(@Req() req, @Query('workspaceId') workspaceId: string) {
    return await this.messageService.findAll(req.user, workspaceId);
  }

  // Get a single message by ID
  @Get(':id')
  async findById(@Param('id') id: string, @Req() req) {
    return await this.messageService.findById(id, req.user);
  }

  // Update a message by ID
  @Put('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Req() req,
  ) {
    return await this.messageService.update(id, updateMessageDto, req.user);
  }

  // Delete a message by ID
  @Delete('delete/:id')
  async delete(@Param('id') id: string, @Req() req) {
    return await this.messageService.delete(id, req.user);
  }

  // Get all templates for a workspace
  // @Get('workspace/:workspaceId/templates')
  // async getWorkspaceTemplates(@Param('workspaceId') workspaceId: string, @Req() req) {
  //   // optional: check workspace access
  //   const hasAccess = req.user.workspaces?.some(w => w.workspaceId.toString() === workspaceId);
  //   if (!hasAccess) throw new ForbiddenException('Unauthorized');

  //   return await this.messageService.findByWorkspace(workspaceId);
  // }

  @Get('workspace/:workspaceId/templates')
  async getWorkspaceTemplates(@Param('workspaceId') workspaceId: string, @Req() req) {
  const hasAccess = req.user.workspaces?.some(
    w => w.workspaceId.toString() === workspaceId
  );
  if (!hasAccess) throw new ForbiddenException('Unauthorized');
  return await this.messageService.findByWorkspace(workspaceId);
}


}
