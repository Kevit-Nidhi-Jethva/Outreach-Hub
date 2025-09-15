import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: true })
export class CampaignSentMessageSubdoc {
  _id?: Types.ObjectId; // ✅ allow subdoc _id

  @Prop({ type: Types.ObjectId, ref: 'Contact', required: true })
  contactId: Types.ObjectId;

  @Prop({
    type: {
      name: String,
      phoneNumber: String,
      tags: [String],
    },
  })
  contactSnapshot: {
    name: string;
    phoneNumber: string;
    tags: string[];
  };

  @Prop({ required: true })
  messageContent: string;

  @Prop({ enum: ['pending', 'sent', 'failed'], default: 'pending' })
  status: 'pending' | 'sent' | 'failed';

  @Prop({ type: Date, default: null })
  sentAt: Date | null;

  @Prop({ type: String, default: null })
  error: string | null;
}

export const CampaignSentMessageSchema =
  SchemaFactory.createForClass(CampaignSentMessageSubdoc);

@Schema({ timestamps: true })
export class Campaign extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ enum: ['Draft', 'Running', 'Completed'], default: 'Draft' })
  status: 'Draft' | 'Running' | 'Completed';

  @Prop({ type: [String], default: [] })
  selectedTags: string[];

  @Prop({
    type: {
      type: { type: String, enum: ['Text', 'Text-Image'], required: true },
      text: { type: String, required: true },
      imageUrl: { type: String },
    },
  })
  message: {
    type: 'Text' | 'Text-Image';
    text: string;
    imageUrl?: string;
  };

  @Prop({ type: Date, default: null })
  launchedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: [CampaignSentMessageSchema], default: [] })
  messages: CampaignSentMessageSubdoc[];
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
