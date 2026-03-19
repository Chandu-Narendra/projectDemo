import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ProjectsStateService } from '../../../core/services/state/projects.state';
import { TasksStateService } from '../../../core/services/state/tasks.state';
import { Project } from '../../../shared/models';

export const ITEMS_PER_PAGE_PROJECTS = 5;

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private searchSubject = new BehaviorSubject<string>('');
  private currentPageSubject = new BehaviorSubject<number>(1);

  public search$: Observable<string> = this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged()
  );

  constructor(
    private apiService: ApiService,
    private projectsState: ProjectsStateService,
    private tasksState: TasksStateService
  ) {}

  /**
   * Load all projects with task counts
   */
  loadProjects(): void {
    this.projectsState.setLoading(true);
    this.projectsState.setError(null);

    combineLatest([
      this.apiService.getUsers(),
      this.apiService.getTodos()
    ]).subscribe({
      next: ([users, todos]) => {
        // Calculate task count per user
        const taskCounts = new Map<number, number>();
        todos.forEach((todo) => {
          taskCounts.set(
            todo.userId,
            (taskCounts.get(todo.userId) ?? 0) + 1
          );
        });

        this.projectsState.setProjects(users, taskCounts);
        this.projectsState.setLoading(false);
      },
      error: (error) => {
        console.error('Failed to load projects:', error);
        this.projectsState.setError('Failed to load projects. Please try again.');
        this.projectsState.setLoading(false);
      }
    });
  }

  /**
   * Get paginated and filtered projects
   */
  getPaginatedProjects(): Observable<Project[]> {
    return combineLatest([
      this.projectsState.getProjects$(),
      this.search$,
      this.currentPageSubject.asObservable()
    ]).pipe(
      map(([projects, searchTerm, currentPage]) => {
        // Filter by search term
        let filtered = projects;
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = projects.filter(
            (p) =>
              p.name.toLowerCase().includes(term) ||
              p.email.toLowerCase().includes(term)
          );
        }

        // Paginate
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE_PROJECTS;
        const endIndex = startIndex + ITEMS_PER_PAGE_PROJECTS;
        return filtered.slice(startIndex, endIndex);
      })
    );
  }

  /**
   * Get total projects count for pagination
   */
  getProjectsCount(): Observable<number> {
    return combineLatest([
      this.projectsState.getProjects$(),
      this.search$
    ]).pipe(
      map(([projects, searchTerm]) => {
        if (!searchTerm) {
          return projects.length;
        }
        const term = searchTerm.toLowerCase();
        return projects.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.email.toLowerCase().includes(term)
        ).length;
      })
    );
  }

  /**
   * Set search term
   */
  setSearch(term: string): void {
    this.searchSubject.next(term);
    this.currentPageSubject.next(1); // Reset to first page
  }

  /**
   * Set current page
   */
  setCurrentPage(page: number): void {
    this.currentPageSubject.next(page);
  }

  /**
   * Get total pages
   */
  getTotalPages(): Observable<number> {
    return this.getProjectsCount().pipe(
      map((count) => Math.ceil(count / ITEMS_PER_PAGE_PROJECTS))
    );
  }

  /**
   * Get current page
   */
  getCurrentPage(): Observable<number> {
    return this.currentPageSubject.asObservable();
  }

  /**
   * Load tasks for a specific project
   */
  loadProjectTasks(projectId: number): void {
    this.tasksState.setLoading(true);
    this.tasksState.setError(null);
    this.tasksState.setCurrentProjectId(projectId);

    this.apiService.getTodosByUserId(projectId).subscribe({
      next: (todos) => {
        this.tasksState.setTasks(todos);
        this.tasksState.setLoading(false);
      },
      error: (error) => {
        console.error('Failed to load tasks:', error);
        this.tasksState.setError('Failed to load tasks. Please try again.');
        this.tasksState.setLoading(false);
      }
    });
  }

  /**
   * Get a specific project
   */
  getProject(id: number): Project | undefined {
    return this.projectsState.getProjectById(id);
  }
}
