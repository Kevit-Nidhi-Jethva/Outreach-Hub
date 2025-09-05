import { Component, OnInit } from '@angular/core';
import { WorkspaceStateService } from '../../../core/services/workspace-state.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  selectedWorkspaceName = '';

  stats = [
    { title: 'Total Contacts', value: '1,234', icon: 'people' },
    { title: 'Active Campaigns', value: '12', icon: 'rocket-takeoff' },
    { title: 'Templates', value: '45', icon: 'file-earmark-text' },
    { title: 'Reports', value: '8', icon: 'bar-chart' }
  ];

  recentActivity = [
    { text: 'Campaign "Summer Sale" sent to 500 contacts', icon: 'send' },
    { text: 'New template "Newsletter" created', icon: 'file-earmark-plus' },
    { text: 'Contact list "VIP Customers" updated', icon: 'people' },
    { text: 'Report "Monthly Performance" generated', icon: 'bar-chart' }
  ];

  recentSignups = [
    { name: 'John Doe', avatar: 'https://via.placeholder.com/40x40.png?text=JD' },
    { name: 'Jane Smith', avatar: 'https://via.placeholder.com/40x40.png?text=JS' },
    { name: 'Bob Johnson', avatar: 'https://via.placeholder.com/40x40.png?text=BJ' }
  ];

  constructor(private workspaceState: WorkspaceStateService) {}

  ngOnInit(): void {
    const ws = this.workspaceState.getWorkspaceSync();
    if (ws) {
      this.selectedWorkspaceName = ws.name || ws.workspaceId || '';
    }
  }
}
