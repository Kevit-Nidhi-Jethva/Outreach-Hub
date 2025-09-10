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
  selector: 'app-my-contacts',
  templateUrl: './my-contact.component.html',
  styleUrls: ['./my-contact.component.scss']
})
export class MyContactsComponent implements OnInit {
  contacts: Contact[] = [];
  displayModal = false;
  editingId: string | null = null;

  // form model
  form: Contact = { name: '', phoneNumber: '', tags: [] };
  tagInput = '';

  // validation errors
  errors: { [key: string]: string } = {};

  // pagination
  currentPage = 1;
  pageSize = 6;

  loading = false;

  constructor(private contactsService: ContactsService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.contactsService.getMyContacts().subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch my contacts:', err);
        this.loading = false;
      },
    });
  }

  // pagination helpers
  get paginatedContacts(): Contact[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.contacts.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.contacts.length / this.pageSize || 1));
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }
  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  // modal controls
  openAdd(): void {
  this.displayModal = true;
  this.editingId = null;
  this.form = { name: '', phoneNumber: '', tags: [] };  // ✅ ensure array
  this.tagInput = '';
  this.errors = {};
}


  openEdit(contact: Contact): void {
  this.displayModal = true;
  this.editingId = contact._id!;
  this.form = { ...contact };
  this.form.tags = contact.tags ? [...contact.tags] : [];  // ✅ ensure array
  this.tagInput = '';
  this.errors = {};
}


  closeModal(): void {
    this.displayModal = false;
    this.editingId = null;
    this.form = { name: '', phoneNumber: '', tags: [] };
    this.tagInput = '';
    this.errors = {};
  }

  // tags logic
  addTag(): void {
    const t = (this.tagInput || '').trim();
    if (!t) {
      this.tagInput = '';
      return;
    }
    if (!this.form.tags) this.form.tags = [];
    if (!this.form.tags.includes(t)) this.form.tags.push(t);
    this.tagInput = '';
  }

  removeTag(tag: string): void {
    this.form.tags = (this.form.tags || []).filter(t => t !== tag);
  }

  // validation
  validate(): boolean {
    this.errors = {};
    let valid = true;

    if (!this.form.name || !this.form.name.trim()) {
      this.errors['name'] = 'Name is required';
      valid = false;
    }

    const phone = (this.form.phoneNumber || '').trim();
    if (!phone) {
      this.errors['phoneNumber'] = 'Phone number is required';
      valid = false;
    } else if (!/^\d{10}$/.test(phone)) {
      this.errors['phoneNumber'] = 'Phone number must be 10 digits';
      valid = false;
    }

    if (!this.form.tags || this.form.tags.length === 0) {
      this.errors['tags'] = 'At least one tag is required';
      valid = false;
    }

    return valid;
  }

  // save (create or update)
  save(): void {
    if (!this.validate()) return;

    const payload = {
      name: this.form.name.trim(),
      phoneNumber: this.form.phoneNumber.trim(),
      tags: this.form.tags || []
    };

    if (this.editingId) {
      this.contactsService.updateContact(this.editingId, payload).subscribe({
        next: (updated: Contact) => {
          const idx = this.contacts.findIndex(c => c._id === this.editingId);
          if (idx !== -1) this.contacts[idx] = updated;
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating contact:', err);
        }
      });
    } else {
      this.contactsService.createContact(payload).subscribe({
        next: (created: Contact) => {
          this.contacts.unshift(created);
          if (this.contacts.length > this.pageSize && this.currentPage !== 1) {
            this.currentPage = 1;
          }
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating contact:', err);
        }
      });
    }
  }

  // delete
  deleteContact(id?: string): void {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this contact?')) return;
    this.contactsService.deleteContact(id).subscribe({
      next: () => {
        this.contacts = this.contacts.filter(c => c._id !== id);
        if (this.currentPage > this.totalPages) this.currentPage = Math.max(1, this.totalPages);
      },
      error: (err) => {
        console.error('Error deleting contact:', err);
      }
    });
  }
}