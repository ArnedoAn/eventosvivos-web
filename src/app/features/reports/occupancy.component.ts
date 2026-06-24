import { DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

import { EventsApiService } from '../../core/api/events-api.service';
import type { EventStatus, OccupancyResponse } from '../../core/models/event.model';

type OccupancyResult =
  | { loading: true; data: null; error: null }
  | { loading: false; data: OccupancyResponse; error: null }
  | { loading: false; data: null; error: unknown };

@Component({
  selector: 'app-occupancy',
  imports: [
    DecimalPipe,
    RouterLink,
    ...HlmAlertImports,
    ...HlmBadgeImports,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmProgressImports,
    ...HlmSeparatorImports,
    ...HlmSpinnerImports,
  ],
  templateUrl: './occupancy.html',
  styleUrl: './occupancy.scss',
})
export class Occupancy {
  private readonly route = inject(ActivatedRoute);
  private readonly eventsApi = inject(EventsApiService);

  private readonly occupancyResult$ = this.route.paramMap.pipe(
    map((params) => params.get('id')!),
    switchMap((id) =>
      this.eventsApi.occupancy(id).pipe(
        map((data) => ({ loading: false, data, error: null }) as OccupancyResult),
        startWith({ loading: true, data: null, error: null } as OccupancyResult),
        catchError((error) => of({ loading: false, data: null, error } as OccupancyResult)),
      ),
    ),
  );

  readonly result = toSignal(this.occupancyResult$, {
    initialValue: { loading: true, data: null, error: null } as OccupancyResult,
  });

  readonly loading = computed(() => this.result().loading);
  readonly data = computed(() => this.result().data);
  readonly error = computed(() => this.result().error);

  readonly statusVariant = computed(() => {
    const status = this.data()?.status;
    return statusVariantFor(status);
  });

  readonly occupancyBarValue = computed(() => {
    const pct = this.data()?.occupancyPercent ?? 0;
    return Math.min(Math.round(pct), 100);
  });
}

function statusVariantFor(status: EventStatus | undefined) {
  if (status === 'Activo') return 'default' as const;
  if (status === 'Cancelado') return 'destructive' as const;
  return 'secondary' as const;
}
