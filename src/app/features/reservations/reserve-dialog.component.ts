import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, map } from 'rxjs';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type FormControl,
  type FormGroup,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

import { ReservationsApiService } from '../../core/api/reservations-api.service';
import { AuthStore } from '../../core/auth/auth.store';
import { mapErrorToSpanish } from '../../core/http/error-messages';
import type { EventResponse } from '../../core/models/event.model';
import type {
  CreateReservationRequest,
  ReservationResponse,
} from '../../core/models/reservation.model';

type ReserveFormValue = {
  quantity: number;
  buyerName: string;
  buyerEmail: string;
};

@Component({
  selector: 'app-reserve-dialog',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ...HlmDialogImports,
    ...HlmButtonImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmSpinnerImports,
    ...HlmAlertImports,
  ],
  templateUrl: './reserve-dialog.html',
  styleUrl: './reserve-dialog.scss',
})
export class ReserveDialog {
  private readonly fb = inject(FormBuilder);
  private readonly reservationsApi = inject(ReservationsApiService);
  protected readonly authStore = inject(AuthStore);

  readonly event = input.required<EventResponse>();

  /** Only authenticated Users (not Admin) can reserve. */
  readonly canReserve = computed(
    () => this.authStore.isAuthenticated() && this.authStore.role() === 'User',
  );

  readonly form: FormGroup<{
    quantity: FormControl<number>;
    buyerName: FormControl<string>;
    buyerEmail: FormControl<string>;
  }> = this.fb.nonNullable.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    buyerName: ['', Validators.required],
    buyerEmail: ['', [Validators.required, Validators.email]],
  });

  readonly loading = signal(false);
  readonly result = signal<ReservationResponse | null>(null);
  readonly error = signal<string | null>(null);

  private readonly formValid = toSignal(
    this.form.statusChanges.pipe(startWith(this.form.status), map(s => s === 'VALID')),
    { initialValue: false },
  );
  readonly submitDisabled = computed(() => !this.formValid() || this.loading());

  submit(): void {
    if (this.form.invalid || this.loading()) return;

    const value = this.form.getRawValue() as ReserveFormValue;
    const request: CreateReservationRequest = {
      eventId: this.event().id,
      quantity: value.quantity,
      buyerName: value.buyerName,
      buyerEmail: value.buyerEmail,
    };

    this.loading.set(true);
    this.error.set(null);

    this.reservationsApi.create(request).subscribe({
      next: (response) => {
        this.result.set(response);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(this.mapError(err));
        this.loading.set(false);
      },
    });
  }

  reset(): void {
    this.form.reset({ quantity: 1, buyerName: '', buyerEmail: '' });
    this.result.set(null);
    this.error.set(null);
  }

  private mapError(err: unknown): string {
    const body = (err as { error?: Record<string, unknown> })?.error;
    const code = body?.['code'] as string | undefined;
    const detail = body?.['detail'] as string | undefined;
    const status = (err as { status?: number })?.status;
    return mapErrorToSpanish(detail, code, status);
  }
}
