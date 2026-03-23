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
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
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
