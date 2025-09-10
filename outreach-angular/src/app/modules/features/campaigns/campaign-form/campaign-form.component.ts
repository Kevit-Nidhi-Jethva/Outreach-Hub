import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CampaignService, Campaign } from '../services/campaign.service';

@Component({
  selector: 'app-campaigns-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss']
})
export class CampaignsFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  campaignId: string | null = null;

  // Dummy templates for select dropdown
  templates = [
    { id: '1', name: 'Template 1', type: 'Text' },
    { id: '2', name: 'Template 2', type: 'Text-Image' }
  ];

  constructor(
    private fb: FormBuilder,
    private campaignService: CampaignService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.campaignId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.campaignId;

    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: ['Draft', Validators.required],
      selectedTags: [[]],
      templateId: [''],
      message: this.fb.group({
        type: ['Text', Validators.required],
        text: ['', Validators.required],
        imageUrl: ['']
      })
    });

    if (this.isEdit && this.campaignId) {
      this.campaignService.getCampaignById(this.campaignId).subscribe(c => {
        this.form.patchValue(c);
      });
    }
  }

  onTemplateChange(templateId: string) {
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      this.form.patchValue({
        templateId: template.id,
        message: { type: template.type, text: '', imageUrl: '' }
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    const data: Campaign = this.form.value;

    if (this.isEdit && this.campaignId) {
      this.campaignService.updateCampaign(this.campaignId, data).subscribe(() => {
        alert('Campaign updated successfully');
        this.router.navigate(['/campaigns']);
      });
    } else {
      this.campaignService.createCampaign(data).subscribe(() => {
        alert('Campaign created successfully');
        this.router.navigate(['/campaigns']);
      });
    }
  }
}
