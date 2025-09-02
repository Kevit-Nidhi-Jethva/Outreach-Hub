import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../app/modules/features/auth/login/login.component';
import { UnauthorizedComponent } from './modules/shared/components/unauthorized/unauthorized.component';
import { DashboardModule } from './modules/features/dashboard/dashboard.module';

const routes: Routes = [
  { path: 'login', component: LoginComponent },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'unauthorized' , component: UnauthorizedComponent},
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
