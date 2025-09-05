// src/workspace/workspace.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, Req, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post('create')
  async create(@Body() dto: CreateWorkspaceDto, @Req() req) {
    return this.workspaceService.create(dto, req.user);
  }

  @Get('all')
  async findAll(@Req() req) {
    return this.workspaceService.findAll(req.user);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req) {
    return this.workspaceService.findById(id, req.user);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateWorkspaceDto, @Req() req) {
    return this.workspaceService.update(id, updateDto, req.user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req) {
    return this.workspaceService.delete(id, req.user);
  }
}
