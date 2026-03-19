import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state-container" *ngIf="isEmpty">
      <div class="empty-state-icon">{{ icon }}</div>
      <h3 class="empty-state-title">{{ title }}</h3>
      <p class="empty-state-message">{{ message }}</p>
      <button *ngIf="actionLabel" class="empty-state-action" (click)="onAction()">
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      text-align: center;
      color: #666;
    }

    .empty-state-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      color: #333;
    }

    .empty-state-message {
      margin: 0 0 1.5rem 0;
      color: #999;
      max-width: 400px;
    }

    .empty-state-action {
      padding: 0.5rem 1.5rem;
      background-color: #3f51b5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .empty-state-action:hover {
      background-color: #303f9f;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  @Input() isEmpty = false;
  @Input() title = 'No Data';
  @Input() message = 'There is no data to display.';
  @Input() icon = '📭';
  @Input() actionLabel: string | null = null;
  @Input() onAction = () => {};
}
