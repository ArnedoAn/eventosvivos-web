import { Component, computed, input } from '@angular/core';
import { HlmSpinner } from '@spartan-ng/helm/spinner';

export type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-spinner',
  imports: [HlmSpinner],
  templateUrl: './spinner.html',
})
export class SpinnerComponent {
  readonly size = input<SpinnerSize>('md');

  readonly sizeClass = computed(() => {
    const sizes: Record<SpinnerSize, string> = {
      sm: 'text-[length:--spacing(3)]',
      md: 'text-[length:--spacing(4)]',
      lg: 'text-[length:--spacing(6)]',
    };
    return sizes[this.size()];
  });
}
