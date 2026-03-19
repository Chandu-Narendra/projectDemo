import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task, Todo } from '@shared/models';

@Injectable({
  providedIn: 'root'
})
export class TasksStateService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private currentProjectIdSubject = new BehaviorSubject<number | null>(null);

  public tasks$: Observable<Task[]> = this.tasksSubject.asObservable();
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();
  public error$: Observable<string | null> = this.errorSubject.asObservable();
  public currentProjectId$: Observable<number | null> = this.currentProjectIdSubject.asObservable();

  constructor() {}

  /**
   * Set tasks from API with optional conversion
   */
  setTasks(todos: Todo[]): void {
    const tasks: Task[] = todos.map((todo) => ({
      ...todo,
      createdDate: new Date()
    }));
    this.tasksSubject.next(tasks);
  }

  /**
   * Get tasks as Observable
   */
  getTasks$(): Observable<Task[]> {
    return this.tasks$;
  }

  /**
   * Get current tasks snapshot
   */
  getTasksSnapshot(): Task[] {
    return this.tasksSubject.value;
  }

  /**
   * Add a new task (optimistic update for mock API)
   */
  addTask(task: Task): void {
    const newTask: Task = {
      ...task,
      createdDate: new Date()
    };
    const currentTasks = this.tasksSubject.value;
    this.tasksSubject.next([newTask, ...currentTasks]);
  }

  /**
   * Update an existing task
   */
  updateTask(id: number, updates: Partial<Task>): void {
    const tasks = this.tasksSubject.value.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    this.tasksSubject.next(tasks);
  }

  /**
   * Delete a task
   */
  deleteTask(id: number): void {
    const tasks = this.tasksSubject.value.filter((t) => t.id !== id);
    this.tasksSubject.next(tasks);
  }

  /**
   * Set the current project being viewed
   */
  setCurrentProjectId(projectId: number | null): void {
    this.currentProjectIdSubject.next(projectId);
  }

  /**
   * Get the current project ID
   */
  getCurrentProjectId(): number | null {
    return this.currentProjectIdSubject.value;
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
    this.tasksSubject.next([]);
    this.loadingSubject.next(false);
    this.errorSubject.next(null);
    this.currentProjectIdSubject.next(null);
  }
}
