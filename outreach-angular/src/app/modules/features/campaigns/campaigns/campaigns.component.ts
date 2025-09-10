import { Component, OnInit, OnDestroy } from '@angular/core';
import { CampaignService, Campaign, CampaignMessage } from '../services/campaign.service';
import { TemplateService, Template } from '../../templates/services/template.service';

@Component({
  selector: 'app-campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.scss'],
})
export class CampaignsComponent implements OnInit, OnDestroy {
  campaigns: Campaign[] = [];
  templates: Template[] = [];

  displayModal = false;
  editingCampaign: Campaign | null = null;
  selectedTemplate: Template | null = null;
  pollingInterval: any;

  form: any = {
    name: '',
    description: '',
    message: {
      type: '',
      text: '',
      imageUrl: '',
    },
  };

  constructor(
    private campaignService: CampaignService,
    private templateService: TemplateService
  ) {}

  ngOnInit(): void {
    this.loadCampaigns();
    this.loadTemplates();
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  startPolling() {
    if (this.pollingInterval) return;
    this.pollingInterval = setInterval(() => {
      this.loadCampaigns();
    }, 5000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  loadCampaigns() {
    const workspaceId = localStorage.getItem('selectedWorkspaceId');
    if (!workspaceId) {
      console.error('No workspace selected');
      return;
    }
    this.campaignService.getCampaigns(workspaceId).subscribe({
      next: (res) => {
        this.campaigns = res;

        // start/stop polling based on running campaigns
        const hasRunning = this.campaigns.some(c => c.status === 'Running');
        if (hasRunning) this.startPolling();
        else this.stopPolling();
      },
      error: (err) => console.error(err),
    });
  }

  loadTemplates() {
    this.templateService.getTemplates().subscribe({
      next: (res) => (this.templates = res),
      error: (err) => console.error(err),
    });
  }

  openAdd() {
    this.editingCampaign = null;
    this.form = {
      name: '',
      description: '',
      message: { type: '', text: '', imageUrl: '' },
      workspaceId: localStorage.getItem('selectedWorkspaceId') || ''
    };
    this.selectedTemplate = null;
    this.displayModal = true;
  }

  openEdit(campaign: Campaign) {
    this.editingCampaign = campaign;
    this.form = JSON.parse(JSON.stringify(campaign)); // deep copy
    if (!this.form.message) this.form.message = { type: '', text: '', imageUrl: '' };

    this.selectedTemplate = this.templates.find(
      t => t.message.text === this.form.message.text && t.type === this.form.message.type
    ) || null;

    this.displayModal = true;
  }

  closeModal() {
    this.displayModal = false;
  }

  selectTemplate(template: Template | null) {
    if (template) {
      this.selectedTemplate = template;
      this.form.message = { ...template.message, type: template.type };
    } else {
      this.selectedTemplate = null;
      this.form.message = { type: '', text: '', imageUrl: '' };
    }
  }

//   saveCampaign() {
//   if (this.editingCampaign) {
//     if (this.editingCampaign.status !== 'Draft') {
//       alert('Only draft campaigns can be updated.');
//       return;
//     }

//     // Deep copy and clean data
//     const updateData: any = {
//       name: this.form.name,
//       description: this.form.description,
//       message: {
//         type: this.form.message?.type || 'Text',
//         text: this.form.message?.text || '',
//         ...(this.form.message?.type === 'Text-Image' ? { imageUrl: this.form.message.imageUrl || '' } : {})
//       },
//       selectedTags: this.form.selectedTags || []
//     };

//     this.campaignService.updateCampaign(this.editingCampaign._id, updateData).subscribe({
//       next: (res) => {
//         this.loadCampaigns();
//         this.closeModal();
//       },
//       error: (err) => console.error('Update error:', err)
//     });
//   } else {
//     // Create new campaign
//     const wsId = localStorage.getItem('selectedWorkspace'); // ensure workspaceId
//     const newCampaign = {
//       name: this.form.name,
//       description: this.form.description,
//       workspaceId: wsId,
//       status: 'Draft',
//       message: {
//         type: this.form.message?.type || 'Text',
//         text: this.form.message?.text || '',
//         ...(this.form.message?.type === 'Text-Image' ? { imageUrl: this.form.message.imageUrl || '' } : {})
//       },
//       selectedTags: this.form.selectedTags || []
//     };

//     this.campaignService.createCampaign(newCampaign).subscribe({
//       next: (res) => {
//         this.loadCampaigns();
//         this.closeModal();
//       },
//       error: (err) => console.error('Create error:', err)
//     });
//   }
// }


  deleteCampaign(id: string) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    this.campaignService.deleteCampaign(id).subscribe({
      next: () => this.loadCampaigns(),
      error: (err) => console.error(err),
    });
  }

//   launchCampaign(campaign: Campaign) {
//     this.campaignService.launchCampaign(campaign._id).subscribe({
//       next: () => {
//         this.loadCampaigns();

//         setTimeout(() => {
//           const updated = this.campaigns.find(c => c._id === campaign._id);
//           if (updated && updated.status === 'Draft') {
//             updated.status = 'Running';
//             this.startPolling();
//           }
//         }, 1000);
//       },
//       error: (err) => console.error(err),
//     });
//   }

//   copyCampaign(campaign: Campaign) {
//     this.campaignService.copyCampaign(campaign._id).subscribe({
//       next: () => this.loadCampaigns(),
//       error: (err) => console.error(err),
//     });
//   }
 }
