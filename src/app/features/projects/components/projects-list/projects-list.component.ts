import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { debounceTime, take } from 'rxjs/operators';
import { ProjectsService, ITEMS_PER_PAGE_PROJECTS } from '../../services/projects.service';
import { ProjectsStateService } from '../../../../core/services/state/projects.state';
import { ErrorInterceptor } from '../../../../core/services/interceptors/error.interceptor';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { Project } from '../../../../shared/models';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorBannerComponent
  ],
  template: `
    <div class="projects-container">
      <div class="projects-header">
        <h1>Projects</h1>
        <div class="header-controls">
          <input
            type="text"
            class="search-input"
            placeholder="Search projects..."
            (change)="onSearch($event)"
            [value]="searchValue"
          />
          <label class="error-toggle">
            <input type="checkbox" (change)="toggleErrorSimulation($event)" />
            Simulate Errors
          </label>
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
        message="Loading projects..."
      ></app-loading-spinner>

      <!-- Projects List -->
      <div class="projects-list" *ngIf="(loading$ | async) === false">
        <table class="projects-table" *ngIf="(projects$ | async) as projects">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Email</th>
              <th>Tasks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let project of projects; trackBy: trackByProjectId"
              class="project-row"
            >
              <td class="project-name">{{ project.name }}</td>
              <td class="project-email">{{ project.email }}</td>
              <td class="project-tasks">{{ project.taskCount }}</td>
              <td class="project-actions">
                <button
                  class="view-button"
                  (click)="viewTasks(project.id)"
                >
                  View Tasks →
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <app-empty-state
          [isEmpty]="(projects$ | async)?.length === 0"
          title="No Projects Found"
          message="Try adjusting your search criteria"
          icon="📊"
        ></app-empty-state>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="(projects$ | async)?.length ?? 0 > 0">
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
    </div>
  `,
  styles: [`
    .projects-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .projects-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .projects-header h1 {
      margin: 0;
      font-size: 2rem;
      color: #333;
    }

    .header-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-input {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      width: 250px;
    }

    .search-input:focus {
      outline: none;
      border-color: #3f51b5;
      box-shadow: 0 0 5px rgba(63, 81, 181, 0.2);
    }

    .error-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 14px;
    }

    .error-toggle input {
      cursor: pointer;
    }

    .projects-list {
      margin-bottom: 2rem;
    }

    .projects-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .projects-table thead {
      background-color: #f5f5f5;
      border-bottom: 2px solid #ddd;
    }

    .projects-table th,
    .projects-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    .projects-table th {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .projects-table tbody tr:hover {
      background-color: #f9f9f9;
    }

    .project-name {
      font-weight: 500;
      color: #1976d2;
    }

    .project-email {
      font-size: 14px;
      color: #666;
    }

    .project-tasks {
      text-align: center;
      font-weight: 600;
      color: #3f51b5;
    }

    .project-actions {
      text-align: center;
    }

    .view-button {
      padding: 0.5rem 1rem;
      background-color: #3f51b5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      transition: background-color 0.2s;
    }

    .view-button:hover {
      background-color: #303f9f;
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
export class ProjectsListComponent implements OnInit {
  projects$: Observable<Project[]>;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  currentPage$: Observable<number>;
  totalPages$: Observable<number>;
  searchValue = '';

  constructor(
    private projectsService: ProjectsService,
    private projectsState: ProjectsStateService,
    private router: Router
  ) {
    this.projects$ = this.projectsService.getPaginatedProjects();
    this.loading$ = this.projectsState.loading$;
    this.error$ = this.projectsState.error$;
    this.currentPage$ = this.projectsService.getCurrentPage();
    this.totalPages$ = this.projectsService.getTotalPages();
  }

  ngOnInit(): void {
    this.projectsService.loadProjects();
  }

  /**
   * Search projects by name or email
   */
  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchValue = searchTerm;
    this.projectsService.setSearch(searchTerm);
  }

  /**
   * Navigate to tasks page for a project
   */
  viewTasks(projectId: number): void {
    this.router.navigate(['/projects', projectId, 'tasks']);
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    combineLatest([
      this.projectsService.getCurrentPage(),
      this.projectsService.getTotalPages()
    ]).pipe(
      take(1)
    ).subscribe(([currentPage, totalPages]) => {
      if (currentPage > 1) {
        this.projectsService.setCurrentPage(currentPage - 1);
      }
    });
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    combineLatest([
      this.projectsService.getCurrentPage(),
      this.projectsService.getTotalPages()
    ]).pipe(
      take(1)
    ).subscribe(([currentPage, totalPages]) => {
      if (currentPage < totalPages) {
        this.projectsService.setCurrentPage(currentPage + 1);
      }
    });
  }

  /**
   * Retry loading projects
   */
  onRetry(): void {
    this.projectsService.loadProjects();
  }

  /**
   * Toggle error simulation for testing
   */
  toggleErrorSimulation(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    ErrorInterceptor.enableErrorSimulation(isChecked);
  }

  /**
   * TrackBy function for ngFor optimization
   */
  trackByProjectId(index: number, project: Project): number {
    return project.id;
  }
}
