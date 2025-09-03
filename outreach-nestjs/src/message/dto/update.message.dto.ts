// src/message/dto/update-message.dto.ts
import { IsOptional, IsString, IsEnum, ValidateNested } from 'class-validator';
import { MessageType } from './create.message.dto';
import { Type } from 'class-transformer';

class MessageContentUpdateDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsOptional()
  @ValidateNested()
  @Type(() => MessageContentUpdateDto)
  message?: MessageContentUpdateDto;
}
