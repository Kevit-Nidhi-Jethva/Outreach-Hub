import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module.js';
import { AppComponent } from './app.component.js';
import { LayoutComponent } from './modules/features/layout/layout.component.js';

import { SharedModule } from './modules/shared/shared.module.js';
import { ContactsModule } from './modules/features/contacts/contacts.module.js';
import { TemplateModule } from './modules/features/templates/templates.module.js';
import { CampaignsModule } from './modules/features/campaigns/campaigns.module.js';
import { DashboardModule } from './modules/features/dashboard/dashboard.module';
import { ProfileModule } from './modules/features/profile/profile.module';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './modules/core/intersecptors/auth.interceptor.js';
import { CommonModule } from '@angular/common';
import {ToastrModule} from "ngx-toastr";
import { CalendarModule } from 'primeng/calendar';


@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    ContactsModule,
    TemplateModule,
    CampaignsModule,
    DashboardModule,
    ProfileModule,
    BrowserAnimationsModule,
    CommonModule,
    ToastrModule.forRoot(),
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
