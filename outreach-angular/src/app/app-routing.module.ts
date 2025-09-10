// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UnauthorizedComponent } from './modules/shared/components/unauthorized/unauthorized.component.js';

import { WorkspaceGuard } from './modules/core/guards/workspace.guard.js';
import { AuthGuard } from './modules/core/guards/auth.guard.js';

import { LayoutComponent } from './modules/features/layout/layout.component.js';
import { WelcomeComponent } from './modules/features/dashboard/welcome/welcome.component.js';

import { ContactListComponent } from './modules/features/contacts/components/contact-list/contact-list.component.js';
import { CampaignsComponent } from './modules/features/campaigns/campaigns/campaigns.component.js';
import { ReportsComponent as ReportComponent } from './modules/features/reports/reports/reports.component.js';
import { TemplatesComponent } from './modules/features/templates/templates/templates.component.js';
import { ProfileComponent } from './modules/features/profile/profile/profile.component.js';
import { MyContactsComponent } from './modules/features/contacts/components/my-contact/my-contact.component.js';
import { WorkspaceContactsComponent } from './modules/features/contacts/components/workspace-contact/workspace-contact.component.js';
import { RoleGuard } from './modules/core/guards/role.guard.js';
import { EditorGuard } from './modules/core/guards/editor.guard.js';
import { CampaignsListComponent } from './modules/features/campaigns/campaign-list/campaign-list.component.js';
import { CampaignsFormComponent } from './modules/features/campaigns/campaign-form/campaign-form.component.js';
import { CampaignsViewComponent } from './modules/features/campaigns/campaign-view/campaign-view.component.js';

const routes: Routes = [
  // Public / auth
  {
    path: 'login',
    loadChildren: () =>
      import('./modules/features/auth/auth.module.js').then(m => m.AuthModule)
  },

  // Explicit unauthorized page
  { path: 'unauthorized', component: UnauthorizedComponent },

  // Keep backwards compatible route (redirect) and canonical workspace selection route
  { path: 'workspace-selection', redirectTo: 'workspaces/workspace-selection', pathMatch: 'full' },
  {
    path: 'workspaces/workspace-selection',
    loadChildren: () =>
      import('./modules/features/workspaces/workspaces.module.js').then(m => m.WorkspacesModule),
    canActivate: [AuthGuard] // ensure only authenticated users can choose workspace
  },

  // Authenticated shell (LayoutComponent contains navbar/sidebar/footer + router-outlet)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard, WorkspaceGuard], // WorkspaceGuard ensures workspace is selected
    children: [
      // Default inside shell -> welcome
      { path: '', redirectTo: 'welcome', pathMatch: 'full' },

      // Welcome = default dashboard landing
      { path: 'welcome', component: WelcomeComponent },

      // Feature pages inside shell (keep as currently used components)
      { path: 'contacts', component: ContactListComponent },
      { path: 'contacts/my', component: MyContactsComponent, canActivate: [EditorGuard] },
      { path: 'contacts/workspace', component: WorkspaceContactsComponent },
      { path: 'reports', component: ReportComponent },
      { path: 'templates', component: TemplatesComponent },
      { path: 'profile', component: ProfileComponent },
      // inside your routes array
      {
        path: 'campaigns',
        children: [
          { path: '', component: CampaignsListComponent },
          { path: 'create', component: CampaignsFormComponent },
          { path: ':id', component: CampaignsViewComponent },
          { path: ':id/edit', component: CampaignsFormComponent },
        ]
      },


      // Optional: keep /dashboard alias to welcome for legacy links
      { path: 'dashboard', redirectTo: 'welcome', pathMatch: 'full' }
    ]
  },

  // Wildcard -> Unauthorized
  { path: '**', redirectTo: 'unauthorized' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
