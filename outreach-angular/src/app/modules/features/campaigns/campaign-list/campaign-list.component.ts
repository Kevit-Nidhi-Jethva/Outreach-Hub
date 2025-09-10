import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CampaignService, Campaign } from '../services/campaign.service';

@Component({
  selector: 'app-campaigns-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss']
})
export class CampaignsListComponent implements OnInit {
  campaigns: Campaign[] = [];
  workspaceId: string = '';

  constructor(private campaignService: CampaignService, private router: Router) {}

  ngOnInit(): void {
    this.workspaceId = localStorage.getItem('selectedWorkspaceId') || '';
    this.loadCampaigns();
  }

  loadCampaigns() {
    this.campaignService.getCampaigns(this.workspaceId).subscribe({
      next: (data) => (this.campaigns = data),
      error: (err) => console.error('Failed to load campaigns', err)
    });
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
      next: () => this.loadCampaigns(),
      error: (err) => console.error('Delete failed', err)
    });
  }

  copyCampaign(id: string) {
    this.campaignService.copyCampaign(id).subscribe({
      next: () => this.loadCampaigns(),
      error: (err) => console.error('Copy failed', err)
    });
  }

  launchCampaign(id: string) {
    if (!confirm('Are you sure you want to launch this campaign?')) return;
    this.campaignService.launchCampaign(id).subscribe({
      next: () => this.loadCampaigns(),
      error: (err) => console.error('Launch failed', err)
    });
  }
}
