import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campaign } from './campaign.schema';
import { CreateCampaignDto } from './dto/create.campaign.dto';
import { UpdateCampaignDto } from './dto/update.campaign.dto';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel(Campaign.name) private readonly campaignModel: Model<Campaign>,
  ) {}

  private getWorkspaceRole(user: any, workspaceId: string) {
    if (user?.isAdmin) return { role: 'Admin' };
    return user?.workspaces?.find(
      (w) => w?.workspaceId?.toString() === workspaceId.toString(),
    );
  }

  // ✅ Create
  async create(dto: CreateCampaignDto, user: any): Promise<Campaign> {
    const workspaceRole = this.getWorkspaceRole(user, dto.workspaceId);

    if (!workspaceRole) {
      throw new ForbiddenException('Unauthorized: Not your workspace');
    }
    if (workspaceRole.role !== 'Editor') {
      throw new ForbiddenException('Only editors can create campaigns');
    }

    const created = new this.campaignModel({
      ...dto,
      workspaceId: new Types.ObjectId(dto.workspaceId),
      createdBy: new Types.ObjectId(user.id || user._id),
    });

    return created.save();
  }

  // ✅ Get my campaigns (createdBy me, across all workspaces)
  async findMine(user: any): Promise<Campaign[]> {
    const userId = new Types.ObjectId(user.id || user._id);
    return this.campaignModel
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  // ✅ Get all in a workspace
  async findAllInWorkspace(workspaceId: string, user: any): Promise<Campaign[]> {
    const workspaceRole = this.getWorkspaceRole(user, workspaceId);

    if (!workspaceRole) {
      throw new ForbiddenException('Unauthorized: Not your workspace');
    }

    return this.campaignModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  // ✅ Get by id
  async findOne(id: string, user: any): Promise<Campaign> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid campaign ID');
    }

    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');

    const workspaceRole = this.getWorkspaceRole(user, campaign.workspaceId.toString());

    if (!workspaceRole) {
      throw new ForbiddenException('Unauthorized: Not your workspace');
    }

    return campaign;
  }

    // ✅ Update
  async update(id: string, dto: UpdateCampaignDto, user: any): Promise<Campaign> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid campaign ID');
    }

    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');

    const workspaceRole = this.getWorkspaceRole(user, campaign.workspaceId.toString());

    if (!workspaceRole || workspaceRole.role !== 'Editor') {
      throw new ForbiddenException('Only editors can update campaigns');
    }

    // Prevent workspaceId/createdBy hijack
    const { workspaceId, createdBy, ...safe } = dto as any;

    const updated = await this.campaignModel.findByIdAndUpdate(
      id,
      { $set: safe },
      { new: true, runValidators: true },
    );

    if (!updated) {
      throw new NotFoundException('Campaign not found after update');
    }

    return updated;
  }


  // ✅ Delete
  async remove(id: string, user: any): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid campaign ID');
    }

    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');

    const workspaceRole = this.getWorkspaceRole(user, campaign.workspaceId.toString());

    if (!workspaceRole || workspaceRole.role !== 'Editor') {
      throw new ForbiddenException('Only editors can delete campaigns');
    }

    await campaign.deleteOne();
    return { message: 'Campaign deleted successfully' };
  }
}
