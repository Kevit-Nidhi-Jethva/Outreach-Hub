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
export class CampaignListComponent implements OnInit {
  campaigns: Campaign[] = [];
  loading = false;

  constructor(
    public router: Router, // public so template can call router if needed
    private campaignService: CampaignService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const ws = this.authService.getSelectedWorkspaceId();
    if (!ws) {
      this.toastr.error('No workspace selected');
      return;
    }
    this.loadCampaigns();
  }

  loadCampaigns() {
    this.loading = true;
    this.campaignService.getCampaigns().subscribe({
      next: (res) => {
        this.campaigns = res || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load campaigns');
        this.loading = false;
      }
    });
  }

  newCampaign() {
    this.router.navigate(['/campaigns/form']);
  }

  viewCampaign(id?: string) {
    if (!id) return;
    this.router.navigate(['/campaigns/view', id]);
  }

  editCampaign(id?: string) {
    if (!id) return;
    this.router.navigate(['/campaigns/edit', id]);
  }

  deleteCampaign(id?: string) {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    this.campaignService.deleteCampaign(id).subscribe({
      next: () => {
        this.toastr.success('Campaign deleted');
        this.loadCampaigns();
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to delete campaign');
      }
    });
  }
}
