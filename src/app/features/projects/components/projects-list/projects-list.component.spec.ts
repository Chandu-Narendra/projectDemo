import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ProjectsListComponent } from './projects-list.component';
import { ProjectsService } from '../../services/projects.service';
import { ProjectsStateService } from '../../../../core/services/state/projects.state';
import { ErrorInterceptor } from '../../../../core/services/interceptors/error.interceptor';
import { Project } from '../../../../shared/models';
import { of } from 'rxjs';

describe('ProjectsListComponent', () => {
  let component: ProjectsListComponent;
  let fixture: ComponentFixture<ProjectsListComponent>;
  let projectsService: jasmine.SpyObj<ProjectsService>;
  let projectsState: jasmine.SpyObj<ProjectsStateService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const projectsServiceSpy = jasmine.createSpyObj('ProjectsService', [
      'loadProjects',
      'setSearch',
      'setCurrentPage',
      'getCurrentPage',
      'getTotalPages',
      'getPaginatedProjects'
    ]);
    const projectsStateSpy = jasmine.createSpyObj('ProjectsStateService', [
      'getProjects$',
      'getLoading$',
      'getError$'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const mockProject: Project = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      taskCount: 5
    };

    projectsServiceSpy.loadProjects.and.returnValue(undefined);
    projectsServiceSpy.getPaginatedProjects.and.returnValue(of([mockProject]));
    projectsServiceSpy.getCurrentPage.and.returnValue(of(1));
    projectsServiceSpy.getTotalPages.and.returnValue(of(2));
    projectsStateSpy.getLoading$.and.returnValue(of(false));
    projectsStateSpy.getError$.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [ProjectsListComponent],
      providers: [
        { provide: ProjectsService, useValue: projectsServiceSpy },
        { provide: ProjectsStateService, useValue: projectsStateSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
    projectsState = TestBed.inject(ProjectsStateService) as jasmine.SpyObj<ProjectsStateService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(ProjectsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects on init', () => {
    expect(projectsService.loadProjects).toHaveBeenCalled();
  });

  it('should navigate to tasks when viewTasks is called', () => {
    component.viewTasks(1);
    expect(router.navigate).toHaveBeenCalledWith(['/projects', 1, 'tasks']);
  });

  it('should set search term', () => {
    component.onSearch({ target: { value: 'John' } } as any);
    expect(projectsService.setSearch).toHaveBeenCalledWith('John');
  });

  it('should go to next page', () => {
    component.nextPage();
    expect(projectsService.setCurrentPage).toHaveBeenCalled();
  });

  it('should go to previous page', () => {
    component.previousPage();
    expect(projectsService.setCurrentPage).toHaveBeenCalled();
  });

  it('should toggle error simulation', () => {
    spyOn(ErrorInterceptor, 'enableErrorSimulation');
    const event = { target: { checked: true } } as any;
    component.toggleErrorSimulation(event);
    expect(ErrorInterceptor.enableErrorSimulation).toHaveBeenCalledWith(true);
  });

  it('should retry loading projects', () => {
    component.onRetry();
    expect(projectsService.loadProjects).toHaveBeenCalled();
  });

  it('should track projects by id', () => {
    const mockProject: Project = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      taskCount: 5
    };
    const trackByResult = component.trackByProjectId(0, mockProject);
    expect(trackByResult).toBe(1);
  });
});
