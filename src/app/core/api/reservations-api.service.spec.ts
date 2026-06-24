import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import type { CreateReservationRequest, ReservationResponse } from '../models/reservation.model';
import { ReservationsApiService } from './reservations-api.service';

const BASE = `${environment.apiBaseUrl}/reservations`;

function makeReservation(overrides: Partial<ReservationResponse> = {}): ReservationResponse {
  return {
    id: 'res-1',
    eventId: 'evt-1',
    userId: 'usr-1',
    quantity: 2,
    buyerName: 'María García',
    buyerEmail: 'maria@example.com',
    status: 'PendientePago',
    createdUtc: '2026-06-24T14:32:00Z',
    ...overrides,
  };
}

describe('ReservationsApiService', () => {
  let service: ReservationsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ReservationsApiService],
    });
    service = TestBed.inject(ReservationsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('create() sends POST with eventId, quantity, buyerName, buyerEmail', () => {
    const payload: CreateReservationRequest = {
      eventId: 'evt-1',
      quantity: 2,
      buyerName: 'María García',
      buyerEmail: 'maria@example.com',
    };
    service.create(payload).subscribe();

    const req = http.expectOne(BASE);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(makeReservation());
  });

  it('confirm() sends POST (not PATCH) to /reservations/{id}/confirm', () => {
    service.confirm('res-1').subscribe();

    const req = http.expectOne(`${BASE}/res-1/confirm`);
    expect(req.request.method).toBe('POST');
    req.flush(makeReservation({ status: 'Confirmada' }));
  });

  it('cancel() sends POST (not PATCH) to /reservations/{id}/cancel', () => {
    service.cancel('res-1').subscribe();

    const req = http.expectOne(`${BASE}/res-1/cancel`);
    expect(req.request.method).toBe('POST');
    req.flush(makeReservation({ status: 'Cancelada' }));
  });

  it('confirm() emits the updated ReservationResponse', () => {
    const confirmed = makeReservation({ status: 'Confirmada' });
    let result: ReservationResponse | undefined;
    service.confirm('res-1').subscribe((res) => { result = res; });
    http.expectOne(`${BASE}/res-1/confirm`).flush(confirmed);
    expect(result?.status).toBe('Confirmada');
  });

  it('cancel() emits the updated ReservationResponse', () => {
    const cancelled = makeReservation({ status: 'Cancelada' });
    let result: ReservationResponse | undefined;
    service.cancel('res-1').subscribe((res) => { result = res; });
    http.expectOne(`${BASE}/res-1/cancel`).flush(cancelled);
    expect(result?.status).toBe('Cancelada');
  });
});
