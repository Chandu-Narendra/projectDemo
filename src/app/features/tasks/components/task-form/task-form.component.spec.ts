import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskFormComponent } from './task-form.component';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.taskForm.get('title')?.value).toBe('');
    expect(component.taskForm.get('completed')?.value).toBe(false);
  });

  it('should validate required title field', () => {
    const titleControl = component.taskForm.get('title');
    titleControl?.setValue('');
    titleControl?.markAsTouched();

    expect(titleControl?.hasError('required')).toBe(true);
    expect(component.isFieldInvalid('title')).toBe(true);
  });

  it('should validate minimum length for title', () => {
    const titleControl = component.taskForm.get('title');
    titleControl?.setValue('Test');
    titleControl?.markAsTouched();

    expect(titleControl?.hasError('minlength')).toBe(true);
    expect(component.isFieldInvalid('title')).toBe(true);
  });

  it('should allow valid title', () => {
    const titleControl = component.taskForm.get('title');
    titleControl?.setValue('Valid Task Title');

    expect(titleControl?.valid).toBe(true);
    expect(component.isFieldInvalid('title')).toBe(false);
  });

  it('should allow form submission with valid data', (done) => {
    component.submit.subscribe((task) => {
      expect(task.title).toBe('Valid Task Title');
      expect(task.completed).toBe(false);
      done();
    });

    component.taskForm.patchValue({
      title: 'Valid Task Title',
      completed: false
    });

    component.onSubmit();
  });

  it('should NOT submit form with invalid data', (done) => {
    let submitted = false;

    component.submit.subscribe(() => {
      submitted = true;
    });

    component.taskForm.patchValue({
      title: 'Test',
      completed: false
    });

    component.onSubmit();

    setTimeout(() => {
      expect(submitted).toBe(false);
      done();
    }, 100);
  });

  it('should emit close event', (done) => {
    component.close.subscribe(() => {
      done();
    });

    component.onClose();
  });

  it('should mark form as touched on submit attempt', () => {
    const titleControl = component.taskForm.get('title');
    expect(titleControl?.touched).toBe(false);

    component.onSubmit();

    expect(titleControl?.touched).toBe(true);
  });

  it('should reset form after successful submission', (done) => {
    component.submit.subscribe(() => {
      expect(component.taskForm.get('title')?.value).toBe('');
      expect(component.taskForm.get('completed')?.value).toBe(false);
      done();
    });

    component.taskForm.patchValue({
      title: 'Test Task Title',
      completed: false
    });

    component.onSubmit();
  });
});
