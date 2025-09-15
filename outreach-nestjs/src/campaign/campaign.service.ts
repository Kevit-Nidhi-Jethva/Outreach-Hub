import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campaign, CampaignSentMessageSubdoc } from './campaign.schema';
import { CreateCampaignDto } from './dto/create.campaign.dto';
import { UpdateCampaignDto } from './dto/update.campaign.dto';
import { Contact } from '../contact/contact.schema';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

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

  private getUserId(user: any): Types.ObjectId {
    return new Types.ObjectId(user.id || user._id);
  }

  // CREATE CAMPAIGN
  async create(dto: CreateCampaignDto, user: any): Promise<Campaign> {
    const workspaceRole = this.getWorkspaceRole(user, dto.workspaceId);
    if (!workspaceRole) throw new ForbiddenException('Unauthorized');
    if (workspaceRole.role !== 'Editor')
      throw new ForbiddenException('Only editors can create campaigns');

    const created = new this.campaignModel({
      name: dto.name,
      description: dto.description || '',
      status: dto.status || 'Draft',
      selectedTags: dto.selectedTags || [],
      message: {
        type: dto.message.type,
        text: dto.message.text,
        imageUrl: dto.message.imageUrl || undefined,
      },
      workspaceId: new Types.ObjectId(dto.workspaceId),
      createdBy: new Types.ObjectId(user.id || user._id),
    });

    return created.save();
  }

  // GET MY CAMPAIGNS
  async findMine(user: any): Promise<Campaign[]> {
    const userId = new Types.ObjectId(user.id || user._id);
    return this.campaignModel
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  // GET ALL CAMPAIGNS IN WORKSPACE
  async findAllInWorkspace(workspaceId: string, user: any): Promise<Campaign[]> {
    const workspaceRole = this.getWorkspaceRole(user, workspaceId);
    if (!workspaceRole) throw new ForbiddenException('Unauthorized');

    return this.campaignModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  // GET CAMPAIGN BY ID
  async findOne(id: string, user: any): Promise<Campaign> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');

    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');

    const workspaceRole = this.getWorkspaceRole(
      user,
      campaign.workspaceId.toString(),
    );
    if (!workspaceRole) throw new ForbiddenException('Unauthorized');

    return campaign;
  }

async update(
  id: string,
  dto: UpdateCampaignDto,
  user: any,
): Promise<Campaign> {
  if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');

  const campaign = await this.campaignModel.findById(id);
  if (!campaign) throw new NotFoundException('Campaign not found');

  const workspaceRole = this.getWorkspaceRole(
    user,
    campaign.workspaceId.toString(),
  );
  if (!workspaceRole || workspaceRole.role !== 'Editor')
    throw new ForbiddenException('Only editors can update campaigns');

  if (campaign.status !== 'Draft')
    throw new ForbiddenException('Only Draft campaigns can be updated');

  // Create a new object and map types manually
  const updateObj: Partial<Campaign> = {};

  if (dto.name !== undefined) updateObj.name = dto.name;
  if (dto.description !== undefined) updateObj.description = dto.description;
  if (dto.status !== undefined) updateObj.status = dto.status;
  if (dto.selectedTags !== undefined) updateObj.selectedTags = dto.selectedTags;
  if (dto.workspaceId !== undefined) updateObj.workspaceId = new Types.ObjectId(dto.workspaceId);

  if (dto.launchedAt !== undefined) updateObj.launchedAt = new Date(dto.launchedAt);

  if (dto.message !== undefined) {
    updateObj.message = {
      type: dto.message.type,
      text: dto.message.text,
      imageUrl: dto.message.imageUrl || undefined,
    };
  }

  const updated = await this.campaignModel.findByIdAndUpdate(
    id,
    { $set: updateObj },
    { new: true, runValidators: true },
  );

  if (!updated) throw new NotFoundException('Campaign not found after update');

  return updated as Campaign;
}


  // DELETE CAMPAIGN
  async remove(id: string, user: any): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');

    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');

    const workspaceRole = this.getWorkspaceRole(
      user,
      campaign.workspaceId.toString(),
    );
    if (!workspaceRole || workspaceRole.role !== 'Editor')
      throw new ForbiddenException('Only editors can delete campaigns');

    await campaign.deleteOne();
    return { message: 'Campaign deleted successfully' };
  }

  // LAUNCH CAMPAIGN
  async launch(id: string, user: any): Promise<Campaign> {
    const campaign = await this.findOne(id, user);

    if (campaign.status !== 'Draft')
      throw new ForbiddenException('Only Draft campaigns can be launched');

    const workspaceRole = this.getWorkspaceRole(
      user,
      campaign.workspaceId.toString(),
    );
    if (!workspaceRole || workspaceRole.role !== 'Editor')
      throw new ForbiddenException('Only editors can launch campaigns');

    // Fetch contacts matching tags (if no tags, get all in workspace)
    const contactQuery: any = { workspaceId: campaign.workspaceId };
    if (Array.isArray(campaign.selectedTags) && campaign.selectedTags.length) {
      contactQuery.tags = { $in: campaign.selectedTags };
    }

    const contacts = await this.contactModel.find(contactQuery).exec();

    // Prepare per-contact messages
    const messagesToSave: CampaignSentMessageSubdoc[] = contacts.map((c) => ({
      contactId: new Types.ObjectId(c._id as string),
      contactSnapshot: {
        name: c.name,
        phoneNumber: c.phoneNumber,
        tags: c.tags || [],
      },
      messageContent: campaign.message.text,
      status: 'pending',
      sentAt: null,
      error: null,
    }));

    campaign.messages = messagesToSave;
    campaign.status = 'Running';
    campaign.launchedAt = new Date();
    await campaign.save();

    // Simulate async sending (non-blocking)
    (async () => {
      try {
        const runningCampaign = await this.campaignModel.findById(campaign._id);
        if (!runningCampaign) return;

        for (let i = 0; i < (runningCampaign.messages || []).length; i++) {
          const msg = (runningCampaign.messages as any[])[i];
          await new Promise((res) => setTimeout(res, 300 + Math.random() * 700));
          const succeeded = Math.random() > 0.05;

          if (succeeded) {
            await this.campaignModel.updateOne(
              { _id: campaign._id, 'messages._id': msg._id },
              { $set: { 'messages.$.status': 'sent', 'messages.$.sentAt': new Date() } },
            );
          } else {
            await this.campaignModel.updateOne(
              { _id: campaign._id, 'messages._id': msg._id },
              {
                $set: {
                  'messages.$.status': 'failed',
                  'messages.$.sentAt': new Date(),
                  'messages.$.error': 'Simulated send failure',
                },
              },
            );
          }
        }

        const fresh = await this.campaignModel.findById(campaign._id).lean();
        if (!fresh) return;

        const sentCount = (fresh.messages || []).filter((m) => m.status === 'sent')
          .length;
        const failedCount = (fresh.messages || []).filter((m) => m.status === 'failed')
          .length;

        await this.campaignModel.findByIdAndUpdate(campaign._id, { status: 'Completed' });
        this.logger.log(
          `Campaign ${campaign._id} completed. total=${fresh.messages.length} sent=${sentCount} failed=${failedCount}`,
        );
      } catch (err) {
        this.logger.error('Error processing campaign messages', err);
        try {
          await this.campaignModel.findByIdAndUpdate(campaign._id, { status: 'Completed' });
        } catch (e) {
          this.logger.error('Failed to set campaign status after error', e);
        }
      }
    })();

    return campaign;
  }

  // COPY CAMPAIGN
  async copy(id: string, user: any): Promise<Campaign> {
    const campaign = await this.findOne(id, user);

    const workspaceRole = this.getWorkspaceRole(
      user,
      campaign.workspaceId.toString(),
    );
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

  // GET CAMPAIGN STATUS
  async getStatus(id: string, user: any): Promise<{ status: string }> {
    const campaign = await this.findOne(id, user);
    return { status: campaign.status };
  }

  // GET MESSAGES WITH PAGINATION
  async getMessages(
    id: string,
    user: any,
    page = 1,
    limit = 50,
  ): Promise<{ total: number; page: number; limit: number; data: any[] }> {
    const campaign = await this.findOne(id, user);

    const total = (campaign.messages || []).length;
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Math.min(1000, Number(limit) || 50));
    const start = (p - 1) * l;
    const end = start + l;

    const data = (campaign.messages || []).slice(start, end);

    return { total, page: p, limit: l, data };
  }
}
