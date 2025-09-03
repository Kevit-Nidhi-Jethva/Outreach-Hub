import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { WorkspaceStateService } from '../services/workspace-state.service';

@Injectable({ providedIn: 'root' })
export class WorkspaceGuard implements CanActivate {
  constructor(private router: Router, private workspaceState: WorkspaceStateService) {}

  canActivate(): boolean {
    const ws = this.workspaceState.getWorkspaceSync();
    if (!ws) {
      this.router.navigate(['/workspace-selection']);
      return false;
    }
    return true;
  }
}
