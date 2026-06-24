import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup() {
    TestBed.configureTestingModule({});
    return TestBed.inject(NotificationService);
  }

  it('should add a message to the queue on push', () => {
    const service = setup();

    service.push({ text: 'Hello world' });

    const messages = service.messages();
    expect(messages.length).toBe(1);
    expect(messages[0].text).toBe('Hello world');
    expect(messages[0].type).toBe('info');
    expect(messages[0].id).toBeTruthy();
  });

  it('should support error and success types', () => {
    const service = setup();

    service.push({ text: 'Error message', type: 'error' });
    service.push({ text: 'Success message', type: 'success' });

    const messages = service.messages();
    expect(messages.length).toBe(2);
    expect(messages[0].type).toBe('error');
    expect(messages[1].type).toBe('success');
  });

  it('should remove a message by id', () => {
    const service = setup();
    service.push({ text: 'First' });
    service.push({ text: 'Second' });

    const firstId = service.messages()[0].id;
    service.remove(firstId);

    const messages = service.messages();
    expect(messages.length).toBe(1);
    expect(messages[0].text).toBe('Second');
  });

  it('should auto-dismiss a message after the default duration', () => {
    const service = setup();

    service.push({ text: 'Auto dismiss' });

    expect(service.messages().length).toBe(1);

    vi.advanceTimersByTime(5000);

    expect(service.messages().length).toBe(0);
  });

  it('should auto-dismiss a message after a custom duration', () => {
    const service = setup();

    service.push({ text: 'Custom duration' }, 10000);

    vi.advanceTimersByTime(9999);
    expect(service.messages().length).toBe(1);

    vi.advanceTimersByTime(1);
    expect(service.messages().length).toBe(0);
  });

  it('should not remove other messages when one auto-dismisses', () => {
    const service = setup();

    service.push({ text: 'Short' }, 1000);
    service.push({ text: 'Long' }, 5000);

    vi.advanceTimersByTime(1000);

    const messages = service.messages();
    expect(messages.length).toBe(1);
    expect(messages[0].text).toBe('Long');
  });
});
