import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsMongoId,
  IsDateString,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class MessageDto {
  @IsEnum(['Text', 'Text-Image'])
  type: 'Text' | 'Text-Image';

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['Draft', 'Running', 'Completed'])
  status?: 'Draft' | 'Running' | 'Completed';

  @IsOptional()
  @IsArray()
  selectedTags?: string[];

  @ValidateNested()
  @Type(() => MessageDto)
  message: MessageDto;

  @IsOptional()
  @IsDateString()
  launchedAt?: string;

  @IsMongoId()
  workspaceId: string; // taken from body OR fallback from token in guard logic
}
