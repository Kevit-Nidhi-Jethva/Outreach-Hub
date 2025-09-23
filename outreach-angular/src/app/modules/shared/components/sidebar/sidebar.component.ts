import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { WorkspaceStateService, SelectedWorkspace } from '../../../core/services/workspace-state.service';

type Role = 'Admin' | 'Editor' | 'Viewer';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  guard?: (role: Role) => boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() role?: Role;
  @Input() isCollapsed: boolean = false;
  currentWorkspace: SelectedWorkspace | null = null;

  username: string = 'User';
  userRole: Role = 'Viewer';
  userInitial: string = '';

  // ✅ New state for Contacts dropdown
  isContactsOpen: boolean = false;

  constructor(
    private authService: AuthService,
    private workspaceState: WorkspaceStateService
  ) {}

  ngOnInit(): void {
    // Get username from AuthService
    const usernameFromToken = this.authService.getUsername();
    if (usernameFromToken) {
      this.username = usernameFromToken;
      this.userInitial = this.username.charAt(0).toUpperCase();
    }

    // 🔹 Always set userRole from workspace role
    this.workspaceState.workspace$.subscribe((workspace) => {
      this.currentWorkspace = workspace;
      if (workspace?.role) {
        const normalized = workspace.role.toLowerCase();
        if (normalized === 'admin') this.userRole = 'Admin';
        else if (normalized === 'editor') this.userRole = 'Editor';
        else this.userRole = 'Viewer';
      }
    });
  }

  allMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'house-door-fill', route: '/dashboard', guard: () => true },
    { label: 'Contacts', icon: 'person-lines-fill', route: '/contacts', guard: () => true },
    { label: 'Templates', icon: 'file-earmark-text', route: 'templates', guard: () => true },
    { label: 'Campaigns', icon: 'rocket-takeoff', route: '/campaigns', guard: () => true },
    { label: 'Reports', icon: 'bar-chart-fill', route: '/reports', guard: () => true },
    { label: 'Profile', icon: 'person-badge', route: '/profile', guard: (role: Role) => role === 'Editor' }
  ];

  get items(): MenuItem[] {
    return this.allMenuItems.filter(item =>
      !item.guard ? true : item.guard(this.userRole)
    );
  }

  trackByFn(index: number, item: MenuItem): string {
    return item.route;
  }

  // ✅ Toggle method for Contacts dropdown
  toggleContacts(): void {
    this.isContactsOpen = !this.isContactsOpen;
  }

  // Toggle sidebar for responsive
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
