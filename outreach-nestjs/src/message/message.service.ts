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

  // Create message
  async create(createMessageDto: CreateMessageDto, user: any): Promise<Message> {
    const workspace = await this.workspaceModel.findById(createMessageDto.workspaceId);
    if (!workspace || workspace.createdBy.toString() !== user.id) {
      throw new ForbiddenException('Unauthorized: Not your workspace');
    }

    const createdMessage = new this.messageModel({
      ...createMessageDto,
      workspaceId: new Types.ObjectId(createMessageDto.workspaceId),
      createdBy: user.id,
    });

    return await createdMessage.save();
  }

  // Get all messages of user's workspaces
  async findAll(user: any): Promise<Message[]> {
  const workspaces = await this.workspaceModel.find({
    createdBy: new Types.ObjectId(user.id)
  }, '_id');

    if (!workspaces.length) return []; // no workspaces owned by user

    const workspaceIds = workspaces.map(ws => ws._id);
    return this.messageModel.find({ workspaceId: { $in: workspaceIds } }).exec();
  }

  // Get message by ID (only if belongs to user's workspace)
  async findById(id: string, user: any): Promise<Message> {
    const message = await this.messageModel.findById(id);
    if (!message) throw new NotFoundException('Message not found');

    const workspace = await this.workspaceModel.findById(message.workspaceId);
    if (!workspace || workspace.createdBy.toString() !== user.id) {
      throw new ForbiddenException('Unauthorized access to this message');
    }

    return message;
  }

  // Update message
  async update(id: string, updateDto: UpdateMessageDto, user: any): Promise<Message> {
    const message = await this.messageModel.findById(id);
    if (!message) throw new NotFoundException('Message not found');

    const workspace = await this.workspaceModel.findById(message.workspaceId);
    if (!workspace || workspace.createdBy.toString() !== user.id) {
      throw new ForbiddenException('Unauthorized: Not your workspace');
    }

    // Only update passed fields
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

    const workspace = await this.workspaceModel.findById(message.workspaceId);
    if (!workspace || workspace.createdBy.toString() !== user.id) {
      throw new ForbiddenException('Unauthorized: Not your workspace');
    }

    await this.messageModel.deleteOne({ _id: id });
    return { message: 'Message deleted successfully' };
  }
}
