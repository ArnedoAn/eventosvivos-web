import { Component, computed, inject } from '@angular/core';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import {
  NotificationService,
  type NotificationMessage,
  type NotificationType,
} from '../../core/notifications/notification.service';

function variantForType(type: NotificationType): 'default' | 'destructive' {
  return type === 'error' ? 'destructive' : 'default';
}

@Component({
  selector: 'app-notification-host',
  imports: [HlmAlertImports, HlmButtonImports],
  templateUrl: './notification-host.html',
  host: {
    class: 'fixed top-4 right-4 z-50 flex flex-col gap-2',
  },
})
export class NotificationHostComponent {
  private readonly notificationService = inject(NotificationService);

  readonly messages = computed(() =>
    this.notificationService.messages().map((message) => ({
      ...message,
      variant: variantForType(message.type),
    })),
  );

  remove(id: string): void {
    this.notificationService.remove(id);
  }
}
