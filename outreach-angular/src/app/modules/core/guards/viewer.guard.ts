import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ViewerGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const role = this.authService.getUserRole();

    if (role === 'Viewer' || role === 'Editor') {
      // viewer can see reports, editor can also see them
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
