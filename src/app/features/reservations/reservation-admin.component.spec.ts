import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';

import { ReservationsApiService } from '../../core/api/reservations-api.service';
import { DETAIL_TO_ES } from '../../core/http/error-messages';
import type { ReservationResponse } from '../../core/models/reservation.model';
import { ReservationAdmin } from './reservation-admin.component';

function makeReservation(overrides: Partial<ReservationResponse> = {}): ReservationResponse {
  return {
    id: 'res-1',
    eventId: 'evt-1',
    userId: 'usr-1',
    quantity: 2,
    buyerName: 'Juan Pérez',
    buyerEmail: 'juan@example.com',
    status: 'PendientePago',
    createdUtc: '2026-06-24T14:00:00Z',
    ...overrides,
  };
}

function createDetailError(detail: string, status = 422): unknown {
  return {
    error: { detail, title: 'Error', status },
    status,
    statusText: 'Unprocessable Entity',
  };
}

describe('ReservationAdmin', () => {
  let fixture: ComponentFixture<ReservationAdmin>;
  let component: ReservationAdmin;
  let reservationsApiMock: {
    confirm: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    reservationsApiMock = {
      confirm: vi.fn(),
      cancel: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReservationAdmin],
      providers: [{ provide: ReservationsApiService, useValue: reservationsApiMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with empty state', () => {
    expect(component).toBeTruthy();
    expect(component.result()).toBeNull();
    expect(component.pending()).toBeNull();
    expect(component.errorMessage()).toBeNull();
  });

  it('confirm() calls reservationsApi.confirm with reservationId when no result loaded', () => {
    reservationsApiMock.confirm.mockReturnValue(
      of(makeReservation({ id: 'res-42', status: 'Confirmada' })),
    );

    component.reservationId.set('res-42');
    component.confirm();

    expect(reservationsApiMock.confirm).toHaveBeenCalledWith('res-42');
    expect(component.result()?.status).toBe('Confirmada');
    expect(component.pending()).toBeNull();
  });

  it('cancel() calls reservationsApi.cancel with result.id when result is loaded', () => {
    reservationsApiMock.cancel.mockReturnValue(
      of(makeReservation({ id: 'res-7', status: 'Cancelada' })),
    );

    component.result.set(makeReservation({ id: 'res-7', status: 'Confirmada' }));
    component.cancel();

    expect(reservationsApiMock.cancel).toHaveBeenCalledWith('res-7');
    expect(component.result()?.status).toBe('Cancelada');
  });

  it('canConfirm is true only when result.status === PendientePago and not pending', () => {
    expect(component.canConfirm()).toBe(false);

    component.result.set(makeReservation({ status: 'PendientePago' }));
    expect(component.canConfirm()).toBe(true);

    component.result.set(makeReservation({ status: 'Confirmada' }));
    expect(component.canConfirm()).toBe(false);

    component.result.set(makeReservation({ status: 'Cancelada' }));
    expect(component.canConfirm()).toBe(false);
  });

  it('canCancel is true only when result.status === Confirmada and not pending', () => {
    expect(component.canCancel()).toBe(false);

    component.result.set(makeReservation({ status: 'Confirmada' }));
    expect(component.canCancel()).toBe(true);

    component.result.set(makeReservation({ status: 'PendientePago' }));
    expect(component.canCancel()).toBe(false);

    component.result.set(makeReservation({ status: 'Cancelada' }));
    expect(component.canCancel()).toBe(false);
  });

  it('confirm() sets errorMessage in Spanish on API error', () => {
    reservationsApiMock.confirm.mockReturnValue(
      throwError(() => createDetailError('Reservation is already confirmed.')),
    );

    component.reservationId.set('res-1');
    component.confirm();

    expect(component.errorMessage()).toBe(DETAIL_TO_ES['Reservation is already confirmed.']);
    expect(component.pending()).toBeNull();
  });

  it('cancel() sets errorMessage in Spanish on API error', () => {
    reservationsApiMock.cancel.mockReturnValue(
      throwError(() => createDetailError('Only confirmed reservations can be cancelled.')),
    );

    component.result.set(makeReservation({ status: 'Confirmada' }));
    component.cancel();

    expect(component.errorMessage()).toBe(
      DETAIL_TO_ES['Only confirmed reservations can be cancelled.'],
    );
    expect(component.pending()).toBeNull();
  });

  it('reset() clears all state', () => {
    component.result.set(makeReservation());
    component.errorMessage.set('Algún error');
    component.reservationId.set('res-1');

    component.reset();

    expect(component.result()).toBeNull();
    expect(component.errorMessage()).toBeNull();
    expect(component.reservationId()).toBe('');
    expect(component.pending()).toBeNull();
  });
});
