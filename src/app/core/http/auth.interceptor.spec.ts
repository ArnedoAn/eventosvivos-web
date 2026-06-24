import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { environment } from '../../../environments/environment';
import { AuthStore } from '../auth/auth.store';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        AuthStore,
      ],
    });

    return {
      http: TestBed.inject(HttpClient),
      httpTestingController: TestBed.inject(HttpTestingController),
      authStore: TestBed.inject(AuthStore),
    };
  }

  it('should not add Authorization header when token is null', () => {
    const { http, httpTestingController } = setup();

    http.get(`${environment.apiBaseUrl}/events`).subscribe();

    const req = httpTestingController.expectOne(`${environment.apiBaseUrl}/events`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);

    httpTestingController.verify();
  });

  it('should add Authorization Bearer header when token is set', () => {
    const { http, httpTestingController, authStore } = setup();

    authStore.login({ token: 'my-token', role: 'User' });
    http.get(`${environment.apiBaseUrl}/events`).subscribe();

    const req = httpTestingController.expectOne(`${environment.apiBaseUrl}/events`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush([]);

    httpTestingController.verify();
  });
});
