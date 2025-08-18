import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('contacts')
@UseGuards(AuthGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // Create
  @Post()
  create(@Body() createContactDto: CreateContactDto, @Req() req) {
    return this.contactService.create(createContactDto, req.user);
  }

  // Find All by Workspace
  @Get('workspace/:workspaceId')
  findAll(@Param('workspaceId') workspaceId: string, @Req() req) {
    return this.contactService.findAll(workspaceId, req.user);
  }

  // Find One
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.contactService.findOne(id, req.user);
  }

  // Update
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto, @Req() req) {
    return this.contactService.update(id, updateContactDto, req.user);
  }

  // Delete
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.contactService.remove(id, req.user);
  }
}
