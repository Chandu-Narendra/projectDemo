import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TasksService } from './tasks.service';
import { ApiService } from '../../../core/services/api.service';
import { TasksStateService } from '../../../core/services/state/tasks.state';
import { ProjectsStateService } from '../../../core/services/state/projects.state';
import { Task } from '../../../shared/models';

describe('TasksService', () => {
  let service: TasksService;
  let tasksState: TasksStateService;
  let projectsState: ProjectsStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TasksService, ApiService, TasksStateService, ProjectsStateService]
    });
    service = TestBed.inject(TasksService);
    tasksState = TestBed.inject(TasksStateService);
    projectsState = TestBed.inject(ProjectsStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set search term', (done) => {
    service.setSearch('Test');

    service.search$.subscribe((term) => {
      expect(term).toBe('Test');
      done();
    });
  });

  it('should set filter', (done) => {
    service.setFilter('completed');

    service.filter$.subscribe((filter) => {
      expect(filter).toBe('completed');
      done();
    });
  });

  it('should set current page', (done) => {
    service.setCurrentPage(2);

    service.getCurrentPage().subscribe((page) => {
      expect(page).toBe(2);
      done();
    });
  });

  it('should get statistics', (done) => {
    const mockTasks: Task[] = [
      { id: 1, userId: 1, title: 'Task 1', completed: true },
      { id: 2, userId: 1, title: 'Task 2', completed: false },
      { id: 3, userId: 1, title: 'Task 3', completed: true }
    ];

    tasksState.addTask(mockTasks[0]);
    tasksState.addTask(mockTasks[1]);
    tasksState.addTask(mockTasks[2]);

    service.getStatistics().subscribe((stats) => {
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.completionRate).toBe(66.67);
      done();
    });
  });

  it('should filter tasks by completion status', (done) => {
    const mockTasks: Task[] = [
      { id: 1, userId: 1, title: 'Task 1', completed: true },
      { id: 2, userId: 1, title: 'Task 2', completed: false }
    ];

    tasksState.addTask(mockTasks[0]);
    tasksState.addTask(mockTasks[1]);

    service.setFilter('completed');

    service.getPaginatedTasks().subscribe((tasks) => {
      expect(tasks.every(t => t.completed === true)).toBe(true);
      done();
    });
  });

  it('should get paginated tasks', (done) => {
    const mockTasks: Task[] = [];
    for (let i = 0; i < 8; i++) {
      mockTasks.push({
        id: i + 1,
        userId: 1,
        title: `Task ${i + 1}`,
        completed: false
      });
    }

    mockTasks.forEach(task => tasksState.addTask(task));
    service.setCurrentPage(1);

    service.getPaginatedTasks().subscribe((tasks) => {
      expect(tasks.length).toBeLessThanOrEqual(5); // Max 5 per page
      done();
    });
  });

  it('should get total pages for tasks', (done) => {
    const mockTasks: Task[] = [];
    for (let i = 0; i < 12; i++) {
      mockTasks.push({
        id: i + 1,
        userId: 1,
        title: `Task ${i + 1}`,
        completed: false
      });
    }

    mockTasks.forEach(task => tasksState.addTask(task));

    service.getTotalPages().subscribe((pages) => {
      expect(pages).toBe(3); // 12 tasks / 5 per page = 3 pages
      done();
    });
  });
});
