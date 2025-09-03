import { Component, OnInit } from '@angular/core';
import { WorkspaceStateService } from '../../../core/services/workspace-state.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  selectedWorkspaceName = '';

  constructor(private workspaceState: WorkspaceStateService) {}

  ngOnInit(): void {
    const ws = this.workspaceState.getWorkspaceSync();
    if (ws) {
      this.selectedWorkspaceName = ws.name || ws.workspaceId || '';
    }
  }
}
