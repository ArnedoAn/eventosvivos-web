import { Component, computed, inject, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

import { AuthStore } from '../../core/auth/auth.store';
import type { EventResponse } from '../../core/models/event.model';
import { VenuesStore } from '../../core/stores/venues.store';
import { ReserveDialog } from '../reservations/reserve-dialog.component';

@Component({
  selector: 'app-event-card',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
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
  protected readonly authStore = inject(AuthStore);
  protected readonly venuesStore = inject(VenuesStore);

  readonly statusVariant = computed(() => {
    const status = this.event().status;
    if (status === 'Activo') return 'default' as const;
    if (status === 'Cancelado') return 'destructive' as const;
    return 'secondary' as const;
  });

  venueName(id: number): string {
    return this.venuesStore.name(id);
  }
}
