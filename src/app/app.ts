import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ErrorBannerComponent } from './shared/components/error-banner/error-banner.component';
import { ErrorInterceptor } from './core/services/interceptors/error.interceptor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ErrorBannerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  error$ = ErrorInterceptor.error$;

  dismissError(): void {
    // Error will be dismissed by the error banner component
  }
}
