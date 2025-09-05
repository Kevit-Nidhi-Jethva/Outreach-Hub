import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplatesRoutingModule } from './templates-routing.module';
import { TemplatesComponent } from './templates/templates.component';
// import { TemplateCardComponent } from './template-card/template-card.component';

@NgModule({
  declarations: [
    TemplatesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    TemplatesRoutingModule
  ]
})
export class TemplateModule { }
