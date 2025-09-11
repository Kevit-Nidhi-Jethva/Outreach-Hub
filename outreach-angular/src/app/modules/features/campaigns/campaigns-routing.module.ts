import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CampaignsListComponent } from './campaign-list/campaign-list.component';
import { CampaignsFormComponent } from './campaign-form/campaign-form.component';
import { CampaignsViewComponent } from './campaign-view/campaign-view.component';

const routes: Routes = [
  { path: '', component: CampaignsListComponent }, // /campaigns
  { path: 'form', component: CampaignsFormComponent }, // /campaigns/form (create)
  { path: 'edit/:id', component: CampaignsFormComponent }, // /campaigns/edit/:id (edit)
  { path: 'view/:id', component: CampaignsViewComponent }, // /campaigns/view/:id (view details)
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampaignsRoutingModule {}
