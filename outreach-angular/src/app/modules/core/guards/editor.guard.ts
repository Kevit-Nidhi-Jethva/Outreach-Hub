import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { WorkspaceStateService } from '../services/workspace-state.service';

@Injectable({
  providedIn: 'root'
})
export class EditorGuard implements CanActivate {
  private currentWorkspaceId: string | null = null;

  constructor(
    private authService: AuthService,
    private workspaceState: WorkspaceStateService,
    private router: Router
  ) {
    // Subscribe to current workspace
    this.workspaceState.workspace$.subscribe(ws => {
      this.currentWorkspaceId =  ws?.workspaceId || null;
    });
  }

  canActivate(): boolean {
    const role = this.authService.getUserRole(this.currentWorkspaceId || undefined);

    if (role === 'editor' || role === 'Editor' || role === 'admin') {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
