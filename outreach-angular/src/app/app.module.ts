import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './modules/features/dashboard/dashboard.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../app/modules/core/intersecptors/auth.interceptor';
import { AuthModule } from './modules/features/auth/auth.module';
import { RouterModule } from '@angular/router';
import { DashboardModule } from './modules/features/dashboard/dashboard.module';
import { ReportComponent } from './modules/features/report/report.component';
import { ProfileComponent } from './modules/features/profile/profile.component';



@NgModule({
  declarations: [
    AppComponent,
    ReportComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AuthModule,
    HttpClientModule,
    RouterModule,
    DashboardModule
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
