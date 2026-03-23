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
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.scss',
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
