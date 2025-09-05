import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkspacesRoutingModule } from './workspaces-routing.module';
import { WorkspacesComponent } from './workspaces/workspaces.component';
import { WorkspaceSelectionComponent } from './workspace-selection/workspace-selection.component';


@NgModule({
  declarations: [
    WorkspacesComponent,
    WorkspaceSelectionComponent
  ],
  imports: [
    CommonModule,
    WorkspacesRoutingModule
  ]
})
export class WorkspacesModule { }
