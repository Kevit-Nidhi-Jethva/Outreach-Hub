// import {
//   Injectable,
//   ForbiddenException,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model, Types } from 'mongoose';
// import { Campaign } from './campaign.schema';
// import { CreateCampaignDto } from './dto/create.campaign.dto';
// import { UpdateCampaignDto } from './dto/update.campaign.dto';

// @Injectable()
// export class CampaignService {
//   constructor(
//     @InjectModel(Campaign.name) private readonly campaignModel: Model<Campaign>,
//   ) {}

//   private getWorkspaceRole(user: any, workspaceId: string) {
//     if (user?.isAdmin) return { role: 'Admin' };
//     return user?.workspaces?.find(
//       (w) => w?.workspaceId?.toString() === workspaceId.toString(),
//     );
//   }

//   // ✅ Create
//   async create(dto: CreateCampaignDto, user: any): Promise<Campaign> {
//     const workspaceRole = this.getWorkspaceRole(user, dto.workspaceId);

//     if (!workspaceRole) {
//       throw new ForbiddenException('Unauthorized: Not your workspace');
//     }
//     if (workspaceRole.role !== 'Editor') {
//       throw new ForbiddenException('Only editors can create campaigns');
//     }

//     const created = new this.campaignModel({
//       ...dto,
//       workspaceId: new Types.ObjectId(dto.workspaceId),
//       createdBy: new Types.ObjectId(user.id || user._id),
//     });

//     return created.save();
//   }

//   // ✅ Get my campaigns (createdBy me, across all workspaces)
//   async findMine(user: any): Promise<Campaign[]> {
//     const userId = new Types.ObjectId(user.id || user._id);
//     return this.campaignModel
//       .find({ createdBy: userId })
//       .sort({ createdAt: -1 })
//       .exec();
//   }

//   // ✅ Get all in a workspace
//   async findAllInWorkspace(workspaceId: string, user: any): Promise<Campaign[]> {
//     const workspaceRole = this.getWorkspaceRole(user, workspaceId);

//     if (!workspaceRole) {
//       throw new ForbiddenException('Unauthorized: Not your workspace');
//     }

//     return this.campaignModel
//       .find({ workspaceId: new Types.ObjectId(workspaceId) })
//       .sort({ createdAt: -1 })
//       .exec();
//   }

//   // ✅ Get by id
//   async findOne(id: string, user: any): Promise<Campaign> {
//     if (!Types.ObjectId.isValid(id)) {
//       throw new NotFoundException('Invalid campaign ID');
//     }

//     const campaign = await this.campaignModel.findById(id);
//     if (!campaign) throw new NotFoundException('Campaign not found');

//     const workspaceRole = this.getWorkspaceRole(user, campaign.workspaceId.toString());

//     if (!workspaceRole) {
//       throw new ForbiddenException('Unauthorized: Not your workspace');
//     }

//     return campaign;
//   }

//     // ✅ Update
//   async update(id: string, dto: UpdateCampaignDto, user: any): Promise<Campaign> {
//     if (!Types.ObjectId.isValid(id)) {
//       throw new NotFoundException('Invalid campaign ID');
//     }

//     const campaign = await this.campaignModel.findById(id);
//     if (!campaign) throw new NotFoundException('Campaign not found');

//     const workspaceRole = this.getWorkspaceRole(user, campaign.workspaceId.toString());

//     if (!workspaceRole || workspaceRole.role !== 'Editor') {
//       throw new ForbiddenException('Only editors can update campaigns');
//     }

//     // Prevent workspaceId/createdBy hijack
//     const { workspaceId, createdBy, ...safe } = dto as any;

//     const updated = await this.campaignModel.findByIdAndUpdate(
//       id,
//       { $set: safe },
//       { new: true, runValidators: true },
//     );

//     if (!updated) {
//       throw new NotFoundException('Campaign not found after update');
//     }

//     return updated;
//   }


//   // ✅ Delete
//   async remove(id: string, user: any): Promise<{ message: string }> {
//     if (!Types.ObjectId.isValid(id)) {
//       throw new NotFoundException('Invalid campaign ID');
//     }

//     const campaign = await this.campaignModel.findById(id);
//     if (!campaign) throw new NotFoundException('Campaign not found');

//     const workspaceRole = this.getWorkspaceRole(user, campaign.workspaceId.toString());

//     if (!workspaceRole || workspaceRole.role !== 'Editor') {
//       throw new ForbiddenException('Only editors can delete campaigns');
//     }

