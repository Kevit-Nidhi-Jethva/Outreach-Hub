import { Component, OnInit } from '@angular/core';
import { CampaignService, Campaign } from '../services/campaign.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-campaigns-view',
  templateUrl: './campaign-view.component.html',
  styleUrls: ['./campaign-view.component.scss'],
})
export class CampaignsViewComponent implements OnInit {
  campaign: Campaign | null = null;

  constructor(
    private service: CampaignService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.getCampaignById(id).subscribe({
        next: (data) => (this.campaign = data),
        error: (err) => console.error(err),
      });
    }
  }

  back() {
    this.location.back();
  }
}
