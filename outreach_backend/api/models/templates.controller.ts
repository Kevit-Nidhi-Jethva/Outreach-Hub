import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
// import { AuthGuard } from '../auth/auth.guard'; // TODO: Uncomment to protect your routes

@Controller('api/templates')
// @UseGuards(AuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  findAll(@Query('workspaceId') workspaceId: string) {
    return this.templatesService.findAllByWorkspace(workspaceId);
  }
}