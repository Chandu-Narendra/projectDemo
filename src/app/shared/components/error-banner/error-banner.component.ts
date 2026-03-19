import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorEvent } from '@core/services/interceptors/error.interceptor';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-banner" *ngIf="error" [@slideDown]>
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <div class="error-message">
          <strong>Error:</strong> {{ error.message }}
          <small *ngIf="error.status" class="error-status">({{ error.status }})</small>
        </div>
        <button class="error-close" (click)="onDismiss()" aria-label="Close error">
          ✕
        </button>
      </div>
      <div class="error-actions" *ngIf="showRetry">
        <button class="retry-button" (click)="retry.emit()">Retry</button>
      </div>
    </div>
  `,
  styles: [`
    .error-banner {
      background-color: #ffebee;
      border-left: 4px solid #f44336;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      animation: slideDown 0.3s ease-out;
    }

    .error-content {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .error-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .error-message {
      flex: 1;
      color: #c62828;
      font-size: 14px;
    }

    .error-status {
      margin-left: 0.5rem;
      color: #d32f2f;
      font-size: 12px;
    }

    .error-close {
      background: none;
      border: none;
      color: #c62828;
      cursor: pointer;
      font-size: 1.25rem;
      padding: 0;
      flex-shrink: 0;
      transition: color 0.2s;
    }

    .error-close:hover {
      color: #b71c1c;
    }

    .error-actions {
      margin-top: 1rem;
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .retry-button {
      padding: 0.5rem 1rem;
      background-color: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .retry-button:hover {
      background-color: #d32f2f;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorBannerComponent {
  @Input() error: ErrorEvent | null = null;
  @Input() showRetry = true;
  @Output() dismiss = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  onDismiss(): void {
    this.dismiss.emit();
  }

  onRetry(): void {
    this.retry.emit();
  }
}
