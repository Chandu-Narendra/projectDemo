import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
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
