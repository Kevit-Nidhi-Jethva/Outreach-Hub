import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // console.log('Form submitted. Valid:', this.loginForm.valid);
    // console.log('Form errors:', this.loginForm.errors);
    // console.log('Email errors:', this.loginForm.get('email')?.errors);
    // console.log('Password errors:', this.loginForm.get('password')?.errors);
    
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      // console.log('Attempting login with:', { email, password });
      
      this.authService.login(email, password).subscribe({
        next: () => {
          console.log('Login successful');
          this.router.navigate(['/workspace-selection']);
        },
        error: (err) => {
          console.error('Login error:', err);
          this.errorMessage = err.error?.message || 'Invalid credentials';
        }
      });
    } else {
      console.log('Form is invalid, cannot submit');
      // Mark all fields as touched to show validation errors
      this.loginForm.markAllAsTouched();
    }
  }
}
