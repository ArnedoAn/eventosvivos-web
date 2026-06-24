import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { provideRouter } from '@angular/router';

import { EventsApiService } from '../../core/api/events-api.service';
import type { EventResponse } from '../../core/models/event.model';
import { EventList } from './event-list.component';

describe('EventList', () => {
  let eventsApiMock: { list: ReturnType<typeof vi.fn> };

  const mockEvents: EventResponse[] = [
    {
      id: '1',
      title: 'Concierto de Rock',
      description: 'Gran concierto',
      type: 'Concierto',
      venueId: 1,
      startUtc: '2026-07-15T20:00:00Z',
      endUtc: '2026-07-15T23:00:00Z',
      capacity: 500,
      price: 75000,
      status: 'Activo',
    },
    {
      id: '2',
      title: 'Conferencia Tech',
      description: 'Charlas tech',
      type: 'Conferencia',
      venueId: 2,
      startUtc: '2026-08-01T09:00:00Z',
      endUtc: '2026-08-01T18:00:00Z',
      capacity: 50,
      price: 25000,
      status: 'Activo',
    },
  ];

  beforeEach(async () => {
    eventsApiMock = { list: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [EventList, ReactiveFormsModule],
      providers: [provideRouter([]), { provide: EventsApiService, useValue: eventsApiMock }],
    }).compileComponents();
  });

  it('should create', () => {
    eventsApiMock.list.mockReturnValue(of([]));
    const fixture = TestBed.createComponent(EventList);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load events on init via EventsApiService.list and render one card per event', () => {
    eventsApiMock.list.mockReturnValue(of(mockEvents));

    const fixture = TestBed.createComponent(EventList);
    fixture.detectChanges();

    expect(eventsApiMock.list).toHaveBeenCalledWith({});

    fixture.detectChanges();
    const cards = fixture.debugElement.queryAll(By.css('app-event-card'));
    expect(cards.length).toBe(mockEvents.length);
  });

  it('should re-request with type param when type filter changes', () => {
    eventsApiMock.list.mockReturnValue(of([]));

    const fixture = TestBed.createComponent(EventList);
    fixture.detectChanges();
    eventsApiMock.list.mockClear();

    const typeSelect = fixture.debugElement.query(By.css('[formControlName="type"]'));
    typeSelect.nativeElement.value = 'Conferencia';
    typeSelect.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(eventsApiMock.list).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'Conferencia' }),
    );
  });

  it('should debounce title search by 300ms and pass q param', async () => {
    eventsApiMock.list.mockReturnValue(of([]));

    const fixture = TestBed.createComponent(EventList);
    fixture.detectChanges();
    eventsApiMock.list.mockClear();

    const qInput = fixture.debugElement.query(By.css('[formControlName="q"]'));
    qInput.nativeElement.value = 'rock';
    qInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(eventsApiMock.list).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    expect(eventsApiMock.list).toHaveBeenCalledTimes(1);
    expect(eventsApiMock.list).toHaveBeenCalledWith(expect.objectContaining({ q: 'rock' }));
  });
});
