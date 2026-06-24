import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmBadgeImports, type BadgeVariants } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

import { ReservationsApiService } from '../../core/api/reservations-api.service';
import { mapErrorToSpanish } from '../../core/http/error-messages';
import type { ReservationResponse, ReservationStatus } from '../../core/models/reservation.model';

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
    ...HlmSeparatorImports,
  ],
  templateUrl: './reservation-admin.html',
  styleUrl: './reservation-admin.scss',
})
export class ReservationAdmin {
  private readonly reservationsApi = inject(ReservationsApiService);

  readonly reservationId = signal('');
  readonly pending = signal<'confirm' | 'cancel' | null>(null);
  readonly result = signal<ReservationResponse | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly canConfirm = computed(
    () => this.result()?.status === 'PendientePago' && !this.pending(),
  );

  readonly canCancel = computed(
    () => this.result()?.status === 'Confirmada' && !this.pending(),
  );

  confirm(): void {
    const id = this.result()?.id ?? this.reservationId().trim();
    if (!id || this.pending()) return;

    this.pending.set('confirm');
    this.errorMessage.set(null);

    this.reservationsApi.confirm(id).subscribe({
      next: (res) => {
        this.result.set(res);
        this.pending.set(null);
      },
      error: (err: unknown) => {
        this.errorMessage.set(this.mapError(err));
        this.pending.set(null);
      },
    });
  }

  cancel(): void {
    const id = this.result()?.id ?? this.reservationId().trim();
    if (!id || this.pending()) return;

    this.pending.set('cancel');
    this.errorMessage.set(null);

    this.reservationsApi.cancel(id).subscribe({
      next: (res) => {
        this.result.set(res);
        this.pending.set(null);
      },
      error: (err: unknown) => {
        this.errorMessage.set(this.mapError(err));
        this.pending.set(null);
      },
    });
  }

  reset(): void {
    this.reservationId.set('');
    this.result.set(null);
    this.errorMessage.set(null);
    this.pending.set(null);
  }

  statusVariant(status: ReservationStatus): BadgeVariants['variant'] {
    switch (status) {
      case 'Confirmada':
        return 'default';
      case 'PendientePago':
        return 'secondary';
      case 'Cancelada':
        return 'destructive';
      default:
        return 'default';
    }
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
