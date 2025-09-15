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
  Query,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/create.campaign.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('campaigns')
@UseGuards(AuthGuard)
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  /** Create campaign */
  @Post('create')
  create(@Body() dto: CreateCampaignDto, @Req() req) {
    return this.campaignService.create(dto, req.user);
  }

  /** My campaigns */
  @Get('mine')
  findMine(@Req() req) {
    return this.campaignService.findMine(req.user);
  }

  /** All campaigns in workspace */
  @Get('workspace/:workspaceId')
  findAllInWorkspace(@Param('workspaceId') workspaceId: string, @Req() req) {
    return this.campaignService.findAllInWorkspace(workspaceId, req.user);
  }

  /** Single campaign by ID */
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.campaignService.findOne(id, req.user);
  }

  /** Update campaign */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCampaignDto, @Req() req) {
    return this.campaignService.update(id, dto, req.user);
  }

  /** Delete campaign */
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.campaignService.remove(id, req.user);
  }

  /** Launch campaign */
  @Post(':id/launch')
  launch(@Param('id') id: string, @Req() req) {
    return this.campaignService.launch(id, req.user);
  }

  /** Copy campaign */
  @Post(':id/copy')
  copy(@Param('id') id: string, @Req() req) {
    return this.campaignService.copy(id, req.user);
  }

  /** Campaign status */
  @Get(':id/status')
  getStatus(@Param('id') id: string, @Req() req) {
    return this.campaignService.getStatus(id, req.user);
  }

  /** Get per-contact messages with pagination */
  @Get(':id/messages')
  getMessages(
    @Param('id') id: string,
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 50;
    return this.campaignService.getMessages(id, req.user, p, l);
  }
}
