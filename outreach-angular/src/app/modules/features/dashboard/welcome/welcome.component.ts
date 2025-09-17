import { Component, OnInit } from '@angular/core';
import { WorkspaceStateService } from '../../../core/services/workspace-state.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  selectedWorkspaceName = '';

  totalCampaigns = 120;
  totalContacts = 450;
  totalTemplates = 35;
  totalSentMessages = 3240;

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

  // Chart.js data and options for line chart
  lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Campaigns Sent',
        data: [10, 20, 15, 25, 30, 28, 35],
        fill: false,
        borderColor: '#6b46c1',
        tension: 0.1
      }
    ]
  };

  lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      }
    }
  };

  lineChartLegend = true;
  lineChartType: 'line' = 'line';

  // Chart.js data and options for bar chart
  barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Contacts Added',
        data: [5, 15, 10, 20, 25, 22, 30],
        backgroundColor: '#3182ce'
      }
    ]
  };

  barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      }
    }
  };

  barChartLegend = true;
  barChartType: 'bar' = 'bar';

  ngOnInit(): void {
    const ws = this.workspaceState.getWorkspaceSync();
    if (ws) {
      this.selectedWorkspaceName = ws.name || ws.workspaceId || '';
    }
  }
}
