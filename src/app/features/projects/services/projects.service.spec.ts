import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProjectsService } from './projects.service';
import { ApiService } from '../../../core/services/api.service';
import { ProjectsStateService } from '../../../core/services/state/projects.state';
import { TasksStateService } from '../../../core/services/state/tasks.state';
import { Project } from '../../../shared/models';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let apiService: ApiService;
  let projectsState: ProjectsStateService;
  let tasksState: TasksStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectsService, ApiService, ProjectsStateService, TasksStateService]
    });
    service = TestBed.inject(ProjectsService);
    apiService = TestBed.inject(ApiService);
    projectsState = TestBed.inject(ProjectsStateService);
    tasksState = TestBed.inject(TasksStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set search term and reset page', (done) => {
    service.setSearch('John');

    service.search$.subscribe((term) => {
      expect(term).toBe('John');
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

  it('should get total pages', (done) => {
    const mockProjects: Project[] = [];
    // Create 11 projects to have 3 pages with 5 per page
    for (let i = 0; i < 15; i++) {
      mockProjects.push({
        id: i + 1,
        name: `Project ${i + 1}`,
        email: `project${i + 1}@example.com`,
        taskCount: 0
      });
    }

    projectsState.setProjects(mockProjects);

    service.getTotalPages().subscribe((pages) => {
      expect(pages).toBe(3); // 15 projects / 5 per page = 3 pages
      done();
    });
  });

  it('should get paginated projects', (done) => {
    const mockProjects: Project[] = [];
    for (let i = 0; i < 7; i++) {
      mockProjects.push({
        id: i + 1,
        name: `Project ${i + 1}`,
        email: `project${i + 1}@example.com`,
        taskCount: 0
      });
    }

    projectsState.setProjects(mockProjects);
    service.setCurrentPage(1);

    service.getPaginatedProjects().subscribe((projects) => {
      expect(projects.length).toBeLessThanOrEqual(5); // Max 5 per page
      done();
    });
  });

  it('should filter projects by search term', (done) => {
    const mockProjects: Project[] = [
      { id: 1, name: 'John Doe', email: 'john@example.com', taskCount: 5 },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', taskCount: 3 },
      { id: 3, name: 'John Smith', email: 'john.smith@example.com', taskCount: 2 }
    ];

    projectsState.setProjects(mockProjects);
    service.setSearch('John');

    service.getPaginatedProjects().subscribe((projects) => {
      expect(projects.length).toBeGreaterThan(0);
      expect(projects.some(p => p.name.includes('John'))).toBe(true);
      done();
    });
  });
});
