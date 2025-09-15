import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campaign } from './campaign.schema';
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

  // Create
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

  // Get my campaigns
  async findMine(user: any): Promise<Campaign[]> {
    const userId = new Types.ObjectId(user.id || user._id);
    return this.campaignModel
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Get all in a workspace
  async findAllInWorkspace(workspaceId: string, user: any): Promise<Campaign[]> {
    const workspaceRole = this.getWorkspaceRole(user, workspaceId);
    if (!workspaceRole) throw new ForbiddenException('Unauthorized');

    return this.campaignModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Get by id
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

  // Update
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

    const { workspaceId, createdBy, ...safe } = dto as any;

    const updated = await this.campaignModel.findByIdAndUpdate(
      id,
      { $set: safe },
      { new: true, runValidators: true },
    );

    if (!updated) throw new NotFoundException('Campaign not found after update');
    return updated;
  }

  // Delete
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

  // Launch campaign
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

    // Fetch contacts matching tags (if no tags selected, match all in workspace)
    const contactQuery: any = { workspaceId: campaign.workspaceId };
    if (Array.isArray(campaign.selectedTags) && campaign.selectedTags.length) {
      contactQuery.tags = { $in: campaign.selectedTags };
    }

    const contacts = await this.contactModel.find(contactQuery).exec();

    // Prepare per-contact messages (pending)
    // Use `any[]` to avoid strict type mismatch with TS subdoc types; Mongoose will handle validation
    const messagesToSave: any[] = contacts.map((c) => ({
      contactId: (c as any)._id ? new Types.ObjectId((c as any)._id) : undefined,
      contactSnapshot: {
        name: (c as any).name,
        phoneNumber: (c as any).phoneNumber,
        tags: (c as any).tags || [],
      },
      messageContent: campaign.message.text,
      status: 'pending' as 'pending',
      sentAt: null,
      error: null,
    }));

    // Save initial messages and update campaign status to Running
    campaign.messages = messagesToSave as any; // assign, mongoose will cast
    campaign.status = 'Running';
    campaign.launchedAt = new Date();
    await campaign.save();

    // Now simulate sending each message asynchronously (non-blocking)
    // We will update each message item in the campaign.messages array
    // Note: production should use a job queue (Bull, RabbitMQ), this is a simulation
    (async () => {
      try {
        // Re-fetch campaign to ensure we have the current array with _ids assigned
        const runningCampaign = await this.campaignModel.findById(campaign._id);
        if (!runningCampaign) {
          this.logger.error(`Campaign ${campaign._id} disappeared after save`);
          return;
        }

        for (let i = 0; i < (runningCampaign.messages || []).length; i++) {
          const msg = (runningCampaign.messages as any[])[i];

          // artificial delay per message to emulate send time
          await new Promise((res) => setTimeout(res, 300 + Math.random() * 700));

          // simulate random success/failure
          const succeeded = Math.random() > 0.05; // 95% success chance

          if (succeeded) {
            // mark as sent
            await this.campaignModel.updateOne(
              { _id: campaign._id, 'messages._id': msg._id },
              {
                $set: {
                  'messages.$.status': 'sent',
                  'messages.$.sentAt': new Date(),
                },
              },
            );
          } else {
            // mark failed with error
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

        // After processing all messages, compute summary stats
        const fresh = await this.campaignModel.findById(campaign._id).lean();
        if (!fresh) {
          this.logger.error(`Campaign ${campaign._id} not found when finalizing`);
          return;
        }

        const total = (fresh.messages || []).length;
        const sentCount = (fresh.messages || []).filter((m) => m.status === 'sent')
          .length;
        const failedCount = (fresh.messages || []).filter((m) => m.status === 'failed')
          .length;

        // update campaign status to Completed
        await this.campaignModel.findByIdAndUpdate(campaign._id, {
          status: 'Completed',
        });

        this.logger.log(
          `Campaign ${campaign._id} completed. total=${total} sent=${sentCount} failed=${failedCount}`,
        );
      } catch (err) {
        this.logger.error('Error while processing campaign messages', err);
        // If an unexpected error occurs, mark campaign Completed anyway or Failed - here we'll mark Completed but you can adjust
        try {
          await this.campaignModel.findByIdAndUpdate(campaign._id, {
            status: 'Completed',
          });
        } catch (e) {
          this.logger.error('Failed to set campaign status after processing error', e);
        }
      }
    })();

    // return the campaign (running) to client
    return campaign;
  }

  // Copy campaign
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

  // Polling status
  async getStatus(id: string, user: any): Promise<{ status: string }> {
    const campaign = await this.findOne(id, user);
    return { status: campaign.status };
  }

  // Get messages for a campaign (with optional pagination)
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
