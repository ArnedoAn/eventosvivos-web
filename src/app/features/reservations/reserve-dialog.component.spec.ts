import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { ReservationsApiService } from '../../core/api/reservations-api.service';
import { AuthStore } from '../../core/auth/auth.store';
import { DETAIL_TO_ES } from '../../core/http/error-messages';
import type { EventResponse } from '../../core/models/event.model';
import type { ReservationResponse } from '../../core/models/reservation.model';
import { ReserveDialog } from './reserve-dialog.component';

function createDetailError(detail: string, status = 422): unknown {
  return {
    error: { detail, title: 'Error', status },
    status,
    statusText: 'Unprocessable Entity',
  };
}

const mockAuthUser = {
  token: signal<string | null>('jwt-token'),
  role: signal<string | null>('User'),
  isAuthenticated: signal(true),
  login: vi.fn(),
  logout: vi.fn(),
  restoreFromStorage: vi.fn(),
};

describe('ReserveDialog', () => {
  let fixture: ComponentFixture<ReserveDialog>;
  let component: ReserveDialog;
  let reservationsApiMock: { create: ReturnType<typeof vi.fn> };

  const mockEvent: EventResponse = {
    id: 'evt-1',
    title: 'Concierto de Rock',
    description: 'Gran concierto',
    type: 'Concierto',
    venueId: 1,
    startUtc: '2026-07-15T20:00:00Z',
    endUtc: '2026-07-15T23:00:00Z',
    capacity: 500,
    price: 75000,
    status: 'Activo',
  };

  beforeEach(async () => {
    reservationsApiMock = { create: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ReserveDialog, ReactiveFormsModule],
      providers: [
        { provide: ReservationsApiService, useValue: reservationsApiMock },
        { provide: AuthStore, useValue: mockAuthUser },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReserveDialog);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('event', mockEvent);
    fixture.detectChanges();
  });

  it('should render the dialog trigger button for authenticated User', () => {
    const button = fixture.debugElement.query(By.css('button[hlmDialogTrigger]'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.textContent).toContain('Reservar');
  });

  it('should keep submit disabled while the form is invalid', () => {
    component.form.patchValue({ quantity: 0, buyerName: '', buyerEmail: 'invalid' });
    fixture.detectChanges();

    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.quantity.errors?.['min']).toBeTruthy();
    expect(component.form.controls.buyerEmail.errors?.['email']).toBeTruthy();
    expect(component.loading()).toBe(false);
  });

  it('should call ReservationsApiService.create on valid submit', () => {
    const response: ReservationResponse = {
      id: 'res-1',
      eventId: mockEvent.id,
      userId: 'usr-1',
      quantity: 2,
      buyerName: 'Juan Pérez',
      buyerEmail: 'juan@example.com',
      status: 'PendientePago',
      createdUtc: '2026-06-24T14:00:00Z',
    };
    reservationsApiMock.create.mockReturnValue(of(response));

    component.form.setValue({
      quantity: 2,
      buyerName: 'Juan Pérez',
      buyerEmail: 'juan@example.com',
    });
    component.submit();

    expect(reservationsApiMock.create).toHaveBeenCalledWith({
      eventId: mockEvent.id,
      quantity: 2,
      buyerName: 'Juan Pérez',
      buyerEmail: 'juan@example.com',
    });
  });

  it('should show Spanish message for "Not enough seats available." detail', () => {
    reservationsApiMock.create.mockReturnValue(
      throwError(() => createDetailError('Not enough seats available.')),
    );

    component.form.setValue({
      quantity: 2,
      buyerName: 'Juan Pérez',
      buyerEmail: 'juan@example.com',
    });
    component.submit();

    expect(component.error()).toBe(DETAIL_TO_ES['Not enough seats available.']);
  });

  it('should show Spanish message for "Maximum 5 seats within 24 hours of the event." detail', () => {
    reservationsApiMock.create.mockReturnValue(
      throwError(() => createDetailError('Maximum 5 seats within 24 hours of the event.')),
    );

    component.form.setValue({
      quantity: 2,
      buyerName: 'Juan Pérez',
      buyerEmail: 'juan@example.com',
    });
    component.submit();

    expect(component.error()).toBe(
      DETAIL_TO_ES['Maximum 5 seats within 24 hours of the event.'],
    );
  });

  it('should show Spanish message for "Maximum 10 seats for high-price events." detail', () => {
    reservationsApiMock.create.mockReturnValue(
      throwError(() => createDetailError('Maximum 10 seats for high-price events.')),
    );

    component.form.setValue({
      quantity: 2,
      buyerName: 'Juan Pérez',
      buyerEmail: 'juan@example.com',
    });
    component.submit();

    expect(component.error()).toBe(DETAIL_TO_ES['Maximum 10 seats for high-price events.']);
  });

  it('should set result signal on success with status PendientePago', () => {
    const response: ReservationResponse = {
      id: 'res-1',
      eventId: mockEvent.id,
      userId: 'usr-1',
      quantity: 2,
      buyerName: 'Juan Pérez',
      buyerEmail: 'juan@example.com',
      status: 'PendientePago',
      createdUtc: '2026-06-24T14:00:00Z',
    };
    reservationsApiMock.create.mockReturnValue(of(response));

    component.form.setValue({
      quantity: 2,
      buyerName: 'Juan Pérez',
      buyerEmail: 'juan@example.com',
    });
    component.submit();

    expect(component.result()?.status).toBe('PendientePago');
    expect(component.result()?.buyerName).toBe('Juan Pérez');
  });
});
