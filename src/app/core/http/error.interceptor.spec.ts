import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { NotificationService } from '../notifications/notification.service';
import { errorInterceptor } from './error.interceptor';

const URL = `${environment.apiBaseUrl}/events`;

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([errorInterceptor])),
      provideHttpClientTesting(),
      NotificationService,
    ],
  });
  return {
    http: TestBed.inject(HttpClient),
    http2: TestBed.inject(HttpTestingController),
    ns: TestBed.inject(NotificationService),
  };
}

describe('errorInterceptor', () => {
  it('maps by detail text (camelCase body, no code)', () => {
    const { http, http2, ns } = setup();
    http.get(URL).subscribe({ error: () => {} });

    http2.expectOne(URL).flush(
      { title: 'Not Found', detail: 'Event not found.', status: 404 },
      { status: 404, statusText: 'Not Found' },
    );

    expect(ns.messages()).toHaveLength(1);
    expect(ns.messages()[0].type).toBe('error');
    expect(ns.messages()[0].text).toBe('El evento no fue encontrado.');
    http2.verify();
  });

  it('maps by code when code present in body (Plan B1 ready)', () => {
    const { http, http2, ns } = setup();
    http.get(URL).subscribe({ error: () => {} });

    http2.expectOne(URL).flush(
      { title: 'Not Found', detail: 'Event not found.', status: 404, code: 'event.notFound' },
      { status: 404, statusText: 'Not Found' },
    );

    expect(ns.messages()[0].text).toBe('El evento no fue encontrado.');
    http2.verify();
  });

  it('tolerates PascalCase body from 500 middleware', () => {
    const { http, http2, ns } = setup();
    http.get(URL).subscribe({ error: () => {} });

    http2.expectOne(URL).flush(
      { Title: 'An unexpected error occurred', Detail: 'An unexpected error occurred.', Status: 500 },
      { status: 500, statusText: 'Internal Server Error' },
    );

    expect(ns.messages()[0].text).toBe('Ocurrió un error inesperado.');
    http2.verify();
  });

  it('falls back to status-based message when detail not in dict', () => {
    const { http, http2, ns } = setup();
    http.get(URL).subscribe({ error: () => {} });

    http2.expectOne(URL).flush(
      { title: 'Bad Request', detail: 'PropertyName: some unknown validation message.', status: 400 },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(ns.messages()[0].text).toBe('PropertyName: some unknown validation message.');
    http2.verify();
  });

  it('maps reserve.soldOut detail to Spanish', () => {
    const { http, http2, ns } = setup();
    http.get(URL).subscribe({ error: () => {} });

    http2.expectOne(URL).flush(
      { title: 'Unprocessable Entity', detail: 'Not enough seats available.', status: 422 },
      { status: 422, statusText: 'Unprocessable Entity' },
    );

    expect(ns.messages()[0].text).toBe('No hay suficientes asientos disponibles.');
    http2.verify();
  });

  it('pushes error notification (type = error)', () => {
    const { http, http2, ns } = setup();
    http.get(URL).subscribe({ error: () => {} });

    http2.expectOne(URL).flush(
      { detail: 'Invalid credentials.' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(ns.messages()[0].type).toBe('error');
    http2.verify();
  });

  it('rethrows the error after pushing notification', () => {
    const { http, http2 } = setup();
    let caughtError: unknown;
    http.get(URL).subscribe({ error: (err: unknown) => { caughtError = err; } });
    http2.expectOne(URL).flush({ detail: 'Not found.' }, { status: 404, statusText: 'Not Found' });
    http2.verify();
    expect(caughtError).toBeTruthy();
  });
});
