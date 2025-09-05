import { Component } from '@angular/core';

interface Contact {
  id?: number;
  name: string;
  phoneNumber: string;
  tags: string[];
}

@Component({
  selector: 'app-contacts',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent {
  contacts: Contact[] = [
    { id: 1, name: 'John Doe', phoneNumber: '9876543210', tags: ['friend', 'work'] },
    { id: 2, name: 'Jane Smith', phoneNumber: '9876501234', tags: ['family'] }
  ];

  // Modal control
  showModal = false;
  editingContact: Contact | null = null;

  // Form state
  formData: Contact = { name: '', phoneNumber: '', tags: [] };
  newTag: string = '';

  // Pagination
  currentPage = 1;
  pageSize = 6;

  get totalPages(): number {
    return Math.ceil(this.contacts.length / this.pageSize);
  }

  get paginatedContacts(): Contact[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.contacts.slice(start, start + this.pageSize);
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  // Open modal
  openModal() {
    this.showModal = true;
    this.editingContact = null;
    this.formData = { name: '', phoneNumber: '', tags: [] };
    this.newTag = '';
  }

  // Close modal
  closeModal() {
    this.showModal = false;
  }

  // Add tag
  addTag() {
    const tag = this.newTag.trim();
    if (tag && !this.formData.tags.includes(tag)) {
      this.formData.tags.push(tag);
    }
    this.newTag = '';
  }

  // Remove tag
  removeTag(index: number) {
    this.formData.tags.splice(index, 1);
  }

  // Save contact (add or update)
  saveContact() {
    if (!this.formData.name.trim() || !this.formData.phoneNumber.trim()) {
      alert('Name and phone number are required!');
      return;
    }

    if (this.editingContact) {
      // Update existing
      const idx = this.contacts.findIndex(c => c.id === this.editingContact!.id);
      if (idx > -1) {
        this.contacts[idx] = { ...this.formData, id: this.editingContact.id };
      }
    } else {
      // Add new
      const newContact: Contact = {
        ...this.formData,
        id: Date.now()
      };
      this.contacts.push(newContact);
    }

    this.closeModal();
  }

  // Edit contact
  editContact(contact: Contact) {
    this.showModal = true;
    this.editingContact = contact;
    this.formData = { ...contact, tags: [...contact.tags] };
    this.newTag = '';
  }

  // Delete contact
  deleteContact(contact: Contact) {
    if (confirm('Are you sure you want to delete this contact?')) {
      this.contacts = this.contacts.filter(c => c.id !== contact.id);
    }
  }
}
