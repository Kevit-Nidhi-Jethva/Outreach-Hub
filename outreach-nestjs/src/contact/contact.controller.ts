//contact controller
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

    // Get my contacts for a workspace
  @Get('workspace/:workspaceId/my')
  findMy(@Param('workspaceId') workspaceId: string, @Req() req) {
    return this.contactService.findMy(workspaceId, req.user);
  }

    // contacts.controller.ts
  @Get('workspace/:workspaceId')
  async getWorkspaceContacts(@Param('workspaceId') workspaceId: string) {
    return this.contactService.findByWorkspace(workspaceId);
  }

  // ✅ Only my contacts in workspace
  @Get('workspace/:workspaceId/my')
  async getMyContacts(@Param('workspaceId') workspaceId: string, @Req() req) {
    const userId = req.user.sub; // comes from JWT payload
    return this.contactService.findMyContacts(workspaceId, userId);
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

  // Get all unique tags in a workspace
  @Get('tags/:workspaceId')
  async getTags(@Param('workspaceId') workspaceId: string) {
    const contacts = await this.contactService.findByWorkspace(workspaceId);
    const tagsSet = new Set<string>();
    contacts.forEach(contact => {
      if (Array.isArray(contact.tags)) {
        contact.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  }

}
