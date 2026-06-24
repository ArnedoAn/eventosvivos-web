import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, type ParamMap } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { EventsApiService } from '../../core/api/events-api.service';
import type { OccupancyResponse } from '../../core/models/event.model';
import { Occupancy } from './occupancy.component';

describe('Occupancy', () => {
  let fixture: ComponentFixture<Occupancy>;
  let occupancyApiMock: { occupancy: ReturnType<typeof vi.fn> };
  const eventId = 'ev-123';

  const mockOccupancy: OccupancyResponse = {
    eventId,
    title: 'Concierto de Rock',
    capacity: 100,
    soldConfirmed: 75,
    availableRemaining: 20,
    retainedByPenalty: 5,
    occupancyPercent: 75,
    totalRevenue: 3_750_000,
    status: 'Activo',
  };

  const fakeParamMap: ParamMap = {
    get: (key: string) => (key === 'id' ? eventId : null),
    has: () => false,
    getAll: () => [],
    keys: [],
  };

  beforeEach(async () => {
    occupancyApiMock = { occupancy: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Occupancy],
      providers: [
        { provide: EventsApiService, useValue: occupancyApiMock },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(fakeParamMap) },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    occupancyApiMock.occupancy.mockReturnValue(of(mockOccupancy));
    fixture = TestBed.createComponent(Occupancy);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load occupancy via EventsApiService.occupancy(id)', () => {
    occupancyApiMock.occupancy.mockReturnValue(of(mockOccupancy));
    fixture = TestBed.createComponent(Occupancy);
    fixture.detectChanges();

    expect(occupancyApiMock.occupancy).toHaveBeenCalledWith(eventId);
  });

  it('should render soldConfirmed, availableRemaining, retainedByPenalty, occupancyPercent, totalRevenue, status', () => {
    occupancyApiMock.occupancy.mockReturnValue(of(mockOccupancy));
    fixture = TestBed.createComponent(Occupancy);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;

    expect(text).toContain(mockOccupancy.title);
    expect(text).toContain('Vendidas');
    expect(text).toContain(String(mockOccupancy.soldConfirmed));
    expect(text).toContain('Disponibles');
    expect(text).toContain(String(mockOccupancy.availableRemaining));
    expect(text).toContain('Perdidas');
    expect(text).toContain(String(mockOccupancy.retainedByPenalty));
    expect(text).toContain('Ocupación');
    expect(text).toContain(`${mockOccupancy.occupancyPercent}%`);
    expect(text).toContain('Ingresos totales');
    expect(text).toContain(mockOccupancy.status);
  });
});
