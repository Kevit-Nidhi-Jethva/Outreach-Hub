import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CampaignService } from '../services/campaign.service';
import { CampaignService, Campaign } from '../services/campaign.service';
import { TemplateService, Template } from '../../templates/services/template.service';
import { ContactsService } from '../../contacts/services/contacts.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss']
})
export class CampaignsFormComponent implements OnInit {
  campaignForm!: FormGroup;
  templates: Template[] = [];
  workspaceTags: string[] = [];
  loading = false;
  isEdit = false;

  workspaceId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private campaignService: CampaignService,
    private templateService: TemplateService,
    private contactsService: ContactsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get workspace ID first
    this.workspaceId = this.authService.getSelectedWorkspaceId();
    if (!this.workspaceId) {
      console.error('No workspace selected');
      return;
    }

    this.initForm();
    this.fetchTemplates();
    this.fetchWorkspaceTags();
  }

  initForm() {
    this.campaignForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      templateId: [''],
      selectedTags: [[]],
      message: this.fb.group({
        type: ['Text', Validators.required],
        text: ['', Validators.required],
        imageUrl: ['']
      })
    });
  }

  fetchTemplates() {
    if (!this.workspaceId) return;
    this.templateService.getWorkspaceTemplates(this.workspaceId).subscribe({
      next: (res) => {
        this.templates = res;
      },
      error: (err) => console.error('Error fetching templates', err)
    });
  }

  fetchWorkspaceTags() {
    if (!this.workspaceId) return;
    this.contactsService.getWorkspaceTags(this.workspaceId).subscribe({
      next: (tags) => (this.workspaceTags = tags),
      error: (err) => console.error('Error fetching tags', err)
    });
  }

  onTemplateChange(event: Event) {
    const templateId = (event.target as HTMLSelectElement).value;
    const selectedTemplate = this.templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      this.campaignForm.get('message')?.patchValue({
        type: selectedTemplate.type,
        text: selectedTemplate.message.text,
        imageUrl: selectedTemplate.message.imageUrl || ''
      });
    } else {
      this.campaignForm.get('message')?.patchValue({
        type: 'Text',
        text: '',
        imageUrl: ''
      });
    }
  }

  isTagSelected(tag: string) {
    return this.campaignForm.get('selectedTags')?.value.includes(tag);
  }

  onTagToggle(event: Event) {
    const input = event.target as HTMLInputElement;
    const selectedTags = this.campaignForm.get('selectedTags')?.value || [];
    if (input.checked) {
      selectedTags.push(input.value);
    } else {
      const index = selectedTags.indexOf(input.value);
      if (index > -1) selectedTags.splice(index, 1);
    }
    this.campaignForm.get('selectedTags')?.setValue(selectedTags);
  }

  submit() {
    if (!this.campaignForm.valid || !this.workspaceId) return;

    const payload = { ...this.campaignForm.value, workspaceId: this.workspaceId };

    this.loading = true;
    if (this.isEdit) {
      const campaignId = payload._id;
      const campaignId = (payload as any)._id;
      if (!campaignId) return;
      this.campaignService.updateCampaign(campaignId, payload).subscribe({
        next: () => (this.loading = false),
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      this.campaignService.createCampaign(payload).subscribe({
      this.campaignService.createCampaign(payload as Campaign).subscribe({
        next: () => (this.loading = false),
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
    }
  }
}
