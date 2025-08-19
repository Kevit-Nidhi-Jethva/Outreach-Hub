// src/message/dto/update-message.dto.ts
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { MessageType } from './create.message.dto';

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsOptional()
  message?: {
    text?: string;
    imageUrl?: string;
  };
}
