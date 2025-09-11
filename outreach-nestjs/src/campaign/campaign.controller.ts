// import {
//   Controller,
//   Post,
//   Get,
//   Param,
//   Body,
//   Patch,
//   Delete,
//   UseGuards,
//   Req,
// } from '@nestjs/common';
// import { CampaignService } from './campaign.service';
//   import { CreateCampaignDto } from './dto/create.campaign.dto';
// import { UpdateCampaignDto } from './dto/update.campaign.dto';
// import { AuthGuard } from 'src/auth/auth.guard';

// @Controller('campaigns')
// @UseGuards(AuthGuard) // all routes require auth like your Node router.use(verifyToken)
// export class CampaignController {
//   constructor(private readonly campaignService: CampaignService) {}

//   // POST /campaigns
//   @Post('create')
//   create(@Body() dto: CreateCampaignDto, @Req() req) {
//     return this.campaignService.create(dto, req.user);
//   }

//   // GET /campaigns/mine
//   @Get('mine')
//   findMine(@Req() req) {
//     return this.campaignService.findMine(req.user);
//   }

//   // GET /campaigns/workspace/:workspaceId
//   @Get('workspace/:workspaceId')
//   findAllInWorkspace(@Param('workspaceId') workspaceId: string, @Req() req) {
//     return this.campaignService.findAllInWorkspace(workspaceId, req.user);
//   }

//   // GET /campaigns/:id
//   @Get(':id')
//   findOne(@Param('id') id: string, @Req() req) {
//     return this.campaignService.findOne(id, req.user);
//   }

//   // PATCH /campaigns/:id
//   @Patch(':id')
//   update(@Param('id') id: string, @Body() dto: UpdateCampaignDto, @Req() req) {
//     return this.campaignService.update(id, dto, req.user);
//   }

//   // DELETE /campaigns/:id
//   @Delete(':id')
//   remove(@Param('id') id: string, @Req() req) {
//     return this.campaignService.remove(id, req.user);
//   }
// }

import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards,
  Req,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create.campaign.dto';
import { UpdateCampaignDto } from './dto/update.campaign.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('campaigns')
@UseGuards(AuthGuard)
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post('create')
  create(@Body() dto: CreateCampaignDto, @Req() req) {
    return this.campaignService.create(dto, req.user);
  }

  @Get('mine')
  findMine(@Req() req) {
    return this.campaignService.findMine(req.user);
  }

  @Get('workspace/:workspaceId')
  findAllInWorkspace(@Param('workspaceId') workspaceId: string, @Req() req) {
    return this.campaignService.findAllInWorkspace(workspaceId, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.campaignService.findOne(id, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCampaignDto, @Req() req) {
    return this.campaignService.update(id, dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.campaignService.remove(id, req.user);
  }

  // ✅ Launch campaign
  @Post(':id/launch')
  launch(@Param('id') id: string, @Req() req) {
    return this.campaignService.launch(id, req.user);
  }

  // ✅ Copy campaign
  @Post(':id/copy')
  copy(@Param('id') id: string, @Req() req) {
    return this.campaignService.copy(id, req.user);
  }

  // ✅ Polling status
  @Get(':id/status')
  getStatus(@Param('id') id: string, @Req() req) {
    return this.campaignService.getStatus(id, req.user);
  }
}
