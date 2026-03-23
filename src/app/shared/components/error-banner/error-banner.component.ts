import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorEvent } from '@core/services/interceptors/error.interceptor';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-banner.component.html',
  styleUrl: './error-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorBannerComponent {
  @Input() error: ErrorEvent | null = null;
  @Input() showRetry = false;
  @Output() retry = new EventEmitter<void>();

  onDismiss(): void {
    this.error = null;
  }
}
