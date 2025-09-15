import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsMongoId,
  IsDateString,
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
  workspaceId: string;
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['Draft', 'Running', 'Completed'])
  status?: 'Draft' | 'Running' | 'Completed';

  @IsOptional()
  @IsArray()
  selectedTags?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MessageDto)
  message?: MessageDto;

  @IsOptional()
  @IsDateString()
  launchedAt?: string;
}
