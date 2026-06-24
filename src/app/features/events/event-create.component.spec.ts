import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { EventsApiService } from '../../core/api/events-api.service';
import type { EventResponse } from '../../core/models/event.model';
import { EventCreate } from './event-create.component';

describe('EventCreate', () => {
  let component: EventCreate;
  let fixture: ComponentFixture<EventCreate>;
  let eventsApiMock: { create: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    eventsApiMock = { create: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [EventCreate, ReactiveFormsModule],
      providers: [provideRouter([]), { provide: EventsApiService, useValue: eventsApiMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCreate);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep submit disabled and show errors when the form is invalid', () => {
    component.form.setValue({
      title: 'abc',
      description: 'corta',
      type: 'Conferencia',
      venueId: 0,
      startUtc: '2026-07-20T10:00',
      endUtc: '2026-07-20T09:00',
      capacity: 0,
      price: 0,
    });
    component.form.markAllAsTouched();

    fixture.detectChanges();

    expect(component.form.invalid).toBe(true);

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(true);

    const errors = fixture.nativeElement.querySelectorAll(
      'hlm-field-error, [data-testid="field-error"]',
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should call EventsApiService.create and navigate to /events on valid submit', () => {
    const response: EventResponse = {
      id: 'ev-1',
      title: 'Conferencia de Angular',
      description: 'Una conferencia muy completa sobre Angular',
      type: 'Conferencia',
      venueId: 1,
      startUtc: '2026-07-20T10:00:00Z',
      endUtc: '2026-07-20T18:00:00Z',
      capacity: 100,
      price: 50000,
      status: 'Activo',
    };
    eventsApiMock.create.mockReturnValue(of(response));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.form.setValue({
      title: 'Conferencia de Angular',
      description: 'Una conferencia muy completa sobre Angular',
      type: 'Conferencia',
      venueId: 1,
      startUtc: '2026-07-20T10:00',
      endUtc: '2026-07-20T18:00',
      capacity: 100,
      price: 50000,
    });

    component.onSubmit();

    expect(eventsApiMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Conferencia de Angular',
        description: 'Una conferencia muy completa sobre Angular',
        type: 'Conferencia',
        venueId: 1,
        capacity: 100,
        price: 50000,
      }),
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/events']);
    expect(component.pending()).toBe(false);
  });

  it('should display the mapped server error inline for event.venueOverlap', async () => {
    eventsApiMock.create.mockReturnValue(
      throwError(() => ({
        error: { detail: 'Venue schedule overlaps with another event.', status: 409 },
        status: 409,
      })),
    );

    component.form.setValue({
      title: 'Concierto de Rock',
      description: 'Concierto con gran aforo para todos los asistentes',
      type: 'Concierto',
      venueId: 3,
      startUtc: '2026-07-20T20:00',
      endUtc: '2026-07-20T23:00',
      capacity: 500,
      price: 75000,
    });

    component.onSubmit();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.serverError()).toBe('El recinto ya está reservado para esas fechas.');

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain(
      'El recinto ya está reservado para esas fechas.',
    );
  });
});
