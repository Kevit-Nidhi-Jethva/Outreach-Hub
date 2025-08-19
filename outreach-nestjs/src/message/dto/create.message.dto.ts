// src/message/dto/create-message.dto.ts
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum MessageType {
  TEXT = 'Text',
  TEXT_IMAGE = 'Text-Image',
}

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(MessageType)
  @IsNotEmpty()
  type: MessageType;

  @IsNotEmpty()
  message: {
    text: string;
    imageUrl?: string;
  };

  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}
