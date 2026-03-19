import { TestBed } from '@angular/core/testing';
import { ProjectsStateService } from './projects.state';
import { Project } from '../../../shared/models';

describe('ProjectsStateService', () => {
  let service: ProjectsStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectsStateService]
    });
    service = TestBed.inject(ProjectsStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty projects', (done) => {
    service.getProjects$().subscribe((projects) => {
      expect(projects.length).toBe(0);
      done();
    });
  });

  it('should set projects', (done) => {
    const mockProjects: Project[] = [
      { id: 1, name: 'John Doe', email: 'john@example.com', taskCount: 5 },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', taskCount: 3 }
    ];

    service.setProjects(mockProjects);

    service.getProjects$().subscribe((projects) => {
      expect(projects).toEqual(mockProjects);
      expect(projects.length).toBe(2);
      done();
    });
  });

  it('should update project task count', (done) => {
    const mockProjects: Project[] = [
      { id: 1, name: 'John Doe', email: 'john@example.com', taskCount: 5 }
    ];

    service.setProjects(mockProjects);
    service.updateProjectTaskCount(1, 10);

    service.getProjects$().subscribe((projects) => {
      expect(projects[0].taskCount).toBe(10);
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

  it('should clear error state', (done) => {
    service.setError('Some error');
    service.setError(null);

    service.error$.subscribe((error: string | null) => {
      expect(error).toBeNull();
      done();
    });
  });
});
