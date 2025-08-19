import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

class CampaignMessageSubdoc {
  @Prop({ type: String, enum: ['Text', 'Text-Image'], required: true })
  type: 'Text' | 'Text-Image';

  @Prop({ required: true })
  text: string;

  @Prop()
  imageUrl?: string;
}

class CampaignSentMessageSubdoc {
  @Prop({ type: Types.ObjectId, ref: 'Contact' })
  contactId?: Types.ObjectId;

  @Prop()
  messageContent?: string;

  @Prop({ type: Date, default: Date.now })
  sentAt?: Date;
}

@Schema({ timestamps: true })
export class Campaign extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: String, enum: ['Draft', 'Running', 'Completed'], default: 'Draft' })
  status: 'Draft' | 'Running' | 'Completed';

  @Prop({ type: [String], default: [] })
  selectedTags: string[];

  @Prop({ type: CampaignMessageSubdoc, required: true })
  message: CampaignMessageSubdoc;

  @Prop({ type: Date })
  launchedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [CampaignSentMessageSubdoc], default: [] })
  messages: CampaignSentMessageSubdoc[];
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

// indexes like in your Node model
CampaignSchema.index({ workspaceId: 1, status: 1 });
