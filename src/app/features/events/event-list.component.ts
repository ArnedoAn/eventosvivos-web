import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  combineLatest,
  concat,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

import { EventsApiService } from '../../core/api/events-api.service';
import type {
  EventFilter,
  EventResponse,
  EventStatus,
  EventType,
} from '../../core/models/event.model';
import { VENUES } from '../../core/models/venue.model';
import { EventCard } from './event-card.component';

type FilterFormValue = {
  type: EventType | '';
  venueId: number | '';
  status: EventStatus | '';
  from: string;
  to: string;
  q: string;
};

@Component({
  selector: 'app-event-list',
  imports: [
    ReactiveFormsModule,
    EventCard,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmButtonImports,
    ...HlmSpinnerImports,
    ...HlmEmptyImports,
  ],
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss',
})
export class EventList {
  private readonly fb = inject(FormBuilder);
  private readonly eventsApi = inject(EventsApiService);

  readonly eventTypes: EventType[] = ['Conferencia', 'Taller', 'Concierto'];
  readonly eventStatuses: EventStatus[] = ['Activo', 'Cancelado', 'Completado'];
  readonly venues = VENUES;

  readonly filterForm = this.fb.nonNullable.group({
    type: ['' as EventType | ''],
    venueId: ['' as number | ''],
    status: ['' as EventStatus | ''],
    from: [''],
    to: [''],
    q: [''],
  });

  private readonly filter$ = combineLatest([
    this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.getRawValue()),
      map((values) => {
        const { q: _q, ...rest } = values;
        return rest;
      }),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    ),
    concat(
      of(this.filterForm.get('q')!.value),
      this.filterForm.get('q')!.valueChanges.pipe(debounceTime(300)),
    ).pipe(distinctUntilChanged()),
  ]).pipe(map(([rest, q]) => this.buildFilter({ ...rest, q } as FilterFormValue)));

  private readonly eventsResult$ = this.filter$.pipe(
    switchMap((filter) =>
      this.eventsApi.list(filter).pipe(
        map((events) => ({ events, loading: false })),
        startWith({ events: [] as EventResponse[], loading: true }),
      ),
    ),
  );

  readonly eventsResult = toSignal(this.eventsResult$, {
    initialValue: { events: [] as EventResponse[], loading: false },
  });
  readonly events = computed(() => this.eventsResult().events);
  readonly loading = computed(() => this.eventsResult().loading);
  readonly empty = computed(() => !this.loading() && this.events().length === 0);

  private buildFilter(values: FilterFormValue): EventFilter {
    const filter: EventFilter = {};
    if (values.type) filter.type = values.type;
    if (values.venueId !== '') filter.venueId = Number(values.venueId);
    if (values.status) filter.status = values.status;
    if (values.from) filter.from = values.from;
    if (values.to) filter.to = values.to;
    if (values.q) filter.q = values.q;
    return filter;
  }
}
