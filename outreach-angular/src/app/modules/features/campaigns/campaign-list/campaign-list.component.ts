import { Component, OnInit, OnDestroy } from '@angular/core';
import { CampaignService, Campaign } from '../services/campaign.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss']
})
export class CampaignListComponent implements OnInit, OnDestroy {
  campaigns: Campaign[] = [];
  loading = false;
  pollingSubs: { [id: string]: Subscription } = {};

  constructor(
    private campaignService: CampaignService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchCampaigns();
  }

  ngOnDestroy(): void {
    Object.values(this.pollingSubs).forEach(sub => sub.unsubscribe());
  }

  fetchCampaigns(): void {
    this.loading = true;
    this.campaignService.getCampaigns().subscribe({
      next: (res) => {
        this.campaigns = res || [];
        this.startPollingRunningCampaigns();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err?.message || 'Failed to load campaigns');
        this.loading = false;
      }
    });
  }

  startPollingRunningCampaigns(): void {
    this.campaigns.forEach(c => {
      if (c.status === 'Running' && !this.pollingSubs[c._id!]) {
        const sub = interval(3000).pipe(
          switchMap(() => this.campaignService.getCampaignStatus(c._id!))
        ).subscribe({
          next: (statusRes) => {
            c.status = statusRes.status as any;
            if (c.status !== 'Running') {
              this.pollingSubs[c._id!].unsubscribe();
              delete this.pollingSubs[c._id!];
            }
          },
          error: () => {}
        });
        this.pollingSubs[c._id!] = sub;
      }
    });
  }

  createCampaign() {
    this.router.navigate(['/campaigns/form']);
  }

  editCampaign(id: string) {
    this.router.navigate(['/campaigns/edit', id]);
  }

  viewCampaign(id: string) {
    this.router.navigate(['/campaigns/view', id]);
  }

  deleteCampaign(id: string) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    this.campaignService.deleteCampaign(id).subscribe({
      next: () => {
        this.toastr.success('Campaign deleted');
        this.campaigns = this.campaigns.filter(c => c._id !== id);
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err?.error?.message || 'Failed to delete campaign');
      }
    });
  }

  launchCampaign(id: string) {
    this.campaignService.launchCampaign(id).subscribe({
      next: (res) => {
        this.toastr.success('Campaign launched');
        const c = this.campaigns.find(camp => camp._id === id);
        if (c) {
          c.status = 'Running';
          c.launchedAt = res.launchedAt || new Date().toISOString();
          this.startPollingRunningCampaigns();
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err?.error?.message || 'Failed to launch campaign');
      }
    });
  }

  copyCampaign(id: string) {
    this.campaignService.copyCampaign(id).subscribe({
      next: (res) => {
        this.toastr.success('Campaign copied');
        this.campaigns.unshift(res);
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err?.error?.message || 'Failed to copy campaign');
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
}
