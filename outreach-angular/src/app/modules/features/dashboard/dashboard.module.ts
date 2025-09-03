import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { WelcomeComponent } from './welcome/welcome.component';

@NgModule({
  declarations: [DashboardComponent, WelcomeComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule {}
