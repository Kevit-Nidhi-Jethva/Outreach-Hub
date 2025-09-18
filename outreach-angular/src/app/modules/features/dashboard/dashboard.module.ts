import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
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
    NgChartsModule,
    FormsModule,
    CalendarModule,
    TableModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule {}
