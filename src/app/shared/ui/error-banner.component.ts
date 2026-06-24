import { Component, input } from '@angular/core';
import { HlmAlertImports } from '@spartan-ng/helm/alert';

export type ErrorBannerVariant = 'destructive' | 'default';

@Component({
  selector: 'app-error-banner',
  imports: [HlmAlertImports],
  templateUrl: './error-banner.html',
})
export class ErrorBannerComponent {
  readonly message = input.required<string>();
  readonly variant = input<ErrorBannerVariant>('destructive');
}
