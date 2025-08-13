// dto/update-contact.dto.ts
import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateContactDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
