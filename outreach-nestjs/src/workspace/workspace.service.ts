// src/workspace/workspace.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workspace } from './workspace.schema';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(@InjectModel(Workspace.name) private workspaceModel: Model<Workspace>) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, user: any): Promise<Workspace> {
    const newWorkspace = new this.workspaceModel({
      ...createWorkspaceDto,
      createdBy: new Types.ObjectId(user.id),
    });
    return newWorkspace.save();
  }

  async findAll(user:any): Promise<Workspace[]> {
    const userId= new Types.ObjectId(user.id);
    return this.workspaceModel.find({ createdBy: userId }).exec();
  }

  async findById(id: string, user: any): Promise<Workspace> {
    const userId = new Types.ObjectId(user.id);
    const workspace = await this.workspaceModel.findOne({ _id: id, createdBy: userId });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }


  // 🔹 Update workspace by ID (only if created by user)
  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto, user: any): Promise<Workspace> {
    const userId = new Types.ObjectId(user.id);
    const workspace = await this.workspaceModel.findOneAndUpdate(
      { _id: id, createdBy: userId },
      updateWorkspaceDto,
      { new: true, runValidators: true },
    );
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }
  
  async delete(id: string, user: any): Promise<{ message: string }> {
    const userId = new Types.ObjectId(user.id);
    const workspace = await this.workspaceModel.findOneAndDelete({ _id: id, createdBy: userId });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return { message: 'Workspace deleted successfully' };
  }
}
