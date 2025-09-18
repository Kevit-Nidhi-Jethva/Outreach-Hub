import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
// import { AuthGuard } from '../auth/auth.guard'; // TODO: Uncomment to protect your routes

@Controller('api/tags')
// @UseGuards(AuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll(@Query('workspaceId') workspaceId: string) {
    return this.tagsService.findAllByWorkspace(workspaceId);
  }
}