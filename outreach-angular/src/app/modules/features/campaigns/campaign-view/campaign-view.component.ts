import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CampaignService } from '../services/campaign.service';

@Component({
  selector: 'app-campaigns-view',
  templateUrl: './campaign-view.component.html',
  styleUrls: ['./campaign-view.component.scss']
})
export class CampaignsViewComponent implements OnInit {
  campaign: any;
  campaignId!: string;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.campaignId = this.route.snapshot.paramMap.get('id') || '';
    this.loadCampaign();
  }

  loadCampaign() {
    this.loading = true;
    this.campaignService.getCampaignById(this.campaignId).subscribe({
      next: (res) => {
        this.campaign = res;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to load campaign');
        this.loading = false;
      }
    });
  }
}
