import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CampaignService, Campaign } from '../services/campaign.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss']
})
export class CampaignsListComponent implements OnInit {
  campaigns: Campaign[] = [];
  loading = false;

  constructor(
    public router: Router,
    private campaignService: CampaignService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const workspaceId = this.authService.getSelectedWorkspaceId();
    if (!workspaceId) {
      this.toastr.error('No workspace selected');
      return;
    }
    this.loadCampaigns();
  }

  loadCampaigns() {
    this.loading = true;
    this.campaignService.getCampaigns().subscribe({
      next: (res) => {
        this.campaigns = res;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to load campaigns');
        this.loading = false;
      }
    });
  }

  newCampaign() {
    this.router.navigate(['/campaigns/form']);
  }

  viewCampaign(id: string) {
    this.router.navigate(['/campaigns/view', id]);
  }

  editCampaign(id: string) {
    this.router.navigate(['/campaigns/edit', id]);
  }

  deleteCampaign(id: string) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    this.campaignService.deleteCampaign(id).subscribe({
      next: () => {
        this.toastr.success('Campaign deleted');
        this.loadCampaigns();
      },
      error: () => this.toastr.error('Failed to delete campaign')
    });
  }
}
