import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ErrorEvent {
  message: string;
  status?: number;
  timestamp: Date;
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private static errorSubject = new BehaviorSubject<ErrorEvent | null>(null);
  static error$ = ErrorInterceptor.errorSubject.asObservable();

  // Key to enable error simulation via localStorage
  private readonly ERROR_SIMULATION_KEY = 'APP_SIMULATE_ERROR';
  private readonly ERROR_RATE_KEY = 'APP_ERROR_RATE';

  constructor() {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Check if error simulation is enabled
    const simulateError = this._shouldSimulateError();

    if (simulateError) {
      return throwError(() =>
        this._createSimulatedError()
      );
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorEvent: ErrorEvent = {
          message: this._getErrorMessage(error),
          status: error.status,
          timestamp: new Date()
        };

        // Emit error event for global handling
        ErrorInterceptor.errorSubject.next(errorEvent);

        return throwError(() => error);
      })
    );
  }

  /**
   * Check if error simulation should be triggered
   */
  private _shouldSimulateError(): boolean {
    const simulateErrorFlag = localStorage.getItem(this.ERROR_SIMULATION_KEY);
    const errorRate = localStorage.getItem(this.ERROR_RATE_KEY);

    if (simulateErrorFlag === 'true') {
      return true;
    }

    if (errorRate) {
      const rate = parseFloat(errorRate);
      return Math.random() < rate;
    }

    return false;
  }

  /**
   * Create a simulated error response
   */
  private _createSimulatedError(): HttpErrorResponse {
    return new HttpErrorResponse({
      error: 'Simulated API Error',
      status: 500,
      statusText: 'Internal Server Error',
      url: 'https://jsonplaceholder.typicode.com/api'
    });
  }

  /**
   * Get user-friendly error message from HttpErrorResponse
   */
  private _getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      return error.error.message || 'An unknown error occurred';
    }

    // Server-side error
    const status = error.status;
    switch (status) {
      case 0:
        return 'Unable to connect to the server. Please check your internet connection.';
      case 400:
        return 'Bad Request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Forbidden. You do not have permission to access this resource.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return `An error occurred: ${error.statusText || 'Unknown error'}`;
    }
  }

  /**
   * Enable error simulation (callable from components for testing)
   */
  static enableErrorSimulation(enable: boolean): void {
    if (enable) {
      localStorage.setItem('APP_SIMULATE_ERROR', 'true');
    } else {
      localStorage.removeItem('APP_SIMULATE_ERROR');
    }
  }

  /**
   * Set error rate (0-1) for random error simulation
   */
  static setErrorRate(rate: number): void {
    if (rate > 0) {
      localStorage.setItem('APP_ERROR_RATE', rate.toString());
    } else {
      localStorage.removeItem('APP_ERROR_RATE');
    }
  }
}
