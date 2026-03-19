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
    expect(component.form.get('title')?.value).toBe('');
    expect(component.form.get('completed')?.value).toBe(false);
  });

  it('should validate required title field', () => {
    const titleControl = component.form.get('title');
    titleControl?.setValue('');
    titleControl?.markAsTouched();

    expect(titleControl?.hasError('required')).toBe(true);
    expect(component.getTitleErrors()).toContain('Title is required');
  });

  it('should validate minimum length for title', () => {
    const titleControl = component.form.get('title');
    titleControl?.setValue('Test');
    titleControl?.markAsTouched();

    expect(titleControl?.hasError('minlength')).toBe(true);
    expect(component.getTitleErrors()).toContain('Title must be at least 5 characters');
  });

  it('should allow valid title', () => {
    const titleControl = component.form.get('title');
    titleControl?.setValue('Valid Task Title');

    expect(titleControl?.valid).toBe(true);
    expect(titleControl?.hasError('minlength')).toBe(false);
  });

  it('should allow form submission with valid data', (done) => {
    component.submit.subscribe((task) => {
      expect(task.title).toBe('Valid Task Title');
      expect(task.completed).toBe(false);
      done();
    });

    component.form.patchValue({
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

    component.form.patchValue({
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

    component.onDismiss();
  });

  it('should mark form as touched on submit attempt', () => {
    const titleControl = component.form.get('title');
    expect(titleControl?.touched).toBe(false);

    component.onSubmit();

    expect(titleControl?.touched).toBe(true);
  });

  it('should reset form after successful submission', (done) => {
    component.submit.subscribe(() => {
      expect(component.form.get('title')?.value).toBe('');
      expect(component.form.get('completed')?.value).toBe(false);
      done();
    });

    component.form.patchValue({
      title: 'Test Task Title',
      completed: false
    });

    component.onSubmit();
  });
});
