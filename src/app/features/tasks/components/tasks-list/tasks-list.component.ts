import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TasksService, TaskFilter, ITEMS_PER_PAGE_TASKS } from '../../services/tasks.service';
import { ProjectsService } from '../../../projects/services/projects.service';
import { TasksStateService } from '../../../../core/services/state/tasks.state';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StatisticsComponent } from '../../../../shared/components/statistics/statistics.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { Task, Project } from '../../../../shared/models';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorBannerComponent,
    StatisticsComponent,
    TaskFormComponent
  ],
  template: `
    <div class="tasks-container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb" *ngIf="project$ | async as project">
        <button class="breadcrumb-link" (click)="navigateBack()">← Projects</button>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ project.name }}</span>
      </nav>

      <div class="tasks-header">
        <h1>Tasks</h1>
        <div class="header-controls">
          <input
            type="text"
            class="search-input"
            placeholder="Search tasks..."
            (change)="onSearch($event)"
          />
          <div class="filter-buttons">
            <button
              class="filter-button"
              [class.active]="(currentFilter$ | async) === 'all'"
              (click)="setFilter('all')"
            >
              All
            </button>
            <button
              class="filter-button"
              [class.active]="(currentFilter$ | async) === 'completed'"
              (click)="setFilter('completed')"
            >
              Completed
            </button>
            <button
              class="filter-button"
              [class.active]="(currentFilter$ | async) === 'pending'"
              (click)="setFilter('pending')"
            >
              Pending
            </button>
          </div>
          <button class="create-button" (click)="openCreateTaskForm()">
            + Create Task
          </button>
        </div>
      </div>

      <!-- Error Banner -->
      <app-error-banner
        [error]="error$ | async"
        [showRetry]="true"
        (retry)="onRetry()"
      ></app-error-banner>

      <!-- Loading Spinner -->
      <app-loading-spinner
        [isLoading]="(loading$ | async) ?? false"
        message="Loading tasks..."
      ></app-loading-spinner>

      <!-- Tasks List -->
      <div class="tasks-list" *ngIf="(loading$ | async) === false">
        <div class="task-card" *ngFor="let task of tasks$ | async; trackBy: trackByTaskId">
          <div class="task-header">
            <h3 class="task-title">{{ task.title }}</h3>
            <span class="task-status" [class.completed]="task.completed">
              {{ task.completed ? 'Completed' : 'Pending' }}
            </span>
          </div>
          <div class="task-actions">
            <button
              class="task-action-btn"
              (click)="toggleTaskStatus(task.id, !task.completed)"
            >
              {{ task.completed ? 'Mark as Pending' : 'Mark as Completed' }}
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <app-empty-state
          [isEmpty]="(tasks$ | async)?.length === 0 && (loading$ | async) === false"
          title="No Tasks Found"
          message="Try adjusting your filters or create a new task"
          icon="✓"
        ></app-empty-state>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="(tasks$ | async)?.length ?? 0 > 0">
        <button
          class="pagination-button"
          (click)="previousPage()"
          [disabled]="(currentPage$ | async) === 1"
        >
          ← Previous
        </button>
        <span class="pagination-info">
          Page {{ (currentPage$ | async) ?? 1 }} of {{ (totalPages$ | async) ?? 1 }}
        </span>
        <button
          class="pagination-button"
          (click)="nextPage()"
          [disabled]="(currentPage$ | async) === (totalPages$ | async)"
        >
          Next →
        </button>
      </div>

      <!-- Task Statistics -->
      <app-statistics></app-statistics>

      <!-- Task Form Modal -->
      <app-task-form
        *ngIf="showCreateTaskForm"
        (close)="closeCreateTaskForm()"
        (submit)="onCreateTask($event)"
      ></app-task-form>
    </div>
  `,
  styles: [`
    .tasks-container {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
      font-size: 14px;
      color: #666;
    }

    .breadcrumb-link {
      background: none;
      border: none;
      color: #1976d2;
      cursor: pointer;
      text-decoration: none;
      transition: color 0.2s;
    }

    .breadcrumb-link:hover {
      color: #1565c0;
      text-decoration: underline;
    }

    .breadcrumb-separator {
      margin: 0 0.25rem;
    }

    .breadcrumb-current {
      color: #333;
      font-weight: 500;
    }

    .tasks-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .tasks-header h1 {
      margin: 0;
      font-size: 2rem;
      color: #333;
    }

    .header-controls {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .search-input {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      width: 200px;
    }

    .search-input:focus {
      outline: none;
      border-color: #3f51b5;
      box-shadow: 0 0 5px rgba(63, 81, 181, 0.2);
    }

    .filter-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .filter-button {
      padding: 0.5rem 1rem;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .filter-button:hover {
      background-color: #eee;
    }

    .filter-button.active {
      background-color: #3f51b5;
      color: white;
      border-color: #3f51b5;
    }

    .create-button {
      padding: 0.5rem 1rem;
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: background-color 0.2s;
    }

    .create-button:hover {
      background-color: #45a049;
    }

    .tasks-list {
      margin-bottom: 2rem;
    }

    .task-card {
      background: white;
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: all 0.2s;
    }

    .task-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      border-color: #ddd;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .task-title {
      margin: 0;
      font-size: 1.1rem;
      color: #333;
      flex: 1;
    }

    .task-status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    .task-status:not(.completed) {
      background-color: #fff3e0;
      color: #e65100;
    }

    .task-status.completed {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .task-actions {
      display: flex;
      gap: 0.5rem;
    }

    .task-action-btn {
      padding: 0.5rem 1rem;
      background-color: #e3f2fd;
      color: #1976d2;
      border: 1px solid #bbdefb;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }

    .task-action-btn:hover {
      background-color: #bbdefb;
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .pagination-button {
      padding: 0.5rem 1rem;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .pagination-button:hover:not(:disabled) {
      background-color: #3f51b5;
      color: white;
      border-color: #3f51b5;
    }

    .pagination-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-info {
      font-size: 14px;
      color: #666;
      min-width: 180px;
      text-align: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksListComponent implements OnInit {
  tasks$: Observable<Task[]>;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  currentPage$: Observable<number>;
  totalPages$: Observable<number>;
  currentFilter$: Observable<TaskFilter>;
  statistics$: Observable<any>;
  project$: Observable<Project | undefined>;
  showCreateTaskForm = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tasksService: TasksService,
    private projectsService: ProjectsService,
    private tasksState: TasksStateService
  ) {
    this.tasks$ = this.tasksService.getPaginatedTasks();
    this.loading$ = this.tasksState.loading$;
    this.error$ = this.tasksState.error$;
    this.currentPage$ = this.tasksService.getCurrentPage();
    this.totalPages$ = this.tasksService.getTotalPages();
    this.currentFilter$ = this.tasksService.filter$;
    this.statistics$ = this.tasksService.getStatistics();
    this.project$ = this.route.params.pipe(
      map((params) => {
        const projectId = +params['userId'];
        return this.projectsService.getProject(projectId);
      })
    );
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const projectId = +params['userId'];
      this.projectsService.loadProjectTasks(projectId);
    });
  }

  /**
   * Search tasks by title
   */
  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.tasksService.setSearch(searchTerm);
  }

  /**
   * Set filter
   */
  setFilter(filter: string): void {
    this.tasksService.setFilter(filter as TaskFilter);
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    this.tasksService.getCurrentPage().subscribe((currentPage) => {
      if (currentPage > 1) {
        this.tasksService.setCurrentPage(currentPage - 1);
      }
    });
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    combineLatest([
      this.tasksService.getCurrentPage(),
      this.tasksService.getTotalPages()
    ]).subscribe(([currentPage, totalPages]) => {
      if (currentPage < totalPages) {
        this.tasksService.setCurrentPage(currentPage + 1);
      }
    });
  }

  /**
   * Navigate back to projects
   */
  navigateBack(): void {
    this.router.navigate(['/projects']);
  }

  /**
   * Open create task form
   */
  openCreateTaskForm(): void {
    this.showCreateTaskForm = true;
  }

  /**
   * Close create task form
   */
  closeCreateTaskForm(): void {
    this.showCreateTaskForm = false;
  }

  /**
   * Create new task
   */
  onCreateTask(task: Task): void {
    this.route.params.subscribe((params) => {
      const projectId = +params['userId'];
      const newTask: Task = {
        ...task,
        userId: projectId
      };
      this.tasksService.addTask(newTask);
      this.closeCreateTaskForm();
    });
  }

  /**
   * Toggle task status
   */
  toggleTaskStatus(taskId: number, newStatus: boolean): void {
    this.tasksService.updateTask(taskId, { completed: newStatus });
  }

  /**
   * Retry loading tasks
   */
  onRetry(): void {
    this.route.params.subscribe((params) => {
      const projectId = +params['userId'];
      this.projectsService.loadProjectTasks(projectId);
    });
  }

  /**
   * TrackBy function for ngFor optimization
   */
  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }
}
