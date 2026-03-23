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
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.scss',
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
