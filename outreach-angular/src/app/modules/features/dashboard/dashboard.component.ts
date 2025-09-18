import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartData } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // Dummy data for cards
  totalCampaigns = 120;
  totalContacts = 450;
  totalTemplates = 35;
  totalSentMessages = 3240;

  // Dummy chart data (Campaigns by date)
  lineChartData: ChartData<'line'> = {
    labels: ['1 Sep', '2 Sep', '3 Sep', '4 Sep', '5 Sep', '6 Sep', '7 Sep'],
    datasets: [
      { data: [10, 15, 20, 25, 30, 28, 35], label: 'Campaigns Sent' }
    ]
  };
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
  };
  lineChartLegend = true;
  lineChartType: ChartType = 'line';

  // Dummy pie chart data (Contacts by Tags)
  pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Friends', 'Work', 'Family', 'Others'],
    datasets: [{ data: [120, 90, 60, 180] }]
  };
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
  };

  // Dummy recent activity
  recentActivities = [
    { activity: 'Campaign "Launch Promo" sent', date: '2025-09-15', status: 'Success' },
    { activity: 'Added new contact John Doe', date: '2025-09-14', status: 'Success' },
    { activity: 'Campaign "Newsletter" failed', date: '2025-09-13', status: 'Failed' },
    { activity: 'Template "Welcome Message" created', date: '2025-09-12', status: 'Success' },
  ];

  constructor() { }

  ngOnInit(): void { }

}
