import { Injectable, signal } from '@angular/core';

export type NotificationType = 'error' | 'success' | 'info';

export interface NotificationMessage {
  id: string;
  text: string;
  type: NotificationType;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  readonly messages = signal<NotificationMessage[]>([]);
  private idCounter = 0;
  private timeouts = new Map<string, ReturnType<typeof setTimeout>>();

  push(message: { text: string; type?: NotificationType }, durationMs = 5000): void {
    const id = this.generateId();
    const type = message.type ?? 'info';
    this.messages.update((messages) => [...messages, { id, text: message.text, type }]);

    const timeoutId = setTimeout(() => {
      this.remove(id);
    }, durationMs);
    this.timeouts.set(id, timeoutId);
  }

  remove(id: string): void {
    const timeoutId = this.timeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(id);
    }
    this.messages.update((messages) => messages.filter((m) => m.id !== id));
  }

  private generateId(): string {
    return `notification-${++this.idCounter}`;
  }
}
