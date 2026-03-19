import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { User, Todo } from '@shared/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com';
  private cache = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) {}

  /**
   * Get all users (projects)
   * Cached to prevent duplicate requests
   */
  getUsers(): Observable<User[]> {
    return this.getCachedRequest('users', () =>
      this.http.get<User[]>(`${this.apiUrl}/users`)
    );
  }

  /**
   * Get all todos (tasks)
   * Cached to prevent duplicate requests
   */
  getTodos(): Observable<Todo[]> {
    return this.getCachedRequest('todos', () =>
      this.http.get<Todo[]>(`${this.apiUrl}/todos`)
    );
  }

  /**
   * Get todos for a specific user
   * @param userId - The ID of the user
   */
  getTodosByUserId(userId: number): Observable<Todo[]> {
    return this.http.get<Todo[]>(
      `${this.apiUrl}/todos?userId=${userId}`
    );
  }

  /**
   * Get comments (for future use)
   * @param postId - The ID of the post
   */
  getComments(postId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/comments?postId=${postId}`
    );
  }

  /**
   * Cache implementation - prevents duplicate HTTP requests
   * @param key - Cache key
   * @param request - Function that returns the observable
   */
  private getCachedRequest<T>(
    key: string,
    request: () => Observable<T>
  ): Observable<T> {
    if (!this.cache.has(key)) {
      this.cache.set(
        key,
        request().pipe(
          shareReplay(1) // Cache the result and replay to new subscribers
        )
      );
    }
    return this.cache.get(key) as Observable<T>;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   * @param key - Cache key to clear
   */
  clearCacheEntry(key: string): void {
    this.cache.delete(key);
  }
}
