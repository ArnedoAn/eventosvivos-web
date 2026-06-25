import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';

import { EventsApiService } from '../../core/api/events-api.service';
import { mapErrorToSpanish } from '../../core/http/error-messages';
import { EVENT_TYPES, type CreateEventRequest, type EventType } from '../../core/models/event.model';
import { VenuesStore } from '../../core/stores/venues.store';

function dateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startUtc')?.value as string | undefined;
  const end = group.get('endUtc')?.value as string | undefined;
  if (!start || !end) return null;
  return new Date(end) > new Date(start) ? null : { dateRange: true };
}

@Component({
  selector: 'app-event-create',
  imports: [
    ReactiveFormsModule,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmTextareaImports,
    ...HlmButtonImports,
    ...HlmAlertImports,
    ...HlmSpinnerImports,
  ],
  templateUrl: './event-create.html',
  styleUrl: './event-create.scss',
})
export class EventCreate {
  private readonly fb = inject(FormBuilder);
  private readonly eventsApi = inject(EventsApiService);
  private readonly router = inject(Router);
  protected readonly venuesStore = inject(VenuesStore);

  readonly pending = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly eventTypes = EVENT_TYPES;

  readonly form = this.fb.nonNullable.group(
    {
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      type: ['' as EventType, Validators.required],
      venueId: [0, [Validators.required, Validators.min(1)]],
      startUtc: ['', Validators.required],
      endUtc: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
    },
    { validators: [dateRangeValidator, this.capacityValidator.bind(this)] },
  );

  onSubmit(): void {
    if (this.form.invalid || this.pending()) return;

    this.pending.set(true);
    this.serverError.set(null);

    const value = this.form.getRawValue();
    const request: CreateEventRequest = {
      title: value.title,
      description: value.description,
      type: value.type,
      venueId: Number(value.venueId),
      startUtc: new Date(value.startUtc).toISOString(),
      endUtc: new Date(value.endUtc).toISOString(),
      capacity: value.capacity,
      price: value.price,
    };

    this.eventsApi.create(request).subscribe({
      next: () => {
        this.pending.set(false);
        void this.router.navigate(['/events']);
      },
      error: (error: unknown) => {
        this.pending.set(false);
        this.serverError.set(this.mapServerError(error));
      },
    });
  }

  private capacityValidator(group: AbstractControl): ValidationErrors | null {
    const venueId = Number(group.get('venueId')?.value);
    const capacity = Number(group.get('capacity')?.value);
    if (!venueId || !capacity) return null;
    const maxCap = this.venuesStore.capacity(venueId);
    return capacity <= maxCap ? null : { capacityExceedsVenue: { max: maxCap } };
  }

  private mapServerError(error: unknown): string {
    const body = (error as { error?: Record<string, unknown> })?.error;
    const code = body?.['code'] as string | undefined;
    const detail = body?.['detail'] as string | undefined;
    const status = (error as { status?: number })?.status;
    return mapErrorToSpanish(detail, code, status);
  }
}
