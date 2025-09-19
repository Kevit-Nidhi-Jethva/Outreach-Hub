import { Component, OnInit } from '@angular/core';
import { ContactsService } from '../../services/contacts.service';

interface Contact {
  _id?: string;
  name: string;
  phoneNumber: string;
  tags: string[];
  createdBy?: any;
  workspaceId?: string;
}

@Component({
  selector: 'app-workspace-contacts',
  templateUrl: './workspace-contact.component.html',
  styleUrls: ['./workspace-contact.component.scss']
})
export class WorkspaceContactsComponent implements OnInit {
  contacts: Contact[] = [];
  loading = false;

  // pagination
  currentPage = 1;
  pageSize = 6;

  // view modal
  viewing: Contact | null = null;
  showViewModal = false;

  constructor(private contactsService: ContactsService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.contactsService.getWorkspaceContacts().subscribe({
      next: (res: Contact[]) => {
        this.contacts = Array.isArray(res) ? res.sort((a, b) => a.name.localeCompare(b.name)) : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading workspace contacts:', err);
        this.loading = false;
      }
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.contacts.length / this.pageSize || 1));
  }

  get paginated(): Contact[] {
    const s = (this.currentPage - 1) * this.pageSize;
    return this.contacts.slice(s, s + this.pageSize);
  }

  next(): void { if (this.currentPage < this.totalPages) this.currentPage++; }
  prev(): void { if (this.currentPage > 1) this.currentPage--; }

  openView(contact: Contact): void {
    this.viewing = contact;
    this.showViewModal = true;
  }
  closeView(): void {
    this.viewing = null;
    this.showViewModal = false;
  }
}