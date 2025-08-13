// dto/create-contact.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}
