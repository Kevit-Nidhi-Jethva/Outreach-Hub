import { Component, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  ngAfterViewInit() {
    new Chart("areaChart", {
      type: 'line',
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          { label: "Dataset 1", data: [20, 40, 30, 50, 60, 70], borderColor: "#ff9800", fill: true, backgroundColor: "rgba(255,152,0,0.2)" },
          { label: "Dataset 2", data: [30, 20, 50, 60, 40, 80], borderColor: "#4caf50", fill: true, backgroundColor: "rgba(76,175,80,0.2)" },
          { label: "Dataset 3", data: [50, 30, 40, 20, 70, 90], borderColor: "#f44336", fill: true, backgroundColor: "rgba(244,67,54,0.2)" }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } }
      }
    });
  }
}
