import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CampaignsRoutingModule } from './campaigns-routing.module';
import { CampaignsComponent } from './campaigns/campaigns.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CampaignsListComponent } from './campaign-list/campaign-list.component';
import { CampaignsViewComponent } from './campaign-view/campaign-view.component';
import { CampaignsFormComponent } from './campaign-form/campaign-form.component';

// Angular Material modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';

@NgModule({
  declarations: [
    CampaignsComponent,
    CampaignsListComponent,
    CampaignsViewComponent,
    CampaignsFormComponent
  ],
  imports: [
    CommonModule,
    CampaignsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class CampaignsModule { }
