import { Component, OnInit, Inject, PLATFORM_ID, HostListener, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { WorkspaceStateService } from '../../core/services/workspace-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  userRole: 'admin' | 'editor' | 'viewer' = 'viewer';
  username: string = 'User';
  isScrolled: boolean = false;
  workspaceName: string = '';
  private sub: Subscription | null = null;

  // Add dummy data for the sidebar
  dashboardItems: any[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'house-door-fill' },
    { label: 'Users', route: '/users', icon: 'people-fill' },
    { label: 'Campaigns', route: '/campaigns', icon: 'megaphone-fill' },
    { label: 'Analytics', route: '/analytics', icon: 'bar-chart-fill' },
    { label: 'Templates', route: '/templates', icon: 'file-earmark-text' },
    { label: 'Messages', route: '/messages', icon: 'chat-dots-fill' },
  ];

    stats = [
    { title: 'Total Contacts', value: 120, icon: 'people' },
    { title: 'Active Campaigns', value: 5, icon: 'megaphone' },
    { title: 'Messages Sent', value: 450, icon: 'envelope' },
  ];

  // 🔹 Recent activities
  recentActivity = [
    { icon: 'person-plus', text: 'You created a new contact', time: '2 mins ago' },
    { icon: 'play-circle', text: 'Campaign "Welcome Series" started', time: '10 mins ago' },
    { icon: 'file-earmark-text', text: 'New template saved', time: '1 hour ago' },
  ];

  // 🔹 Recent signups (workspace users)
  recentSignups = [
    { name: 'John Doe', role: 'Editor', avatar: 'https://i.pravatar.cc/40?img=1' },
    { name: 'Jane Smith', role: 'Viewer', avatar: 'https://i.pravatar.cc/40?img=2' },
    { name: 'Mike Lee', role: 'Editor', avatar: 'https://i.pravatar.cc/40?img=3' },
  ];


  constructor(
    private authService: AuthService,
    private workspaceState: WorkspaceStateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.username = this.authService.getUsername() || 'User';
    // prefer role from selected workspace, else fallback to token
    const ws = this.workspaceState.getWorkspaceSync();
    if (ws?.role) {
      this.userRole = (ws.role === 'Editor' ? 'editor' : (ws.role === 'Viewer' ? 'viewer' : ws.role as any));
      this.workspaceName = ws.name || '';
    } else {
      const tokenRole = this.authService.getUserRole();
      this.userRole = (tokenRole === 'admin' || tokenRole === 'editor' || tokenRole === 'viewer') ? tokenRole as 'admin' | 'editor' | 'viewer' : 'viewer';
      this.workspaceName = '';
    }

    this.sub = this.workspaceState.workspace$.subscribe((w) => {
      if (w) {
        this.workspaceName = w.name || '';
        this.userRole = (w.role === 'Editor' ? 'editor' : (w.role === 'Viewer' ? 'viewer' : w.role as any));
      } else {
        const tokenRole = this.authService.getUserRole();
        this.userRole = (tokenRole === 'admin' || tokenRole === 'editor' || tokenRole === 'viewer') ? tokenRole as 'admin' | 'editor' | 'viewer' : 'viewer';
        this.workspaceName = '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled = window.scrollY > 50;
    }
  }
}
