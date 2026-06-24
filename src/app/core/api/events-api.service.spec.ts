import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import type { CreateEventRequest, EventFilter, EventResponse, OccupancyResponse } from '../models/event.model';
import { EventsApiService } from './events-api.service';

const BASE = `${environment.apiBaseUrl}/events`;

function makeEvent(overrides: Partial<EventResponse> = {}): EventResponse {
  return {
    id: 'evt-1',
    title: 'Tech Conference',
    description: 'A great conference',
    venueId: 1,
    capacity: 150,
    startUtc: '2026-09-15T18:00:00Z',
    endUtc: '2026-09-15T22:00:00Z',
    price: 75,
    type: 'Conferencia',
    status: 'Activo',
    ...overrides,
  };
}

describe('EventsApiService', () => {
  let service: EventsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), EventsApiService],
    });
    service = TestBed.inject(EventsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list() sends GET with only non-null filter params', () => {
    const filter: EventFilter = { type: 'Conferencia', venueId: 1, from: '2026-01-01T00:00:00Z' };
    service.list(filter).subscribe();

    const req = http.expectOne((r) => r.url === BASE);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('type')).toBe('Conferencia');
    expect(req.request.params.get('venueId')).toBe('1');
    expect(req.request.params.get('from')).toBe('2026-01-01T00:00:00Z');
    expect(req.request.params.get('status')).toBeNull();
    req.flush([makeEvent()]);
  });

  it('list() omits undefined/null filter fields', () => {
    service.list({}).subscribe();

    const req = http.expectOne(BASE);
    expect(req.request.params.keys()).toHaveLength(0);
    req.flush([]);
  });

  it('create() sends POST with venueId, startUtc, endUtc', () => {
    const payload: CreateEventRequest = {
      title: 'Tech Conference',
      description: 'A great conference',
      type: 'Conferencia',
      venueId: 1,
      startUtc: '2026-09-15T18:00:00Z',
      endUtc: '2026-09-15T22:00:00Z',
      capacity: 150,
      price: 75,
    };
    service.create(payload).subscribe();

    const req = http.expectOne(BASE);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(makeEvent());
  });

  it('occupancy() sends GET to /events/{id}/occupancy', () => {
    const mock: OccupancyResponse = {
      eventId: 'evt-1',
      title: 'Tech Conference',
      capacity: 150,
      soldConfirmed: 42,
      availableRemaining: 100,
      retainedByPenalty: 8,
      occupancyPercent: 28.0,
      totalRevenue: 3150,
      status: 'Activo',
    };
    service.occupancy('evt-1').subscribe((res) => expect(res).toEqual(mock));

    const req = http.expectOne(`${BASE}/evt-1/occupancy`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
