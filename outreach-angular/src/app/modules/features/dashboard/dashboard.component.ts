import { Component, OnInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userRole: 'admin' | 'editor' | 'viewer' = 'viewer';
  username: string = 'User';
  isScrolled: boolean = false;

  // Add dummy data for the sidebar
  dashboardItems: any[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'house-door-fill' },
    { label: 'Users', route: '/users', icon: 'people-fill' },
    { label: 'Campaigns', route: '/campaigns', icon: 'megaphone-fill' },
    { label: 'Analytics', route: '/analytics', icon: 'graph-up' },
    { label: 'Settings', route: '/settings', icon: 'gear-fill' }
  ];

  // Add dummy data for the dashboard content
  stats = [
    { icon: 'person-check-fill', title: 'Active Users', value: '2,567' },
    { icon: 'envelope-fill', title: 'Emails Sent', value: '12,345' },
    { icon: 'graph-up', title: 'Campaigns Running', value: '45' },
    { icon: 'bar-chart-line-fill', title: 'Total Revenue', value: '$25,670' }
  ];

  recentActivity = [
    { icon: 'envelope-plus', text: 'New email campaign "Summer Sale" created by Admin.' },
    { icon: 'person-plus-fill', text: 'New user signed up: Jane Smith.' },
    { icon: 'cash-stack', text: 'Payment received from client ABC.' }
  ];

  recentSignups = [
    { avatar: 'https://via.placeholder.com/40', name: 'Sarah Lee' },
    { avatar: 'https://via.placeholder.com/40', name: 'Michael Chen' },
    { avatar: 'https://via.placeholder.com/40', name: 'Emily White' }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const tokenRole = this.authService.getUserRole();
    this.userRole = (tokenRole === 'admin' || tokenRole === 'editor' || tokenRole === 'viewer') ? tokenRole as 'admin' | 'editor' | 'viewer' : 'viewer';
    this.username = this.authService.getUsername() || 'User';
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled = window.scrollY > 50;
    }
  }
}
