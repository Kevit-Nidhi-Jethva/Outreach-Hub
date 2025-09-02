import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { ContactListComponent } from '../contacts/components/contact-list/contact-list.component';
import { TemplatesComponent } from '../templates/templates/templates.component';
import { CampaignsComponent } from '../campaigns/campaigns/campaigns.component';
import { ReportComponent } from '../report/report.component';
import { ProfileComponent } from '../profile/profile.component';
import { WorkspacesComponent } from '../workspaces/workspaces/workspaces.component';

import { EditorGuard } from '../../core/guards/editor.guard';
import { ViewerGuard } from '../../core/guards/viewer.guard';

const routes: Routes = [
  
     {
    path: '',
    component: DashboardComponent,
    children: [
      { path: 'contacts', component: ContactListComponent, canActivate: [EditorGuard] },
      { path: 'templates', component: TemplatesComponent, canActivate: [EditorGuard] },
      { path: 'campaigns', component: CampaignsComponent, canActivate: [EditorGuard] },
      { path: 'reports', component: ReportComponent},
      { path: 'workspaces', component: WorkspacesComponent},
      { path: 'profile', component: ProfileComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
