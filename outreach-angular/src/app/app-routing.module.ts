import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/features/auth/login/login.component';
import { UnauthorizedComponent } from './modules/shared/components/unauthorized/unauthorized.component';
import { DashboardModule } from './modules/features/dashboard/dashboard.module';
import { WorkspaceSelectionComponent} from './modules/features/workspaces/workspace-selection/workspace-selection.component';
import { WorkspaceGuard } from './modules/core/guards/workspace.guard';
import { AuthGuard } from './modules/core/guards/auth.guard';
import { LayoutComponent } from './modules/features/layout/layout.component';
import { DashboardComponent } from './modules/features/dashboard/dashboard.component';
import { ContactListComponent } from './modules/features/contacts/components/contact-list/contact-list.component';
import { CampaignsComponent } from './modules/features/campaigns/campaigns/campaigns.component';
import { ReportComponent } from './modules/features/report/report.component';
import { TemplatesComponent } from './modules/features/templates/templates/templates.component';
import { ProfileComponent } from './modules/features/profile/profile.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'unauthorized' , component: UnauthorizedComponent},
  { path: 'workspace-selection', component: WorkspaceSelectionComponent, canActivate: [AuthGuard] },
  {
  path: 'dashboard',
  loadChildren: () => import('./modules/features/dashboard/dashboard.module').then(m => m.DashboardModule),
  canActivate: [AuthGuard, WorkspaceGuard]
  },
  { path: '**', redirectTo: '/login' },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'contacts', component: ContactListComponent },
      { path: 'campaigns', component: CampaignsComponent },
      { path: 'reports', component: ReportComponent },
      { path: 'templates', component: TemplatesComponent },
      { path: 'profile', component: ProfileComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
