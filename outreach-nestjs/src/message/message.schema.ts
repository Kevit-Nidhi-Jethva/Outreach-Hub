import { Prop, Schema , SchemaFactory} from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

export type MessageDocument = Message & Document;

@Schema({timestamps: true})
export class Message{
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['Text', 'Text-Image'] })
  type: string;

  @Prop({
    type: {
      text: { type: String, required: true },
      imageUrl: { type: String },
    },
    required: true,
  })
  message: {
    text: string;
    imageUrl?: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({workspaceId: 1, type: 1 });
