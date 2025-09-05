// src/message/message.service.ts
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './message.schema';
import { Workspace } from '../workspace/workspace.schema';
import { CreateMessageDto } from './dto/create.message.dto';
import { UpdateMessageDto } from './dto/update.message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Workspace.name) private readonly workspaceModel: Model<Workspace>,
  ) {}

  private ensureWorkspaceAccess(user: any, workspaceId: string) {
    const hasAccess = user.workspaces?.some(
      (w) => w.workspaceId.toString() === workspaceId.toString(),
    );
    if (!hasAccess) {
      throw new ForbiddenException('Unauthorized: You do not belong to this workspace');
    }
  }

  // Create message
  async create(createMessageDto: CreateMessageDto, user: any): Promise<Message> {
    this.ensureWorkspaceAccess(user, createMessageDto.workspaceId);

    const createdMessage = new this.messageModel({
      ...createMessageDto,
      workspaceId: new Types.ObjectId(createMessageDto.workspaceId),
      createdBy: user.id,
    });

    return await createdMessage.save();
  }

  // Get all messages of user’s workspaces
  async findAll(user: any): Promise<Message[]> {
    const workspaceIds = user.workspaces?.map((w) => new Types.ObjectId(w.workspaceId)) || [];
    if (!workspaceIds.length) return [];

    return this.messageModel.find({ workspaceId: { $in: workspaceIds } }).exec();
  }

  // Get message by ID
  async findById(id: string, user: any): Promise<Message> {
    const message = await this.messageModel.findById(id);
    if (!message) throw new NotFoundException('Message not found');

    this.ensureWorkspaceAccess(user, message.workspaceId.toString());
    return message;
  }

  // Update message
  async update(id: string, updateDto: UpdateMessageDto, user: any): Promise<Message> {
    const message = await this.messageModel.findById(id);
    if (!message) throw new NotFoundException('Message not found');

    this.ensureWorkspaceAccess(user, message.workspaceId.toString());

    if (updateDto.name) message.name = updateDto.name;
    if (updateDto.type) message.type = updateDto.type;
    if (updateDto.message) {
      message.message.text = updateDto.message.text ?? message.message.text;
      message.message.imageUrl = updateDto.message.imageUrl ?? message.message.imageUrl;
    }

    return await message.save();
  }

  // Delete message
  async delete(id: string, user: any): Promise<{ message: string }> {
    const message = await this.messageModel.findById(id);
    if (!message) throw new NotFoundException('Message not found');

    this.ensureWorkspaceAccess(user, message.workspaceId.toString());

    await this.messageModel.deleteOne({ _id: id });
    return { message: 'Message deleted successfully' };
  }
}
