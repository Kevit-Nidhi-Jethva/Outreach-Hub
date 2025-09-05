import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { WorkspaceStateService } from '../services/workspace-state.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private workspaceState: WorkspaceStateService
  ) {}

  canActivate(): boolean {
    const ws = this.workspaceState.getWorkspaceSync();

    if (ws && ws.role === 'Editor' || 'editor') {
      return true; // ✅ Editors allowed
    }

    // ❌ Viewer or no workspace
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
