import { Component, OnInit } from '@angular/core';
import { Template, TemplateService } from '../services/template.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {

  templates: Template[] = [];
  displayModal = false;
  editingTemplate: Template | null = null;

  form = { name: '', content: '' };
  currentUser = 'editor1'; // dummy logged-in editor

  constructor(private templateService: TemplateService) { }

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates() {
    this.templateService.getTemplates().subscribe(data => this.templates = data);
  }

  openAdd() {
    this.editingTemplate = null;
    this.form = { name: '', content: '' };
    this.displayModal = true;
  }

  openEdit(template: Template) {
    this.editingTemplate = template;
    this.form = { name: template.name, content: template.content };
    this.displayModal = true;
  }

  save() {
    if (this.editingTemplate) {
      const updated: Template = { ...this.editingTemplate, ...this.form };
      this.templateService.updateTemplate(updated).subscribe(() => {
        this.loadTemplates();
        this.displayModal = false;
      });
    } else {
      const newTemplate: Template = { id: uuidv4(), ...this.form, createdBy: this.currentUser };
      this.templateService.addTemplate(newTemplate).subscribe(() => {
        this.loadTemplates();
        this.displayModal = false;
      });
    }
  }

  deleteTemplate(template: Template) {
    if (template.createdBy === this.currentUser) {
      this.templateService.deleteTemplate(template.id).subscribe(() => this.loadTemplates());
    } else {
      alert('You can only delete templates created by you.');
    }
  }

  closeModal() {
    this.displayModal = false;
  }
}
