import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmBadgeImports, type BadgeVariants } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

import { ReservationsApiService } from '../../core/api/reservations-api.service';
import { mapErrorToSpanish } from '../../core/http/error-messages';
import type {
  ReservationFilter,
  ReservationResponse,
  ReservationStatus,
} from '../../core/models/reservation.model';

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PendientePago: 'Pendiente de pago',
  Confirmada: 'Confirmada',
  Cancelada: 'Cancelada',
};

@Component({
  selector: 'app-reservation-admin',
  imports: [
    FormsModule,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmBadgeImports,
    ...HlmButtonImports,
    ...HlmSpinnerImports,
    ...HlmAlertImports,
  ],
  templateUrl: './reservation-admin.html',
  styleUrl: './reservation-admin.scss',
})
export class ReservationAdmin {
  private readonly reservationsApi = inject(ReservationsApiService);

  readonly reservations = signal<ReservationResponse[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly filterStatus = signal<ReservationStatus | ''>('');
  readonly filterEventId = signal('');

  readonly pending = signal<Record<string, 'confirm' | 'cancel'>>({});
  readonly itemErrors = signal<Record<string, string>>({});

  readonly filtered = computed(() => {
    const status = this.filterStatus();
    const eventId = this.filterEventId().trim();
    return this.reservations().filter((r) => {
      if (status && r.status !== status) return false;
      if (eventId && !r.eventId.startsWith(eventId)) return false;
      return true;
    });
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);

    const filter: ReservationFilter = {};
    this.reservationsApi.list(filter).subscribe({
      next: (list) => {
        this.reservations.set(list);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loadError.set(this.mapError(err));
        this.loading.set(false);
      },
    });
  }

  canConfirm(r: ReservationResponse): boolean {
    return r.status === 'PendientePago' && !this.pending()[r.id];
  }

  canCancel(r: ReservationResponse): boolean {
    return r.status === 'Confirmada' && !this.pending()[r.id];
  }

  confirm(r: ReservationResponse): void {
    this.pending.update((p) => ({ ...p, [r.id]: 'confirm' }));
    this.itemErrors.update((e) => { const copy = { ...e }; delete copy[r.id]; return copy; });

    this.reservationsApi.confirm(r.id).subscribe({
      next: (updated) => {
        this.reservations.update((list) => list.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
        this.pending.update((p) => { const copy = { ...p }; delete copy[r.id]; return copy; });
      },
      error: (err: unknown) => {
        this.itemErrors.update((e) => ({ ...e, [r.id]: this.mapError(err) }));
        this.pending.update((p) => { const copy = { ...p }; delete copy[r.id]; return copy; });
      },
    });
  }

  cancel(r: ReservationResponse): void {
    this.pending.update((p) => ({ ...p, [r.id]: 'cancel' }));
    this.itemErrors.update((e) => { const copy = { ...e }; delete copy[r.id]; return copy; });

    this.reservationsApi.cancel(r.id).subscribe({
      next: (updated) => {
        this.reservations.update((list) => list.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
        this.pending.update((p) => { const copy = { ...p }; delete copy[r.id]; return copy; });
      },
      error: (err: unknown) => {
        this.itemErrors.update((e) => ({ ...e, [r.id]: this.mapError(err) }));
        this.pending.update((p) => { const copy = { ...p }; delete copy[r.id]; return copy; });
      },
    });
  }

  statusVariant(status: ReservationStatus): BadgeVariants['variant'] {
    if (status === 'Confirmada') return 'default';
    if (status === 'PendientePago') return 'secondary';
    return 'destructive';
  }

  statusLabel(status: ReservationStatus): string {
    return STATUS_LABELS[status];
  }

  private mapError(err: unknown): string {
    const body = (err as { error?: Record<string, unknown> })?.error;
    const code = body?.['code'] as string | undefined;
    const detail = body?.['detail'] as string | undefined;
    const status = (err as { status?: number })?.status;
    return mapErrorToSpanish(detail, code, status);
  }
}
