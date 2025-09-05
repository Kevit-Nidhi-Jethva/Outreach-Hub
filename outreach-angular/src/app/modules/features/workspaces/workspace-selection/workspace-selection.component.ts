import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceStateService } from '../../../core/services/workspace-state.service';

@Component({
  selector: 'app-workspace-selection',
  templateUrl: './workspace-selection.component.html',
  styleUrls: ['./workspace-selection.component.scss']
})
export class WorkspaceSelectionComponent implements OnInit {
  workspaces: any[] = [];

  constructor(
    private wsService: WorkspaceService,
    private router: Router,
    private workspaceState: WorkspaceStateService
  ) {}

  ngOnInit(): void {
    this.wsService.getAllWorkspaces().subscribe({
      next: (data) => this.workspaces = data || [],
      error: (err) => {
        console.error('Failed to load workspaces', err);
      }
    });
  }

  selectWorkspace(ws: any) {
    // ws is expected to contain workspaceId, role, name
    const obj = {
      workspaceId: ws.workspaceId || ws._id || ws.id,
      role: ws.role || ws.defaultRole || null,
      name: ws.name || ws.title || ''
    };
    this.workspaceState.setWorkspace(obj);
    this.router.navigate(['/dashboard']); // navigates to dashboard layout
  }
}
