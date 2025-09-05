import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkspaceSelectionComponent } from './workspace-selection/workspace-selection.component';

const routes: Routes = [
  { path: '', component: WorkspaceSelectionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspacesRoutingModule { }
