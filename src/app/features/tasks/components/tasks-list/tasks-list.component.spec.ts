import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { TasksListComponent } from './tasks-list.component';
import { TasksService } from '../../services/tasks.service';
import { TasksStateService } from '../../../../core/services/state/tasks.state';
import { Task } from '../../../../shared/models';
import { of } from 'rxjs';

describe('TasksListComponent', () => {
  let component: TasksListComponent;
  let fixture: ComponentFixture<TasksListComponent>;
  let tasksService: jasmine.SpyObj<TasksService>;
  let tasksState: jasmine.SpyObj<TasksStateService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  beforeEach(async () => {
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', [
      'loadTasks',
      'setSearch',
      'setFilter',
      'setCurrentPage',
      'getCurrentPage',
      'getTotalPages',
      'getPaginatedTasks',
      'getStatistics'
    ]);
    const tasksStateSpy = jasmine.createSpyObj('TasksStateService', [
      'getTasks$',
      'getLoading$',
      'getError$',
      'updateTask'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const mockTask: Task = {
      id: 1,
      userId: 1,
      title: 'Test Task',
      completed: false
    };

    tasksServiceSpy.loadTasks.and.returnValue(undefined);
    tasksServiceSpy.getPaginatedTasks.and.returnValue(of([mockTask]));
    tasksServiceSpy.getCurrentPage.and.returnValue(of(1));
    tasksServiceSpy.getTotalPages.and.returnValue(of(1));
    tasksServiceSpy.getStatistics.and.returnValue(of({
      total: 1,
      completed: 0,
      pending: 1,
      completionRate: 0
    }));
    tasksStateSpy.getTasks$.and.returnValue(of([mockTask]));
    tasksStateSpy.getLoading$.and.returnValue(of(false));
    tasksStateSpy.getError$.and.returnValue(of(null));

    activatedRoute = {
      parent: {
        params: of({ userId: 1 })
      }
    };

    await TestBed.configureTestingModule({
      imports: [TasksListComponent],
      providers: [
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: TasksStateService, useValue: tasksStateSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();

    tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
    tasksState = TestBed.inject(TasksStateService) as jasmine.SpyObj<TasksStateService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(TasksListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set search term', () => {
    component.onSearch({ target: { value: 'Test' } } as any);
    expect(tasksService.setSearch).toHaveBeenCalledWith('Test');
  });

  it('should set filter', () => {
    component.setFilter('completed');
    expect(tasksService.setFilter).toHaveBeenCalledWith('completed');
  });

  it('should toggle task status', () => {
    component.toggleTaskStatus(1, true);
    expect(tasksService.loadTasks).toHaveBeenCalled();
  });

  it('should go to next page', () => {
    component.nextPage();
    expect(tasksService.setCurrentPage).toHaveBeenCalled();
  });

  it('should go to previous page', () => {
    component.previousPage();
    expect(tasksService.setCurrentPage).toHaveBeenCalled();
  });

  it('should open create task form', () => {
    component.openCreateTaskForm();
    expect(component.showCreateTaskForm).toBe(true);
  });

  it('should close create task form', () => {
    component.showCreateTaskForm = true;
    component.closeCreateTaskForm();
    expect(component.showCreateTaskForm).toBe(false);
  });

  it('should navigate back to projects', () => {
    component.navigateBack();
    expect(router.navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('should track tasks by id', () => {
    const mockTask: Task = {
      id: 1,
      userId: 1,
      title: 'Test Task',
      completed: false
    };
    const trackByResult = component.trackByTaskId(0, mockTask);
    expect(trackByResult).toBe(1);
  });
});
