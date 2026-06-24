import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import type { EventResponse } from '../../core/models/event.model';
import { EventCard } from './event-card.component';

describe('EventCard', () => {
  let component: EventCard;
  let fixture: ComponentFixture<EventCard>;

  const mockEvent: EventResponse = {
    id: '1',
    title: 'Concierto de Rock',
    description: 'Gran concierto de rock nacional',
    type: 'Concierto',
    venueId: 1,
    startUtc: '2026-07-15T20:00:00Z',
    endUtc: '2026-07-15T23:00:00Z',
    capacity: 500,
    price: 75000,
    status: 'Activo',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('event', mockEvent);
    fixture.detectChanges();
  });

  it('should render event title and status', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(mockEvent.title);
    expect(compiled.textContent).toContain(mockEvent.status);
  });

  it('should resolve venue name from venueId', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // venueId=1 → 'Auditorio Central'
    expect(compiled.textContent).toContain('Auditorio Central');
  });

  it('should render the reserve dialog with the event', () => {
    const dialog = fixture.debugElement.query(By.css('app-reserve-dialog'));
    expect(dialog).toBeTruthy();
    expect(dialog.componentInstance.event()).toEqual(mockEvent);
  });
});
