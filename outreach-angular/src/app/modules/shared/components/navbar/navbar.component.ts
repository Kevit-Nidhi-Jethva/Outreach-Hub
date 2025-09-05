import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WorkspaceStateService, SelectedWorkspace } from '../../../core/services/workspace-state.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  // remove @Input() here – we'll fetch directly from AuthService
  username: string = '';
  isScrolled: boolean = false;

  currentWorkspace: SelectedWorkspace | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private workspaceState: WorkspaceStateService
  ) {}

  ngOnInit(): void {
    // 🔹 Get username from AuthService
    const usernameFromToken = this.authService.getUsername();
    if (usernameFromToken) {
      this.username = usernameFromToken;
    }

    // 🔹 Subscribe to workspace
    this.workspaceState.workspace$.subscribe(ws => {
      this.currentWorkspace = ws;
    });
  }

  logout(): void {
    this.authService.logout();
    this.workspaceState.clearWorkspace();
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  switchWorkspace(): void {
    this.workspaceState.clearWorkspace();
    this.router.navigate(['/workspace-selection']);
  }
}
