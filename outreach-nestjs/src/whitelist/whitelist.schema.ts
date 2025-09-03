import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class WhitelistedToken {
  @Prop({ required: true })
  token: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  expiresAt: Date;
}

export type WhitelistedTokenDocument = WhitelistedToken & Document;
export const WhitelistedTokenSchema =
  SchemaFactory.createForClass(WhitelistedToken);
