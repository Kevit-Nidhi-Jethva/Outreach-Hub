import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CampaignListComponent } from './campaign-list/campaign-list.component';
import { CampaignFormComponent } from './campaign-form/campaign-form.component';
import { CampaignViewComponent } from './campaign-view/campaign-view.component';

const routes: Routes = [
  { path: '', component: CampaignListComponent }, // /campaigns
  { path: 'form', component: CampaignFormComponent }, // /campaigns/form (create)
  { path: 'edit/:id', component: CampaignFormComponent }, // /campaigns/edit/:id (edit)
  { path: 'view/:id', component: CampaignViewComponent }, // /campaigns/view/:id (view details)
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampaignsRoutingModule {}
