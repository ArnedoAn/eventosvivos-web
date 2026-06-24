import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it, beforeEach } from 'vitest';

import { NotificationService } from '../../core/notifications/notification.service';
import { NotificationHostComponent } from './notification-host.component';

describe('NotificationHostComponent', () => {
  let fixture: ComponentFixture<NotificationHostComponent>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationHostComponent],
    }).compileComponents();

    notificationService = TestBed.inject(NotificationService);
    fixture = TestBed.createComponent(NotificationHostComponent);
    fixture.detectChanges();
  });

  it('should render no alerts when the queue is empty', () => {
    const alerts = fixture.debugElement.queryAll(By.css('hlm-alert'));
    expect(alerts.length).toBe(0);
  });

  it('should render messages from the notification service', () => {
    notificationService.push({ text: 'First message', type: 'info' });
    notificationService.push({ text: 'Second message', type: 'success' });
    fixture.detectChanges();

    const alerts = fixture.debugElement.queryAll(By.css('hlm-alert'));
    expect(alerts.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('First message');
    expect(fixture.nativeElement.textContent).toContain('Second message');
  });

  it('should map error messages to destructive variant', () => {
    notificationService.push({ text: 'Error message', type: 'error' });
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('hlm-alert')).nativeElement as HTMLElement;
    expect(alert.className).toContain('text-destructive');
  });

  it('should map info and success messages to default variant', () => {
    notificationService.push({ text: 'Info message', type: 'info' });
    notificationService.push({ text: 'Success message', type: 'success' });
    fixture.detectChanges();

    const alerts = fixture.debugElement.queryAll(By.css('hlm-alert'));
    expect(alerts.length).toBe(2);
    for (const alert of alerts) {
      expect((alert.nativeElement as HTMLElement).className).not.toContain('text-destructive');
    }
  });

  it('should remove a message when the close button is clicked', () => {
    notificationService.push({ text: 'Dismissible message', type: 'info' });
    fixture.detectChanges();

    expect(notificationService.messages().length).toBe(1);

    const closeButton = fixture.debugElement.query(By.css('button[hlmBtn]'));
    closeButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(notificationService.messages().length).toBe(0);
  });
});
