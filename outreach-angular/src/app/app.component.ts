import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass, NgStyle } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, NgClass, NgStyle],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title: string = 'outreach-angular';
  myBtn: string='Click Me';
  counter:number=0;

  // atribute binding
  isDisabled:boolean=true;
  angularImage:string="../assets/angular_logo.jpeg";

  //style binding
  bgColor:string='green';
  textColor:string='white';
  description:string='font-size:50px; color:white'

  //class binding
  redText:string ="abcd";  

  incrementCounter(){
    this.counter++;
  }
  initialValue:string="this is initial value";


  //ngclass
  message:string="this is a dangerous message";
  classes:string='danger text-size';

  //ngStyle
  selectedColor:string='red';
}
