import { TestBed } from '@angular/core/testing';
import { TasksStateService } from './tasks.state';
import { Task } from '../../../shared/models';

describe('TasksStateService', () => {
  let service: TasksStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TasksStateService]
    });
    service = TestBed.inject(TasksStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty tasks', (done) => {
    service.getTasks$().subscribe((tasks) => {
      expect(tasks.length).toBe(0);
      done();
    });
  });

  it('should add task', (done) => {
    const newTask: Task = { id: 1, userId: 1, title: 'New Task', completed: false };

    service.addTask(newTask);

    service.getTasks$().subscribe((tasks) => {
      expect(tasks.length).toBe(1);
      expect(tasks[0]).toEqual(newTask);
      done();
    });
  });

  it('should update task', (done) => {
    const task: Task = { id: 1, userId: 1, title: 'Original', completed: false };
    service.addTask(task);

    const updatedTask: Task = { id: 1, userId: 1, title: 'Updated', completed: true };
    service.updateTask(1, { title: 'Updated', completed: true });

    service.getTasks$().subscribe((tasks) => {
      expect(tasks[0].title).toBe('Updated');
      expect(tasks[0].completed).toBe(true);
      done();
    });
  });

  it('should delete task', (done) => {
    const task: Task = { id: 1, userId: 1, title: 'Task to delete', completed: false };
    service.addTask(task);

    service.deleteTask(1);

    service.getTasks$().subscribe((tasks) => {
      expect(tasks.length).toBe(0);
      done();
    });
  });

  it('should set current project id', (done) => {
    service.setCurrentProjectId(5);

    service.currentProjectId$.subscribe((projectId: number | null) => {
      expect(projectId).toBe(5);
      done();
    });
  });

  it('should set loading state', (done) => {
    service.setLoading(true);

    service.loading$.subscribe((loading: boolean) => {
      expect(loading).toBe(true);
      done();
    });
  });

  it('should set error state', (done) => {
    const errorMessage = 'Test error';
    service.setError(errorMessage);

    service.error$.subscribe((error: string | null) => {
      expect(error).toBe(errorMessage);
      done();
    });
  });
});
