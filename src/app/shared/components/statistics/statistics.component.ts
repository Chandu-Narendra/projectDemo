import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { TasksService } from '../../../features/tasks/services/tasks.service';
import { ProjectsService } from '../../../features/projects/services/projects.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="statistics-container">
      <h2>Statistics Dashboard</h2>
      
      <div class="charts-grid">
        <div class="chart-card" *ngIf="taskCompletionChartData$ | async as data">
          <h3>Task Completion Status</h3>
          <canvas
            baseChart
            [data]="data"
            [options]="taskCompletionChartOptions"
            type="doughnut">
          </canvas>
        </div>

        <div class="chart-card" *ngIf="completionRateChartData$ | async as data">
          <h3>Completion Rate</h3>
          <canvas
            baseChart
            [data]="data"
            [options]="completionRateChartOptions"
            type="line">
          </canvas>
        </div>
      </div>

      <div class="stats-summary">
        <div class="stat-block" *ngIf="statistics$ | async as stats">
          <div class="stat-item">
            <span class="stat-label">Total Tasks</span>
            <span class="stat-value">{{ stats.total }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Completed</span>
            <span class="stat-value completed">{{ stats.completed }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Pending</span>
            <span class="stat-value pending">{{ stats.pending }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Completion Rate</span>
            <span class="stat-value">{{ stats.completionRate | number: '1.2-2' }}%</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .statistics-container {
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
      margin: 20px 0;
    }

    h2 {
      color: #3f51b5;
      margin-bottom: 20px;
      font-size: 24px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .chart-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .chart-card h3 {
      color: #333;
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: 600;
    }

    .stats-summary {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-block {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
    }

    .stat-item {
      text-align: center;
      padding: 15px;
      border-left: 4px solid #3f51b5;
      background: #f9f9f9;
      border-radius: 4px;
    }

    .stat-label {
      display: block;
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .stat-value {
      display: block;
      color: #3f51b5;
      font-size: 28px;
      font-weight: bold;
    }

    .stat-value.completed {
      color: #4caf50;
    }

    .stat-value.pending {
      color: #ff9800;
    }

    canvas {
      max-width: 100%;
    }
  `]
})
export class StatisticsComponent implements OnInit {
  taskCompletionChartData$: Observable<ChartData<'doughnut'>> | null = null;
  completionRateChartData$: Observable<ChartData<'line'>> | null = null;
  statistics$: Observable<any>;

  taskCompletionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  completionRateChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true
      }
    }
  };

  constructor(private tasksService: TasksService, private projectsService: ProjectsService) {
    this.statistics$ = this.tasksService.getStatistics();

    this.taskCompletionChartData$ = this.statistics$.pipe(
      map((stats) => ({
        labels: ['Completed', 'Pending'],
        datasets: [
          {
            data: [stats.completed, stats.pending],
            backgroundColor: ['#4caf50', '#ff9800'],
            borderColor: ['#45a049', '#fb8c00'],
            borderWidth: 2
          }
        ]
      }))
    );

    this.completionRateChartData$ = this.statistics$.pipe(
      map((stats) => ({
        labels: ['Completion Rate'],
        datasets: [
          {
            label: 'Rate (%)',
            data: [stats.completionRate],
            borderColor: '#3f51b5',
            backgroundColor: 'rgba(63, 81, 181, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      }))
    );
  }

  ngOnInit(): void {
    // Statistics are provided by the TasksService
  }
}
