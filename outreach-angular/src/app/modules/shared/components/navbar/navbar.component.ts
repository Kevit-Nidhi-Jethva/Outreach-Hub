import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WorkspaceStateService, SelectedWorkspace } from '../../../core/services/workspace-state.service';

type Role = 'Editor' | 'Viewer';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  guard?: (role: Role) => boolean;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  username: string = '';
  isScrolled: boolean = false;

  currentWorkspace: SelectedWorkspace | null = null;

  // Search functionality
  searchQuery: string = '';
  filteredItems: MenuItem[] = [];
  showDropdown: boolean = false;
  userRole: Role = 'Viewer';

  allMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'house-door-fill', route: '/welcome' },
    { label: 'Contacts', icon: 'person-lines-fill', route: '/contacts' },
    { label: 'My Contacts', icon: 'person', route: '/contacts/my' },
    { label: 'Workspace Contacts', icon: 'people', route: '/contacts/workspace' },
    { label: 'Templates', icon: 'file-earmark-text', route: '/templates' },
    { label: 'Campaigns', icon: 'rocket-takeoff', route: '/campaigns' },
    { label: 'Reports', icon: 'bar-chart-fill', route: '/reports' },
    { label: 'Profile', icon: 'person-badge', route: '/profile' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private workspaceState: WorkspaceStateService
  ) {}

  ngOnInit(): void {
    const usernameFromToken = this.authService.getUsername();
    if (usernameFromToken) {
      this.username = usernameFromToken;
    }

    this.workspaceState.workspace$.subscribe(ws => {
      this.currentWorkspace = ws;
      if (ws?.role) {
        const normalized = ws.role.toLowerCase();
        if (normalized === 'editor') this.userRole = 'Editor';
        else this.userRole = 'Viewer';
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.filteredItems = this.allMenuItems.filter(item =>
        item.label.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
        (!item.guard || item.guard(this.userRole))
      );
      this.showDropdown = this.filteredItems.length > 0;
    } else {
      this.filteredItems = [];
      this.showDropdown = false;
    }
  }

  onSelect(item: MenuItem): void {
    this.router.navigate([item.route]);
    this.searchQuery = '';
    this.showDropdown = false;
  }

  onFocus(): void {
    if (this.searchQuery.trim()) {
      this.onSearch();
    }
  }

  onBlur(): void {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
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
