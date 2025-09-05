import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';

import { ContactListComponent } from './components/contact-list/contact-list.component';
import { MyContactsComponent } from './components/my-contact/my-contact.component';
import { WorkspaceContactsComponent } from './components/workspace-contact/workspace-contact.component';

@NgModule({
  declarations: [
    ContactListComponent, 
    MyContactsComponent, 
    WorkspaceContactsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    PaginatorModule,
    DialogModule,
    MultiSelectModule
  ],
  exports: [ContactListComponent, MyContactsComponent, WorkspaceContactsComponent]
})
export class ContactsModule { }
