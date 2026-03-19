import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TasksStateService } from '../../../core/services/state/tasks.state';
import { Task } from '../../../shared/models';

export const ITEMS_PER_PAGE_TASKS = 5;

export enum TaskFilter {
  ALL = 'all',
  COMPLETED = 'completed',
  PENDING = 'pending'
}

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private searchSubject = new BehaviorSubject<string>('');
  private filterSubject = new BehaviorSubject<TaskFilter>(TaskFilter.ALL);
  private currentPageSubject = new BehaviorSubject<number>(1);

  public search$: Observable<string> = this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged()
  );

  public filter$: Observable<TaskFilter> = this.filterSubject.asObservable();

  constructor(private tasksState: TasksStateService) {}

  /**
   * Get paginated and filtered tasks
   */
  getPaginatedTasks(): Observable<Task[]> {
    return combineLatest([
      this.tasksState.getTasks$(),
      this.search$,
      this.filter$,
      this.currentPageSubject.asObservable()
    ]).pipe(
      map(([tasks, searchTerm, filter, currentPage]) => {
        // Apply filter
        let filtered = tasks;
        if (filter === TaskFilter.COMPLETED) {
          filtered = tasks.filter((t) => t.completed);
        } else if (filter === TaskFilter.PENDING) {
          filtered = tasks.filter((t) => !t.completed);
        }

        // Apply search
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter((t) =>
            t.title.toLowerCase().includes(term)
          );
        }

        // Apply pagination
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE_TASKS;
        const endIndex = startIndex + ITEMS_PER_PAGE_TASKS;
        return filtered.slice(startIndex, endIndex);
      })
    );
  }

  /**
   * Get task count for pagination
   */
  getTasksCount(): Observable<number> {
    return combineLatest([
      this.tasksState.getTasks$(),
      this.search$,
      this.filter$
    ]).pipe(
      map(([tasks, searchTerm, filter]) => {
        let count = tasks;

        // Apply filter
        if (filter === TaskFilter.COMPLETED) {
          count = tasks.filter((t) => t.completed);
        } else if (filter === TaskFilter.PENDING) {
          count = tasks.filter((t) => !t.completed);
        }

        // Apply search
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          count = count.filter((t) =>
            t.title.toLowerCase().includes(term)
          );
        }

        return count.length;
      })
    );
  }

  /**
   * Set search term
   */
  setSearch(term: string): void {
    this.searchSubject.next(term);
    this.currentPageSubject.next(1);
  }

  /**
   * Set filter
   */
  setFilter(filter: TaskFilter): void {
    this.filterSubject.next(filter);
    this.currentPageSubject.next(1);
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
    return this.getTasksCount().pipe(
      map((count) => Math.ceil(count / ITEMS_PER_PAGE_TASKS))
    );
  }

  /**
   * Get current page
   */
  getCurrentPage(): Observable<number> {
    return this.currentPageSubject.asObservable();
  }

  /**
   * Add new task
   */
  addTask(task: Task): void {
    this.tasksState.addTask(task);
  }

  /**
   * Update task
   */
  updateTask(id: number, updates: Partial<Task>): void {
    this.tasksState.updateTask(id, updates);
  }

  /**
   * Delete task
   */
  deleteTask(id: number): void {
    this.tasksState.deleteTask(id);
  }

  /**
   * Get current filter
   */
  getCurrentFilter(): TaskFilter {
    return this.filterSubject.value;
  }

  /**
   * Get all tasks (unfiltered)
   */
  getAllTasks(): Observable<Task[]> {
    return this.tasksState.getTasks$();
  }

  /**
   * Get statistics
   */
  getStatistics(): Observable<{
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  }> {
    return this.tasksState.getTasks$().pipe(
      map((tasks) => {
        const total = tasks.length;
        const completed = tasks.filter((t) => t.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        return {
          total,
          completed,
          pending,
          completionRate
        };
      })
    );
  }
}
