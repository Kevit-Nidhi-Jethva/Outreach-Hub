import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { WelcomeComponent } from './welcome/welcome.component';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [DashboardComponent, WelcomeComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    NgChartsModule
  ]
})
export class DashboardModule {}
