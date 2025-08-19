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

  private userHasWorkspace(user: any, workspaceId: string): boolean {
    if (user?.isAdmin) return true;
    if (!user?.workspaces?.length) return false;
    return user.workspaces.some(
      (w) => w?.workspaceId?.toString() === workspaceId.toString(),
    );
  }

  // Create
  async create(dto: CreateCampaignDto, user: any): Promise<Campaign> {
    const workspaceIdStr = dto.workspaceId;

    if (!this.userHasWorkspace(user, workspaceIdStr)) {
      throw new ForbiddenException('Unauthorized: Not your workspace');
    }

    const created = new this.campaignModel({
      ...dto,
      workspaceId: new Types.ObjectId(workspaceIdStr),
      createdBy: new Types.ObjectId(user.id || user._id),
    });

    return created.save();
  }

  // Get my campaigns (createdBy me)
  async findMine(user: any): Promise<Campaign[]> {
    const userId = new Types.ObjectId(user.id || user._id);
    return this.campaignModel
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Get all in a workspace
  async findAllInWorkspace(workspaceId: string, user: any): Promise<Campaign[]> {
    if (!this.userHasWorkspace(user, workspaceId)) {
      throw new ForbiddenException('Unauthorized: Not your workspace');
    }

    return this.campaignModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Get by id (must belong to a workspace the user has)
  async findOne(id: string, user: any): Promise<Campaign> {
    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (
      !user?.isAdmin &&
      !this.userHasWorkspace(user, campaign.workspaceId.toString())
    ) {
      throw new ForbiddenException('You are not authorized to view this campaign');
    }

    return campaign;
  }

  // Update by id
  async update(id: string, dto: UpdateCampaignDto, user: any): Promise<Campaign> {
    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (
      !user?.isAdmin &&
      !this.userHasWorkspace(user, campaign.workspaceId.toString())
    ) {
      throw new ForbiddenException('You are not authorized to update this campaign');
    }

    // Prevent workspaceId/createdBy hijack by ignoring them in updates
    const { workspaceId, createdBy, ...safe } = dto as any;

    const updated = await this.campaignModel.findByIdAndUpdate(
      id,
      { $set: safe },
      { new: true, runValidators: true },
    );

    return updated!;
  }

  // Delete by id
  async remove(id: string, user: any): Promise<{ message: string }> {
    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (
      !user?.isAdmin &&
      !this.userHasWorkspace(user, campaign.workspaceId.toString())
    ) {
      throw new ForbiddenException('You are not authorized to delete this campaign');
    }

    await campaign.deleteOne();
    return { message: 'Campaign deleted successfully' };
  }
}
