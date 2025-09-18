import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignService, Campaign } from '../services/campaign.service';
import { ContactsService } from '../../contacts/services/contacts.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

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
    private contactsService: ContactsService,
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

        // Fetch contact names for sent messages
        if (this.campaign?.messages && this.campaign.messages.length > 0) {
          const contactObservables = this.campaign.messages.map(msg =>
            this.contactsService.getContactById(msg.contactId || '').pipe(
              // Map to contact name or fallback to contactId
              map(contact => ({ contactId: msg.contactId, contactName: contact?.name || msg.contactId }))
            )
          );

          forkJoin(contactObservables).subscribe({
            next: (contacts) => {
              // Map contactId to contactName for display
              const contactNameMap: { [id: string]: string } = {};
              contacts.forEach(c => {
                if (c.contactId) {
                  contactNameMap[c.contactId] = c.contactName;
                }
              });
              // Replace contactId with contactName in messages
              if (this.campaign && this.campaign.messages) {
                this.campaign.messages = this.campaign.messages.map(msg => ({
                  ...msg,
                  contactName: contactNameMap[msg.contactId || ''] || msg.contactId
                }));
              }
            },
            error: (err) => {
              console.error('Failed to load contact names', err);
            }
          });
        }

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
