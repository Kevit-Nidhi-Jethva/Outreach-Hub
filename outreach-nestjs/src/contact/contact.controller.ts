import { Controller, Post, Get, Param, Body, Query, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-decorator';

@Controller('contacts')
@UseGuards(AuthGuard, RolesGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('create')
  @Roles('Editor')
  createContact(@Body() dto: CreateContactDto, @Req() req) {
    return this.contactService.create(dto, req.user);
  }

  @Get('get')
  @Roles('Editor', 'Viewer')
  getContacts(@Query() query) {
    return this.contactService.findAll(query);
  }

  @Get('get/:id')
  @Roles('Editor', 'Viewer')
  getContactById(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Put('update/:id')
  @Roles('Editor')
  updateContact(@Param('id') id: string, @Body() dto: UpdateContactDto, @Req() req) {
    return this.contactService.update(id, dto, req.user);
  }

  @Delete('delete/:id')
  @Roles('Editor')
  deleteContact(@Param('id') id: string, @Req() req) {
    return this.contactService.remove(id, req.user);
  }
}
