import { Component, OnInit } from '@angular/core';
import { WorkspaceStateService } from '../../../core/services/workspace-state.service';
import { ContactsService } from '../../contacts/services/contacts.service';
import { CampaignService } from '../../campaigns/services/campaign.service';
import { TemplateService } from '../../templates/services/template.service';
import { UsersService } from '../../users/services/users.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  selectedWorkspaceName = '';

  totalCampaigns = 0;
  totalContacts = 0;
  totalTemplates = 0;
  totalSentMessages = 0;

  dateRange: Date[] = [];

  private allCampaigns: any[] = [];
  private allContacts: any[] = [];
  private allTemplates: any[] = [];

  latestCampaigns: any[] = [];
  mostUsedTags: { tag: string; count: number }[] = [];

  // ng2-charts data and options for line chart (Campaigns Sent Over Time)
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Campaigns Sent',
        fill: false,
        borderColor: '#6b46c1',
        tension: 0.1
      }
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  };
  public lineChartType: 'line' = 'line';

  // ng2-charts data and options for bar chart (Contacts Added Over Time)
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Contacts Added',
        backgroundColor: '#3182ce'
      }
    ]
  };
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  };
  public barChartType: 'bar' = 'bar';

  // ng2-charts data and options for doughnut chart (Templates Created)
  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#dd6b20', '#3182ce', '#6b46c1', '#d53f8c', '#48bb78'],
      }
    ]
  };
  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  };
  public doughnutChartType: 'doughnut' = 'doughnut';

  // ng2-charts data and options for pie chart (Campaign Status)
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#48bb78', '#3182ce', '#dd6b20', '#6b46c1', '#d53f8c'],
      }
    ]
  };
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true,
      }
    }
  };
  public pieChartType: 'pie' = 'pie';

  constructor(
    private workspaceState: WorkspaceStateService,
    private contactsService: ContactsService,
    private campaignService: CampaignService,
    private templateService: TemplateService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    const ws = this.workspaceState.getWorkspaceSync();
    if (ws) {
      this.selectedWorkspaceName = ws.name || ws.workspaceId || '';
    }

    if (ws?.workspaceId) {
      this.loadData();
    }
  }

  loadData(): void {
    forkJoin({
      contacts: this.contactsService.getWorkspaceContacts().pipe(catchError(err => { console.error('Contacts error:', err); return of([]); })),
      campaigns: this.campaignService.getCampaigns().pipe(catchError(err => { console.error('Campaigns error:', err); return of([]); })),
      templates: this.templateService.getTemplates().pipe(catchError(err => { console.error('Templates error:', err); return of([]); })),
      users: this.usersService.getUsersByWorkspace(this.workspaceState.getWorkspaceSync()?.workspaceId || '').pipe(catchError(err => { console.error('Users error:', err); return of([]); }))
    }).subscribe({
      next: ({ contacts, campaigns, templates, users }) => {
        this.allContacts = contacts;
        this.allCampaigns = campaigns;
        this.allTemplates = templates;

        this.updateData();
      },
      error: (error) => {
        console.error('Error in forkJoin:', error);
      }
    });
  }

  private updateData(): void {
    let contacts = this.allContacts;
    let campaigns = this.allCampaigns;
    let templates = this.allTemplates;

    if (this.dateRange && this.dateRange.length === 2) {
      const start = this.dateRange[0];
      const end = this.dateRange[1];
      contacts = this.allContacts.filter(c => c.createdAt && new Date(c.createdAt) >= start && new Date(c.createdAt) <= end);
      campaigns = this.allCampaigns.filter(c => c.createdAt && new Date(c.createdAt) >= start && new Date(c.createdAt) <= end);
      templates = this.allTemplates.filter(t => t.createdAt && new Date(t.createdAt) >= start && new Date(t.createdAt) <= end);
    }

    this.totalContacts = contacts.length;
    this.totalCampaigns = campaigns.length;
    this.totalTemplates = templates.length;
    this.totalSentMessages = campaigns.reduce((sum, campaign) => sum + (campaign.messages && campaign.messages.length ? campaign.messages.length : 0), 0);

    // Latest launched campaigns
    this.latestCampaigns = campaigns
      .filter(c => c.launchedAt)
      .sort((a, b) => new Date(b.launchedAt).getTime() - new Date(a.launchedAt).getTime())
      .slice(0, 5);

    // Most used tags
    const tagCounts: { [key: string]: number } = {};
    contacts.forEach(c => {
      if (Array.isArray(c.tags)) {
        c.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    this.mostUsedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    this.processChartData(campaigns, contacts, templates);
  }

  onDateRangeChange(): void {
    this.updateData();
  }

  private processChartData(campaigns: any[], contacts: any[], templates: any[]): void {
    const now = new Date();
    const months: string[] = [];
    const campaignCounts: number[] = [];
    const contactCounts: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      months.push(monthName);

      const campaignCount = campaigns.filter(c => {
        if (!c.createdAt) return false;
        const created = new Date(c.createdAt);
        return created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear();
      }).length;
      campaignCounts.push(campaignCount);

      const contactCount = contacts.filter(c => {
        if (!c.createdAt) return false;
        const created = new Date(c.createdAt);
        return created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear();
      }).length;
      contactCounts.push(contactCount);
    }

    // Update line chart data
    this.lineChartData = {
      labels: months,
      datasets: [
        {
          data: campaignCounts,
          label: 'Campaigns Sent',
          fill: false,
          borderColor: '#6b46c1',
          tension: 0.1
        }
      ]
    };

    // For templates, group by type and count
    const templateTypeCounts: { [key: string]: number } = {};
    templates.forEach(t => {
      const type = t.type || 'Unknown';
      templateTypeCounts[type] = (templateTypeCounts[type] || 0) + 1;
    });

    // Update doughnut chart data
    this.doughnutChartData = {
      labels: Object.keys(templateTypeCounts),
      datasets: [
        {
          data: Object.values(templateTypeCounts),
          backgroundColor: ['#dd6b20', '#3182ce', '#6b46c1', '#d53f8c', '#48bb78'],
        }
      ]
    };

    // For pie chart, group campaigns by status
    const statusCounts: { [key: string]: number } = {};
    campaigns.forEach(c => {
      const status = c.status || 'Draft';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Update pie chart data
    this.pieChartData = {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: ['#48bb78', '#3182ce', '#dd6b20', '#6b46c1', '#d53f8c'],
        }
      ]
    };
  }
}
