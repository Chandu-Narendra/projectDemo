import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { ErrorInterceptor } from './error.interceptor';

describe('ErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true
        }
      ]
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('APP_SIMULATE_ERROR');
    localStorage.removeItem('APP_ERROR_RATE');
  });

  it('should be created', () => {
    const interceptor = TestBed.inject(HTTP_INTERCEPTORS).find(i => i instanceof ErrorInterceptor);
    expect(interceptor).toBeTruthy();
  });

  it('should pass through successful requests', () => {
    const testUrl = 'https://api.example.com/test';
    const responseData = { message: 'Success' };

    httpClient.get(testUrl).subscribe((data) => {
      expect(data).toEqual(responseData);
    });

    const req = httpMock.expectOne(testUrl);
    expect(req.request.method).toBe('GET');
    req.flush(responseData);
  });

  it('should handle 404 errors', (done) => {
    const testUrl = 'https://api.example.com/notfound';

    httpClient.get(testUrl).subscribe(
      () => {
        fail('should have failed with 404 error');
      },
      (error) => {
        expect(error).toBeDefined();
        done();
      }
    );

    const req = httpMock.expectOne(testUrl);
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('should handle 500 errors', (done) => {
    const testUrl = 'https://api.example.com/error';

    httpClient.get(testUrl).subscribe(
      () => {
        fail('should have failed with 500 error');
      },
      (error) => {
        expect(error).toBeDefined();
        done();
      }
    );

    const req = httpMock.expectOne(testUrl);
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should enable error simulation', () => {
    ErrorInterceptor.enableErrorSimulation(true);
    expect(localStorage.getItem('APP_SIMULATE_ERROR')).toBe('true');

    ErrorInterceptor.enableErrorSimulation(false);
    expect(localStorage.getItem('APP_SIMULATE_ERROR')).toBeNull();
  });

  it('should emit error events', (done) => {
    const testUrl = 'https://api.example.com/test';

    ErrorInterceptor.error$.subscribe((error) => {
      expect(error).toBeDefined();
      done();
    });

    httpClient.get(testUrl).subscribe(
      () => {},
      () => {}
    );

    const req = httpMock.expectOne(testUrl);
    req.flush('Error', { status: 400, statusText: 'Bad Request' });
  });
});
