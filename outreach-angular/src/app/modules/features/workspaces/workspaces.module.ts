import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkspacesRoutingModule } from './workspaces-routing.module';
import { WorkspacesComponent } from './workspaces/workspaces.component';


@NgModule({
  declarations: [
    WorkspacesComponent
  ],
  imports: [
    CommonModule,
    WorkspacesRoutingModule
  ]
})
export class WorkspacesModule { }
