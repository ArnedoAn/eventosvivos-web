import { Injectable, computed, inject, signal } from '@angular/core';

import { VenuesApiService } from '../api/venues-api.service';
import type { VenueResponse } from '../models/venue.model';

@Injectable({
  providedIn: 'root',
})
export class VenuesStore {
  private readonly api = inject(VenuesApiService);

  private readonly _venues = signal<VenueResponse[]>([]);
  readonly loaded = signal(false);

  readonly venues = this._venues.asReadonly();

  constructor() {
    this.load();
  }

  load(): void {
    this.api.list().subscribe({
      next: (list) => {
        this._venues.set(list);
        this.loaded.set(true);
      },
    });
  }

  name(id: number): string {
    return this._venues().find((v) => v.id === id)?.name ?? `Recinto ${id}`;
  }

  capacity(id: number): number {
    return this._venues().find((v) => v.id === id)?.capacity ?? 0;
  }

  nameSignal = computed(() => (id: number) => this.name(id));
}
