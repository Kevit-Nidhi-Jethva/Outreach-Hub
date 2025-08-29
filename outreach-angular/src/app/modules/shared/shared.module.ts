import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TruncatePipe } from './pipes/truncate.pipe';



@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    TruncatePipe
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
