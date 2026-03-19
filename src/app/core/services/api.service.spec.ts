import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { User, Todo } from '../../shared/models';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const apiUrl = 'https://jsonplaceholder.typicode.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should fetch users from API', (done) => {
      const mockUsers: User[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ];

      service.getUsers().subscribe((users) => {
        expect(users).toEqual(mockUsers);
        expect(users.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should cache users on subsequent calls', () => {
      const mockUsers: User[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com' }
      ];

      service.getUsers().subscribe();
      service.getUsers().subscribe();

      const requests = httpMock.match(`${apiUrl}/users`);
      expect(requests.length).toBe(1); // Only one request due to caching
      requests[0].flush(mockUsers);
    });
  });

  describe('getTodosByUserId', () => {
    it('should fetch todos for a specific user', (done) => {
      const userId = 1;
      const mockTodos: Todo[] = [
        { id: 1, userId: 1, title: 'Test task', completed: false },
        { id: 2, userId: 1, title: 'Another task', completed: true }
      ];

      service.getTodosByUserId(userId).subscribe((todos) => {
        expect(todos).toEqual(mockTodos);
        expect(todos.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/todos?userId=${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTodos);
    });

    it('should cache todos by userId', () => {
      const userId = 1;
      const mockTodos: Todo[] = [
        { id: 1, userId: 1, title: 'Test task', completed: false }
      ];

      service.getTodosByUserId(userId).subscribe();
      service.getTodosByUserId(userId).subscribe();

      const requests = httpMock.match(`${apiUrl}/todos?userId=${userId}`);
      expect(requests.length).toBe(1); // Only one request due to caching
      requests[0].flush(mockTodos);
    });
  });

  describe('getTodos', () => {
    it('should fetch all todos', (done) => {
      const mockTodos: Todo[] = [
        { id: 1, userId: 1, title: 'Task 1', completed: false }
      ];

      service.getTodos().subscribe((todos) => {
        expect(todos).toEqual(mockTodos);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/todos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTodos);
    });
  });

  describe('getComments', () => {
    it('should fetch comments for a post', (done) => {
      const postId = 1;
      const mockComments = [
        { id: 1, postId: 1, name: 'Comment 1', email: 'user@example.com', body: 'Great post' }
      ];

      service.getComments(postId).subscribe((comments) => {
        expect(comments).toEqual(mockComments);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/posts/${postId}/comments`);
      expect(req.request.method).toBe('GET');
      req.flush(mockComments);
    });
  });
});
