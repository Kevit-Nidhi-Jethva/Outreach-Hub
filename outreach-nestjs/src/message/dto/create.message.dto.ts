// src/message/dto/create-message.dto.ts
import { IsNotEmpty, IsString, IsEnum, IsMongoId, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum MessageType {
  TEXT = 'Text',
  TEXT_IMAGE = 'Text-Image',
}

class MessageContentDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(MessageType)
  @IsNotEmpty()
  type: MessageType;

  @ValidateNested()
  @Type(() => MessageContentDto)
  @IsNotEmpty()
  message: MessageContentDto;

  @IsMongoId()
  @IsNotEmpty()
  workspaceId: string;
}
