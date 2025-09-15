import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignService, Campaign } from '../services/campaign.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-campaign-view',
  templateUrl: './campaign-view.component.html',
  styleUrls: ['./campaign-view.component.scss']
})
export class CampaignViewComponent implements OnInit {
  campaignId: string | null = null;
  campaign: Campaign | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private campaignService: CampaignService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.campaignId = this.route.snapshot.paramMap.get('id');
    if (!this.campaignId) {
      this.toastr.error('Invalid campaign ID');
      this.router.navigate(['/campaigns']);
      return;
    }
    this.fetchCampaign(this.campaignId);
  }

  fetchCampaign(id: string) {
    this.loading = true;
    this.campaignService.getCampaignById(id).subscribe({
      next: (res) => {
        this.campaign = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err?.error?.message || 'Failed to load campaign');
        this.router.navigate(['/campaigns']);
        this.loading = false;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Draft': return 'badge bg-secondary';
      case 'Running': return 'badge bg-primary';
      case 'Completed': return 'badge bg-success';
      default: return 'badge bg-light';
    }
  }

  goBack() {
    this.router.navigate(['/campaigns']);
  }
}
