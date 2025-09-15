import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: true })
export class ContactSnapshot {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const ContactSnapshotSchema = SchemaFactory.createForClass(ContactSnapshot);

@Schema({ _id: true })
export class CampaignSentMessageSubdoc {
  @Prop({ type: Types.ObjectId, ref: 'Contact', required: true })
  contactId: Types.ObjectId;

  @Prop({ type: ContactSnapshotSchema, required: true })
  contactSnapshot: ContactSnapshot;

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

@Schema({ _id: true, timestamps: true })
export class MessageContent {
  @Prop({ enum: ['Text', 'Text-Image'], required: true })
  type: 'Text' | 'Text-Image';

  @Prop({ required: true })
  text: string;

  @Prop()
  imageUrl?: string;
}

export const MessageContentSchema = SchemaFactory.createForClass(MessageContent);

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

  @Prop({ type: MessageContentSchema, required: true })
  message: MessageContent;

  @Prop({ type: Date, default: null })
  launchedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [CampaignSentMessageSchema], default: [] })
  messages: CampaignSentMessageSubdoc[];
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
