
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WhitelistedTokenDocument = WhitelistedToken & Document;

@Schema({ timestamps: true })
export class WhitelistedToken {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const WhitelistedTokenSchema = SchemaFactory.createForClass(WhitelistedToken);
