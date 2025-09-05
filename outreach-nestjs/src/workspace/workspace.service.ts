// src/workspace/workspace.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workspace } from './workspace.schema';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { User } from 'src/user/user.schema';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, user: any): Promise<Workspace> {
    // ✅ Only admins can create workspaces
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can create workspaces');
    }

    const newWorkspace = new this.workspaceModel({
      ...createWorkspaceDto,
      createdBy: new Types.ObjectId(user.id),
    });

    return newWorkspace.save();
  }

  async findAll(user: any): Promise<Workspace[]> {
    if (user.role === 'admin') {
      // ✅ Admins can see all workspaces
      return this.workspaceModel.find().exec();
    }

    // ✅ Editors/Viewers only see workspaces they belong to
    const workspaceIds =
      user.workspaces?.map((w) => new Types.ObjectId(w.workspaceId)) || [];
    return this.workspaceModel.find({ _id: { $in: workspaceIds } }).exec();
  }

  async findById(id: string, user: any): Promise<Workspace> {
    if (user.role === 'admin') {
      const workspace = await this.workspaceModel.findById(id);
      if (!workspace) throw new NotFoundException('Workspace not found');
      return workspace;
    }

    // ✅ Check if user belongs to this workspace
    const workspaceData = user.workspaces?.find(
      (w) => String(w.workspaceId) === String(id),
    );
    if (!workspaceData) throw new ForbiddenException('Not part of this workspace');

    const workspace = await this.workspaceModel.findById(id);
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto, user: any): Promise<Workspace> {
    // ✅ Only admins can update
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can update workspaces');
    }

    const workspace = await this.workspaceModel.findByIdAndUpdate(
      id,
      updateWorkspaceDto,
      { new: true, runValidators: true },
    );
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async delete(id: string, user: any): Promise<{ message: string }> {
    // ✅ Only admins can delete
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete workspaces');
    }

    const workspace = await this.workspaceModel.findByIdAndDelete(id);
    if (!workspace) throw new NotFoundException('Workspace not found');

    // cleanup users’ workspaces array
    await this.userModel.updateMany(
      { 'workspaces.workspaceId': new Types.ObjectId(id) },
      { $pull: { workspaces: { workspaceId: new Types.ObjectId(id) } } },
    );

    return { message: 'Workspace deleted successfully' };
  }
}
