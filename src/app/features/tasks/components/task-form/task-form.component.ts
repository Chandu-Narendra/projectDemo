import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Task } from '../../../../shared/models';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Create New Task</h2>
          <button class="modal-close" (click)="onClose()">✕</button>
        </div>

        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="task-form">
          <div class="form-group">
            <label for="title">Task Title *</label>
            <input
              id="title"
              type="text"
              class="form-input"
              formControlName="title"
              placeholder="Enter task title"
              [class.error]="isFieldInvalid('title')"
            />
            <span class="error-message" *ngIf="isFieldInvalid('title')">
              <span *ngIf="taskForm.get('title')?.errors?.['required']">
                Title is required
              </span>
              <span *ngIf="taskForm.get('title')?.errors?.['minlength']">
                Title must be at least 5 characters
              </span>
            </span>
          </div>

          <div class="form-group">
            <label for="status">Status *</label>
            <select
              id="status"
              class="form-input"
              formControlName="completed"
              [class.error]="isFieldInvalid('completed')"
            >
              <option [value]="false">Pending</option>
              <option [value]="true">Completed</option>
            </select>
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="btn-cancel"
              (click)="onClose()"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-submit"
              [disabled]="!taskForm.valid"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      width: 90%;
      max-width: 500px;
      animation: slideUp 0.3s ease-out;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #333;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #999;
      transition: color 0.2s;
    }

    .modal-close:hover {
      color: #333;
    }

    .task-form {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #3f51b5;
      box-shadow: 0 0 5px rgba(63, 81, 181, 0.2);
    }

    .form-input.error {
      border-color: #f44336;
      background-color: #ffebee;
    }

    .error-message {
      display: block;
      color: #f44336;
      font-size: 12px;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      border-top: 1px solid #eee;
      padding-top: 1rem;
    }

    .btn-cancel,
    .btn-submit {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-cancel {
      background-color: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;
    }

    .btn-cancel:hover {
      background-color: #eee;
    }

    .btn-submit {
      background-color: #3f51b5;
      color: white;
    }

    .btn-submit:hover:not(:disabled) {
      background-color: #303f9f;
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskFormComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<Task>();

  taskForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      completed: [false]
    });
  }

  /**
   * Check if field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const newTask: Task = {
        ...formValue,
        id: Date.now(), // Generate temporary ID
        userId: 0, // Will be set by parent component
        createdDate: new Date()
      };
      this.submit.emit(newTask);
      this.taskForm.reset({ completed: false });
    }
  }

  /**
   * Close the modal
   */
  onClose(): void {
    this.close.emit();
  }
}
