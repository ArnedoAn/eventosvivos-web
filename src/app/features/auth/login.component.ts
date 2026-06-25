import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

import { AuthApiService } from '../../core/api/auth-api.service';
import { AuthStore } from '../../core/auth/auth.store';
import { mapErrorToSpanish } from '../../core/http/error-messages';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmButtonImports,
    ...HlmAlertImports,
    ...HlmSpinnerImports,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly pending = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid || this.pending()) return;

    this.pending.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    this.authApi.login({ email, password }).subscribe({
      next: (res) => {
        this.authStore.login(res);
        this.pending.set(false);
        void this.router.navigate(['/events']);
      },
      error: (err: unknown) => {
        this.pending.set(false);
        const body = (err as { error?: Record<string, unknown> })?.error;
        this.errorMessage.set(mapErrorToSpanish(
          body?.['detail'] as string,
          body?.['code'] as string,
          (err as { status?: number })?.status,
        ));
      },
    });
  }
}
