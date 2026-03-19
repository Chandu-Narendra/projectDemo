import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Project, User } from '@shared/models';

@Injectable({
  providedIn: 'root'
})
export class ProjectsStateService {
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public projects$: Observable<Project[]> = this.projectsSubject.asObservable();
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();
  public error$: Observable<string | null> = this.errorSubject.asObservable();

  constructor() {}

  /**
   * Set projects data with optional task counts
   */
  setProjects(projects: User[], taskCounts?: Map<number, number>): void {
    const projectsWithCounts: Project[] = projects.map((user) => ({
      ...user,
      taskCount: taskCounts?.get(user.id) ?? 0
    }));
    this.projectsSubject.next(projectsWithCounts);
  }

  /**
   * Get projects as Observable
   */
  getProjects$(): Observable<Project[]> {
    return this.projects$;
  }

  /**
   * Get current projects value
   */
  getProjectsSnapshot(): Project[] {
    return this.projectsSubject.value;
  }

  /**
   * Get a specific project by ID
   */
  getProjectById(id: number): Project | undefined {
    return this.projectsSubject.value.find((p) => p.id === id);
  }

  /**
   * Update task count for a project
   */
  updateProjectTaskCount(projectId: number, taskCount: number): void {
    const projects = this.projectsSubject.value.map((p) =>
      p.id === projectId ? { ...p, taskCount } : p
    );
    this.projectsSubject.next(projects);
  }

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void {
    this.loadingSubject.next(isLoading);
  }

  /**
   * Set error state
   */
  setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.projectsSubject.next([]);
    this.loadingSubject.next(false);
    this.errorSubject.next(null);
  }
}
