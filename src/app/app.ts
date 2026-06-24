import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { AuthStore } from './core/auth/auth.store';
import { NotificationHostComponent } from './shared/ui/notification-host.component';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, ...HlmButtonImports, NotificationHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  logout(): void {
    this.authStore.logout();
    void this.router.navigate(['/login']);
  }
}
