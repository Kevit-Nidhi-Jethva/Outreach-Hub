
import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

type Role = 'admin' | 'editor' | 'viewer';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  guard?: (role: string) => boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() role?: Role;

  username: string = 'User';
  userRole: Role = 'viewer';
  userInitial: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Get username from AuthService
    const usernameFromToken = this.authService.getUsername();
    if (usernameFromToken) {
      this.username = usernameFromToken;
      this.userInitial = this.username.charAt(0).toUpperCase();
    }

    // Use input role if provided, else get from AuthService
    if (this.role) {
      this.userRole = this.role;
    } else {
      const roleFromToken = this.authService.getUserRole();
      if (roleFromToken) {
        this.userRole = (roleFromToken === 'admin' || roleFromToken === 'editor' || roleFromToken === 'viewer')
          ? roleFromToken as Role
          : 'viewer';
      }
    }
  }

  allMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'house-door-fill',
      route: '/dashboard/home',
      guard: () => true
    },
    {
      label: 'Contacts',
      icon: 'person-lines-fill',
      route: '/dashboard/contacts',
      guard: (role) => role === 'editor'
    },
    {
      label: 'Templates',
      icon: 'file-earmark-text',
      route: '/dashboard/templates',
      guard: (role) => role === 'editor'
    },
    {
      label: 'Campaigns',
      icon: 'rocket-takeoff',
      route: '/dashboard/campaigns',
      guard: (role) => role === 'viewer' || role === 'editor'
    },
    {
      label: 'Reports',
      icon: 'bar-chart-fill',
      route: '/dashboard/reports',
      guard: (role) => role === 'viewer' || role === 'editor'
    },
    {
      label: 'Workspaces',
      icon: 'building',
      route: '/dashboard/workspaces',
      guard: (role) => role === 'viewer' || role === 'editor'
    },
    {
      label: 'Profile',
      icon: 'person-badge',
      route: '/dashboard/profile',
      guard: () => true
    }
  ];

  get items(): MenuItem[] {
    const normalizedRole = this.userRole.toLowerCase();

    const filteredItems = this.allMenuItems.filter(item => {
      if (!item.guard) return true;
      return item.guard(normalizedRole);
    });

    return filteredItems;
  }

  trackByFn(index: number, item: MenuItem): string {
    return item.route;
  }
}
