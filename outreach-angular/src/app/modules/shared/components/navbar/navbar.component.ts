import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WorkspaceStateService } from '../../../core/services/workspace-state.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Input() username: string = '';
  @Input() isScrolled: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private workspaceState: WorkspaceStateService
  ) { }

  ngOnInit(): void {
  }

  logout(): void {
    this.authService.logout();
    // Clear only auth and workspace state (avoid wiping unrelated storage)
    this.workspaceState.clearWorkspace();
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  switchWorkspace() {
    this.workspaceState.clearWorkspace();
    this.router.navigate(['/workspace-selection']);
  }

}