//     await campaign.deleteOne();
//     return { message: 'Campaign deleted successfully' };
//   }
// }

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
import { Contact } from '../contact/contact.schema'; // assuming you have Contact model

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel(Campaign.name) private readonly campaignModel: Model<Campaign>,
    @InjectModel(Contact.name) private readonly contactModel: Model<Contact>,
  ) {}

  private getWorkspaceRole(user: any, workspaceId: string) {
    if (user?.isAdmin) return { role: 'Admin' };
    return user?.workspaces?.find(
      (w) => w?.workspaceId?.toString() === workspaceId.toString(),
    );
  }

    // ✅ add this helper
  private getUserId(user: any): Types.ObjectId {
    return new Types.ObjectId(user.id || user._id);
  }

  async create(dto: CreateCampaignDto, user: any): Promise<Campaign> {
    const workspaceRole = this.getWorkspaceRole(user, dto.workspaceId);
    if (!workspaceRole) throw new ForbiddenException('Unauthorized');
    if (workspaceRole.role !== 'Editor')
      throw new ForbiddenException('Only editors can create campaigns');

    const created = new this.campaignModel({
      ...dto,
      workspaceId: new Types.ObjectId(dto.workspaceId),
      createdBy: new Types.ObjectId(user.id || user._id),
      status: 'Draft',
    });

    return created.save();
  }

  async findMine(user: any): Promise<Campaign[]> {
    const userId = new Types.ObjectId(user.id || user._id);
    return this.campaignModel
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllInWorkspace(
    workspaceId: string,
    user: any,
  ): Promise<Campaign[]> {
    const workspaceRole = this.getWorkspaceRole(user, workspaceId);
    if (!workspaceRole) throw new ForbiddenException('Unauthorized');

    return this.campaignModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, user: any): Promise<Campaign> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');

    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');

    const workspaceRole = this.getWorkspaceRole(user, campaign.workspaceId.toString());
    if (!workspaceRole) throw new ForbiddenException('Unauthorized');

    return campaign;
  }

  async update(id: string, dto: UpdateCampaignDto, user: any): Promise<Campaign> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');

    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');

    const workspaceRole = this.getWorkspaceRole(user, campaign.workspaceId.toString());
    if (!workspaceRole || workspaceRole.role !== 'Editor')
      throw new ForbiddenException('Only editors can update campaigns');

    // ❌ Prevent updates if campaign is not Draft
    if (campaign.status !== 'Draft')
      throw new ForbiddenException('Only Draft campaigns can be updated');

    const { workspaceId, createdBy, ...safe } = dto as any;

    const updated = await this.campaignModel.findByIdAndUpdate(
      id,
      { $set: safe },
      { new: true, runValidators: true },
    );

    if (!updated) throw new NotFoundException('Campaign not found after update');
    return updated;
  }

  async remove(id: string, user: any): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');

    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');

    const workspaceRole = this.getWorkspaceRole(user, campaign.workspaceId.toString());
    if (!workspaceRole || workspaceRole.role !== 'Editor')
      throw new ForbiddenException('Only editors can delete campaigns');

    await campaign.deleteOne();
    return { message: 'Campaign deleted successfully' };
  }

  // ✅ Launch campaign (async-style simulation)
async launch(id: string, user: any): Promise<Campaign> {
  const campaign = await this.findOne(id, user);

  if (campaign.status !== 'Draft')
    throw new ForbiddenException('Only Draft campaigns can be launched');

  const workspaceRole = this.getWorkspaceRole(user, campaign.workspaceId.toString());
  if (!workspaceRole || workspaceRole.role !== 'Editor')
    throw new ForbiddenException('Only editors can launch campaigns');

  // Fetch contacts matching tags
  const contacts = await this.contactModel.find({
    workspaceId: campaign.workspaceId,
    tags: { $in: campaign.selectedTags },
  });

  // Initialize messages
  campaign.messages = contacts.map(c => ({
    contactId: c._id as Types.ObjectId,
    messageContent: campaign.message.text,
    sentAt: new Date(),
  }));

  campaign.status = 'Running';
  campaign.launchedAt = new Date();
  await campaign.save();

  // Optional: mark Completed later
  setTimeout(async () => {
    await this.campaignModel.findByIdAndUpdate(campaign._id, {
      status: 'Completed',
    });
  }, 5000);

  return campaign;
}


  // ✅ Copy campaign
async copy(id: string, user: any): Promise<Campaign> {
  const campaign = await this.findOne(id, user);

  const workspaceRole = this.getWorkspaceRole(user, campaign.workspaceId.toString());
  if (!workspaceRole || workspaceRole.role !== 'Editor')
    throw new ForbiddenException('Only editors can copy campaigns');

  const { _id, createdAt, updatedAt, messages, ...rest } = campaign.toObject();

  const copy = new this.campaignModel({
    ...rest,
    name: campaign.name + ' (Copy)',
    status: 'Draft',
    messages: [],
    createdBy: this.getUserId(user),
  });

  return copy.save();
}

  // ✅ Polling status
  async getStatus(id: string, user: any): Promise<{ status: string }> {
    const campaign = await this.findOne(id, user);
    return { status: campaign.status };
  }
}
