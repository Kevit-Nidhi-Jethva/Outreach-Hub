import { Component, OnInit } from '@angular/core';
import { Template, TemplateService } from '../services/template.service';
import { WorkspaceStateService } from '../../../core/services/workspace-state.service';

type TemplateForm = {
  name: string;
  type: 'Text' | 'Text-Image';
  text: string;
  imageUrl: string;
};

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  templates: Template[] = [];
  displayModal = false;
  editingTemplate: Template | null = null;
  form: TemplateForm = { name: '', type: 'Text', text: '', imageUrl: '' };
  currentWorkspaceId: string | null = null;
  userRole: string = 'Viewer';

  constructor(
    private templateService: TemplateService,
    private workspaceState: WorkspaceStateService
  ) {}

  ngOnInit(): void {
    const ws = this.workspaceState.getWorkspaceSync();
    this.currentWorkspaceId = ws?.workspaceId || null;
    if (ws?.role) {
      const normalized = ws.role.toLowerCase();
      if (normalized === 'editor') this.userRole = 'Editor';
      else this.userRole = 'Viewer';
    }
    this.loadTemplates();
  }

  loadTemplates() {
    if (!this.currentWorkspaceId) return;
    this.templateService.getTemplates().subscribe({
      next: data => {
        // filter for current workspace
        this.templates = data.filter(t => t.workspaceId === this.currentWorkspaceId);
      },
      error: err => console.error('Error loading templates:', err)
    });
  }

  openAdd() {
    if (this.userRole === 'Viewer') return;
    this.editingTemplate = null;
    this.form = { name: '', type: 'Text', text: '', imageUrl: '' };
    this.displayModal = true;
  }

  openEdit(template: Template) {
    if (this.userRole === 'Viewer') return;
    this.editingTemplate = template;
    this.form = {
      name: template.name,
      type: template.type,
      text: template.message.text,
      imageUrl: template.message.imageUrl || ''
    };
    this.displayModal = true;
  }

  save() {
    if (this.userRole === 'Viewer' || !this.currentWorkspaceId) return;

    const message: any = { text: this.form.text };
    if (this.form.type === 'Text-Image') {
      message.imageUrl = this.form.imageUrl;
    }

    const payload = {
      name: this.form.name,
      type: this.form.type,
      message,
      workspaceId: this.currentWorkspaceId
    };

    if (this.editingTemplate) {
      this.templateService.updateTemplate({ ...this.editingTemplate, ...payload }).subscribe(() => {
        this.loadTemplates();
        this.displayModal = false;
      });
    } else {
      this.templateService.createTemplate(payload).subscribe(() => {
        this.loadTemplates();
        this.displayModal = false;
      });
    }
  }

  deleteTemplate(template: Template) {
    if (this.userRole === 'Viewer') return;
    if (confirm('Are you sure you want to delete this template?')) {
      this.templateService.deleteTemplate(template._id).subscribe(() => this.loadTemplates());
    }
  }

  closeModal() {
    this.displayModal = false;
  }
}
