import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CampaignService, Campaign } from '../services/campaign.service';
import { TemplateService } from '../../templates/services/template.service';
import { ContactsService } from '../../contacts/services/contacts.service';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss']
})
export class CampaignFormComponent implements OnInit {
  campaignForm!: FormGroup;
  templates: any[] = [];
  workspaceTags: string[] = [];
  loading = false;
  isEdit = false;
  campaignId: string | null = null;
  workspaceId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private campaignService: CampaignService,
    private templateService: TemplateService,
    private contactsService: ContactsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.workspaceId =
      this.authService.getSelectedWorkspaceId() ||
      this._fallbackWorkspaceIdFromLocalStorage();

    if (!this.workspaceId) {
      this.toastr.error('No workspace selected');
      return;
    }

    this.initForm();
    this.fetchTemplates();
    this.fetchWorkspaceTags();

    this.campaignId = this.route.snapshot.paramMap.get('id');
    if (this.campaignId) {
      this.isEdit = true;
      this.loadCampaign(this.campaignId);
    }
  }

  private initForm() {
    this.campaignForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    templateId: [''], // UI only
    selectedTags: [[]],
    status: ['Draft'],   // ✅ add this
    message: this.fb.group({
      type: ['Text', Validators.required],
      text: ['', Validators.required],
      imageUrl: ['']
    })
  });

  }

  private _fallbackWorkspaceIdFromLocalStorage(): string | null {
    try {
      const raw =
        localStorage.getItem('selectedWorkspace') ||
        localStorage.getItem('workspace') ||
        localStorage.getItem('selectedWorkspaceId') ||
        localStorage.getItem('workspaceId');

      if (!raw) return null;

      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]._id) return parsed[0]._id;
        if (parsed && parsed.workspaceId) return parsed.workspaceId;
        if (parsed && parsed._id) return parsed._id;
      } catch {
        return raw;
      }
    } catch {
      return null;
    }
    return null;
  }

  private fetchTemplates() {
    this.templateService.getTemplates().subscribe({
      next: (res) => {
        this.templates = res || [];
      },
      error: (err) => {
        console.error('Error loading templates', err);
        this.toastr.error('Failed to load templates');
      }
    });
  }

  private fetchWorkspaceTags() {
    if (!this.workspaceId) return;
    this.contactsService.getWorkspaceContacts(this.workspaceId).subscribe({
      next: (contacts: any[] = []) => {
        const set = new Set<string>();
        contacts.forEach(c => {
          if (Array.isArray(c.tags)) {
            c.tags.forEach((t: string) => set.add(t));
          }
        });
        this.workspaceTags = Array.from(set).sort();
      },
      error: (err) => {
        console.error('Error fetching tags', err);
        this.toastr.error('Failed to load tags');
      }
    });
  }

  private loadCampaign(id: string) {
  this.loading = true;
  this.campaignService.getCampaignById(id).subscribe({
    next: (res: Campaign) => {
      this.campaignForm.patchValue({
        name: res.name,
        description: res.description || '',
        templateId: res.templateId || '',
        selectedTags: res.selectedTags || [],
        status: res.status || 'Draft',
        message: {
          type: res.message?.type || 'Text',
          text: res.message?.text || '',
          imageUrl: res.message?.imageUrl || ''
        }
      });

      // Convert launchedAt from string to Date for form if needed
      if (res.launchedAt) {
        const launchedDate = new Date(res.launchedAt);
        // optionally store somewhere if your form has a launchedAt control
      }

      this.loading = false;
    },
    error: (err) => {
      console.error(err);
      this.toastr.error('Failed to load campaign');
      this.loading = false;
    }
  });
}

  onTemplateChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const templateId = select.value;

    if (!templateId) {
      this.campaignForm.get('message')?.patchValue({
        type: 'Text',
        text: '',
        imageUrl: ''
      });
      return;
    }

    const t = this.templates.find(x => x._id === templateId);
    if (t) {
      this.campaignForm.get('message')?.patchValue({
        type: t.type,
        text: t.message?.text || '',
        imageUrl: t.message?.imageUrl || ''
      });
    }
  }

  isTagSelected(tag: string) {
    const arr: string[] = this.campaignForm.get('selectedTags')?.value || [];
    return arr.includes(tag);
  }

  toggleTag(tag: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const selectedTags = this.campaignForm.get('selectedTags')?.value || [];

    if (checked) {
      if (!selectedTags.includes(tag)) {
        this.campaignForm.patchValue({ selectedTags: [...selectedTags, tag] });
      }
    } else {
      this.campaignForm.patchValue({
        selectedTags: selectedTags.filter((t: string) => t !== tag),
      });
    }
  }

  submit() {
  if (!this.campaignForm || this.campaignForm.invalid) {
    this.toastr.error('Please fill required fields');
    return;
  }
  if (!this.workspaceId) {
    this.toastr.error('No workspace selected');
    return;
  }

  const { templateId, ...rest } = this.campaignForm.value;
  const payload: Partial<Campaign> = { ...rest, workspaceId: this.workspaceId };

  // Ensure launchedAt is ISO string if exists
  if (payload.launchedAt) payload.launchedAt = new Date(payload.launchedAt).toISOString();

  this.loading = true;

  if (this.isEdit && this.campaignId) {
    this.campaignService.updateCampaign(this.campaignId, payload).subscribe({
      next: () => {
        this.toastr.success('Campaign updated');
        this.router.navigate(['/campaigns']);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err?.error?.message || 'Failed to update campaign');
        this.loading = false;
      }
    });
  } else {
    this.campaignService.createCampaign(payload).subscribe({
      next: () => {
        this.toastr.success('Campaign created');
        this.router.navigate(['/campaigns']);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err?.error?.message || 'Failed to create campaign');
        this.loading = false;
      }
    });
  }
}
}
