import { Component, computed, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

import type { EventResponse } from '../../core/models/event.model';
import { venueName } from '../../core/models/venue.model';
import { ReserveDialog } from '../reservations/reserve-dialog.component';

@Component({
  selector: 'app-event-card',
  imports: [
    DatePipe,
    DecimalPipe,
    ReserveDialog,
    ...HlmCardImports,
    ...HlmBadgeImports,
    ...HlmButtonImports,
  ],
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss',
})
export class EventCard {
  readonly event = input.required<EventResponse>();

  readonly statusVariant = computed(() => {
    const status = this.event().status;
    if (status === 'Activo') return 'default' as const;
    if (status === 'Cancelado') return 'destructive' as const;
    return 'secondary' as const;
  });

  venueName(id: number): string {
    return venueName(id);
  }
}
